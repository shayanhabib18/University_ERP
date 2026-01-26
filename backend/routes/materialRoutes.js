import express from "express";
import multer from "multer";
import {
  getAllMaterials,
  getMaterialsByCourse,
  uploadMaterial,
  deleteMaterial,
} from "../controllers/CourseMaterialsController.js";

const router = express.Router();

// Multer storage in memory; we write manually to disk
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Base: mounted at /course-materials and /api/course-materials

// List all materials (used by students portal)
router.get("/", getAllMaterials);

// List materials for a course
router.get("/:course_id", getMaterialsByCourse);

// Upload material to a course
router.post("/:course_id/upload", upload.single("file"), uploadMaterial);

// Delete a material
router.delete("/:id", deleteMaterial);

export default router;
