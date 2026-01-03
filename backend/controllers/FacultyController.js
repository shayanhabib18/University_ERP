// backend/controllers/FacultyController.js
import supabase from "../model/supabaseClient.js";

const buildPayload = (body) => {
  const {
    name,
    designation,
    qualification,
    specialization,
    email,
    phone,
    cnic,
    address,
    experience,
    joining_date,
    department_id,
    status,
    role,
    must_change_password,
  } = body;

  return {
    name,
    designation,
    qualification,
    specialization: specialization ?? null,
    email,
    phone,
    cnic,
    address: address ?? null,
    experience: experience ?? null,
    joining_date: joining_date ?? null,
    department_id,
    status: status ?? "ACTIVE",
    role: role ?? "FACULTY",
    must_change_password: must_change_password ?? true,
  };
};

export const getAllFaculty = async (_req, res) => {
  try {
    const { data, error } = await supabase.from("faculties").select("*");
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getFacultyByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { data, error } = await supabase
      .from("faculties")
      .select("*")
      .eq("department_id", departmentId);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addFaculty = async (req, res) => {
  try {
    const required = [
      "name",
      "designation",
      "qualification",
      "email",
      "phone",
      "cnic",
      "department_id",
    ];
    for (const field of required) {
      if (!req.body?.[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    const payload = buildPayload(req.body);
    const { data, error } = await supabase
      .from("faculties")
      .insert([payload])
      .select()
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = buildPayload(req.body);
    const { data, error } = await supabase
      .from("faculties")
      .update(payload)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("faculties").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Faculty deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
