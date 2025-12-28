import supabase from "../model/supabaseClient.js";

const AdminLogin = async (req, res) => {
  const { email, password } = req.body;
  console.log(email,password)
  const { data, error } = await supabase
    .from("users")
    .insert([{ email, password }]);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

export default AdminLogin;

