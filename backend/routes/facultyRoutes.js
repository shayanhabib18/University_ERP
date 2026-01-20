// backend/routes/facultyRoutes.js
import express from "express";
import {
  getAllFaculty,
  getFacultyByDepartment,
  addFaculty,
  updateFaculty,
  deleteFaculty,
  setPassword,
  login,
  forgotPassword,
} from "../controllers/FacultyController.js";

const router = express.Router();

router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.get("/", getAllFaculty);
router.get("/department/:departmentId", getFacultyByDepartment);
router.post("/", addFaculty);
router.put("/:id", updateFaculty);
router.delete("/:id", deleteFaculty);
router.post("/set-password", setPassword);

export default router;
