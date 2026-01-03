import supabase from "../model/supabaseClient.js";

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

    // Fetch announcements with attachments
    const { data, error } = await supabase
      .from("announcement_recipients")
      .select(`
        announcement_id,
        recipient_role,
        announcements (
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
          )
        )
      `)
      .eq("recipient_role", role);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const announcements = data.map((item) => ({
      id: item.announcements.id,
      title: item.announcements.title,
      message: item.announcements.message,
      senderId: item.announcements.sender_id,
      senderRole: item.announcements.sender_role,
      senderName: item.announcements.sender_name,
      recipientRole: item.recipient_role,
      createdAt: item.announcements.created_at,
      attachments: item.announcements.announcement_attachments || [],
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

// Upload announcement attachment
const uploadAttachment = async (req, res) => {
  try {
    const { announcementId, fileName, fileUrl } = req.body;

    if (!announcementId || !fileName || !fileUrl) {
      return res.status(400).json({
        error: "Missing required fields: announcementId, fileName, fileUrl",
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

    // Insert attachment
    const { data, error } = await supabase
      .from("announcement_attachments")
      .insert([
        {
          announcement_id: announcementId,
          file_name: fileName,
          file_url: fileUrl,
        },
      ])
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      success: true,
      message: "Attachment uploaded successfully",
      data: data[0],
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to upload attachment",
      message: error.message,
    });
  }
};

// Get announcements by sender role
const getAnnouncementsBySender = async (req, res) => {
  try {
    const { senderRole } = req.query;

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

export {
  getAnnouncements,
  getAnnouncementsWithAttachments,
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncementById,
  uploadAttachment,
  getAnnouncementsBySender,
};
