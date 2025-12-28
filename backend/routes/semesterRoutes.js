// backend/routes/semesterRoutes.js
import express from "express";
import {
  getAllSemesters,
  getSemestersByDepartment,
  addSemester,
  updateSemester,
  deleteSemester,
} from "../controllers/SemesterController.js";

const router = express.Router();

// Get all semesters
router.get("/", getAllSemesters);

// Get semesters by department
router.get("/department/:id", getSemestersByDepartment);

// Add semester
router.post("/", addSemester);

// Update semester
router.put("/:id", updateSemester);

// Delete semester
router.delete("/:id", deleteSemester);

export default router;
