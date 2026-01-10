import supabase from '../model/supabaseClient.js';

// Helper: Extract user ID from JWT token
function extractUserIdFromToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice(7);
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return payload.sub;
  } catch (err) {
    return null;
  }
}

// Helper: Get student ID by auth_user_id
async function getStudentByAuthId(authUserId) {
  const { data, error } = await supabase
    .from('students')
    .select('id, department_id')
    .eq('auth_user_id', authUserId)
    .single();
  if (error) throw new Error(`Student not found: ${error.message}`);
  return data;
}

// Helper: Check if user is coordinator
async function isCoordinator(authUserId) {
  const { data, error } = await supabase
    .from('coordinators')
    .select('id, department_id, is_active')
    .eq('auth_user_id', authUserId)
    .eq('is_active', true)
    .single();
  if (error) return null; // Not a coordinator
  return data;
}

// ============================================
// STUDENT ENDPOINTS
// ============================================

/**
 * POST /student-requests
 * Create a new student request
 */
export const createRequest = async (req, res) => {
  try {
    const userId = extractUserIdFromToken(req.headers.authorization);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { request_type, title, description, payload, priority } = req.body;

    // Validate input
    if (!request_type || !title) {
      return res.status(400).json({ error: 'request_type and title are required' });
    }

    // Get student info
    const student = await getStudentByAuthId(userId);

    // Create request
    const { data, error } = await supabase
      .from('student_requests')
      .insert([{
        student_id: student.id,
        department_id: student.department_id,
        submitted_by: userId,
        request_type,
        title,
        description: description || null,
        payload: payload ? JSON.stringify(payload) : null,
        priority: priority || 'medium',
        status: 'pending',
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: 'Request created successfully',
      request: data,
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /student-requests
 * List all requests by current student
 */
export const getStudentRequests = async (req, res) => {
  try {
    const userId = extractUserIdFromToken(req.headers.authorization);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const student = await getStudentByAuthId(userId);

    const { data, error } = await supabase
      .from('student_requests')
      .select('*')
      .eq('student_id', student.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ requests: data });
  } catch (error) {
    console.error('Get student requests error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /student-requests/:id
 * Get a specific request (student can only see their own)
 */
export const getRequestById = async (req, res) => {
  try {
    const userId = extractUserIdFromToken(req.headers.authorization);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const student = await getStudentByAuthId(userId);

    const { data, error } = await supabase
      .from('student_requests')
      .select('*')
      .eq('id', id)
      .eq('student_id', student.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Request not found' });
      }
      throw error;
    }

    res.json({ request: data });
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /student-requests/:id/comments
 * Add a comment to a request
 */
export const addComment = async (req, res) => {
  try {
    const userId = extractUserIdFromToken(req.headers.authorization);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const { comment } = req.body;

    if (!comment) {
      return res.status(400).json({ error: 'comment is required' });
    }

    const student = await getStudentByAuthId(userId);

    // Verify student owns this request
    const { data: request, error: reqError } = await supabase
      .from('student_requests')
      .select('id')
      .eq('id', id)
      .eq('student_id', student.id)
      .single();

    if (reqError || !request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Insert comment
    const { data, error } = await supabase
      .from('student_request_comments')
      .insert([{
        request_id: id,
        author_auth_user_id: userId,
        author_role: 'student',
        comment,
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Comment added', comment: data });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// COORDINATOR ENDPOINTS
// ============================================

/**
 * GET /coordinator/requests
 * List requests for coordinator's department
 */
export const getCoordinatorRequests = async (req, res) => {
  try {
    const userId = extractUserIdFromToken(req.headers.authorization);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const coordinator = await isCoordinator(userId);
    if (!coordinator) {
      return res.status(403).json({ error: 'Not a coordinator' });
    }

    const { status, request_type } = req.query;
    let query = supabase
      .from('coordinator_student_requests')
      .select('*')
      .eq('department_id', coordinator.department_id);

    if (status) {
      query = query.eq('status', status);
    }
    if (request_type) {
      query = query.eq('request_type', request_type);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ requests: data });
  } catch (error) {
    console.error('Get coordinator requests error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /coordinator/requests/:id
 * Get request details (with comments and attachments)
 */
export const getCoordinatorRequestDetails = async (req, res) => {
  try {
    const userId = extractUserIdFromToken(req.headers.authorization);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const coordinator = await isCoordinator(userId);
    if (!coordinator) {
      return res.status(403).json({ error: 'Not a coordinator' });
    }

    const { id } = req.params;

    // Get request
    const { data: request, error: reqError } = await supabase
      .from('student_requests')
      .select('*')
      .eq('id', id)
      .eq('department_id', coordinator.department_id)
      .single();

    if (reqError || !request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Get comments
    const { data: comments, error: commentsError } = await supabase
      .from('student_request_comments')
      .select('*')
      .eq('request_id', id)
      .order('created_at', { ascending: true });

    // Get attachments
    const { data: attachments, error: attachmentsError } = await supabase
      .from('student_request_attachments')
      .select('*')
      .eq('request_id', id);

    res.json({
      request,
      comments: comments || [],
      attachments: attachments || [],
    });
  } catch (error) {
    console.error('Get request details error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * PATCH /coordinator/requests/:id
 * Update request status and resolution
 */
export const updateRequestStatus = async (req, res) => {
  try {
    const userId = extractUserIdFromToken(req.headers.authorization);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const coordinator = await isCoordinator(userId);
    if (!coordinator) {
      return res.status(403).json({ error: 'Not a coordinator' });
    }

    const { id } = req.params;
    const { status, resolution_note } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }

    // Verify request belongs to coordinator's department
    const { data: request, error: reqError } = await supabase
      .from('student_requests')
      .select('id')
      .eq('id', id)
      .eq('department_id', coordinator.department_id)
      .single();

    if (reqError || !request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Update request
    const { data, error } = await supabase
      .from('student_requests')
      .update({
        status,
        resolution_note: resolution_note || null,
        handled_by: userId,
        handled_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Request updated', request: data });
  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /coordinator/requests/:id/comments
 * Add a comment to a request as coordinator
 */
export const addCoordinatorComment = async (req, res) => {
  try {
    const userId = extractUserIdFromToken(req.headers.authorization);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const coordinator = await isCoordinator(userId);
    if (!coordinator) {
      return res.status(403).json({ error: 'Not a coordinator' });
    }

    const { id } = req.params;
    const { comment } = req.body;

    if (!comment) {
      return res.status(400).json({ error: 'comment is required' });
    }

    // Verify request belongs to coordinator's department
    const { data: request, error: reqError } = await supabase
      .from('student_requests')
      .select('id')
      .eq('id', id)
      .eq('department_id', coordinator.department_id)
      .single();

    if (reqError || !request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Insert comment
    const { data, error } = await supabase
      .from('student_request_comments')
      .insert([{
        request_id: id,
        author_auth_user_id: userId,
        author_role: 'coordinator',
        comment,
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Comment added', comment: data });
  } catch (error) {
    console.error('Add coordinator comment error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /coordinator/analytics
 * Summary stats for coordinator dashboard
 */
export const getCoordinatorAnalytics = async (req, res) => {
  try {
    const userId = extractUserIdFromToken(req.headers.authorization);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const coordinator = await isCoordinator(userId);
    if (!coordinator) {
      return res.status(403).json({ error: 'Not a coordinator' });
    }

    // Count by status
    const { data: byStatus, error: statusError } = await supabase
      .from('student_requests')
      .select('status', { count: 'exact' })
      .eq('department_id', coordinator.department_id);

    // Count by request type
    const { data: byType, error: typeError } = await supabase
      .from('student_requests')
      .select('request_type', { count: 'exact' })
      .eq('department_id', coordinator.department_id);

    if (statusError || typeError) {
      throw statusError || typeError;
    }

    // Group counts
    const statusCounts = {};
    const typeCounts = {};

    if (byStatus) {
      byStatus.forEach(item => {
        statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
      });
    }

    if (byType) {
      byType.forEach(item => {
        typeCounts[item.request_type] = (typeCounts[item.request_type] || 0) + 1;
      });
    }

    res.json({
      total: byStatus?.length || 0,
      by_status: statusCounts,
      by_type: typeCounts,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: error.message });
  }
};
