import { useState, useEffect } from "react";
import { UserPlus, X, Check, AlertCircle, Users, FileUp, Loader, Edit3, Trash2 } from "lucide-react";

export default function AssignCoordinator() {
  const [coordinatorForm, setCoordinatorForm] = useState({
    name: "",
    email: "",
    phone: "",
    designation: "",
    qualifications: "",
    assignedFor: "Department Management",
    address: "",
    cnic: "",
  });
  const [supportingDocument, setSupportingDocument] = useState(null);
  const [existingCoordinator, setExistingCoordinator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [assignLoading, setAssignLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Fetch existing coordinator
  useEffect(() => {
    const fetchCoordinator = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("facultyToken");
        const email = localStorage.getItem("facultyEmail");

        // Get department ID from profile
        const profileRes = await fetch(
          `http://localhost:5000/faculties/profile/${encodeURIComponent(email)}`
        );
        const profile = await profileRes.json();
        const departmentId = profile.department_id;

        // Fetch all faculty in department
        const facultyRes = await fetch(
          `http://localhost:5000/faculties/department/${departmentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const facultyData = await facultyRes.json();
        
        // Find existing coordinator
        const coordinator = facultyData.find(f => f.role === "COORDINATOR");
        setExistingCoordinator(coordinator);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching coordinator:", error);
        setMessage({ type: "error", text: "Failed to load coordinator data" });
        setLoading(false);
      }
    };

    fetchCoordinator();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCoordinatorForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDocumentChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSupportingDocument(file);
    }
  };

  const handleAssignCoordinator = async () => {
    // Validate form
    if (!coordinatorForm.name.trim() || !coordinatorForm.email.trim() || !coordinatorForm.qualifications.trim()) {
      setMessage({ 
        type: "error", 
        text: "Full Name, Email, and Qualifications are required" 
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(coordinatorForm.email)) {
      setMessage({ 
        type: "error", 
        text: "Please enter a valid email address" 
      });
      return;
    }

    try {
      setAssignLoading(true);
      const token = localStorage.getItem("facultyToken");
      const email = localStorage.getItem("facultyEmail");

      // Get department ID
      const profileRes = await fetch(
        `http://localhost:5000/faculties/profile/${encodeURIComponent(email)}`
      );
      const profile = await profileRes.json();
      const departmentId = profile.department_id;

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("name", coordinatorForm.name);
      formData.append("email", coordinatorForm.email);
      formData.append("phone", coordinatorForm.phone || "");
      formData.append("designation", coordinatorForm.designation || "Department Coordinator");
      formData.append("qualifications", coordinatorForm.qualifications);
      formData.append("assigned_for", coordinatorForm.assignedFor);
      formData.append("address", coordinatorForm.address || "");
      formData.append("cnic", coordinatorForm.cnic || "");
      formData.append("department_id", departmentId);
      formData.append("role", "COORDINATOR");

      // Add document if provided
      if (supportingDocument) {
        formData.append("document", supportingDocument);
      }

      const response = await fetch(
        `http://localhost:5000/faculties/department/${departmentId}/coordinator`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to assign coordinator");
      }

      const result = await response.json();

      setMessage({ 
        type: "success", 
        text: result.message || "Coordinator assigned successfully! A password reset link has been sent to their email." 
      });
      
      // Reset form and refresh coordinator
      setTimeout(() => {
        setShowForm(false);
        setCoordinatorForm({ 
          name: "", 
          email: "", 
          phone: "", 
          designation: "",
          qualifications: "",
          assignedFor: "Department Management",
          address: "",
          cnic: ""
        });
        setSupportingDocument(null);
        setMessage({ type: "", text: "" });
        
        // Refresh coordinator data
        location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error assigning coordinator:", error);
      setMessage({ 
        type: "error", 
        text: error.message || "Failed to assign coordinator" 
      });
    } finally {
      setAssignLoading(false);
    }
  };

  const handleRemoveCoordinator = async () => {
    if (!existingCoordinator) return;
    
    if (!window.confirm(`Are you sure you want to remove ${existingCoordinator.name} as coordinator?`)) {
      return;
    }

    try {
      setAssignLoading(true);
      const token = localStorage.getItem("facultyToken");

      const response = await fetch(
        `http://localhost:5000/faculties/${existingCoordinator.id}/remove-coordinator`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove coordinator");
      }

      setMessage({ 
        type: "success", 
        text: "Coordinator removed successfully!" 
      });
      
      setTimeout(() => {
        setExistingCoordinator(null);
        setMessage({ type: "", text: "" });
      }, 1500);
    } catch (error) {
      console.error("Error removing coordinator:", error);
      setMessage({ 
        type: "error", 
        text: error.message || "Failed to remove coordinator" 
      });
    } finally {
      setAssignLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate__animated animate__fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-800">
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Assign Coordinator
          </span>
        </h1>
        <p className="text-gray-500 mt-1">Manage coordinator assignments for your department</p>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <Check size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Existing Coordinator Card or Assign Button */}
      {existingCoordinator ? (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl shadow-lg border-2 border-indigo-300">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{existingCoordinator.name}</h2>
              <p className="text-indigo-600 font-medium">{existingCoordinator.role}</p>
            </div>
            <div className="flex items-center gap-2 bg-indigo-200 px-3 py-1 rounded-full">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-sm font-semibold text-indigo-700">Active</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-gray-800 font-medium">{existingCoordinator.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="text-gray-800 font-medium">{existingCoordinator.phone || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">CNIC</p>
              <p className="text-gray-800 font-medium">{existingCoordinator.cnic || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Designation</p>
              <p className="text-gray-800 font-medium">{existingCoordinator.designation}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Assigned For</p>
              <p className="text-gray-800 font-medium">Department Management</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Address</p>
              <p className="text-gray-800 font-medium">{existingCoordinator.address || "N/A"}</p>
            </div>
          </div>

          {existingCoordinator.qualification && (
            <div className="mb-6 bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-600">Qualifications</p>
              <p className="text-gray-800 font-medium whitespace-pre-wrap">{existingCoordinator.qualification}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setShowForm(true)}
              disabled={assignLoading}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-all flex-1 justify-center"
            >
              {assignLoading ? <Loader size={16} className="animate-spin" /> : <Edit3 size={16} />}
              Change Coordinator
            </button>
            <button
              onClick={handleRemoveCoordinator}
              disabled={assignLoading}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-all flex-1 justify-center"
            >
              {assignLoading ? <Loader size={16} className="animate-spin" /> : <Trash2 size={16} />}
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-xl shadow-lg transition-all hover:shadow-xl text-lg font-semibold flex items-center justify-center gap-2"
        >
          <UserPlus size={20} />
          Assign Department Coordinator
        </button>
      )}

      {/* Assignment Form */}
      {showForm && (
        <div className="bg-white p-8 rounded-xl shadow-xl border-2 border-indigo-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {existingCoordinator ? "Change" : "Assign"} Coordinator
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
              <input
                type="text"
                name="name"
                value={coordinatorForm.name}
                onChange={handleFormChange}
                placeholder="Enter full name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
              <input
                type="email"
                name="email"
                value={coordinatorForm.email}
                onChange={handleFormChange}
                placeholder="Enter email address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={coordinatorForm.phone}
                onChange={handleFormChange}
                placeholder="Enter phone number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* CNIC */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">CNIC Number</label>
              <input
                type="text"
                name="cnic"
                value={coordinatorForm.cnic}
                onChange={handleFormChange}
                placeholder="Enter CNIC (e.g., 12345-1234567-1)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
              <textarea
                name="address"
                value={coordinatorForm.address}
                onChange={handleFormChange}
                placeholder="Enter complete address..."
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
              />
            </div>

            {/* Designation */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Designation</label>
              <input
                type="text"
                name="designation"
                value={coordinatorForm.designation}
                onChange={handleFormChange}
                placeholder="Enter designation (e.g., Department Coordinator)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Assigned For */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Assigned For</label>
              <input
                type="text"
                name="assignedFor"
                value={coordinatorForm.assignedFor}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* Qualifications */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Qualifications *</label>
              <textarea
                name="qualifications"
                value={coordinatorForm.qualifications}
                onChange={handleFormChange}
                placeholder="Enter qualifications and experience..."
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
              />
            </div>

            {/* Supporting Documents */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Supporting Documents</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition">
                <input
                  type="file"
                  onChange={handleDocumentChange}
                  className="hidden"
                  id="document-upload"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <label htmlFor="document-upload" className="cursor-pointer">
                  <FileUp className="mx-auto mb-2 text-gray-400" size={32} />
                  <p className="text-gray-700 font-medium">Click to upload document</p>
                  <p className="text-sm text-gray-500">PDF, DOC, or Image files</p>
                </label>
              </div>
              {supportingDocument && (
                <p className="mt-2 text-green-600 text-sm font-medium">
                  ✓ {supportingDocument.name} selected
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleAssignCoordinator}
                disabled={assignLoading}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
              >
                {assignLoading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    {existingCoordinator ? "Update Coordinator" : "Assign Coordinator"}
                  </>
                )}
              </button>
              <button
                onClick={() => setShowForm(false)}
                disabled={assignLoading}
                className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
