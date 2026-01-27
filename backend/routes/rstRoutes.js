import express from 'express';
import supabase from '../model/supabaseClient.js';

const router = express.Router();

// Save or Update RST for a student in a course
router.post('/rst', async (req, res) => {
  try {
    const { student_id, course_id, faculty_id, rst_data, grade } = req.body;

    console.log('POST /rst - Received:', { student_id, course_id, faculty_id, grade });

    if (!student_id || !course_id || !rst_data) {
      return res.status(400).json({ error: 'Missing required fields: student_id, course_id, rst_data' });
    }

    // Check if RST already exists
    const { data: existing, error: fetchError } = await supabase
      .from('student_rst')
      .select('*')
      .eq('student_id', student_id)
      .eq('course_id', course_id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Fetch error:', fetchError);
      throw fetchError;
    }

    if (existing) {
      if (existing.approval_status === 'approved') {
        return res.status(400).json({
          error: 'Result is already approved and cannot be modified'
        });
      }

      console.log('Updating existing RST');
      // Update existing RST and resubmit for approval
      const { data, error } = await supabase
        .from('student_rst')
        .update({
          faculty_id,
          rst_data,
          grade,
          approval_status: 'pending',
          approved_by: null,
          approved_at: null,
          rejected_by: null,
          rejected_at: null,
          rejection_reason: null,
          updated_at: new Date().toISOString()
        })
        .eq('student_id', student_id)
        .eq('course_id', course_id)
        .select()
        .single();

      if (error) {
        console.error('Update error:', error);
        throw error;
      }
      console.log('RST updated successfully');
      return res.json({ message: 'RST updated successfully', data });
    } else {
      console.log('Creating new RST');
      // Create new RST and mark as pending approval
      const { data, error } = await supabase
        .from('student_rst')
        .insert({
          student_id,
          course_id,
          faculty_id,
          rst_data,
          grade,
          approval_status: 'pending',
          approved_by: null,
          approved_at: null,
          rejected_by: null,
          rejected_at: null,
          rejection_reason: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }
      console.log('RST created successfully');
      return res.status(201).json({ message: 'RST created successfully', data });
    }
  } catch (error) {
    console.error('Error saving RST:', error);
    res.status(500).json({ 
      error: 'Failed to save RST', 
      details: error.message,
      code: error.code 
    });
  }
});

// Get RST for a specific student and course
router.get('/rst/student/:student_id/course/:course_id', async (req, res) => {
  try {
    const { student_id, course_id } = req.params;
    
    console.log('Fetching RST for student:', student_id, 'course:', course_id);

    const { data, error } = await supabase
      .from('student_rst')
      .select('*')
      .eq('student_id', student_id)
      .eq('course_id', course_id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'RST not found' });
      }
      throw error;
    }

    console.log('RST found:', data);
    res.json(data);
  } catch (error) {
    console.error('Error fetching RST:', error);
    res.status(500).json({ error: 'Failed to fetch RST', details: error.message });
  }
});

// Get all RSTs for a student
router.get('/rst/student/:student_id', async (req, res) => {
  try {
    const { student_id } = req.params;

    const { data, error } = await supabase
      .from('student_rst')
      .select('*')
      .eq('student_id', student_id);

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching student RSTs:', error);
    res.status(500).json({ error: 'Failed to fetch student RSTs', details: error.message });
  }
});

// Get all RSTs for a student with course details (for transcript view)
router.get('/rst/student/:student_id/transcript', async (req, res) => {
  try {
    const { student_id } = req.params;

    const { data, error } = await supabase
      .from('student_rst')
      .select(`
        id,
        grade,
        created_at,
        updated_at,
        rst_data,
        courses (
          id,
          code,
          name,
          credit_hours
        )
      `)
      .eq('student_id', student_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Format response with course details at top level
    const formattedData = (data || []).map(rst => ({
      id: rst.id,
      course_id: rst.courses?.id,
      course_code: rst.courses?.code,
      course_name: rst.courses?.name,
      credit_hours: rst.courses?.credit_hours || 3,
      grade: rst.grade || "N/A",
      rst_data: rst.rst_data,
      created_at: rst.created_at,
      updated_at: rst.updated_at
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching student transcript RSTs:', error);
    res.status(500).json({ error: 'Failed to fetch student transcript', details: error.message });
  }
});

// Get all RSTs for a course (faculty view)
router.get('/rst/course/:course_id', async (req, res) => {
  try {
    const { course_id } = req.params;

    const { data, error } = await supabase
      .from('student_rst')
      .select(`
        *,
        student:students(id, full_name, roll_number)
      `)
      .eq('course_id', course_id);

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching course RSTs:', error);
    res.status(500).json({ error: 'Failed to fetch course RSTs', details: error.message });
  }
});

// Delete RST
router.delete('/rst/student/:student_id/course/:course_id', async (req, res) => {
  try {
    const { student_id, course_id } = req.params;

    const { error } = await supabase
      .from('student_rst')
      .delete()
      .eq('student_id', student_id)
      .eq('course_id', course_id);

    if (error) throw error;

    res.json({ message: 'RST deleted successfully' });
  } catch (error) {
    console.error('Error deleting RST:', error);
    res.status(500).json({ error: 'Failed to delete RST', details: error.message });
  }
});

export default router;
