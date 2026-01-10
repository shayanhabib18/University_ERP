import express from 'express';
import {
  createRequest,
  getStudentRequests,
  getRequestById,
  addComment,
  getCoordinatorRequests,
  getCoordinatorRequestDetails,
  updateRequestStatus,
  addCoordinatorComment,
  getCoordinatorAnalytics,
} from '../controllers/StudentRequestController.js';

const router = express.Router();

// ============================================
// STUDENT ROUTES (requires auth token)
// ============================================

// Create a new request
router.post('/student-requests', createRequest);

// Get all requests for current student
router.get('/student-requests', getStudentRequests);

// Get a specific request
router.get('/student-requests/:id', getRequestById);

// Add a comment to a request
router.post('/student-requests/:id/comments', addComment);

// ============================================
// COORDINATOR ROUTES (requires coordinator role)
// ============================================

// List all requests for coordinator's department
router.get('/coordinator/requests', getCoordinatorRequests);

// Get request details (with comments and attachments)
router.get('/coordinator/requests/:id', getCoordinatorRequestDetails);

// Update request status and resolution
router.patch('/coordinator/requests/:id', updateRequestStatus);

// Add comment to request as coordinator
router.post('/coordinator/requests/:id/comments', addCoordinatorComment);

// Get analytics/summary for coordinator dashboard
router.get('/coordinator/analytics', getCoordinatorAnalytics);

export default router;
