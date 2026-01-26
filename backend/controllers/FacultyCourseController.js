// backend/controllers/FacultyCourseController.js
import supabase from "../model/supabaseClient.js";

// Assign courses to a faculty member
export const assignCoursesToFaculty = async (req, res) => {
  try {
    const { faculty_id, course_ids } = req.body;

    if (!faculty_id || !course_ids || !Array.isArray(course_ids)) {
      return res.status(400).json({ 
        error: "faculty_id and course_ids (array) are required" 
      });
    }

    // Create assignment records
    const assignments = course_ids.map(course_id => ({
      faculty_id,
      course_id
    }));

    const { data, error } = await supabase
      .from("faculty_courses")
      .upsert(assignments, { onConflict: 'faculty_id,course_id' })
      .select();

    if (error) return res.status(500).json({ error: error.message });
    
    // Check if this faculty_id belongs to a manually assigned HOD and mark them as having courses
    try {
      const { data: hodData } = await supabase
        .from("hods")
        .select("id")
        .eq("hod_email", faculty_id) // If faculty_id is an email (for manual HODs)
        .eq("assignment_mode", "manual")
        .eq("status", "ACTIVE")
        .maybeSingle();
      
      if (hodData) {
        // Update the HOD record to mark has_courses as true
        await supabase
          .from("hods")
          .update({ has_courses: true })
          .eq("id", hodData.id);
        console.log(`✅ Updated HOD with courses assigned`);
      }
    } catch (hodErr) {
      console.log("Note: Could not update HOD has_courses flag", hodErr);
    }
    
    res.json({ 
      message: "Courses assigned successfully", 
      data 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Remove a course assignment from faculty
export const removeCourseFromFaculty = async (req, res) => {
  try {
    const { faculty_id, course_id } = req.params;

    const { error } = await supabase
      .from("faculty_courses")
      .delete()
      .eq("faculty_id", faculty_id)
      .eq("course_id", course_id);

    if (error) return res.status(500).json({ error: error.message });
    
    res.json({ message: "Course removed from faculty successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all courses assigned to a specific faculty
export const getFacultyCourses = async (req, res) => {
  try {
    const { faculty_id } = req.params;

    const { data, error } = await supabase
      .from("faculty_courses")
      .select(`
        id,
        assigned_at,
        course:courses (
          id,
          code,
          name,
          credit_hours,
          semester:semesters (
            id,
            number,
            department_id
          )
        )
      `)
      .eq("faculty_id", faculty_id);

    if (error) return res.status(500).json({ error: error.message });

    // Compute enrolled student counts per course
    const courseIds = (data || [])
      .map(item => item?.course?.id)
      .filter(Boolean);

    let enrollmentCounts = {};

    if (courseIds.length > 0) {
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from("course_enrollments")
        .select("course_id")
        .in("course_id", courseIds);

      if (enrollmentsError) {
        return res.status(500).json({ error: enrollmentsError.message });
      }

      enrollmentCounts = (enrollments || []).reduce((acc, row) => {
        acc[row.course_id] = (acc[row.course_id] || 0) + 1;
        return acc;
      }, {});
    }

    const response = (data || []).map(item => ({
      ...item,
      student_count: enrollmentCounts[item?.course?.id] || 0,
    }));

    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get detailed course info for faculty including students and materials
export const getFacultyCourseDetails = async (req, res) => {
  try {
    const { faculty_id, course_id } = req.params;

    // Check if faculty is assigned to this course
    const { data: assignment, error: assignmentError } = await supabase
      .from("faculty_courses")
      .select("id")
      .eq("faculty_id", faculty_id)
      .eq("course_id", course_id)
      .single();

    if (assignmentError || !assignment) {
      return res.status(404).json({ error: "Course not assigned to this faculty" });
    }

    // Get course details
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select(`
        id,
        code,
        name,
        credit_hours,
        semester:semesters (
          id,
          number,
          department_id
        )
      `)
      .eq("id", course_id)
      .single();

    if (courseError) return res.status(500).json({ error: courseError.message });

    // Get enrolled students with profile info
    const { data: enrollments, error: enrollmentsError, count: studentCount } = await supabase
      .from("course_enrollments")
      .select(`
        id,
        status,
        student:students (
          id,
          full_name,
          roll_number,
          personal_email,
          student_phone
        )
      `, { count: 'exact' })
      .eq("course_id", course_id);

    if (enrollmentsError) return res.status(500).json({ error: enrollmentsError.message });

    // Get course materials count (adjust based on your materials table structure)
    const { count: materialsCount } = await supabase
      .from("course_materials")
      .select("*", { count: 'exact', head: true })
      .eq("course_id", course_id);

    res.json({
      ...course,
      students_count: studentCount || 0,
      materials_count: materialsCount || 0,
      students: (enrollments || []).map(e => ({
        id: e.student?.id,
        name: e.student?.full_name,
        roll_number: e.student?.roll_number,
        email: e.student?.personal_email,
        phone: e.student?.student_phone,
        status: e.status || "ongoing",
      })).filter(s => s.id)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all faculty with their assigned courses
export const getAllFacultyWithCourses = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("faculties")
      .select(`
        id,
        name,
        email,
        designation,
        department:departments (
          id,
          name
        ),
        faculty_courses (
          course:courses (
            id,
            code,
            name,
            credit_hours
          )
        )
      `)
      .order('name');

    if (error) return res.status(500).json({ error: error.message });
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get courses that are not assigned to a specific faculty
export const getUnassignedCoursesForFaculty = async (req, res) => {
  try {
    const { faculty_id } = req.params;

    // Get all assigned course IDs
    const { data: assignedCourses, error: assignedError } = await supabase
      .from("faculty_courses")
      .select("course_id")
      .eq("faculty_id", faculty_id);

    if (assignedError) return res.status(500).json({ error: assignedError.message });

    const assignedCourseIds = assignedCourses.map(ac => ac.course_id);

    // Get all courses not in the assigned list
    let query = supabase
      .from("courses")
      .select(`
        id,
        code,
        name,
        credit_hours,
        semester:semesters (
          id,
          number,
          department_id
        )
      `);

    if (assignedCourseIds.length > 0) {
      query = query.not("id", "in", `(${assignedCourseIds.join(",")})`);
    }

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
