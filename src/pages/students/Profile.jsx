import React from "react";

export default function Profile() {
  const details = {
    registrationNo: "2022-BSSE-120",
    phone: "051-1234567",
    address: "House no 1 Street 2 B17",
    mobile: "0123456789",
    city: "Islamabad",
    email: "shayanhabib2003@gmail.com",
    session: "Fa-2022",
    degree: "BSSE",
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-700">
          🎓 Personal Details
        </h2>
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

      {/* Static Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700 text-sm sm:text-base">
        <div>
          <strong>Registration No:</strong> <span>{details.registrationNo}</span>
        </div>
        <div>
          <strong>Phone:</strong> <span>{details.phone}</span>
        </div>
        <div>
          <strong>Address:</strong> <span>{details.address}</span>
        </div>
        <div>
          <strong>Mobile:</strong> <span>{details.mobile}</span>
        </div>
        <div>
          <strong>City:</strong> <span>{details.city}</span>
        </div>
        <div>
          <strong>Email:</strong> <span>{details.email}</span>
        </div>
        <div>
          <strong>Session:</strong> <span>{details.session}</span>
        </div>
        <div>
          <strong>Degree:</strong> <span>{details.degree}</span>
        </div>
      </div>
    </div>
  );
}
