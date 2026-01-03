// backend/routes/facultyRoutes.js
import express from "express";
import {
  getAllFaculty,
  getFacultyByDepartment,
  addFaculty,
  updateFaculty,
  deleteFaculty,
} from "../controllers/FacultyController.js";

const router = express.Router();

router.get("/", getAllFaculty);
router.get("/department/:departmentId", getFacultyByDepartment);
router.post("/", addFaculty);
router.put("/:id", updateFaculty);
router.delete("/:id", deleteFaculty);

export default router;
