import supabase from "../model/supabaseClient.js";
import multer from "multer";

// Storage bucket for announcement attachments
const ANNOUNCEMENT_BUCKET = "announcement-attachments";
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

const initializeAnnouncementStorage = async () => {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) throw error;
    const exists = buckets?.some((bucket) => bucket.name === ANNOUNCEMENT_BUCKET);
    if (!exists) {
      const { error: createError } = await supabase.storage.createBucket(ANNOUNCEMENT_BUCKET, { public: true });
      if (createError) throw createError;
      console.log(`✅ Created storage bucket: ${ANNOUNCEMENT_BUCKET}`);
    }
  } catch (err) {
    console.error("⚠️ Could not initialize announcement attachments bucket:", err.message);
  }
};

// Update announcement core fields and recipients
const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, recipientRoles } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Announcement ID is required" });
    }

    if (!title || !message) {
      return res.status(400).json({ error: "Title and message are required" });
    }

    const { error: updateError } = await supabase
      .from("announcements")
      .update({ title, message })
      .eq("id", id);

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    if (Array.isArray(recipientRoles)) {
      // Replace recipients with provided list
      await supabase.from("announcement_recipients").delete().eq("announcement_id", id);

      if (recipientRoles.length > 0) {
        const inserts = recipientRoles.map((role) => ({ announcement_id: id, recipient_role: role }));
        const { error: recipientErr } = await supabase
          .from("announcement_recipients")
          .insert(inserts);

        if (recipientErr) {
          return res.status(400).json({ error: recipientErr.message });
        }
      }
    }

    const { data: updated } = await supabase
      .from("announcements")
      .select("id, title, message, sender_id, sender_role, sender_name, created_at")
      .eq("id", id)
      .single();

    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update announcement", message: error.message });
  }
};

// Get all announcements for a specific role
const getAnnouncements = async (req, res) => {
  try {
    const { role } = req.query;

    if (!role) {
      return res.status(400).json({ error: "Role is required" });
    }

    // Fetch announcements where recipient_role matches the user's role
    const { data, error } = await supabase
      .from("announcement_recipients")
      .select(`
        announcement_id,
        recipient_role,
        created_at,
        announcements (
          id,
          title,
          message,
          sender_id,
          sender_role,
          sender_name,
          created_at
        )
      `)
      .eq("recipient_role", role);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Extract announcements and format response
    const announcements = data.map((item) => ({
      id: item.announcements.id,
      title: item.announcements.title,
      message: item.announcements.message,
      senderId: item.announcements.sender_id,
      senderRole: item.announcements.sender_role,
      senderName: item.announcements.sender_name,
      recipientRole: item.recipient_role,
      createdAt: item.announcements.created_at,
    }));

    res.json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch announcements",
      message: error.message,
    });
  }
};

// Get announcements with attachments
const getAnnouncementsWithAttachments = async (req, res) => {
  try {
    const { role } = req.query;

    if (!role) {
      return res.status(400).json({ error: "Role is required" });
    }

    // Fetch announcements that either target this role OR were sent by this role
    // This prevents "self-sent" announcements from disappearing when the sender role
    // is not included in the recipients list (e.g., executive sending to faculty/students).
    // Note: Cross-table OR filters on nested selects can be fragile in PostgREST.
    // To avoid 400 errors, fetch all announcements with their recipients/attachments,
    // then filter in memory for either sent-by-role or received-by-role.
    const { data, error } = await supabase
      .from("announcements")
      .select(`
        id,
        title,
        message,
        sender_id,
        sender_role,
        sender_name,
        created_at,
        announcement_attachments (
          id,
          file_name,
          file_url,
          uploaded_at
        ),
        announcement_recipients (
          recipient_role
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Filter: include announcements sent by this role OR where this role is a recipient
    const filtered = (data || []).filter((item) => {
      const recipients = item.announcement_recipients || [];
      const isSender = item.sender_role === role;
      const isRecipient = recipients.some((r) => r.recipient_role === role);
      return isSender || isRecipient;
    });

    // Map recipients to simple array
    const announcements = filtered.map((item) => ({
      id: item.id,
      title: item.title,
      message: item.message,
      senderId: item.sender_id,
      senderRole: item.sender_role,
      senderName: item.sender_name,
      recipientRoles: (item.announcement_recipients || []).map((r) => r.recipient_role),
      createdAt: item.created_at,
      attachments: item.announcement_attachments || [],
    }));

    res.json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch announcements",
      message: error.message,
    });
  }
};

// Create a new announcement
const createAnnouncement = async (req, res) => {
  try {
    console.log("Received announcement request body:", req.body);
    
    const {
      title,
      message,
      senderId,
      senderRole,
      senderName,
      recipientRoles,
    } = req.body;

    // Validate required fields
    if (!title || !message || !senderId || !senderRole || !senderName) {
      console.log("Validation failed:", {
        title: !!title,
        message: !!message,
        senderId: !!senderId,
        senderRole: !!senderRole,
        senderName: !!senderName,
      });
      return res.status(400).json({
        error: "Missing required fields: title, message, senderId, senderRole, senderName",
      });
    }

    if (!Array.isArray(recipientRoles) || recipientRoles.length === 0) {
      return res.status(400).json({
        error: "recipientRoles must be a non-empty array",
      });
    }

    // Insert announcement
    const { data: announcementData, error: announcementError } = await supabase
      .from("announcements")
      .insert([
        {
          title,
          message,
          sender_id: senderId,
          sender_role: senderRole,
          sender_name: senderName,
        },
      ])
      .select();

    if (announcementError) {
      return res.status(400).json({ error: announcementError.message });
    }

    const announcementId = announcementData[0].id;

    // Insert recipient roles
    const recipientInserts = recipientRoles.map((role) => ({
      announcement_id: announcementId,
      recipient_role: role,
    }));

    const { error: recipientError } = await supabase
      .from("announcement_recipients")
      .insert(recipientInserts);

    if (recipientError) {
      return res.status(400).json({ error: recipientError.message });
    }

    res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      data: announcementData[0],
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to create announcement",
      message: error.message,
    });
  }
};

// Delete announcement
const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Announcement ID is required" });
    }

    // Delete announcement (cascade will handle recipients and attachments)
    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      success: true,
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to delete announcement",
      message: error.message,
    });
  }
};

// Get single announcement by ID
const getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Announcement ID is required" });
    }

    const { data, error } = await supabase
      .from("announcements")
      .select(`
        id,
        title,
        message,
        sender_id,
        sender_role,
        sender_name,
        created_at,
        announcement_attachments (
          id,
          file_name,
          file_url,
          uploaded_at
        ),
        announcement_recipients (
          recipient_role
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    const announcement = {
      id: data.id,
      title: data.title,
      message: data.message,
      senderId: data.sender_id,
      senderRole: data.sender_role,
      senderName: data.sender_name,
      createdAt: data.created_at,
      attachments: data.announcement_attachments || [],
      recipientRoles: data.announcement_recipients.map((r) => r.recipient_role),
    };

    res.json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch announcement",
      message: error.message,
    });
  }
};

// Upload announcement attachment (multipart/form-data)
const ensureAnnouncementBucket = async () => {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) throw error;
  const exists = buckets?.some((bucket) => bucket.name === ANNOUNCEMENT_BUCKET);
  if (!exists) {
    const { error: createError } = await supabase.storage.createBucket(ANNOUNCEMENT_BUCKET, { public: true });
    if (createError) throw createError;
  }
};

const uploadAttachment = async (req, res) => {
  try {
    const { announcementId } = req.body;
    const file = req.file;

    if (!announcementId || !file) {
      return res.status(400).json({
        error: "Missing required fields: announcementId and file",
      });
    }

    // Check if announcement exists
    const { data: announcement, error: checkError } = await supabase
      .from("announcements")
      .select("id")
      .eq("id", announcementId)
      .single();

    if (checkError || !announcement) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    // Ensure storage bucket exists (handles first-run deploys)
    await ensureAnnouncementBucket();

    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${announcementId}/${timestamp}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(ANNOUNCEMENT_BUCKET)
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      return res.status(400).json({ error: `Upload failed: ${uploadError.message}` });
    }

    const { data: urlData } = supabase.storage
      .from(ANNOUNCEMENT_BUCKET)
      .getPublicUrl(storagePath);
    const publicUrl = urlData?.publicUrl || null;

    // Insert attachment metadata
    const { data, error } = await supabase
      .from("announcement_attachments")
      .insert([
        {
          announcement_id: announcementId,
          file_name: file.originalname,
          file_url: publicUrl,
          file_size: file.size,
          file_type: file.mimetype,
        },
      ])
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      success: true,
      message: "Attachment uploaded successfully",
      data: {
        id: data[0].id,
        fileName: data[0].file_name,
        fileUrl: data[0].file_url,
        uploadedAt: data[0].uploaded_at,
      },
    });
  } catch (error) {
    console.error("Attachment upload failed:", error?.message || error);
    res.status(400).json({
      error: "Failed to upload attachment",
      message: error.message,
    });
  }
};

// Get announcements by sender role
const getAnnouncementsBySender = async (req, res) => {
  try {
    const senderRole = req.params.senderRole || req.query.senderRole;

    if (!senderRole) {
      return res.status(400).json({ error: "Sender role is required" });
    }

    const { data, error } = await supabase
      .from("announcements")
      .select(`
        id,
        title,
        message,
        sender_id,
        sender_role,
        sender_name,
        created_at,
        announcement_recipients (
          recipient_role
        )
      `)
      .eq("sender_role", senderRole)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const announcements = data.map((item) => ({
      id: item.id,
      title: item.title,
      message: item.message,
      senderId: item.sender_id,
      senderRole: item.sender_role,
      senderName: item.sender_name,
      createdAt: item.created_at,
      recipientRoles: item.announcement_recipients.map((r) => r.recipient_role),
    }));

    res.json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch announcements",
      message: error.message,
    });
  }
};

// Get announcements for a specific department
const getAnnouncementsByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;

    if (!departmentId) {
      return res.status(400).json({ error: "Department ID is required" });
    }

    // Get announcements that are meant for department chairs
    const { data, error } = await supabase
      .from("announcements")
      .select(`
        id,
        title,
        message,
        sender_id,
        sender_role,
        sender_name,
        created_at
      `)
      .eq("recipient_role", "department_chair")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      success: true,
      count: data.length,
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch announcements",
      message: error.message,
    });
  }
};

export {
  getAnnouncements,
  getAnnouncementsWithAttachments,
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncementById,
  uploadAttachment,
  getAnnouncementsBySender,
  getAnnouncementsByDepartment,
  upload,
  initializeAnnouncementStorage,
  updateAnnouncement,
};
