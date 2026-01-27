import supabaseClient from "../model/supabaseClient.js";
import multer from "multer";

// Storage bucket for faculty message attachments
const BUCKET_NAME = "faculty-messages";
export const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

export const initializeFacultyMessageStorage = async () => {
  try {
    const { data: buckets, error: listErr } = await supabaseClient.storage.listBuckets();
    if (listErr) throw listErr;
    const exists = buckets?.some((b) => b.name === BUCKET_NAME);
    if (!exists) {
      const { error: createErr } = await supabaseClient.storage.createBucket(BUCKET_NAME, { public: true });
      if (createErr) throw createErr;
      console.log(`✅ Created storage bucket: ${BUCKET_NAME}`);
    }
  } catch (err) {
    console.error("⚠️ Could not initialize faculty messages bucket:", err.message);
  }
};

const mapAuthToFacultyId = async (authUserId) => {
  const { data: facultyRow, error } = await supabaseClient
    .from("faculties")
    .select("id")
    .eq("auth_user_id", authUserId)
    .maybeSingle();
  if (error || !facultyRow?.id) {
    throw new Error("Faculty account not found for this user");
  }
  return facultyRow.id;
};

export const sendMessage = async (req, res) => {
  try {
    const authUserId = req.user?.id;
    const { recipientFacultyId, subject, body } = req.body;

    if (!authUserId || !recipientFacultyId) {
      return res.status(400).json({ error: "Missing sender or recipient" });
    }

    const senderId = await mapAuthToFacultyId(authUserId);

    // Validate recipient exists
    const { data: recipientRow, error: recipientErr } = await supabaseClient
      .from("faculties")
      .select("id")
      .eq("id", recipientFacultyId)
      .maybeSingle();

    if (recipientErr || !recipientRow?.id) {
      return res.status(404).json({ error: "Recipient faculty not found" });
    }

    let attachmentUrl = null;
    if (req.file) {
      const timestamp = Date.now();
      const safeName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storagePath = `${senderId}/${recipientFacultyId}/${timestamp}-${safeName}`;

      const { error: uploadErr } = await supabaseClient.storage
        .from(BUCKET_NAME)
        .upload(storagePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });

      if (uploadErr) {
        console.error("Storage upload error:", uploadErr);
        return res.status(400).json({ error: `Upload failed: ${uploadErr.message}` });
      }

      const { data: urlData } = supabaseClient.storage
        .from(BUCKET_NAME)
        .getPublicUrl(storagePath);
      attachmentUrl = urlData?.publicUrl || null;
    }

    const { data, error } = await supabaseClient
      .from("faculty_messages")
      .insert({
        sender_faculty_id: senderId,
        recipient_faculty_id: recipientFacultyId,
        subject: subject || null,
        body: body || null,
        attachment_url: attachmentUrl,
      })
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({ message: "Message sent", messageRow: data?.[0] });
  } catch (err) {
    console.error("Error sending message:", err);
    return res.status(500).json({ error: err.message });
  }
};

export const getInbox = async (req, res) => {
  try {
    const authUserId = req.user?.id;
    if (!authUserId) return res.status(401).json({ error: "Unauthorized" });
    let facultyId;
    try {
      facultyId = await mapAuthToFacultyId(authUserId);
    } catch (err) {
      console.error("Faculty lookup failed (inbox):", err.message);
      return res.status(403).json({ error: err.message });
    }

    const { data, error } = await supabaseClient
      .from("faculty_messages")
      .select(`*, sender:sender_faculty_id(name, email), recipient:recipient_faculty_id(name, email) `)
      .eq("recipient_faculty_id", facultyId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return res.json(data || []);
  } catch (err) {
    console.error("Error fetching inbox:", err);
    return res.status(500).json({ error: err.message });
  }
};

export const getSent = async (req, res) => {
  try {
    const authUserId = req.user?.id;
    if (!authUserId) return res.status(401).json({ error: "Unauthorized" });
    let facultyId;
    try {
      facultyId = await mapAuthToFacultyId(authUserId);
    } catch (err) {
      console.error("Faculty lookup failed (sent):", err.message);
      return res.status(403).json({ error: err.message });
    }

    const { data, error } = await supabaseClient
      .from("faculty_messages")
      .select(`*, sender:sender_faculty_id(name, email), recipient:recipient_faculty_id(name, email) `)
      .eq("sender_faculty_id", facultyId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return res.json(data || []);
  } catch (err) {
    console.error("Error fetching sent messages:", err);
    return res.status(500).json({ error: err.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const authUserId = req.user?.id;
    if (!authUserId) return res.status(401).json({ error: "Unauthorized" });
    
    let facultyId;
    try {
      facultyId = await mapAuthToFacultyId(authUserId);
    } catch (err) {
      console.error("Faculty lookup failed (delete):", err.message);
      return res.status(403).json({ error: err.message });
    }

    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Message ID is required" });

    // Check if the message belongs to the faculty (either sender or recipient)
    const { data: message, error: fetchError } = await supabaseClient
      .from("faculty_messages")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Only allow deletion if the user is the sender or recipient
    if (message.sender_faculty_id !== facultyId && message.recipient_faculty_id !== facultyId) {
      return res.status(403).json({ error: "You do not have permission to delete this message" });
    }

    const { error: deleteError } = await supabaseClient
      .from("faculty_messages")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    return res.json({ message: "Message deleted successfully" });
  } catch (err) {
    console.error("Error deleting message:", err);
    return res.status(500).json({ error: err.message });
  }
};
