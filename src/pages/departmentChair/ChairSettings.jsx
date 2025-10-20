import { useState } from "react";
import { User, Lock, Users, Save, Calendar, LogOut } from "lucide-react";

export default function ChairSettings() {
  const [profile, setProfile] = useState({
    name: "Dr. Sarah Khan",
    department: "Business Administration",
    email: "sarah.khan@university.edu",
    phone: "+92 300 1234567",
    office: "Room 204, B-Block",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  const [delegation, setDelegation] = useState({
    facultyName: "",
    reason: "",
    startDate: "",
    endDate: "",
  });

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleDelegationChange = (e) => {
    setDelegation({ ...delegation, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = () => {
    alert("Profile updated successfully!");
  };

  const handleChangePassword = () => {
    if (passwords.newPass !== passwords.confirm) {
      alert("New passwords do not match!");
      return;
    }
    alert("Password changed successfully!");
  };

  const handleDelegationSubmit = () => {
    alert(
      `Delegation assigned to ${delegation.facultyName} from ${delegation.startDate} to ${delegation.endDate}.`
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-8">
      <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
        <User className="text-blue-600" /> Settings
      </h1>

      {/* Profile Management */}
      <section className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-4">
          <User size={18} /> Profile Management
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            name="name"
            value={profile.name}
            onChange={handleProfileChange}
            className="border p-2 rounded"
            placeholder="Full Name"
          />
          <input
            name="department"
            value={profile.department}
            onChange={handleProfileChange}
            className="border p-2 rounded"
            placeholder="Department"
          />
          <input
            name="email"
            value={profile.email}
            onChange={handleProfileChange}
            className="border p-2 rounded"
            placeholder="Email"
            disabled
          />
          <input
            name="phone"
            value={profile.phone}
            onChange={handleProfileChange}
            className="border p-2 rounded"
            placeholder="Phone Number"
          />
          <input
            name="office"
            value={profile.office}
            onChange={handleProfileChange}
            className="border p-2 rounded"
            placeholder="Office Location"
          />
        </div>

        <button
          onClick={handleSaveProfile}
          className="mt-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          <Save size={16} /> Save Changes
        </button>
      </section>

      {/* Change Password */}
      <section className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-4">
          <Lock size={18} /> Change Password
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="password"
            name="current"
            value={passwords.current}
            onChange={handlePasswordChange}
            className="border p-2 rounded"
            placeholder="Current Password"
          />
          <input
            type="password"
            name="newPass"
            value={passwords.newPass}
            onChange={handlePasswordChange}
            className="border p-2 rounded"
            placeholder="New Password"
          />
          <input
            type="password"
            name="confirm"
            value={passwords.confirm}
            onChange={handlePasswordChange}
            className="border p-2 rounded"
            placeholder="Confirm Password"
          />
        </div>

        <button
          onClick={handleChangePassword}
          className="mt-4 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          <Lock size={16} /> Update Password
        </button>
      </section>

      {/* Delegation Settings */}
      <section className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-4">
          <Users size={18} /> Delegation Settings
        </h2>

        <p className="text-sm text-gray-500 mb-4">
          Temporarily assign your responsibilities to another faculty member.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            name="facultyName"
            value={delegation.facultyName}
            onChange={handleDelegationChange}
            className="border p-2 rounded"
            placeholder="Faculty Member Name"
          />
          <input
            name="reason"
            value={delegation.reason}
            onChange={handleDelegationChange}
            className="border p-2 rounded"
            placeholder="Reason for Delegation"
          />
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-gray-500" />
            <input
              type="date"
              name="startDate"
              value={delegation.startDate}
              onChange={handleDelegationChange}
              className="border p-2 rounded w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-gray-500" />
            <input
              type="date"
              name="endDate"
              value={delegation.endDate}
              onChange={handleDelegationChange}
              className="border p-2 rounded w-full"
            />
          </div>
        </div>

        <button
          onClick={handleDelegationSubmit}
          className="mt-4 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
        >
          <Users size={16} /> Assign Delegation
        </button>
      </section>

      {/* Logout */}
      <div className="text-right">
        <button className="flex items-center gap-2 text-red-600 hover:underline ml-auto">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
}
