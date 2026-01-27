import express from "express";
import {
  getAnnouncements,
  getAnnouncementsWithAttachments,
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncementById,
  uploadAttachment,
  getAnnouncementsBySender,
  getAnnouncementsByDepartment,
  upload,
  updateAnnouncement,
} from "../controllers/AnnouncementController.js";

const router = express.Router();

// GET announcements for a specific role
router.get("/", getAnnouncements);

// GET announcements with attachments
router.get("/with-attachments", getAnnouncementsWithAttachments);

// GET announcements by sender role
router.get("/sender/:senderRole", getAnnouncementsBySender);

// GET announcements by department
router.get("/department/:departmentId", getAnnouncementsByDepartment);

// GET single announcement by ID
router.get("/:id", getAnnouncementById);

// POST create announcement
router.post("/", createAnnouncement);

// PUT update announcement
router.put("/:id", updateAnnouncement);

// DELETE announcement
router.delete("/:id", deleteAnnouncement);

// POST upload attachment
router.post("/attachment/upload", upload.single("file"), uploadAttachment);

export default router;
