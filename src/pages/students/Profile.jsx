import React, { useState, useEffect } from "react";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [details, setDetails] = useState({
    registrationNo: "",
    phone: "",
    address: "",
    mobile: "",
    city: "",
    email: "",
    session: "",
    degree: "",
  });

  // Load profile from localStorage (set during login) or fallback to placeholders
  useEffect(() => {
    try {
      const stored = localStorage.getItem("student_info");
      if (stored) {
        const info = JSON.parse(stored);
        console.log("Loaded student_info from localStorage:", info); // Debug log
        setDetails((prev) => ({
          ...prev,
          registrationNo: info.roll_number || prev.registrationNo || "",
          phone: info.student_phone || prev.phone || "",
          mobile: info.student_phone || prev.mobile || "",
          address: info.current_address || prev.address || "",
          city: info.current_address || prev.city || "",
          email: info.personal_email || prev.email || "",
          session: info.joining_session || prev.session || "",
          degree: info.department_name || prev.degree || "",
        }));
      }
    } catch (err) {
      console.warn("Failed to load student profile", err);
    }
  }, []);

  const [requestStatus, setRequestStatus] = useState("");

  const handleChange = (e) => {
    setDetails({
      ...details,
      [e.target.name]: e.target.value,
    });
  };

  const handleRequestApproval = () => {
    setIsEditing(false);
    setRequestStatus("Your update request has been sent to admin for approval.");
    console.log("Request sent to admin:", details);

    // ✅ In future: call API like
    // await axios.post("/api/request-profile-update", details);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-700">
          🎓 Personal Details
        </h2>

        {/* Edit / Request Admin Button */}
        <button
          onClick={() => (isEditing ? handleRequestApproval() : setIsEditing(true))}
          className={`px-4 py-2 rounded-lg text-white font-medium shadow transition-all ${
            isEditing
              ? "bg-green-600 hover:bg-green-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isEditing ? "Request Admin Approval" : "Edit / Request Admin"}
        </button>
      </div>

      {/* Profile Picture */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-36 h-36">
          <img
            src="/images/profiles/profileimg.jpeg"
            alt="Profile"
            className="w-36 h-36 rounded-full object-cover ring-4 ring-indigo-500 shadow-md"
          />
        </div>
      </div>

      {/* Student Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700 text-sm sm:text-base">
        <div>
          <strong>Registration No:</strong> <span>{details.registrationNo}</span>
        </div>
        <div>
          <strong>Session:</strong> <span>{details.session}</span>
        </div>
        <div>
          <strong>Degree:</strong> <span>{details.degree}</span>
        </div>

        {/* Editable fields */}
        {["phone", "mobile", "address", "city", "email"].map((field) => (
          <div key={field}>
            <strong className="capitalize">
              {field === "mobile"
                ? "Mobile"
                : field.charAt(0).toUpperCase() + field.slice(1)}
              :
            </strong>{" "}
            {isEditing ? (
              <input
                type={field === "email" ? "email" : "text"}
                name={field}
                value={details[field]}
                onChange={handleChange}
                className="border border-gray-300 rounded-md px-2 py-1 w-full mt-1 text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            ) : (
              <span>{details[field]}</span>
            )}
          </div>
        ))}
      </div>

      {/* Status Message */}
      {requestStatus && (
        <div className="mt-4 p-3 text-green-700 bg-green-100 rounded-lg text-sm">
          ✅ {requestStatus}
        </div>
      )}
    </div>
  );
}
