import express from "express";
import {
  getPendingResultsForHOD,
  approveSingleResult,
  approveAllResults,
  rejectResult,
  getStudentResults,
} from "../controllers/ResultsApprovalController.js";

const router = express.Router();

// HOD/Department Chair routes
router.get("/pending-for-hod", getPendingResultsForHOD);
router.post("/approve/:resultId", approveSingleResult); // Can be resultId or courseId
router.post("/reject/:resultId", rejectResult);

// Student routes
router.get("/student/:studentId", getStudentResults);

export default router;
