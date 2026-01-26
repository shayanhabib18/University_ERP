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
  getProfile,
  forgotPassword,
  assignExecutive,
  getCurrentExecutive,
  assignCoursesToFaculty,
  getProfileByEmail,
} from "../controllers/FacultyController.js";

const router = express.Router();

router.post("/login", login);
router.get("/profile", getProfile);
router.get("/profile/:email", getProfileByEmail);
router.post("/forgot-password", forgotPassword);
router.get("/", getAllFaculty);
router.get("/executive/current", getCurrentExecutive);
router.get("/department/:departmentId", getFacultyByDepartment);
router.post("/", addFaculty);
router.put("/:id", updateFaculty);
router.delete("/:id", deleteFaculty);
router.post("/set-password", setPassword);
router.post("/assign-executive", assignExecutive);
router.post("/:id/assign-courses", assignCoursesToFaculty);

export default router;
