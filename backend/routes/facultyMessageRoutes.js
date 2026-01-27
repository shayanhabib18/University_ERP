import express from "express";
import { requireAuth, requireRole } from "../src/middleware/auth.js";
import {
  sendMessage,
  getInbox,
  getSent,
  deleteMessage,
  upload,
} from "../controllers/FacultyMessageController.js";

const router = express.Router();

router.post("/", requireAuth, requireRole(["faculty"]), upload.single("file"), sendMessage);
router.get("/inbox", requireAuth, requireRole(["faculty"]), getInbox);
router.get("/sent", requireAuth, requireRole(["faculty"]), getSent);
router.delete("/:id", requireAuth, requireRole(["faculty"]), deleteMessage);

export default router;
