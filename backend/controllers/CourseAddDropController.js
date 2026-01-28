import supabase from '../model/supabaseClient.js';

// ============================================
// COURSE ADD/DROP MANAGEMENT
// ============================================

/**
 * GET /course-add-drop/department/:departmentId/students
 * Get all registered students in a department
 */
export const getStudentsByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;

    if (!departmentId) {
      return res.status(400).json({ error: 'Department ID is required' });
    }

    // Get all active students in the department
    const { data: students, error } = await supabase
      .from('students')
      .select('id, full_name, roll_number, personal_email, status, joining_session')
      .eq('department_id', departmentId)
      .order('roll_number', { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /course-add-drop/student/:studentId/enrollments
 * Get all current course enrollments for a student
 */
export const getStudentEnrollments = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }

    // Get student's enrollments with course details
    const { data: enrollments, error } = await supabase
      .from('course_enrollments')
      .select(`
        id,
        student_id,
        course_id,
        status,
        semester,
        academic_year,
        grade,
        courses (
          id,
          code,
          name,
          credit_hours
        )
      `)
      .eq('student_id', studentId);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Get RST data to check if course has passed/graded
    const { data: rstData, error: rstError } = await supabase
      .from('student_rst')
      .select('course_id, grade')
      .eq('student_id', studentId);

    if (rstError) {
      console.warn('Warning: Could not fetch RST data:', rstError.message);
    }

    // Create a set of course IDs that have been passed/graded
    const passedCourseIds = new Set();
    (rstData || []).forEach((rst) => {
      // If there's a grade, it means the course has been evaluated
      if (rst.grade && rst.grade.toLowerCase() !== 'incomplete') {
        passedCourseIds.add(rst.course_id);
      }
    });

    // Filter out courses that have been passed/graded
    const filteredEnrollments = enrollments.filter(
      (e) => !passedCourseIds.has(e.course_id)
    );

    res.json({
      success: true,
      count: filteredEnrollments.length,
      data: filteredEnrollments,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /course-add-drop/department/:departmentId/available-courses
 * Get available courses for a specific semester in a department
 */
export const getAvailableCourses = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { semesterId } = req.query;

    if (!departmentId) {
      return res.status(400).json({ error: 'Department ID is required' });
    }

    let query = supabase
      .from('courses')
      .select(`
        id,
        code,
        name,
        credit_hours,
        pre_req,
        semesters (
          id,
          number,
          department_id
        )
      `)
      .eq('semesters.department_id', departmentId);

    // Filter by specific semester if provided
    if (semesterId) {
      query = query.eq('semester_id', semesterId);
    }

    const { data: courses, error } = await query.order('code', { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /course-add-drop/add
 * Add a course for a student in the current semester
 * Body: { student_id, course_id }
 */
export const addCourseForStudent = async (req, res) => {
  try {
    const { student_id, course_id } = req.body;

    // Validate required fields
    if (!student_id || !course_id) {
      return res.status(400).json({ error: 'student_id and course_id are required' });
    }

    // Check if student exists
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, department_id, status')
      .eq('id', student_id)
      .single();

    if (studentError || !student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Check if course exists
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, code, name, semesters(department_id)')
      .eq('id', course_id)
      .single();

    if (courseError || !course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Verify course is in the student's department
    if (course.semesters?.department_id !== student.department_id) {
      return res.status(400).json({ error: 'Course is not available for this student\'s department' });
    }

    // Calculate current semester (simplified - adjust based on your academic calendar)
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const currentSemester = currentMonth >= 7 ? 1 : 2; // Aug-Dec = Sem 1, Jan-July = Sem 2
    const academicYear = currentMonth >= 7 ? currentYear : currentYear - 1;

    // Check if student is already enrolled in this course in the current semester
    const { data: existingEnrollment, error: checkError } = await supabase
      .from('course_enrollments')
      .select('id')
      .eq('student_id', student_id)
      .eq('course_id', course_id)
      .eq('semester', currentSemester)
      .eq('academic_year', academicYear)
      .single();

    if (!checkError && existingEnrollment) {
      return res.status(400).json({ error: 'Student is already enrolled in this course for the current semester' });
    }

    // Create new enrollment with current semester info
    const { data: enrollment, error: enrollError } = await supabase
      .from('course_enrollments')
      .insert([{
        student_id,
        course_id,
        status: 'ongoing',
        semester: currentSemester,
        academic_year: academicYear,
      }])
      .select()
      .single();

    if (enrollError) {
      return res.status(500).json({ error: enrollError.message });
    }

    res.json({
      success: true,
      message: `Successfully added ${course.code} - ${course.name} for the current semester`,
      data: enrollment,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * DELETE /course-add-drop/drop/:enrollmentId
 * Drop a course for a student (soft delete - mark as DROPPED)
 * Only drops active courses (not already dropped)
 */
export const dropCourseForStudent = async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    if (!enrollmentId) {
      return res.status(400).json({ error: 'Enrollment ID is required' });
    }

    // Check if enrollment exists
    const { data: enrollment, error: checkError } = await supabase
      .from('course_enrollments')
      .select(`
        id,
        student_id,
        course_id,
        status,
        semester,
        academic_year,
        courses (
          code,
          name
        )
      `)
      .eq('id', enrollmentId)
      .single();

    if (checkError || !enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    // Check if already dropped
    if (enrollment.status === 'dropped') {
      return res.status(400).json({ error: 'This course has already been dropped' });
    }

    // Update enrollment status to dropped
    const { data: updatedEnrollment, error: updateError } = await supabase
      .from('course_enrollments')
      .update({ status: 'dropped' })
      .eq('id', enrollmentId)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    res.json({
      success: true,
      message: `Successfully dropped ${enrollment.courses?.code} - ${enrollment.courses?.name}`,
      data: updatedEnrollment,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /course-add-drop/student/:studentId/semester/:semesterId
 * Get enrollments for a student in a specific semester
 */
export const getStudentEnrollmentsBySemester = async (req, res) => {
  try {
    const { studentId, semesterId } = req.params;

    if (!studentId || !semesterId) {
      return res.status(400).json({ error: 'Student ID and Semester ID are required' });
    }

    const { data: enrollments, error } = await supabase
      .from('course_enrollments')
      .select(`
        id,
        student_id,
        course_id,
        status,
        semester,
        courses (
          id,
          code,
          name,
          credit_hours
        )
      `)
      .eq('student_id', studentId)
      .eq('semester', semesterId);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({
      success: true,
      count: enrollments.length,
      data: enrollments,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET /course-add-drop/department/:departmentId/students-enrollments
 * Get all students in a department with their current enrollments
 */
export const getDepartmentStudentsWithEnrollments = async (req, res) => {
  try {
    const { departmentId } = req.params;

    if (!departmentId) {
      return res.status(400).json({ error: 'Department ID is required' });
    }

    // Get all students in department
    const { data: students, error: studentError } = await supabase
      .from('students')
      .select(`
        id,
        full_name,
        roll_number,
        personal_email,
        status,
        joining_session,
        course_enrollments (
          id,
          course_id,
          status,
          semester,
          courses (
            code,
            name,
            credit_hours
          )
        )
      `)
      .eq('department_id', departmentId)
      .order('roll_number', { ascending: true });

    if (studentError) {
      return res.status(500).json({ error: studentError.message });
    }

    res.json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
