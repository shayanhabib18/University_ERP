import supabase from "../model/supabaseClient.js";

/**
 * Get pending results for HOD/Department Chair approval
 * GET /results/pending-for-hod
 */
export const getPendingResultsForHOD = async (_req, res) => {
  try {
    // Fetch all pending results with related student and course info
    const { data: results, error: resultsError } = await supabase
      .from("student_rst")
      .select(`
        id,
        student_id,
        course_id,
        rst_data,
        grade,
        approval_status,
        created_at,
        student:students (
          id,
          full_name,
          roll_number
        ),
        course:courses (
          id,
          name,
          code
        )
      `)
      .eq("approval_status", "pending");

    if (resultsError) {
      console.error("Error fetching pending results:", resultsError);
      return res.status(500).json({ error: resultsError.message });
    }

    // Group results by course
    const courseMap = {};
    results.forEach(result => {
      const courseId = result.course_id;
      if (!courseMap[courseId]) {
        courseMap[courseId] = {
          id: courseId,
          name: result.course?.name,
          code: result.course?.code,
          results: []
        };
      }

      // Calculate total marks from rst_data
      let totalMarks = 0;
      if (result.rst_data?.components && result.rst_data?.marks) {
        result.rst_data.components.forEach(comp => {
          const mark = result.rst_data.marks[comp.id];
          if (mark && mark !== 'Abs' && !isNaN(parseFloat(mark))) {
            const weightedMark = (parseFloat(mark) / comp.maxMarks) * comp.weightage;
            totalMarks += weightedMark;
          }
        });
      }

      courseMap[courseId].results.push({
        id: result.id,
        student_name: result.student?.full_name,
        roll_number: result.student?.roll_number,
        total_marks: Math.round(totalMarks * 100) / 100,
        grade: result.grade,
        created_at: result.created_at
      });
    });

    // Convert map to array
    const courses = Object.values(courseMap);

    res.json(courses);
  } catch (error) {
    console.error("Error in getPendingResultsForHOD:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Approve a single result
 * POST /results/approve/:resultId
 */
export const approveSingleResult = async (req, res) => {
  try {
    const { resultId } = req.params;
    const facultyId = req.user?.id || req.facultyId;

    // Update result status to approved
    const { data, error } = await supabase
      .from("student_rst")
      .update({ 
        approval_status: "approved",
        approved_by: facultyId,
        approved_at: new Date().toISOString(),
        rejected_by: null,
        rejected_at: null,
        rejection_reason: null
      })
      .eq("id", resultId)
      .eq("approval_status", "pending")
      .select();

    if (error) {
      console.error("Error approving result:", error);
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(400).json({ error: "Result not pending or not found" });
    }

    res.json({ 
      success: true, 
      message: "Result approved successfully",
      data 
    });
  } catch (error) {
    console.error("Error in approveSingleResult:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Approve all results for a course
 * POST /results/approve/:courseId
 */
export const approveAllResults = async (req, res) => {
  try {
    const { courseId } = req.params;
    const facultyId = req.user?.id || req.facultyId;

    // Update all pending results for this course
    const { data, error } = await supabase
      .from("student_rst")
      .update({ 
        approval_status: "approved",
        approved_by: facultyId,
        approved_at: new Date().toISOString(),
        rejected_by: null,
        rejected_at: null,
        rejection_reason: null
      })
      .eq("course_id", courseId)
      .eq("approval_status", "pending")
      .select();

    if (error) {
      console.error("Error approving all results:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ 
      success: true, 
      message: `${data.length} result(s) approved successfully`,
      data 
    });
  } catch (error) {
    console.error("Error in approveAllResults:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Reject a single result
 * POST /results/reject/:resultId
 */
export const rejectResult = async (req, res) => {
  try {
    const { resultId } = req.params;
    const { reason } = req.body;
    const facultyId = req.user?.id || req.facultyId;

    if (!reason) {
      return res.status(400).json({ error: "Rejection reason is required" });
    }

    // Update result status to rejected
    const { data, error } = await supabase
      .from("student_rst")
      .update({ 
        approval_status: "rejected",
        rejection_reason: reason,
        rejected_by: facultyId,
        rejected_at: new Date().toISOString(),
        approved_by: null,
        approved_at: null
      })
      .eq("id", resultId)
      .eq("approval_status", "pending")
      .select();

    if (error) {
      console.error("Error rejecting result:", error);
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(400).json({ error: "Result not pending or not found" });
    }

    res.json({ 
      success: true, 
      message: "Result rejected successfully",
      data 
    });
  } catch (error) {
    console.error("Error in rejectResult:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get approved results for a student
 * GET /results/student/:studentId
 */
export const getStudentResults = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Get all approved results for this student
    const { data: results, error } = await supabase
      .from("student_rst")
      .select(`
        id,
        course_id,
        grade,
        rst_data,
        approved_at,
        course:courses (
          id,
          name,
          code,
          credit_hours,
          semester:semesters (
            number
          )
        )
      `)
      .eq("student_id", studentId)
      .eq("approval_status", "approved")
      .order("approved_at", { ascending: false });

    if (error) {
      console.error("Error fetching student results:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json(results);
  } catch (error) {
    console.error("Error in getStudentResults:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
