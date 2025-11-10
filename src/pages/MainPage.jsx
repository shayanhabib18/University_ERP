import { Link } from "react-router-dom";
import {
  Shield,
  GraduationCap,
  UserCog,
  Users,
  Award,
  FileText,
} from "lucide-react";

const roles = [
  {
    title: "Administrator",
    description: "Manage users, system settings, and configurations.",
    loginPath: "/login/admin",
    icon: <Shield className="w-7 h-7 text-blue-600" />,
    color: "from-blue-50 to-blue-100",
  },
  {
    title: "Student Portal",
    description: "View grades, register courses, and track progress.",
    loginPath: "/login/student",
    icon: <GraduationCap className="w-7 h-7 text-green-600" />,
    color: "from-green-50 to-green-100",
  },
  {
    title: "Faculty Dashboard",
    description: "Manage classes, upload grades, and view schedules.",
    loginPath: "/login/faculty",
    icon: <UserCog className="w-7 h-7 text-purple-600" />,
    color: "from-purple-50 to-purple-100",
  },
  {
    title: "Department Chair",
    description: "Oversee faculty, courses, and department analytics.",
    loginPath: "/login/chairman",
    icon: <Users className="w-7 h-7 text-amber-600" />,
    color: "from-amber-50 to-amber-100",
  },
  {
    title: "Executive Portal",
    description: "Access reports and institutional analytics.",
    loginPath: "/login/executive",
    icon: <Award className="w-7 h-7 text-red-500" />,
    color: "from-rose-50 to-rose-100",
  },
  {
    title: "Exam Department",
    description: "Handle exams, results, and academic reports.",
    loginPath: "/login/exam",
    icon: <FileText className="w-7 h-7 text-orange-600" />,
    color: "from-orange-50 to-orange-100",
  },
];

export default function MainPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50 flex flex-col">
      {/* Header */}
      <header className="text-center py-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent tracking-tight drop-shadow-sm">
          University ERP System
        </h1>
        <p className="text-gray-600 mt-2 text-base max-w-xl mx-auto">
          Streamline academics, administration, and management — all in one secure platform.
        </p>
      </header>

      {/* Roles Section */}
      <main className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto px-6 pb-16">
        {roles.map((role, index) => (
          <div
            key={index}
            className={`group relative bg-gradient-to-br ${role.color} rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1`}
          >
            {/* Icon & Title */}
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                {role.icon}
              </div>
              <h2 className="text-lg font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                {role.title}
              </h2>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm leading-relaxed mb-5">
              {role.description}
            </p>

            {/* Access Button */}
            <Link
              to={role.loginPath}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
            >
              Access Portal
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
          </div>
        ))}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-500 text-sm border-t border-gray-200">
        © {new Date().getFullYear()}{" "}
        <span className="font-semibold text-gray-700">
          University ERP System
        </span>{" "}
        — All rights reserved.
      </footer>
    </div>
  );
}
