import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Loader,
} from "lucide-react";
import { facultyAPI } from "../../services/api";

const FacultyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [departmentName, setDepartmentName] = useState(null);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get token from localStorage
        const token = localStorage.getItem("facultyToken");
        if (!token) {
          setError("No authentication token found. Please login again.");
          setLoading(false);
          return;
        }

        // Fetch faculty profile using the token
        const profileData = await facultyAPI.getProfile(token);
        setProfile(profileData);

        // Fetch department name if department_id is available
        if (profileData?.department_id) {
          try {
            const response = await fetch(
              `http://localhost:5000/departments/${profileData.department_id}`
            );
            if (response.ok) {
              const departmentData = await response.json();
              setDepartmentName(
                departmentData?.name ||
                  departmentData?.department_name ||
                  "Unknown Department"
              );
            }
          } catch (deptError) {
            console.warn("Failed to fetch department details:", deptError);
            setDepartmentName("Unknown Department");
          }
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        setError(err.message || "Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, []);

  const getInitials = (name) => {
    if (!name) return "N/A";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const ProfileHeader = () => (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white mb-8">
      <div className="flex items-start">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
              {getInitials(profile?.name)}
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold">{profile?.name || "Loading..."}</h1>
            <p className="text-gray-300 text-lg mt-1">
              {profile?.designation || "Faculty Member"}
            </p>
            <p className="text-gray-300 text-sm mt-1">
              {departmentName || "Loading department..."}
            </p>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-300">
              <div className="flex items-center gap-1">
                <Mail size={14} />
                {profile?.email || "N/A"}
              </div>
              <div className="flex items-center gap-1">
                <Phone size={14} />
                {profile?.phone || "N/A"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const PersonalInfo = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <User className="text-indigo-600" size={20} />
        Personal Information
      </h3>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <p className="p-3 bg-gray-50 rounded-xl">{profile?.name || "N/A"}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Designation
          </label>
          <p className="p-3 bg-gray-50 rounded-xl">
            {profile?.designation || "N/A"}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department
          </label>
          <p className="p-3 bg-gray-50 rounded-xl">
            {departmentName || "Loading..."}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Mail size={14} />
            Email
          </label>
          <p className="p-3 bg-gray-50 rounded-xl">{profile?.email || "N/A"}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Phone size={14} />
            Phone
          </label>
          <p className="p-3 bg-gray-50 rounded-xl">{profile?.phone || "N/A"}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Calendar size={14} />
            Joining Date
          </label>
          <p className="p-3 bg-gray-50 rounded-xl">
            {profile?.joining_date
              ? new Date(profile.joining_date).toLocaleDateString()
              : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="flex flex-col items-center gap-4">
              <Loader className="animate-spin text-indigo-600" size={40} />
              <p className="text-gray-600">Loading profile...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-red-700 mb-2">
              Error Loading Profile
            </h3>
            <p className="text-red-600">{error}</p>
          </div>
        ) : profile ? (
          <>
            <ProfileHeader />
            <PersonalInfo />
          </>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
            <p className="text-yellow-700">No profile data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyProfile;