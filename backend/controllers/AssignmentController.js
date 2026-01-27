import supabaseClient from "../model/supabaseClient.js";

// Storage bucket name for assignments
const BUCKET_NAME = "assignments";

// Ensure assignments storage bucket exists (run once on startup)
export const initializeAssignmentStorage = async () => {
  try {
    const { data: buckets, error: listErr } = await supabaseClient.storage.listBuckets();
    if (listErr) throw listErr;
    const exists = buckets?.some(b => b.name === BUCKET_NAME);
    if (!exists) {
      const { error: createErr } = await supabaseClient.storage.createBucket(BUCKET_NAME, { public: true });
      if (createErr) throw createErr;
      console.log(`✅ Created storage bucket: ${BUCKET_NAME}`);
    } else {
      console.log(`✅ Storage bucket already exists: ${BUCKET_NAME}`);
    }
  } catch (err) {
    console.error("⚠️ Could not initialize assignments bucket:", err.message);
  }
};

export const createAssignment = async (req, res) => {
  try {
    const { courseId, title, description, deadline } = req.body;
    const authUserId = req.user?.id;

    console.log('📝 Create Assignment Request:', {
      courseId,
      title,
      deadline,
      authUserId,
      user: req.user,
      hasFile: !!req.file
    });

    if (!courseId || !title || !deadline || !authUserId) {
      console.error('❌ Missing required fields:', { courseId, title, deadline, authUserId });
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Map Supabase auth user to faculty record ID
    // Use faculty_id from auth middleware when available
    let facultyId = req.user?.faculty_id;
    if (!facultyId) {
      // Fallback: resolve by auth_user_id, then by email/personal_email (case-insensitive)
      const { data: facultyRow, error: facultyLookupErr } = await supabaseClient
        .from("faculties")
        .select("id")
        .eq("auth_user_id", authUserId)
        .maybeSingle();

      if (facultyRow?.id) {
        facultyId = facultyRow.id;
      } else if (req.user?.email) {
        let { data: facultyByEmail } = await supabaseClient
          .from("faculties")
          .select("id")
          .or(`personal_email.eq.${req.user.email},email.eq.${req.user.email}`)
          .maybeSingle();
        if (!facultyByEmail) {
          const { data: facultyIlike } = await supabaseClient
            .from("faculties")
            .select("id")
            .ilike("email", req.user.email)
            .maybeSingle();
          facultyByEmail = facultyIlike;
        }
        facultyId = facultyByEmail?.id || null;
        if (facultyId) {
          await supabaseClient
            .from("faculties")
            .update({ auth_user_id: authUserId })
            .eq("id", facultyId);
        }
      }

      // As a last resort, auto-create a minimal faculty record to unblock assignment uploads
      if (!facultyId && req.user?.email) {
        // Derive department_id from the course when possible (to satisfy NOT NULL)
        let deptId = null;
        if (courseId) {
          const { data: courseRow } = await supabaseClient
            .from("courses")
            .select("department_id")
            .eq("id", courseId)
            .maybeSingle();
          deptId = courseRow?.department_id || null;
        }

        // Provide safe defaults for likely NOT NULL columns (qualification/phone/cnic)
        const minimalFaculty = {
          name: req.user?.user_metadata?.full_name || req.user.email,
          email: req.user.email,
          auth_user_id: authUserId,
          designation: req.user?.user_metadata?.designation || "Faculty",
          qualification: "N/A",
          phone: "0000000000",
          cnic: "00000-0000000-0",
          role: "FACULTY",
          status: "ACTIVE",
          department_id: deptId,
        };
        const { data: inserted, error: insertErr } = await supabaseClient
          .from("faculties")
          .insert(minimalFaculty)
          .select("id")
          .maybeSingle();
        if (insertErr) {
          console.error("❌ Auto-create faculty failed:", insertErr.message);
        }
        facultyId = inserted?.id || facultyId;
      }

      if (facultyLookupErr) {
        console.error("❌ Faculty mapping failed:", facultyLookupErr?.message);
      }
    }

    if (!facultyId) {
      console.error("❌ Faculty mapping failed: none found for user", authUserId, "email", req.user?.email);
      return res.status(403).json({ error: `Faculty account not found for user ${req.user?.email || authUserId}` });
    }

    let filePublicUrl = null;
    if (req.file) {
      const timestamp = Date.now();
      const safeName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
      // Store by course and faculty for organization
      const storagePath = `${courseId}/${facultyId}/${timestamp}-${safeName}`;

      const { error: uploadError } = await supabaseClient.storage
        .from(BUCKET_NAME)
        .upload(storagePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        return res.status(400).json({ error: `Upload failed: ${uploadError.message}` });
      }

      const { data: urlData } = supabaseClient.storage
        .from(BUCKET_NAME)
        .getPublicUrl(storagePath);
      filePublicUrl = urlData?.publicUrl || null;
    }

    const { data, error } = await supabaseClient
      .from("assignments")
      .insert({
        course_id: courseId,
        faculty_id: facultyId,
        title,
        description: description || "",
        file_path: filePublicUrl,
        deadline,
        assignment_type: "regular",
      })
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ message: "Assignment created successfully", assignment: data[0] });
  } catch (err) {
    console.error("Error creating assignment:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getAssignmentsByStudent = async (req, res) => {
  try {
    const authUserId = req.user?.id;
    if (!authUserId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Map auth user to student record ID
    const { data: studentRow, error: studentLookupErr } = await supabaseClient
      .from("students")
      .select("id")
      .eq("auth_user_id", authUserId)
      .maybeSingle();

    if (studentLookupErr || !studentRow?.id) {
      console.error("❌ Student mapping failed:", studentLookupErr?.message);
      return res.status(403).json({ error: "Student account not found" });
    }
    const studentId = studentRow.id;

    const { data: enrollments } = await supabaseClient
      .from("course_enrollments")
      .select("course_id")
      .eq("student_id", studentId);

    const courseIds = enrollments?.map(e => e.course_id) || [];
    if (courseIds.length === 0) {
      return res.status(200).json([]);
    }

    const { data: assignments } = await supabaseClient
      .from("assignments")
      .select(`*, courses:course_id(code, name), assignment_submissions!left(*)`)
      .in("course_id", courseIds)
      .order("deadline", { ascending: true });

    const mapped = assignments?.map(assignment => {
      const submission = assignment.assignment_submissions?.find(s => s.student_id === studentId);
      return {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        course: `${assignment.courses?.code || ""} - ${assignment.courses?.name || ""}`,
        dueDate: assignment.deadline,
        status: submission ? "Submitted" : "Pending",
        grade: submission?.grade || null,
        fileUrl: assignment.file_path,
        submissionFile: submission?.submission_file_path || null,
        submissionDate: submission?.submission_date || null,
      };
    }) || [];

    res.status(200).json(mapped);
  } catch (err) {
    console.error("Error fetching assignments:", err);
    res.status(500).json({ error: err.message });
  }
};

export const submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const authUserId = req.user?.id;

    if (!authUserId || !req.file) {
      return res.status(400).json({ error: "Missing required data" });
    }

    // Map auth user to student record ID with fallback
    let studentId = req.user?.student_id;
    if (!studentId) {
      const { data: studentRow } = await supabaseClient
        .from("students")
        .select("id")
        .eq("auth_user_id", authUserId)
        .maybeSingle();

      if (studentRow?.id) {
        studentId = studentRow.id;
      } else if (req.user?.email) {
        // Try by email as fallback
        const { data: studentByEmail } = await supabaseClient
          .from("students")
          .select("id")
          .or(`personal_email.eq.${req.user.email},email.eq.${req.user.email}`)
          .maybeSingle();
        if (studentByEmail?.id) {
          studentId = studentByEmail.id;
          // Backfill auth_user_id
          await supabaseClient
            .from("students")
            .update({ auth_user_id: authUserId })
            .eq("id", studentId);
        }
      }
    }

    if (!studentId) {
      console.error("❌ Student mapping failed for user:", authUserId);
      return res.status(403).json({ error: "Student account not found" });
    }

    const timestamp = Date.now();
    const safeName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `submissions/${assignmentId}/${studentId}/${timestamp}-${safeName}`;

    const { error: uploadError } = await supabaseClient.storage
      .from(BUCKET_NAME)
      .upload(storagePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return res.status(400).json({ error: `Upload failed: ${uploadError.message}` });
    }

    const { data: urlData } = supabaseClient.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);
    const publicUrl = urlData?.publicUrl || null;

    // Check if submission already exists
    const { data: existing } = await supabaseClient
      .from("assignment_submissions")
      .select("id")
      .eq("assignment_id", assignmentId)
      .eq("student_id", studentId)
      .maybeSingle();

    let data, error;
    if (existing?.id) {
      // Update existing submission
      const result = await supabaseClient
        .from("assignment_submissions")
        .update({
          submission_file_path: publicUrl,
          submission_date: new Date().toISOString(),
          status: "submitted",
        })
        .eq("id", existing.id)
        .select();
      data = result.data;
      error = result.error;
    } else {
      // Insert new submission
      const result = await supabaseClient
        .from("assignment_submissions")
        .insert({
          assignment_id: assignmentId,
          student_id: studentId,
          submission_file_path: publicUrl,
          submission_date: new Date().toISOString(),
          status: "submitted",
        })
        .select();
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error("❌ Submission insert/update failed:", error.message);
      return res.status(400).json({ error: `Upload failed: ${error.message}` });
    }

    res.status(200).json({ message: "Assignment submitted successfully", submission: data[0] });
  } catch (err) {
    console.error("Error submitting assignment:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getAssignmentsByFaculty = async (req, res) => {
  try {
    const authUserId = req.user?.id;
    const { courseId } = req.query;

    if (!authUserId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Map auth user to faculty record ID
    const { data: facultyRow } = await supabaseClient
      .from("faculties")
      .select("id")
      .eq("auth_user_id", authUserId)
      .maybeSingle();

    if (!facultyRow?.id) {
      return res.status(403).json({ error: "Faculty account not found" });
    }
    const facultyId = facultyRow.id;

    // Build query
    let query = supabaseClient
      .from("assignments")
      .select("*, courses:course_id(code, name)")
      .eq("faculty_id", facultyId)
      .order("deadline", { ascending: false });

    // Filter by course if provided
    if (courseId) {
      query = query.eq("course_id", courseId);
    }

    const { data: assignments, error } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json(assignments || []);
  } catch (err) {
    console.error("Error fetching faculty assignments:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getAssignmentSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const authUserId = req.user?.id;

    // Map auth user to faculty record ID
    const { data: facultyRow } = await supabaseClient
      .from("faculties")
      .select("id")
      .eq("auth_user_id", authUserId)
      .maybeSingle();

    const facultyId = facultyRow?.id;

    // Verify faculty owns this assignment
    const { data: assignment } = await supabaseClient
      .from("assignments")
      .select("id")
      .eq("id", assignmentId)
      .eq("faculty_id", facultyId)
      .single();

    if (!assignment) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { data: submissions } = await supabaseClient
      .from("assignment_submissions")
      .select(`*, students:student_id(full_name, roll_number)`)
      .eq("assignment_id", assignmentId)
      .order("submission_date", { ascending: false });

    res.status(200).json(submissions || []);
  } catch (err) {
    console.error("Error fetching submissions:", err);
    res.status(500).json({ error: err.message });
  }
};
