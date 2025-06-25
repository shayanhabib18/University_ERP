import React, { useState } from "react";

export default function Profile() {
  const initialDetails = {
    registrationNo: "2022-BSSE-120",
    phone: "051-1234567",
    address: "House no 1 Street 2 B17",
    mobile: "0123456789",
    city: "Islamabad",
    email: "shayanhabib2003@gmail.com",
    session: "Fa-2022",
    degree: "BSSE",
  };

  const [details, setDetails] = useState(initialDetails);
  const [editMode, setEditMode] = useState(false);
  const [pendingDetails, setPendingDetails] = useState(initialDetails);
  const [submitted, setSubmitted] = useState(false);
  const [profilePic, setProfilePic] = useState(null); // Base64 or URL

  const handleChange = (e) => {
    setPendingDetails({
      ...pendingDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setEditMode(false);
    setDetails(pendingDetails);
  };

  const handleCancel = () => {
    setPendingDetails(details);
    setEditMode(false);
    setSubmitted(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-700">🎓 Personal Details</h2>
        {!editMode && (
          <button
            onClick={() => setEditMode(true)}
            className="mt-3 sm:mt-0 text-sm px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Edit
          </button>
        )}
      </div>

      {submitted && (
        <div className="mb-4 text-sm text-green-600 font-medium">
          ✅ Your update request has been submitted and is pending admin approval.
        </div>
      )}

      {/* Profile Picture */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-36 h-36">
          <img
            src={profilePic || "/images/profiles/profileimg.jpeg"}
            alt="Profile"
            className="w-36 h-36 rounded-full object-cover ring-4 ring-indigo-500 shadow-md"
          />
          {editMode && (
            <label className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2 cursor-pointer shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 11-2.828-2.828L12.344 4.172a4 4 0 015.656 0l2.828 2.828a4 4 0 010 5.656l-1.414 1.414a2 2 0 11-2.828-2.828L15.172 7z" />
              </svg>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>
        {editMode && (
          <p className="mt-2 text-sm text-gray-600">Upload a square image (JPG/PNG)</p>
        )}
      </div>

      {/* Details Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700 text-sm sm:text-base">
        {Object.entries(details).map(([key, value]) => (
          <div key={key}>
            <strong className="capitalize">
              {key.replace(/([A-Z])/g, " $1")}:
            </strong>{" "}
            {editMode ? (
              <input
                type="text"
                name={key}
                value={pendingDetails[key]}
                onChange={handleChange}
                className="border border-gray-300 rounded px-2 py-1 w-full mt-1"
              />
            ) : (
              <span>{value}</span>
            )}
          </div>
        ))}
      </div>

      {editMode && (
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={handleCancel}
            className="text-sm px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="text-sm px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Submit Request
          </button>
        </div>
      )}
    </div>
  );
}
