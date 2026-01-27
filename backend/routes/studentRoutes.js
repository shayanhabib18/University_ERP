// backend/routes/studentRoutes.js
// Express routes for student management aligned with Supabase schema
import express from "express";
import supabase from "../model/supabaseClient.js";
import { sendApprovalEmailWithLink } from "../utils/mailer.js";

const router = express.Router();

// ==================== HELPER FUNCTIONS ====================

// Helper function to get first semester courses for a department
const getFirstSemesterCourses = async (departmentId) => {
  try {
    // First, get the first semester for the department
    const { data: semester, error: semesterError } = await supabase
      .from("semesters")
      .select("id")
      .eq("department_id", departmentId)
      .eq("number", 1)
      .single();

    if (semesterError || !semester) {
      console.warn(`No first semester found for department ${departmentId}`);
      return [];
    }

    // Get all courses for the first semester
    const { data: courses, error: coursesError } = await supabase
      .from("courses")
      .select("id, code, name, credit_hours")
      .eq("semester_id", semester.id);

    if (coursesError) {
      console.error(`Error fetching courses: ${coursesError.message}`);
      return [];
    }

    return courses || [];
  } catch (error) {
    console.error("Error in getFirstSemesterCourses:", error);
    return [];
  }
};

// Helper function to enroll student in first semester courses
const enrollStudentInFirstSemester = async (studentId, departmentId, joiningDate) => {
  try {
    const courses = await getFirstSemesterCourses(departmentId);
    
    if (courses.length === 0) {
      console.warn(`No courses found for first semester in department ${departmentId}`);
      return { success: false, message: "No first semester courses found" };
    }

    // Determine academic year from joining date
    const year = joiningDate ? new Date(joiningDate).getFullYear() : new Date().getFullYear();
    const academicYear = `${year}-${year + 1}`;

    // Create enrollment records for all first semester courses
    const enrollments = courses.map(course => ({
      student_id: studentId,
      course_id: course.id,
      semester: 1,
      academic_year: academicYear,
      credit_hours: course.credit_hours,
      status: "ongoing"
    }));

    const { data, error } = await supabase
      .from("course_enrollments")
      .insert(enrollments)
      .select();

    if (error) {
      console.error("Error creating enrollments:", error.message);
      return { success: false, message: error.message };
    }

    console.log(`✓ Enrolled student ${studentId} in ${data.length} first semester courses`);
    return { success: true, count: data.length, enrollments: data };
  } catch (error) {
    console.error("Error in enrollStudentInFirstSemester:", error);
    return { success: false, message: error.message };
  }
};

// ==================== STUDENT SIGNUP REQUEST ROUTES ====================

// GET all pending signup requests
router.get("/signup-requests", async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from("student_signup_requests")
      .select(`
        *,
        departments:department_id (
          id,
          name,
          code
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET single signup request by ID
router.get("/signup-requests/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;
    const { data, error } = await supabase
      .from("student_signup_requests")
      .select(`
        *,
        departments:department_id (
          id,
          name,
          code
        )
      `)
      .eq("id", requestId)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// CREATE new signup request
router.post("/signup-requests", async (req, res) => {
  try {
    const {
      student_name,
      father_name,
        date_of_birth,
        gender,
      email,
      mobile,
        parent_phone,
      cnic,
      qualification,
      obtained_marks,
      total_marks,
        address,
      city,
      department_id,
      joining_date,
      joining_session,
      marksheet_url,
    } = req.body;

    const required = [
      "student_name",
      "father_name",
      "email",
      "mobile",
      "cnic",
      "qualification",
      "obtained_marks",
      "total_marks",
      "city",
      "department_id",
      "joining_date",
      "joining_session",
    ];

    for (const field of required) {
      if (!req.body?.[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    const { data, error } = await supabase
      .from("student_signup_requests")
      .insert([
        {
                    date_of_birth,
                    gender,
                    parent_phone,
                    address,
          student_name,
          father_name,
          email,
          mobile,
          cnic,
          qualification,
          obtained_marks,
          total_marks,
          city,
          department_id,
          joining_date,
          joining_session,
          marksheet_url,
          status: "pending",
        },
      ])
      .select();

    if (error) throw error;
    res.status(201).json(data?.[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// UPDATE signup request status (approve/decline)
router.put("/signup-requests/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    if (!["pending", "approved", "declined"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const { data, error } = await supabase
      .from("student_signup_requests")
      .update({ status })
      .eq("id", requestId)
      .select();

    if (error) throw error;
    res.json(data?.[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// APPROVE signup request - create auth user, student record, and email reset link
router.post("/signup-requests/:requestId/approve", async (req, res) => {
  try {
    const { requestId } = req.params;

    // Get the signup request
    const { data: request, error: fetchError } = await supabase
      .from("student_signup_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (fetchError) throw new Error("Signup request not found");
    if (request.status !== "pending") {
      return res.status(400).json({ error: "Request already processed" });
    }

    const email = request.email;

    // Create Supabase Auth user with a random internal password (not shared) and confirm email
    const internalPassword = `Student@${Math.random().toString(36).slice(-12)}`;

    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: internalPassword,
      email_confirm: true,
      user_metadata: {
        full_name: request.student_name,
        role: 'student',
        department_id: request.department_id
      }
    });

    if (authError) throw new Error(`Failed to create auth user: ${authError.message}`);

    // Auto-generate roll number with batch year format
    const { data: dept } = await supabase
      .from("departments")
      .select("code,name")
      .eq("id", request.department_id)
      .single();

    const prefixSource = dept?.code || dept?.name || "STU";
    const prefix = prefixSource.toString().trim();
    const joiningYear = request.joining_date ? new Date(request.joining_date).getFullYear() : new Date().getFullYear();
    const batchYear = joiningYear.toString().slice(-2);
    const rollPrefix = `${prefix}1${batchYear}`;

    const { data: lastRoll } = await supabase
      .from("students")
      .select("roll_number")
      .eq("department_id", request.department_id)
      .ilike("roll_number", `${rollPrefix}-%`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let nextNumber = 1;
    if (lastRoll?.roll_number) {
      const parts = lastRoll.roll_number.split("-");
      const maybeNum = parseInt(parts[parts.length - 1], 10);
      if (!Number.isNaN(maybeNum)) {
        nextNumber = maybeNum + 1;
      }
    }

    const rollNumber = `${rollPrefix}-${String(nextNumber).padStart(2, "0")}`;

    // Create student record
    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .insert([{
        auth_user_id: authUser.user.id,
        full_name: request.student_name,
        father_name: request.father_name,
        date_of_birth: request.date_of_birth || null,
        gender: request.gender || null,
        cnic: request.cnic,
        roll_number: rollNumber,
        department_id: request.department_id,
        joining_session: request.joining_session,
        joining_date: request.joining_date,
        personal_email: request.email,
        student_phone: request.mobile,
        parent_phone: request.parent_phone || null,
        permanent_address: request.address || null,
        city: request.city,
        status: "active"
      }])
      .select();

    if (studentError) {
      await supabase.auth.admin.deleteUser(authUser.user.id);
      throw new Error(`Failed to create student record: ${studentError.message}`);
    }

    // Auto-enroll student in first semester courses
    const studentId = studentData[0].id;
    const enrollmentResult = await enrollStudentInFirstSemester(
      studentId,
      request.department_id,
      request.joining_date
    );

    if (enrollmentResult.success) {
      console.log(`✓ Auto-enrolled student in ${enrollmentResult.count} courses`);
    } else {
      console.warn(`⚠️  Could not auto-enroll student: ${enrollmentResult.message}`);
    }

    // Update signup request status to approved
    await supabase
      .from("student_signup_requests")
      .update({ status: "approved" })
      .eq("id", requestId);

    // Send password-reset link email to student (best-effort)
    try {
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: email,
        options: {
          redirectTo: 'http://localhost:5173/reset-password'
        }
      });

      if (linkError) {
        console.warn(`⚠️  Failed to generate reset link: ${linkError.message}`);
        throw new Error(`Failed to generate reset link: ${linkError.message}`);
      }

      const resetLink = linkData?.properties?.action_link || linkData?.action_link;
      const departmentName = dept?.name || 'N/A';

      await sendApprovalEmailWithLink({
        toEmail: email,
        fullName: request.student_name,
        rollNumber: rollNumber,
        departmentName,
        resetLink,
      });

      console.log(`✓ Approval email sent for ${request.student_name} (${rollNumber})`);
    } catch (mailErr) {
      console.warn("Failed to send reset-link email:", mailErr?.message || mailErr);
    }

    res.status(200).json({
      success: true,
      message: "Student approved. Reset link emailed to student.",
      rollNumber,
    });
  } catch (error) {
    console.error("Approval error:", error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE signup request
router.delete("/signup-requests/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;

    const { error } = await supabase
      .from("student_signup_requests")
      .delete()
      .eq("id", requestId);

    if (error) throw error;
    res.json({ message: "Signup request deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== STUDENT ROUTES ====================

// GET all students
router.get("/", async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// SEARCH students (placed before id-based route)
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: "Search query required" });
    }

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .or(`full_name.ilike.%${q}%,roll_number.ilike.%${q}%,personal_email.ilike.%${q}%`);

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET current student profile using auth token (supabase access token)
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Missing access token" });

    // Decode JWT to extract user id (sub)
    const parts = token.split(".");
    if (parts.length < 2) return res.status(401).json({ error: "Invalid token" });
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
    const userId = payload.sub;
    if (!userId) return res.status(401).json({ error: "Invalid token payload" });

    const { data: student, error } = await supabase
      .from("students")
      .select("id, full_name, roll_number, personal_email, student_phone, city, joining_session, joining_date, permanent_address, department_id")
      .eq("auth_user_id", userId)
      .single();

    if (error) throw error;
    if (!student) return res.status(404).json({ error: "Student not found" });

    // Fetch department name if department_id exists
    let departmentName = "";
    if (student.department_id) {
      const { data: dept } = await supabase
        .from("departments")
        .select("name")
        .eq("id", student.department_id)
        .single();
      departmentName = dept?.name || "";
    }

    res.json({
      ...student,
      department_name: departmentName,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET students by department
router.get("/department/:departmentId", async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("department_id", departmentId)
      .order("roll_number", { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET single student by ID
router.get("/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("id", studentId)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET student courses with grades for transcript
router.get("/:studentId/courses", async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Get course enrollments with course details and grades
    const { data, error } = await supabase
      .from("course_enrollments")
      .select(`
        id,
        semester,
        academic_year,
        grade,
        status,
        courses (
          id,
          name,
          code,
          credit_hours
        )
      `)
      .eq("student_id", studentId)
      .order("academic_year", { ascending: false })
      .order("semester", { ascending: false });

    if (error) throw error;
    
    // Format response to include course details at top level
    const formattedData = (data || []).map(enrollment => ({
      id: enrollment.id,
      course_id: enrollment.courses?.id,
      course_name: enrollment.courses?.name || "Unknown Course",
      course_code: enrollment.courses?.code,
      credit_hours: enrollment.courses?.credit_hours || 3,
      grade: enrollment.grade || "N/A",
      semester: enrollment.semester,
      academic_year: enrollment.academic_year,
      status: enrollment.status,
    }));
    
    res.json(formattedData);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// CREATE new student with Supabase Auth account and send reset link
// Primary endpoint: POST /students (from admin panel)
router.post("/", async (req, res) => {
  // Delegate to register-with-auth logic
  const {
    full_name,
    father_name,
    date_of_birth,
    gender,
    cnic,
    department_id,
    joining_session,
    joining_date,
    personal_email,
    student_phone,
    parent_phone,
  } = req.body;

  const required = [
    "full_name",
    "father_name",
    "cnic",
    "department_id",
    "personal_email",
  ];

  for (const field of required) {
    if (!req.body?.[field]) {
      return res.status(400).json({ error: `${field} is required` });
    }
  }

  try {
    // Check if student already exists in database
    const { data: existingStudent } = await supabase
      .from("students")
      .select("id")
      .eq("personal_email", personal_email)
      .single();

    if (existingStudent) {
      return res.status(400).json({ error: "A student with this email already exists" });
    }

    // Create Supabase Auth user with internal password (not shared)
    const internalPassword = `Student@${Math.random().toString(36).slice(-12)}`;
    let authUser = null;
    let isNewAuthUser = true;

    const { data: createdUser, error: authError } = await supabase.auth.admin.createUser({
      email: personal_email,
      password: internalPassword,
      email_confirm: true,
      user_metadata: {
        full_name: full_name,
        role: 'student',
        department_id: department_id
      }
    });

    if (authError) {
      // If auth user already exists with this email in auth system, try to fetch and reuse it
      if (authError.message.includes("already been registered") || authError.message.includes("already exists")) {
        console.warn(`⚠️  Auth user already exists for ${personal_email}, attempting to reuse...`);
        // Try to get the existing user via admin API
        const { data: users } = await supabase.auth.admin.listUsers();
        const existingAuthUser = users?.users?.find(u => u.email?.toLowerCase() === personal_email.toLowerCase());
        
        if (existingAuthUser) {
          authUser = { user: existingAuthUser };
          isNewAuthUser = false;
          console.log(`✓ Reusing existing auth user for ${personal_email}`);
        } else {
          throw new Error(`Auth user exists but cannot be retrieved for ${personal_email}`);
        }
      } else {
        throw new Error(`Failed to create auth user: ${authError.message}`);
      }
    } else {
      authUser = { user: createdUser.user };
    }

    // Auto-generate roll number with batch year format
    const { data: dept, error: deptError } = await supabase
      .from("departments")
      .select("code,name")
      .eq("id", department_id)
      .single();

    if (deptError) {
      // Only delete auth user if we just created it (not if reusing existing)
      if (isNewAuthUser) {
        await supabase.auth.admin.deleteUser(authUser.user.id);
      }
      throw deptError;
    }

    const prefixSource = dept?.code || dept?.name || "DEP";
    const prefix = (prefixSource || "DEP").toString().trim();
    
    // Get batch year from joining date
    const joiningYear = joining_date ? new Date(joining_date).getFullYear() : new Date().getFullYear();
    const batchYear = joiningYear.toString().slice(-2);
    const rollPrefix = `${prefix}1${batchYear}`;

    const { data: lastRoll } = await supabase
      .from("students")
      .select("roll_number")
      .eq("department_id", department_id)
      .ilike("roll_number", `${rollPrefix}-%`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let nextNumber = 1;
    if (lastRoll?.roll_number) {
      const parts = lastRoll.roll_number.split("-");
      const maybeNum = parseInt(parts[parts.length - 1], 10);
      if (!Number.isNaN(maybeNum)) {
        nextNumber = maybeNum + 1;
      }
    }

    const finalRollNumber = `${rollPrefix}-${String(nextNumber).padStart(2, "0")}`;

    // Create student record
    const { data, error } = await supabase
      .from("students")
      .insert([
        {
          auth_user_id: authUser.user.id,
          full_name,
          father_name,
          date_of_birth,
          gender,
          cnic,
          roll_number: finalRollNumber,
          permanent_address: req.body.address || req.body.permanent_address || null,
          department_id,
          joining_session,
          joining_date,
          personal_email,
          student_phone,
          parent_phone,
          city: req.body.city || null,
          status: "active",
        },
      ])
      .select();

    if (error) {
      // Rollback: delete auth user only if we just created it (not if reusing existing)
      if (isNewAuthUser) {
        await supabase.auth.admin.deleteUser(authUser.user.id);
      }
      throw error;
    }

    // Auto-enroll student in first semester courses
    const studentId = data[0].id;
    const enrollmentResult = await enrollStudentInFirstSemester(
      studentId,
      department_id,
      joining_date
    );

    if (enrollmentResult.success) {
      console.log(`✓ Auto-enrolled student in ${enrollmentResult.count} courses`);
    } else {
      console.warn(`⚠️  Could not auto-enroll student: ${enrollmentResult.message}`);
    }

    // Attempt to send reset-link email
    try {
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: personal_email,
        options: {
          redirectTo: 'http://localhost:5173/reset-password'
        }
      });

      if (linkError) {
        console.warn(`⚠️  Failed to generate reset link: ${linkError.message}`);
        throw new Error(`Failed to generate reset link: ${linkError.message}`);
      }

      const resetLink = linkData?.properties?.action_link || linkData?.action_link;
      const departmentName = dept?.name || 'N/A';

      await sendApprovalEmailWithLink({
        toEmail: personal_email,
        fullName: full_name,
        rollNumber: finalRollNumber,
        departmentName,
        resetLink,
      });
    } catch (mailErr) {
      console.warn("Failed to send reset-link email:", mailErr?.message || mailErr);
    }

    res.status(201).json({
      success: true,
      student: data?.[0],
      roll_number: finalRollNumber,
      message: "Student created. Reset link emailed to student.",
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(400).json({ error: error.message });
  }
});

// CREATE new student with Supabase Auth account and send credentials
// Legacy endpoint for backward compatibility - removed (POST / handles this now)
// router.post("/register-with-auth") → use POST / instead

router.post("/register-with-auth", async (req, res) => {
  try {
    const {
      full_name,
      father_name,
      date_of_birth,
      gender,
      cnic,
      department_id,
      joining_session,
      joining_date,
      personal_email,
      student_phone,
      parent_phone,
    } = req.body;

    const required = [
      "full_name",
      "father_name",
      "cnic",
      "department_id",
      "personal_email",
    ];

    for (const field of required) {
      if (!req.body?.[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    // Check if student already exists in database
    const { data: existingStudent } = await supabase
      .from("students")
      .select("id")
      .eq("personal_email", personal_email)
      .single();

    if (existingStudent) {
      return res.status(400).json({ error: "A student with this email already exists" });
    }

    // Create Supabase Auth user with internal password (not shared)
    const internalPassword = `Student@${Math.random().toString(36).slice(-12)}`;
    let authUser = null;
    let isNewAuthUser = true;

    const { data: createdUser, error: authError } = await supabase.auth.admin.createUser({
      email: personal_email,
      password: internalPassword,
      email_confirm: true,
      user_metadata: {
        full_name: full_name,
        role: 'student',
        department_id: department_id
      }
    });

    if (authError) {
      // If auth user already exists with this email in auth system, try to fetch and reuse it
      if (authError.message.includes("already been registered") || authError.message.includes("already exists")) {
        console.warn(`⚠️  Auth user already exists for ${personal_email}, attempting to reuse...`);
        // Try to get the existing user via admin API
        const { data: users } = await supabase.auth.admin.listUsers();
        const existingAuthUser = users?.users?.find(u => u.email?.toLowerCase() === personal_email.toLowerCase());
        
        if (existingAuthUser) {
          authUser = { user: existingAuthUser };
          isNewAuthUser = false;
          console.log(`✓ Reusing existing auth user for ${personal_email}`);
        } else {
          throw new Error(`Auth user exists but cannot be retrieved for ${personal_email}`);
        }
      } else {
        throw new Error(`Failed to create auth user: ${authError.message}`);
      }
    } else {
      authUser = { user: createdUser.user };
    }

    // Auto-generate roll number with batch year format
    const { data: dept, error: deptError } = await supabase
      .from("departments")
      .select("code,name")
      .eq("id", department_id)
      .single();

    if (deptError) {
      // Only delete auth user if we just created it (not if reusing existing)
      if (isNewAuthUser) {
        await supabase.auth.admin.deleteUser(authUser.user.id);
      }
      throw deptError;
    }

    const prefixSource = dept?.code || dept?.name || "DEP";
    const prefix = (prefixSource || "DEP").toString().trim();
    
    // Get batch year from joining date
    const joiningYear = joining_date ? new Date(joining_date).getFullYear() : new Date().getFullYear();
    const batchYear = joiningYear.toString().slice(-2);
    const rollPrefix = `${prefix}1${batchYear}`;

    const { data: lastRoll } = await supabase
      .from("students")
      .select("roll_number")
      .eq("department_id", department_id)
      .ilike("roll_number", `${rollPrefix}-%`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let nextNumber = 1;
    if (lastRoll?.roll_number) {
      const parts = lastRoll.roll_number.split("-");
      const maybeNum = parseInt(parts[parts.length - 1], 10);
      if (!Number.isNaN(maybeNum)) {
        nextNumber = maybeNum + 1;
      }
    }

    const finalRollNumber = `${rollPrefix}-${String(nextNumber).padStart(2, "0")}`;

    // Create student record
    const { data, error } = await supabase
      .from("students")
      .insert([
        {
          auth_user_id: authUser.user.id,
          full_name,
          father_name,
          date_of_birth,
          gender,
          cnic,
          roll_number: finalRollNumber,
          department_id,
          joining_session,
          joining_date,
          personal_email,
          student_phone,
          parent_phone,
          permanent_address: req.body.address || req.body.permanent_address || null,
          city: req.body.city || null,
          status: "active",
        },
      ])
      .select();

    if (error) {
      // Rollback: delete auth user only if we just created it (not if reusing existing)
      if (isNewAuthUser) {
        await supabase.auth.admin.deleteUser(authUser.user.id);
      }
      throw error;
    }

    // Auto-enroll student in first semester courses
    const studentId = data[0].id;
    const enrollmentResult = await enrollStudentInFirstSemester(
      studentId,
      department_id,
      joining_date
    );

    if (enrollmentResult.success) {
      console.log(`✓ Auto-enrolled student in ${enrollmentResult.count} courses`);
    } else {
      console.warn(`⚠️  Could not auto-enroll student: ${enrollmentResult.message}`);
    }

    // Attempt to send reset-link email
    try {
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: personal_email,
        options: {
          redirectTo: 'http://localhost:5173/reset-password'
        }
      });

      if (linkError) {
        console.warn(`⚠️  Failed to generate reset link: ${linkError.message}`);
        throw new Error(`Failed to generate reset link: ${linkError.message}`);
      }

      const resetLink = linkData?.properties?.action_link || linkData?.action_link;
      const departmentName = dept?.name || 'N/A';

      await sendApprovalEmailWithLink({
        toEmail: personal_email,
        fullName: full_name,
        rollNumber: finalRollNumber,
        departmentName,
        resetLink,
      });
    } catch (mailErr) {
      console.warn("Failed to send reset-link email:", mailErr?.message || mailErr);
    }

    res.status(201).json({
      success: true,
      student: data?.[0],
      roll_number: finalRollNumber,
      message: "Student created. Reset link emailed to student.",
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(400).json({ error: error.message });
  }
});

// UPDATE student
router.put("/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const updateData = req.body;

    const { data, error } = await supabase
      .from("students")
      .update(updateData)
      .eq("id", studentId)
      .select();

    if (error) throw error;
    res.json(data?.[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE student
router.delete("/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    const { error } = await supabase
      .from("students")
      .delete()
      .eq("id", studentId);

    if (error) throw error;
    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== ACADEMIC RECORDS ROUTES ====================

// Helper: fetch academic history from student_rst with course + enrollment context
const fetchAcademicHistory = async (studentId) => {
  // Fetch RST rows with course metadata
  const { data: rstRows, error: rstError } = await supabase
    .from("student_rst")
    .select(`
      id,
      student_id,
      course_id,
      faculty_id,
      grade,
      rst_data,
      created_at,
      updated_at,
      courses:course_id (
        id,
        code,
        name,
        credit_hours,
        semester_id
      )
    `)
    .eq("student_id", studentId);

  if (rstError) throw rstError;

  const rows = rstRows || [];
  if (!rows.length) return [];

  // Fetch enrollment semesters for these courses to derive semester number
  const courseIds = [...new Set(rows.map((r) => r.course_id).filter(Boolean))];
  let enrollmentMap = {};

  if (courseIds.length > 0) {
    const { data: enrollments, error: enrollError } = await supabase
      .from("course_enrollments")
      .select("course_id, semester")
      .eq("student_id", studentId)
      .in("course_id", courseIds);

    if (enrollError) throw enrollError;

    enrollmentMap = (enrollments || []).reduce((acc, e) => {
      acc[e.course_id] = e;
      return acc;
    }, {});
  }

  const enriched = rows.map((row) => {
    const enrollment = enrollmentMap[row.course_id];
    const course = row.courses || {};
    const semesterValue = enrollment?.semester ?? course.semester_id ?? null;

    return {
      id: row.id,
      student_id: row.student_id,
      course_id: row.course_id,
      faculty_id: row.faculty_id,
      grade: row.grade,
      rst_data: row.rst_data,
      created_at: row.created_at,
      updated_at: row.updated_at,
      course_code: course.code || null,
      course_name: course.name || null,
      credit_hours: course.credit_hours || null,
      semester: semesterValue,
    };
  });

  // Sort by semester descending when numeric, then by created_at desc
  enriched.sort((a, b) => {
    const aNum = Number(a.semester);
    const bNum = Number(b.semester);
    const aIsNum = !Number.isNaN(aNum);
    const bIsNum = !Number.isNaN(bNum);
    if (aIsNum && bIsNum && aNum !== bNum) return bNum - aNum;
    if (aIsNum && !bIsNum) return -1;
    if (!aIsNum && bIsNum) return 1;
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  return enriched;
};

// GET academic records for a student (from student_rst)
router.get("/academic-records/student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const data = await fetchAcademicHistory(studentId);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET specific semester record
router.get(
  "/academic-records/student/:studentId/semester/:semester",
  async (req, res) => {
    try {
      const { studentId, semester } = req.params;
      const allHistory = await fetchAcademicHistory(studentId);
      const filtered = allHistory.filter(
        (rec) => String(rec.semester) === String(parseInt(semester, 10))
      );

      if (!filtered.length) {
        return res.status(404).json({ error: "No record found for this semester" });
      }

      res.json(filtered);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// CREATE academic record
router.post("/academic-records", async (req, res) => {
  try {
    const {
      student_id,
      semester,
      academic_year,
      attendance,
      gpa,
      overall_grade,
      total_credit_hours,
      earned_credit_hours,
      remarks,
    } = req.body;

    const required = ["student_id", "semester", "academic_year"];
    for (const field of required) {
      if (!req.body?.[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    const { data, error } = await supabase
      .from("academic_records")
      .insert([
        {
          student_id,
          semester,
          academic_year,
          attendance,
          gpa,
          overall_grade,
          total_credit_hours,
          earned_credit_hours,
          remarks,
        },
      ])
      .select();

    if (error) throw error;
    res.status(201).json(data?.[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// UPDATE academic record
router.put("/academic-records/:recordId", async (req, res) => {
  try {
    const { recordId } = req.params;
    const updateData = req.body;

    const { data, error } = await supabase
      .from("academic_records")
      .update(updateData)
      .eq("id", recordId)
      .select();

    if (error) throw error;
    res.json(data?.[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE academic record
router.delete("/academic-records/:recordId", async (req, res) => {
  try {
    const { recordId } = req.params;

    const { error } = await supabase
      .from("academic_records")
      .delete()
      .eq("id", recordId);

    if (error) throw error;
    res.json({ message: "Academic record deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== DOCUMENTS ROUTES ====================

// GET documents for a student
router.get("/documents/student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const { data, error } = await supabase
      .from("student_documents")
      .select("*")
      .eq("student_id", studentId)
      .order("uploaded_at", { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE document
router.delete("/documents/:documentId", async (req, res) => {
  try {
    const { documentId } = req.params;
    const { error } = await supabase
      .from("student_documents")
      .delete()
      .eq("id", documentId);

    if (error) throw error;
    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== COURSE ENROLLMENTS ROUTES ====================

// GET enrollments for a student
router.get("/enrollments/student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const { data, error } = await supabase
      .from("course_enrollments")
      .select(`
        *,
        courses:course_id (
          id,
          code,
          name,
          credit_hours,
          semester_id
        )
      `)
      .eq("student_id", studentId)
      .order("semester", { ascending: false });

    if (error) throw error;
    
    // Flatten the course data
    const enrichedData = (data || []).map(enrollment => ({
      ...enrollment,
      course_code: enrollment.courses?.code,
      course_name: enrollment.courses?.name,
      credit_hours: enrollment.credit_hours || enrollment.courses?.credit_hours
    }));
    
    res.json(enrichedData);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET enrollments for a semester
router.get(
  "/enrollments/student/:studentId/semester/:semester",
  async (req, res) => {
    try {
      const { studentId, semester } = req.params;
      const { data, error } = await supabase
        .from("course_enrollments")
        .select(`
          *,
          courses:course_id (
            id,
            code,
            name,
            credit_hours,
            semester_id
          )
        `)
        .eq("student_id", studentId)
        .eq("semester", parseInt(semester, 10));

      if (error) throw error;
      
      // Flatten the course data
      const enrichedData = (data || []).map(enrollment => ({
        ...enrollment,
        course_code: enrollment.courses?.code,
        course_name: enrollment.courses?.name,
        credit_hours: enrollment.credit_hours || enrollment.courses?.credit_hours
      }));
      
      res.json(enrichedData);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// CREATE enrollment
router.post("/enrollments", async (req, res) => {
  try {
    const { student_id, course_id, semester, academic_year, credit_hours } =
      req.body;

    const required = ["student_id", "course_id", "semester", "academic_year"];
    for (const field of required) {
      if (!req.body?.[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    const { data, error } = await supabase
      .from("course_enrollments")
      .insert([
        {
          student_id,
          course_id,
          semester,
          academic_year,
          credit_hours,
          status: "ongoing",
        },
      ])
      .select();

    if (error) throw error;
    res.status(201).json(data?.[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// AUTO-ENROLL existing student in first semester (utility endpoint)
router.post("/enrollments/auto-enroll/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    // Get student info
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("id, department_id, joining_date")
      .eq("id", studentId)
      .single();

    if (studentError || !student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Check if student already has enrollments
    const { data: existingEnrollments } = await supabase
      .from("course_enrollments")
      .select("id")
      .eq("student_id", studentId)
      .limit(1);

    if (existingEnrollments && existingEnrollments.length > 0) {
      return res.status(400).json({ 
        error: "Student already has enrollments",
        message: "This student is already enrolled in courses"
      });
    }

    // Auto-enroll in first semester
    const enrollmentResult = await enrollStudentInFirstSemester(
      studentId,
      student.department_id,
      student.joining_date
    );

    if (!enrollmentResult.success) {
      return res.status(400).json({ 
        error: "Enrollment failed",
        message: enrollmentResult.message
      });
    }

    res.status(201).json({
      success: true,
      message: `Student enrolled in ${enrollmentResult.count} courses`,
      enrollments: enrollmentResult.enrollments
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ENROLL student in NEXT semester
router.post("/enrollments/enroll-next-semester/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    // Get student info
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("id, department_id, joining_date")
      .eq("id", studentId)
      .single();

    if (studentError || !student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Get current highest semester number
    const { data: currentEnrollments } = await supabase
      .from("course_enrollments")
      .select("semester")
      .eq("student_id", studentId)
      .order("semester", { ascending: false })
      .limit(1);

    if (!currentEnrollments || currentEnrollments.length === 0) {
      return res.status(400).json({ 
        error: "No existing enrollments found",
        message: "Student must be enrolled in at least one semester first"
      });
    }

    const nextSemester = (currentEnrollments[0].semester || 1) + 1;

    // Get semester info for next semester
    const { data: semesterData, error: semesterError } = await supabase
      .from("semesters")
      .select("id")
      .eq("department_id", student.department_id)
      .eq("number", nextSemester)
      .single();

    if (semesterError || !semesterData) {
      return res.status(404).json({ 
        error: "Next semester not found",
        message: `No semester ${nextSemester} found for this department`
      });
    }

    // Get all courses for the next semester
    const { data: courses, error: coursesError } = await supabase
      .from("courses")
      .select("id, code, name, credit_hours")
      .eq("semester_id", semesterData.id);

    if (coursesError || !courses || courses.length === 0) {
      return res.status(404).json({ 
        error: "No courses found",
        message: `No courses found for semester ${nextSemester}`
      });
    }

    // Determine academic year
    const year = new Date().getFullYear();
    const academicYear = `${year}-${year + 1}`;

    // Create enrollment records
    const enrollments = courses.map(course => ({
      student_id: studentId,
      course_id: course.id,
      semester: nextSemester,
      academic_year: academicYear,
      credit_hours: course.credit_hours,
      status: "ongoing"
    }));

    const { data, error } = await supabase
      .from("course_enrollments")
      .insert(enrollments)
      .select();

    if (error) {
      return res.status(400).json({ 
        error: "Enrollment failed",
        message: error.message
      });
    }

    res.status(201).json({
      success: true,
      message: `Student enrolled in semester ${nextSemester} with ${data.length} courses`,
      semester: nextSemester,
      count: data.length,
      enrollments: data
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DROP course
router.put("/enrollments/:enrollmentId/drop", async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    const { data, error } = await supabase
      .from("course_enrollments")
      .update({ status: "dropped" })
      .eq("id", enrollmentId)
      .select();

    if (error) throw error;
    res.json(data?.[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DEBUG: Check all students with full details (remove in production)
router.get("/debug/all", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("students")
      .select("id, full_name, roll_number, personal_email, student_phone, current_address, joining_session, department_id");

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
