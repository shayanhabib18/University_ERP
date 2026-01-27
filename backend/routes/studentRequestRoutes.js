import express from 'express';
import {
  createRequest,
  getStudentRequests,
  getRequestById,
  addComment,
  getCoordinatorRequests,
  getCoordinatorRequestDetails,
  updateRequestStatus,
  deleteCoordinatorRequest,
  createRequestByCoordinator,
  addCoordinatorComment,
  getCoordinatorAnalytics,
  approveProfileEditRequest,
  rejectProfileEditRequest,
  getAllStudentRequestsForAdmin,
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

// Create request on behalf of student
router.post('/coordinator/create-request', createRequestByCoordinator);

// Get request details (with comments and attachments)
router.get('/coordinator/requests/:id', getCoordinatorRequestDetails);

// Update request status and resolution
router.patch('/coordinator/requests/:id', updateRequestStatus);

// Delete request
router.delete('/coordinator/requests/:id', deleteCoordinatorRequest);

// Add comment to request as coordinator
router.post('/coordinator/requests/:id/comments', addCoordinatorComment);

// Get analytics/summary for coordinator dashboard
router.get('/coordinator/analytics', getCoordinatorAnalytics);

// ============================================
// ADMIN ROUTES (for profile edit requests)
// ============================================

// Get all student requests (admin only)
router.get('/admin/student-requests', getAllStudentRequestsForAdmin);

// Approve profile edit request and update student profile
router.patch('/admin/requests/:id/approve-profile-edit', approveProfileEditRequest);

// Reject profile edit request
router.patch('/admin/requests/:id/reject-profile-edit', rejectProfileEditRequest);

export default router;
