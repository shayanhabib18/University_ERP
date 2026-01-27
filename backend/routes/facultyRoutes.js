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
  coordinatorLogin,
  executiveLogin,
  getProfile,
  getCoordinatorProfile,
  forgotPassword,
  assignExecutive,
  getCurrentExecutive,
  assignCoursesToFaculty,
  getProfileByEmail,
  uploadFacultyDocuments,
  facultyDocsUpload,
  getFacultyDocuments,
  assignCoordinator,
  removeCoordinator,
  assignCoordinatorManually,
  getCoordinatorDepartmentFaculty,
  getCoordinatorDepartmentStudents,
  getCoordinatorOverview,
} from "../controllers/FacultyController.js";
import { requireAuth, requireRole } from "../src/middleware/auth.js";

const router = express.Router();

router.post("/login", login);
router.post("/coordinator/login", coordinatorLogin);
router.post("/executive/login", executiveLogin);
router.get("/profile", getProfile);
router.get("/coordinator/profile", requireAuth, requireRole(["coordinator"]), getCoordinatorProfile);
router.get("/profile/:email", getProfileByEmail);
router.post("/forgot-password", forgotPassword);
router.get("/coordinator/overview", requireAuth, requireRole(["coordinator"]), getCoordinatorOverview);
router.get(
  "/coordinator/department-faculty",
  requireAuth,
  requireRole(["coordinator"]),
  getCoordinatorDepartmentFaculty
);
router.get(
  "/coordinator/department-students",
  requireAuth,
  requireRole(["coordinator"]),
  getCoordinatorDepartmentStudents
);
router.get("/", getAllFaculty);
router.get("/executive/current", getCurrentExecutive);
router.get("/department/:departmentId", getFacultyByDepartment);
router.post("/", addFaculty);
router.put("/:id", updateFaculty);
router.delete("/:id", deleteFaculty);
router.post("/set-password", setPassword);
router.post("/assign-executive", assignExecutive);
router.post("/:id/assign-courses", assignCoursesToFaculty);
router.put("/:id/assign-coordinator", assignCoordinator);
router.put("/:id/remove-coordinator", removeCoordinator);
router.post("/department/:departmentId/coordinator", facultyDocsUpload.single("document"), assignCoordinatorManually);
router.post("/:id/documents", facultyDocsUpload.array("files", 10), uploadFacultyDocuments);
router.get("/:id/documents", getFacultyDocuments);

export default router;
