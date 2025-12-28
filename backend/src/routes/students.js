import express from 'express';
import { supabase } from '../supabase.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Guard: require DB configured
const ensureDB = (req, res, next) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured. Set env in backend/.env' });
  next();
};

router.use(ensureDB);

// Get student academic history by roll number
router.get('/students/:rollNo/history', requireAuth, requireRole(['ADMIN','COORDINATOR','DEPARTMENT_CHAIR']), async (req, res) => {
  const { rollNo } = req.params;
  const { data: student, error: sErr } = await supabase
    .from('students')
    .select('profile_id, roll_no, degree_program, joining_session, joining_date')
    .eq('roll_no', rollNo)
    .single();
  if (sErr) return res.status(404).json({ error: 'Student not found' });

  const { data: semesters, error: semErr } = await supabase
    .from('student_semesters')
    .select('id, name, number, year, session')
    .eq('student_id', student.profile_id)
    .order('number');
  if (semErr) return res.status(500).json({ error: semErr.message });

  const history = [];
  for (const sem of semesters) {
    const { data: courses, error: cErr } = await supabase
      .from('student_courses')
      .select('course_id, grade, credits, courses(name, code, crhr)')
      .eq('semester_id', sem.id)
      .order('course_id');
    if (cErr) return res.status(500).json({ error: cErr.message });
    history.push({ semester: sem.name, courses });
  }

  const { data: gpaRows } = await supabase
    .from('v_student_semester_gpa')
    .select('semester_name, gpa, total_credits')
    .eq('student_id', student.profile_id);

  const { data: cgpaRow } = await supabase
    .from('v_student_cgpa')
    .select('cgpa, total_credits')
    .eq('student_id', student.profile_id)
    .single();

  res.json({ student, semesters: history, gpaPerSemester: gpaRows || [], cgpa: cgpaRow || null });
});

// Generate student transcript JSON by roll number
router.get('/students/:rollNo/transcript', requireAuth, requireRole(['ADMIN','COORDINATOR','DEPARTMENT_CHAIR','EXECUTIVE']), async (req, res) => {
  const { rollNo } = req.params;
  const { data: student, error: sErr } = await supabase
    .from('students')
    .select('profile_id, roll_no, degree_program, joining_session, joining_date, profiles(full_name)')
    .eq('roll_no', rollNo)
    .single();
  if (sErr) return res.status(404).json({ error: 'Student not found' });

  const { data: semesters } = await supabase
    .from('student_semesters')
    .select('id, name, number, year, session')
    .eq('student_id', student.profile_id)
    .order('number');

  const transcript = {
    name: student.profiles?.full_name,
    rollNo: student.roll_no,
    degree: student.degree_program,
    joiningSession: student.joining_session,
    joiningDate: student.joining_date,
    semesters: [],
    cgpa: null
  };

  for (const sem of semesters || []) {
    const { data: courses } = await supabase
      .from('student_courses')
      .select('grade, credits, courses(name, code, crhr)')
      .eq('semester_id', sem.id);
    const { data: gpaRow } = await supabase
      .from('v_student_semester_gpa')
      .select('gpa, total_credits')
      .eq('student_id', student.profile_id)
      .eq('semester_name', sem.name)
      .single();
    transcript.semesters.push({
      semester: sem.name,
      courses: (courses || []).map((c) => ({ name: c.courses?.name, code: c.courses?.code, grade: c.grade, credits: c.credits })),
      gpa: gpaRow?.gpa || null
    });
  }

  const { data: cgpaRow } = await supabase
    .from('v_student_cgpa')
    .select('cgpa')
    .eq('student_id', student.profile_id)
    .single();
  transcript.cgpa = cgpaRow?.cgpa || null;

  res.json(transcript);
});

export default router;
