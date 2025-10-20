import { useState } from "react";
import { CheckCircle, XCircle, ClipboardList, User, Users, Building2, Search } from "lucide-react";

export default function Approvals() {
  const [activeTab, setActiveTab] = useState("faculty");

  return (
    <div className="p-6 bg-gray-50 min-h-screen animate__animated animate__fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-2">
            <ClipboardList className="text-blue-600" /> Approvals
          </h1>
          <p className="text-gray-500">Review and manage pending requests from faculty, students, and your department.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        {[
          { id: "faculty", label: "Faculty Requests", icon: <User size={16} /> },
          { id: "student", label: "Student Requests", icon: <Users size={16} /> },
          { id: "department", label: "Department Requests", icon: <Building2 size={16} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-all ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600 font-semibold"
                : "border-transparent text-gray-500 hover:text-blue-500"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Render active tab */}
      {activeTab === "faculty" && <FacultyApprovals />}
      {activeTab === "student" && <StudentApprovals />}
      {activeTab === "department" && <DepartmentApprovals />}
    </div>
  );
}

function FacultyApprovals() {
  const [searchTerm, setSearchTerm] = useState("");
  const [requests, setRequests] = useState([
    {
      id: 1,
      name: "Dr. Ahmed Ali",
      type: "Leave Request",
      details: "Medical Leave (3 days)",
      date: "2025-10-15",
      status: "Pending",
    },
    {
      id: 2,
      name: "Dr. Hamza Yousaf",
      type: "Course Swap",
      details: "Swap with Dr. Sarah - BBA 302",
      date: "2025-10-14",
      status: "Pending",
    },
  ]);

  const handleAction = (id, newStatus) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  const filtered = requests.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search faculty requests..." />

      <RequestTable
        data={filtered}
        onApprove={(id) => handleAction(id, "Approved")}
        onReject={(id) => handleAction(id, "Rejected")}
      />
    </div>
  );
}

function StudentApprovals() {
  const [requests, setRequests] = useState([
    {
      id: 1,
      name: "Ali Raza",
      type: "Course Add Request",
      details: "Add: FIN-402 (Financial Analytics)",
      date: "2025-10-16",
      status: "Pending",
    },
    {
      id: 2,
      name: "Zainab Tariq",
      type: "Grade Review",
      details: "Request grade change in MKT-301",
      date: "2025-10-13",
      status: "Pending",
    },
  ]);

  const handleAction = (id, newStatus) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  return (
    <RequestTable
      data={requests}
      onApprove={(id) => handleAction(id, "Approved")}
      onReject={(id) => handleAction(id, "Rejected")}
    />
  );
}

function DepartmentApprovals() {
  const [requests, setRequests] = useState([
    {
      id: 1,
      name: "Event Proposal",
      type: "Seminar Approval",
      details: "Research Seminar on AI in Business",
      date: "2025-10-12",
      status: "Pending",
    },
    {
      id: 2,
      name: "Budget Request",
      type: "Resource Purchase",
      details: "Request to purchase new lab equipment",
      date: "2025-10-11",
      status: "Pending",
    },
  ]);

  const handleAction = (id, newStatus) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  return (
    <RequestTable
      data={requests}
      onApprove={(id) => handleAction(id, "Approved")}
      onReject={(id) => handleAction(id, "Rejected")}
    />
  );
}

// 🔍 Reusable Search Bar Component
function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="mb-6 flex items-center bg-white rounded-xl shadow-sm border border-gray-200 p-2 px-4 max-w-md">
      <Search className="text-gray-400" size={18} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-3 py-2 text-sm outline-none bg-transparent"
      />
    </div>
  );
}

// 📋 Reusable Request Table Component
function RequestTable({ data, onApprove, onReject }) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 text-gray-700 uppercase text-xs">
          <tr>
            <th className="px-6 py-3">Name / Request</th>
            <th className="px-6 py-3">Type</th>
            <th className="px-6 py-3">Details</th>
            <th className="px-6 py-3">Date</th>
            <th className="px-6 py-3 text-center">Status</th>
            <th className="px-6 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((r, i) => (
              <tr
                key={r.id}
                className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition`}
              >
                <td className="px-6 py-4 font-medium text-gray-800">{r.name}</td>
                <td className="px-6 py-4 text-gray-600">{r.type}</td>
                <td className="px-6 py-4 text-gray-600">{r.details}</td>
                <td className="px-6 py-4 text-gray-500">{r.date}</td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-semibold ${
                      r.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : r.status === "Approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-6 py-4 flex justify-center gap-3">
                  <button
                    onClick={() => onApprove(r.id)}
                    className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-md text-xs shadow-sm transition-all"
                  >
                    <CheckCircle size={14} /> Approve
                  </button>
                  <button
                    onClick={() => onReject(r.id)}
                    className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-xs shadow-sm transition-all"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center py-8 text-gray-500">
                No pending requests.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
