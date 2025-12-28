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

// Departments CRUD
router.get('/departments', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  const { data, error } = await supabase.from('departments').select('*').order('id');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/departments', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  const { name, code } = req.body;
  const { data, error } = await supabase.from('departments').insert({ name, code }).select('*').single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

router.put('/departments/:id', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  const { id } = req.params;
  const { name, code } = req.body;
  const { data, error } = await supabase.from('departments').update({ name, code }).eq('id', id).select('*').single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.delete('/departments/:id', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('departments').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
});

// Courses CRUD
router.get('/courses', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  const { data, error } = await supabase
    .from('courses')
    .select('id, name, code, semester, crhr, department_id')
    .order('semester');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/courses', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  const { department_id, name, code, semester, crhr, prerequisites = [] } = req.body;
  const { data, error } = await supabase
    .from('courses')
    .insert({ department_id, name, code, semester, crhr })
    .select('*')
    .single();
  if (error) return res.status(400).json({ error: error.message });

  if (prerequisites.length) {
    const preRows = prerequisites.map((pid) => ({ course_id: data.id, prerequisite_course_id: pid }));
    const { error: preErr } = await supabase.from('course_prerequisites').insert(preRows);
    if (preErr) return res.status(400).json({ error: preErr.message });
  }

  res.status(201).json(data);
});

router.put('/courses/:id', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  const { id } = req.params;
  const { name, code, semester, crhr, prerequisites } = req.body;
  const { data, error } = await supabase
    .from('courses')
    .update({ name, code, semester, crhr })
    .eq('id', id)
    .select('*')
    .single();
  if (error) return res.status(400).json({ error: error.message });

  if (Array.isArray(prerequisites)) {
    await supabase.from('course_prerequisites').delete().eq('course_id', id);
    if (prerequisites.length) {
      const preRows = prerequisites.map((pid) => ({ course_id: Number(id), prerequisite_course_id: pid }));
      const { error: preErr } = await supabase.from('course_prerequisites').insert(preRows);
      if (preErr) return res.status(400).json({ error: preErr.message });
    }
  }

  res.json(data);
});

router.delete('/courses/:id', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('courses').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
});

export default router;
