import express from "express";
import {
  getAnnouncements,
  getAnnouncementsWithAttachments,
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncementById,
  uploadAttachment,
  getAnnouncementsBySender,
} from "../controllers/AnnouncementController.js";

const router = express.Router();

// GET announcements for a specific role
router.get("/", getAnnouncements);

// GET announcements with attachments
router.get("/with-attachments", getAnnouncementsWithAttachments);

// GET announcements by sender role
router.get("/sender/:senderRole", getAnnouncementsBySender);

// GET single announcement by ID
router.get("/:id", getAnnouncementById);

// POST create announcement
router.post("/", createAnnouncement);

// DELETE announcement
router.delete("/:id", deleteAnnouncement);

// POST upload attachment
router.post("/attachment/upload", uploadAttachment);

export default router;
