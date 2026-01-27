import supabaseClient from "../../model/supabaseClient.js";

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ Auth failed: No token provided");
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    console.log("🔑 Verifying token for:", req.method, req.path);

    const { data, error } = await supabaseClient.auth.getUser(token);

    if (error || !data?.user) {
      console.log("❌ Auth failed: Invalid token", error?.message);
      return res.status(401).json({ error: "Invalid token" });
    }

    console.log("✅ Token valid for user:", data.user.email);

    // Get faculty details from database using auth_user_id
    let { data: faculty, error: facultyError } = await supabaseClient
      .from("faculties")
      .select("id, name, email, role, department_id")
      .eq("auth_user_id", data.user.id)
      .maybeSingle();

    // Fallback: map faculty by email/personal_email and backfill auth_user_id
    if (!faculty && data.user?.email) {
      // Try exact match on personal_email or email
      let { data: facultyByEmail } = await supabaseClient
        .from("faculties")
        .select("id, name, email, role, department_id")
        .or(`personal_email.eq.${data.user.email},email.eq.${data.user.email}`)
        .maybeSingle();

      // If still not found, try case-insensitive match
      if (!facultyByEmail) {
        const { data: facultyIlike } = await supabaseClient
          .from("faculties")
          .select("id, name, email, role, department_id")
          .ilike("email", data.user.email)
          .maybeSingle();
        facultyByEmail = facultyIlike;
      }

      if (facultyByEmail?.id) {
        faculty = facultyByEmail;
        await supabaseClient
          .from("faculties")
          .update({ auth_user_id: data.user.id })
          .eq("id", facultyByEmail.id);
      }
    }

    // Get student details if not faculty
    let student = null;
    if (!faculty) {
      // Try by auth_user_id first
      const { data: studentData, error: studentError } = await supabaseClient
        .from("students")
        .select("id, name, email, department_id, personal_email, auth_user_id")
        .eq("auth_user_id", data.user.id)
        .maybeSingle();
      
      student = studentData;
      
      // If not found by auth_user_id, try by email and update auth_user_id
      if (!student) {
        console.log("⚠️ Student not found by auth_user_id, trying by email:", data.user.email);
        
        // Try by personal_email first
        let { data: studentByEmail, error: searchError } = await supabaseClient
          .from("students")
          .select("id, name, email, department_id, personal_email, auth_user_id")
          .eq("personal_email", data.user.email)
          .maybeSingle();
        
        // If not found by personal_email, try by email
        if (!studentByEmail) {
          const result = await supabaseClient
            .from("students")
            .select("id, name, email, department_id, personal_email, auth_user_id")
            .eq("email", data.user.email)
            .maybeSingle();
          
          studentByEmail = result.data;
          searchError = result.error;
        }
        
        if (searchError) {
          console.error("❌ Error searching for student by email:", searchError);
        }
        
        console.log("🔍 Search result:", { 
          found: !!studentByEmail, 
          student_id: studentByEmail?.id,
          email: studentByEmail?.email, 
          personal_email: studentByEmail?.personal_email 
        });
        
        if (studentByEmail) {
          console.log("✅ Found student by email (ID:", studentByEmail.id, "), updating auth_user_id...");
          // Update the auth_user_id
          const { error: updateError } = await supabaseClient
            .from("students")
            .update({ auth_user_id: data.user.id })
            .eq("id", studentByEmail.id);
          
          if (!updateError) {
            student = { ...studentByEmail, auth_user_id: data.user.id };
            console.log("✅ Updated student auth_user_id for student ID:", studentByEmail.id);
          } else {
            console.error("❌ Failed to update auth_user_id:", updateError);
          }
        } else {
          console.log("❌ No student record found in database for email:", data.user.email);
          console.log("💡 Please check if the student exists in the students table");
        }
      }
      
      console.log("👤 Student found:", student ? `ID ${student.id}` : "None");
    } else {
      console.log("👨‍🏫 Faculty found:", `ID ${faculty.id}`);
    }

    const designation = data.user.user_metadata?.designation;
    const rawRole = faculty?.role || (faculty ? "faculty" : (student ? "student" : (designation === "Professor" ? "faculty" : "student")));
    const normalizedRole = (rawRole || "").toLowerCase();

    req.user = {
      id: data.user.id,
      auth_user_id: data.user.id,
      email: data.user.email,
      role: normalizedRole,
      role_raw: rawRole,
      faculty_id: faculty?.id,
      student_id: student?.id,
      department_id: faculty?.department_id || student?.department_id,
      user_metadata: data.user.user_metadata || {},
      app_metadata: data.user.app_metadata || {},
    };

    console.log("✅ Auth complete:", { email: req.user.email, role: req.user.role, student_id: req.user.student_id, faculty_id: req.user.faculty_id });
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({ error: "Unauthorized" });
  }
};

export const requireRole = (roles) => (req, res, next) => {
  if (!roles || roles.length === 0) return next();
  if (!req.user?.role) return res.status(403).json({ error: "Forbidden" });

  const reqRole = (req.user.role || "").toLowerCase();
  const allowed = roles.some((r) => (r || "").toLowerCase() === reqRole);
  if (!allowed) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
};
