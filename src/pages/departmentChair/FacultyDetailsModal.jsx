import React from "react";
import { X } from "lucide-react";

export default function FacultyDetailsModal({ faculty, onClose }) {
  if (!faculty) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X size={22} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6 border-b pb-4">
          <img
            src={faculty.image || "/images/profiles/profileimg.jpeg"}
            alt={faculty.name}
            className="w-20 h-20 rounded-full object-cover border-4 border-indigo-500 shadow-md"
          />
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              {faculty.name}
            </h2>
            <p className="text-sm text-gray-500">{faculty.designation}</p>
            <span className="inline-block mt-1 bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-1 rounded-md">
              {faculty.department}
            </span>
          </div>
        </div>

        {/* Faculty Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 text-sm sm:text-base">
          <p><span className="font-semibold text-gray-900">ID:</span> {faculty.id}</p>
          <p><span className="font-semibold text-gray-900">Email:</span> {faculty.email}</p>
          <p><span className="font-semibold text-gray-900">Join Date:</span> {faculty.joinDate}</p>
          <p><span className="font-semibold text-gray-900">Office Hours:</span> {faculty.officeHours}</p>
          <p><span className="font-semibold text-gray-900">Total Courses:</span> {faculty.totalCourses}</p>
          <p><span className="font-semibold text-gray-900">Total Workload:</span> {faculty.totalWorkload}</p>
        </div>

        {/* Assigned Courses */}
        <div className="mt-5">
          <p className="font-semibold text-gray-900 mb-2">Assigned Courses:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            {faculty.assignedCourses?.map((course, index) => (
              <li key={index}>{course}</li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
