// backend/routes/departmentRoutes.js
import express from "express";
import {
  getAllDepartments,
  addDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentById,
  getHODByDepartment,
  assignHOD,
} from "../controllers/DepartmentController.js";

const router = express.Router();

// Get all departments
router.get("/", getAllDepartments);

// Add a department
router.post("/", addDepartment);

// Get department by ID (must be after specific routes like /hod)
router.get("/:id", getDepartmentById);

// Update a department
router.put("/:id", updateDepartment);

// Delete a department
router.delete("/:id", deleteDepartment);

// Get HOD for a department
router.get("/:departmentId/hod", getHODByDepartment);

// Assign HOD to a department
router.post("/:departmentId/assign-hod", assignHOD);

export default router;
