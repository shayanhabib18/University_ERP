// backend/routes/departmentRoutes.js
import express from "express";
import {
  getAllDepartments,
  addDepartment,
  updateDepartment,
  deleteDepartment,
} from "../controllers/DepartmentController.js";

const router = express.Router();

// Get all departments
router.get("/", getAllDepartments);

// Add a department
router.post("/", addDepartment);

// Update a department
router.put("/:id", updateDepartment);

// Delete a department
router.delete("/:id", deleteDepartment);

export default router;
