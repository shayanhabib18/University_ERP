import supabase from "../model/supabaseClient.js";
import fetch from "node-fetch";

// Generate quiz using GROQ API
export const generateQuiz = async (req, res) => {
  try {
    const { 
      courseId, 
      type, 
      aiPrompt, 
      description,
      durationMinutes = 60,
      totalQuestions = 10,
      passingScore = 50,
      deadline
    } = req.body;
    const facultyId = req.user?.faculty_id;

    if (!facultyId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!courseId || !type || !aiPrompt) {
      return res.status(400).json({ error: "Course, type, and AI prompt are required" });
    }

    // Get course details
    const { data: courseData, error: courseErr } = await supabase
      .from("courses")
      .select("name, code")
      .eq("id", courseId)
      .maybeSingle();

    if (courseErr) return res.status(500).json({ error: courseErr.message });
    if (!courseData) return res.status(404).json({ error: "Course not found" });

    // Generate quiz using Groq API
    const grokApiKey = process.env.GROK_API_KEY;
    if (!grokApiKey) {
      return res.status(500).json({ error: "Groq API key not configured" });
    }

    const systemPrompt = type === "mcq"
      ? `You are an expert educational content creator. Generate ${totalQuestions} multiple choice questions for a university-level course "${courseData.name}".
         
         Format the response as a JSON array with this structure:
         [
           {
             "question": "The question text",
             "options": ["Option A", "Option B", "Option C", "Option D"],
             "correct": 0,
             "explanation": "Detailed explanation why this is correct"
           }
         ]
         
         The "correct" field should be the index (0-3) of the correct answer. Do not include any markdown formatting or code blocks, just pure JSON.`
      : `You are an expert educational content creator. Generate ${totalQuestions} descriptive/essay questions for a university-level course "${courseData.name}".
         
         Format the response as a JSON array with this structure:
         [
           {
             "question": "The detailed question text",
             "points": ["Key point 1 to cover", "Key point 2 to cover", "Key point 3 to cover"],
             "marks": 10
           }
         ]
         
         Do not include any markdown formatting or code blocks, just pure JSON.`;

    const grokResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${grokApiKey}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: aiPrompt,
          },
        ],
        model: "llama-3.3-70b-versatile",
        stream: false,
        temperature: 0.7,
      }),
    });

    if (!grokResponse.ok) {
      const errorText = await grokResponse.text();
      console.error("Groq API Error:", errorText);
      return res.status(500).json({ error: "Failed to generate quiz with Groq API" });
    }

    const grokData = await grokResponse.json();
    let questionsText = grokData.choices[0]?.message?.content;

    if (!questionsText) {
      return res.status(500).json({ error: "No content received from Groq API" });
    }

    // Clean up the response - remove markdown code blocks if present
    questionsText = questionsText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let questions;
    try {
      questions = JSON.parse(questionsText);
    } catch (parseError) {
      console.error("Failed to parse Groq response:", questionsText);
      return res.status(500).json({ error: "Invalid JSON response from Groq API" });
    }

    // Ensure we have the right number of questions
    if (questions.length > totalQuestions) {
      questions = questions.slice(0, totalQuestions);
    }

    // Save quiz to database
    const { data: quiz, error: quizErr } = await supabase
      .from("quizzes")
      .insert({
        course_id: courseId,
        faculty_id: facultyId,
        title: `Quiz: ${courseData.code || courseData.name}`,
        description: description,
        ai_prompt: aiPrompt,
        type: type,
        questions: questions,
        duration_minutes: durationMinutes,
        total_questions: totalQuestions,
        passing_score: passingScore,
        is_published: true,
        deadline: deadline,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (quizErr) {
      console.error("Error saving quiz:", quizErr);
      return res.status(500).json({ error: "Failed to save quiz: " + quizErr.message });
    }

    return res.json({
      success: true,
      message: "Quiz generated and published to students successfully",
      quiz: quiz,
      questions: questions,
    });
  } catch (err) {
    console.error("Generate quiz error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
};

// Get all quizzes for a faculty member
export const getFacultyQuizzes = async (req, res) => {
  try {
    const facultyId = req.user?.faculty_id;

    if (!facultyId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { data: quizzes, error } = await supabase
      .from("quizzes")
      .select(`
        *,
        course:courses(id, name, code)
      `)
      .eq("faculty_id", facultyId)
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    return res.json({ quizzes: quizzes || [] });
  } catch (err) {
    console.error("Get faculty quizzes error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Share quiz with students
export const shareQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { deadline } = req.body;
    const facultyId = req.user?.faculty_id;

    if (!facultyId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Verify quiz belongs to faculty
    const { data: quiz, error: quizErr } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", quizId)
      .eq("faculty_id", facultyId)
      .maybeSingle();

    if (quizErr) return res.status(500).json({ error: quizErr.message });
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    // Update quiz with share status and deadline
    const { error: updateErr } = await supabase
      .from("quizzes")
      .update({
        is_published: true,
        deadline: deadline,
        published_at: new Date().toISOString(),
      })
      .eq("id", quizId);

    if (updateErr) return res.status(500).json({ error: updateErr.message });

    return res.json({
      success: true,
      message: "Quiz shared with students successfully",
    });
  } catch (err) {
    console.error("Share quiz error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Submit quiz answer (for students)
export const submitQuizAnswer = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body;
    let studentId = req.user?.student_id;
    // Fallback resolution if student_id missing in req.user
    if (!studentId) {
      try {
        const authUserId = req.user?.auth_user_id;
        const userEmail = req.user?.email;

        // Try mapping by auth_user_id first
        const { data: studentByAuth } = await supabase
          .from("students").select("id").eq("auth_user_id", authUserId).maybeSingle();
        if (studentByAuth?.id) {
          studentId = studentByAuth.id;
        } else if (userEmail) {
          // Try personal_email then email
          let resolvedId = null;
          const res1 = await supabase
            .from("students").select("id").eq("personal_email", userEmail).maybeSingle();
          if (res1.data?.id) {
            resolvedId = res1.data.id;
          } else {
            const res2 = await supabase
              .from("students").select("id").eq("email", userEmail).maybeSingle();
            resolvedId = res2.data?.id || null;
          }
          if (resolvedId) {
            studentId = resolvedId;
            // Backfill auth_user_id for future requests
            await supabase
              .from("students").update({ auth_user_id: authUserId }).eq("id", studentId);
          }
        }
      } catch (e) {
        console.warn("Student fallback resolution failed:", e?.message);
      }
    }

    if (!studentId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get quiz
    const { data: quiz, error: quizErr } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", quizId)
      .eq("is_published", true)
      .maybeSingle();

    if (quizErr) return res.status(500).json({ error: quizErr.message });
    if (!quiz) return res.status(404).json({ error: "Quiz not found or not available" });

    // Check deadline
    if (quiz.deadline && new Date() > new Date(quiz.deadline)) {
      return res.status(400).json({ error: "Quiz deadline has passed" });
    }

    // Auto-grade MCQ quiz
    let score = 0;
    let totalQuestions = quiz.questions.length;
    let results = [];

    if (quiz.type === "mcq") {
      quiz.questions.forEach((question, index) => {
        const userAnswer = answers[index];
        const isCorrect = userAnswer === question.correct;
        if (isCorrect) score++;

        results.push({
          questionIndex: index,
          question: question.question,
          userAnswer: userAnswer,
          correctAnswer: question.correct,
          isCorrect: isCorrect,
          explanation: question.explanation,
        });
      });
    }

    // Save submission
    const { data: submission, error: submitErr } = await supabase
      .from("quiz_submissions")
      .insert({
        quiz_id: quizId,
        student_id: studentId,
        answers: answers,
        score: score,
        total_questions: totalQuestions,
        results: results,
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (submitErr) {
      console.error("Error saving submission:", submitErr);
      return res.status(500).json({ error: "Failed to save submission" });
    }

    return res.json({
      success: true,
      submission: submission,
      score: score,
      totalQuestions: totalQuestions,
      percentage: ((score / totalQuestions) * 100).toFixed(2),
      results: results,
    });
  } catch (err) {
    console.error("Submit quiz error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get quiz submissions (for faculty)
export const getQuizSubmissions = async (req, res) => {
  try {
    const { quizId } = req.params;
    const facultyId = req.user?.faculty_id;

    console.log("📊 getQuizSubmissions called:", { quizId, facultyId });

    if (!facultyId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Verify quiz belongs to faculty
    const { data: quiz, error: quizErr } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", quizId)
      .eq("faculty_id", facultyId)
      .maybeSingle();

    if (quizErr) {
      console.error("❌ Quiz query error:", quizErr);
      return res.status(500).json({ error: quizErr.message });
    }
    if (!quiz) {
      console.error("❌ Quiz not found or doesn't belong to faculty:", { quizId, facultyId });
      return res.status(404).json({ error: "Quiz not found" });
    }

    console.log("✅ Quiz found:", { id: quiz.id, title: quiz.title, faculty_id: quiz.faculty_id });

    // Get submissions with student details
    const { data: submissions, error: subErr } = await supabase
      .from("quiz_submissions")
      .select(`
        *,
        student:students(id, full_name, roll_number)
      `)
      .eq("quiz_id", quizId)
      .order("submitted_at", { ascending: false });

    if (subErr) {
      console.error("❌ Submissions query error:", subErr);
      return res.status(500).json({ error: subErr.message });
    }

    console.log("📋 Quiz submissions found:", {
      count: submissions?.length || 0,
      sample: submissions?.[0] ? {
        id: submissions[0].id,
        student_id: submissions[0].student_id,
        student: submissions[0].student,
        score: submissions[0].score
      } : null
    });

    return res.json({
      success: true,
      submissions: submissions || [],
      quiz: quiz,
    });
  } catch (err) {
    console.error("Get quiz submissions error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get available quizzes for students
export const getStudentQuizzes = async (req, res) => {
  try {
    let studentId = req.user?.student_id;
    console.log("📚 getStudentQuizzes called - Student ID:", studentId);

    // Fallback resolution: map auth_user_id/email to student.id if missing
    if (!studentId) {
      console.log("❌ No student_id found in req.user. Attempting to resolve via auth_user_id/email...");
      const authUserId = req.user?.auth_user_id;
      const userEmail = req.user?.email;

      // Try mapping by auth_user_id first
      const { data: studentByAuth, error: mapErr1 } = await supabase
        .from("students")
        .select("id")
        .eq("auth_user_id", authUserId)
        .maybeSingle();

      if (mapErr1) {
        console.error("❌ Error mapping student by auth_user_id:", mapErr1);
      }

      if (studentByAuth?.id) {
        studentId = studentByAuth.id;
        console.log("✅ Resolved student by auth_user_id:", studentId);
      } else if (userEmail) {
        // Try personal_email then email
        let resolvedId = null;
        const res1 = await supabase
          .from("students")
          .select("id")
          .eq("personal_email", userEmail)
          .maybeSingle();
        if (res1.data?.id) {
          resolvedId = res1.data.id;
        } else {
          const res2 = await supabase
            .from("students")
            .select("id")
            .eq("email", userEmail)
            .maybeSingle();
          resolvedId = res2.data?.id || null;
        }
        if (resolvedId) {
          studentId = resolvedId;
          console.log("✅ Resolved student by email:", studentId);
          // Optionally backfill auth_user_id
          const { error: backfillErr } = await supabase
            .from("students")
            .update({ auth_user_id: authUserId })
            .eq("id", studentId);
          if (backfillErr) {
            console.warn("⚠️ Failed to backfill auth_user_id:", backfillErr.message);
          }
        }
      }

      if (!studentId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
    }

    // Get student's enrolled courses
    const { data: enrollments, error: enrollErr } = await supabase
      .from("course_enrollments")
      .select("course_id")
      .eq("student_id", studentId);

    console.log("📝 Enrollments query result:", { 
      count: enrollments?.length || 0, 
      enrollments, 
      error: enrollErr 
    });

    if (enrollErr) {
      console.error("Error fetching enrollments:", enrollErr);
      return res.status(500).json({ error: "Failed to fetch enrollments" });
    }

    if (!enrollments || enrollments.length === 0) {
      console.log("⚠️ No course enrollments found for student:", studentId);
      return res.json({ quizzes: [] });
    }

    const courseIds = enrollments.map(e => e.course_id);
    console.log("🎓 Student enrolled in courses:", courseIds);

    // Get published quizzes for those courses
    const { data: quizzes, error: quizErr } = await supabase
      .from("quizzes")
      .select(`
        *,
        course:courses(id, name, code),
        faculty:faculties(id, name)
      `)
      .in("course_id", courseIds)
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    console.log("📋 Quizzes query result:", { 
      count: quizzes?.length || 0, 
      quizzes: quizzes?.map(q => ({ id: q.id, title: q.title, course_id: q.course_id })),
      error: quizErr 
    });

    if (quizErr) {
      console.error("Error fetching quizzes:", quizErr);
      return res.status(500).json({ error: quizErr.message });
    }

    // Check which quizzes the student has already submitted
    const { data: submissions, error: subErr } = await supabase
      .from("quiz_submissions")
      .select("quiz_id, score, total_questions, submitted_at")
      .eq("student_id", studentId);

    if (subErr) {
      console.error("Error fetching submissions:", subErr);
    }

    const submissionsMap = {};
    if (submissions) {
      submissions.forEach(sub => {
        submissionsMap[sub.quiz_id] = sub;
      });
    }

    // Add submission status to quizzes
    const quizzesWithStatus = (quizzes || []).map(quiz => ({
      ...quiz,
      submission: submissionsMap[quiz.id] || null,
      isSubmitted: !!submissionsMap[quiz.id],
    }));

    console.log("✅ Returning quizzes to student:", quizzesWithStatus.length);
    return res.json({ quizzes: quizzesWithStatus });
  } catch (err) {
    console.error("Get student quizzes error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Debug endpoint: show student resolution and counts
export const debugStudentQuizzes = async (req, res) => {
  try {
    let studentId = req.user?.student_id;
    const authUserId = req.user?.auth_user_id;
    const userEmail = req.user?.email;

    const steps = [];
    steps.push({ step: "initial", studentId, authUserId, userEmail });

    if (!studentId) {
      const { data: s1 } = await supabase
        .from("students").select("id").eq("auth_user_id", authUserId).maybeSingle();
      if (s1?.id) {
        studentId = s1.id; steps.push({ step: "by_auth_user_id", studentId });
      } else {
        const { data: s2 } = await supabase
          .from("students").select("id").eq("personal_email", userEmail).maybeSingle();
        if (s2?.id) { studentId = s2.id; steps.push({ step: "by_personal_email", studentId }); }
        if (!studentId) {
          const { data: s3 } = await supabase
            .from("students").select("id").eq("email", userEmail).maybeSingle();
          if (s3?.id) { studentId = s3.id; steps.push({ step: "by_email", studentId }); }
        }
      }
    }

    // enrollments
    let enrollments = [];
    if (studentId) {
      const { data } = await supabase
        .from("course_enrollments").select("course_id").eq("student_id", studentId);
      enrollments = data || [];
    }

    // quizzes count
    let quizzesCount = 0;
    if (enrollments.length) {
      const courseIds = enrollments.map(e => e.course_id);
      const { data: quizzes } = await supabase
        .from("quizzes").select("id").in("course_id", courseIds).eq("is_published", true);
      quizzesCount = (quizzes || []).length;
    }

    return res.json({
      resolvedStudentId: studentId || null,
      steps,
      enrollmentsCount: enrollments.length,
      quizzesCount,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Delete quiz
export const deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const facultyId = req.user?.faculty_id;

    if (!facultyId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { error } = await supabase
      .from("quizzes")
      .delete()
      .eq("id", quizId)
      .eq("faculty_id", facultyId);

    if (error) return res.status(500).json({ error: error.message });

    return res.json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (err) {
    console.error("Delete quiz error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
