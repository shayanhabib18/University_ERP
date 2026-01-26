import React, { useState, useEffect } from "react";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [details, setDetails] = useState({
    fullName: "",
    registrationNo: "",
    phone: "",
    address: "",
    mobile: "",
    city: "",
    email: "",
    session: "",
    joiningDate: "",
    degree: "",
  });

  // Load profile from localStorage (set during login) or fallback to placeholders
  useEffect(() => {
    try {
      const stored = localStorage.getItem("student_info");
      if (stored) {
        const info = JSON.parse(stored);
        console.log("Loaded student_info from localStorage:", info); // Debug log
        const loadedDetails = {
          fullName: info.full_name || "",
          registrationNo: info.roll_number || "",
          phone: info.student_phone || "",
          mobile: info.student_phone || "",
          address: info.permanent_address || "",
          city: info.city || "",
          email: info.personal_email || "",
          session: info.joining_session || "",
          joiningDate: info.joining_date || "",
          degree: info.department_name || "",
        };
        setDetails(loadedDetails);
        setOriginalDetails(loadedDetails);
      }
    } catch (err) {
      console.warn("Failed to load student profile", err);
    }
  }, []);

  const [requestStatus, setRequestStatus] = useState("");
  const [originalDetails, setOriginalDetails] = useState({});
  const [pendingRequest, setPendingRequest] = useState(null);

  // Check for pending or rejected profile edit requests
  useEffect(() => {
    const checkPendingRequests = async () => {
      try {
        const token = localStorage.getItem("student_token");
        const response = await fetch("http://localhost:5000/api/student-requests", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const requests = await response.json();
          // Find the most recent PROFILE_EDIT request
          const profileEditRequest = requests
            .filter((req) => req.request_type === "PROFILE_EDIT")
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

          if (profileEditRequest) {
            setPendingRequest(profileEditRequest);

            if (profileEditRequest.status === "pending") {
              setRequestStatus("⏳ Your profile update request is pending admin approval.");
            } else if (profileEditRequest.status === "rejected") {
              setRequestStatus(
                "❌ Request rejected. Please contact student affairs for more details."
              );
            } else if (profileEditRequest.status === "approved") {
              setRequestStatus("✅ Your profile has been updated!");
              // Fetch fresh profile data from backend
              const profileResponse = await fetch("http://localhost:5000/students/me", {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              
              if (profileResponse.ok) {
                const freshInfo = await profileResponse.json();
                console.log("Fetched fresh profile data:", freshInfo);
                
                // Update localStorage with fresh data
                localStorage.setItem("student_info", JSON.stringify(freshInfo));
                
                // Update UI state
                const loadedDetails = {
                  fullName: freshInfo.full_name || "",
                  registrationNo: freshInfo.roll_number || "",
                  phone: freshInfo.student_phone || "",
                  mobile: freshInfo.student_phone || "",
                  address: freshInfo.permanent_address || "",
                  city: freshInfo.city || "",
                  email: freshInfo.personal_email || "",
                  session: freshInfo.joining_session || "",
                  joiningDate: freshInfo.joining_date || "",
                  degree: freshInfo.department_name || "",
                };
                setDetails(loadedDetails);
                setOriginalDetails(loadedDetails);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error checking pending requests:", error);
      }
    };

    checkPendingRequests();
  }, []);

  const handleChange = (e) => {
    setDetails({
      ...details,
      [e.target.name]: e.target.value,
    });
  };

  const handleRequestApproval = async () => {
    try {
      setIsEditing(false);
      setRequestStatus("Sending request...");

      const token = localStorage.getItem("student_token");
      const studentInfo = JSON.parse(localStorage.getItem("student_info") || "{}");

      // Prepare the changes payload
      const changes = {
        phone: details.phone !== originalDetails.phone ? details.phone : null,
        mobile: details.mobile !== originalDetails.mobile ? details.mobile : null,
        address: details.address !== originalDetails.address ? details.address : null,
        city: details.city !== originalDetails.city ? details.city : null,
        email: details.email !== originalDetails.email ? details.email : null,
      };

      // Filter out null values
      const changesPayload = Object.fromEntries(
        Object.entries(changes).filter(([_, v]) => v !== null)
      );

      // Create profile edit request
      const response = await fetch("http://localhost:5000/api/student-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          request_type: "PROFILE_EDIT",
          title: "Profile Update Request",
          description: "Request to update profile information",
          payload: changesPayload,
          priority: "medium",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create request");
      }

      setRequestStatus("✅ Your update request has been sent to admin for approval.");
      
      // Reset to original details
      setDetails(originalDetails);
    } catch (error) {
      console.error("Error creating profile edit request:", error);
      setRequestStatus("❌ Failed to send request. Please try again.");
    }
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
          disabled={pendingRequest?.status === "pending"}
          className={`px-4 py-2 rounded-lg text-white font-medium shadow transition-all ${
            pendingRequest?.status === "pending"
              ? "bg-gray-400 cursor-not-allowed"
              : isEditing
              ? "bg-green-600 hover:bg-green-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {pendingRequest?.status === "pending"
            ? "Request Pending..."
            : isEditing
            ? "Request Admin Approval"
            : "Edit / Request Admin"}
        </button>
      </div>

      {/* Student Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700 text-sm sm:text-base">
        <div>
          <strong>Student Name:</strong> <span>{details.fullName}</span>
        </div>
        <div>
          <strong>Registration No:</strong> <span>{details.registrationNo}</span>
        </div>
        <div>
          <strong>Season:</strong> <span>{details.session}</span>
        </div>
        <div>
          <strong>Joining Date:</strong> <span>{details.joiningDate}</span>
        </div>
        <div>
          <strong>Degree:</strong> <span>{details.degree}</span>
        </div>
        <div>
          <strong>Email Address:</strong> <span>{details.email}</span>
        </div>

        {/* Editable fields */}
        {["phone", "address", "city"].map((field) => (
          <div key={field}>
            <strong className="capitalize">
              {field === "phone"
                ? "Student Phone No"
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
        <div
          className={`mt-4 p-3 rounded-lg text-sm ${
            requestStatus.includes("rejected")
              ? "text-red-700 bg-red-100"
              : requestStatus.includes("pending")
              ? "text-orange-700 bg-orange-100"
              : requestStatus.includes("updated") || requestStatus.includes("sent")
              ? "text-green-700 bg-green-100"
              : "text-blue-700 bg-blue-100"
          }`}
        >
          {requestStatus}
        </div>
      )}
    </div>
  );
}
