import { Link } from "react-router-dom";
import {
  Shield,
  GraduationCap,
  UserCog,
  Users,
  BarChart4,
  Award,
  FileText,
} from "lucide-react";

const roles = [
  {
    title: "Administrator",
    description:
      "Manage system configurations, user accounts, and institutional settings.",
    loginPath: "/login/admin",
    icon: <Shield className="w-8 h-8 text-blue-600" />,
    color: "from-blue-50 to-blue-100",
  },
  {
    title: "Student Portal",
    description:
      "Access academic records, course materials, and registration services.",
    loginPath: "/login/student",
    icon: <GraduationCap className="w-8 h-8 text-green-600" />,
    color: "from-green-50 to-green-100",
  },
  {
    title: "Faculty Dashboard",
    description:
      "Manage courses, submit grades, and track student progress efficiently.",
    loginPath: "/login/faculty",
    icon: <UserCog className="w-8 h-8 text-purple-600" />,
    color: "from-purple-50 to-purple-100",
  },
  {
    title: "Department Chair",
    description:
      "Oversee academic programs, faculty performance, and departmental analytics.",
    loginPath: "/login/chairman",
    icon: <Users className="w-8 h-8 text-amber-600" />,
    color: "from-amber-50 to-amber-100",
  },
  {
    title: "Executive Portal",
    description:
      "High-level access for Vice Chancellor and executives to manage analytics and governance.",
    loginPath: "/login/executive",
    icon: <Award className="w-8 h-8 text-red-500" />,
    color: "from-indigo-50 to-indigo-100",
  },
  {
    title: "Exam Department",
    description:
      "Manage examinations, results processing, and academic coordination.",
    loginPath: "/login/exam",
    icon: <FileText className="w-8 h-8 text-orange-600" />,
    color: "from-orange-50 to-orange-100",
  },
];

export default function MainPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      {/* Header */}
      <header className="text-center py-12 mb-6 animate-fadeIn">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent drop-shadow-sm">
          University ERP System
        </h1>
        <p className="text-lg text-gray-600 mt-3 max-w-2xl mx-auto">
          A unified platform for academic management, administration, and
          institutional excellence.
        </p>
      </header>

      {/* Role Cards */}
      <main className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto px-6 mb-20">
        {roles.map((role, index) => (
          <div
            key={index}
            className={`group relative bg-gradient-to-br ${role.color} rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] backdrop-blur-md border border-gray-100/50`}
          >
            <div className="p-8 flex flex-col h-full">
              {/* Icon Section */}
              <div className="w-16 h-16 flex items-center justify-center rounded-xl bg-white shadow-sm mb-5 group-hover:scale-110 transition-transform">
                {role.icon}
              </div>

              {/* Title & Description */}
              <h2 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-blue-700 transition-colors">
                {role.title}
              </h2>
              <p className="text-gray-600 mb-8 flex-grow leading-relaxed">
                {role.description}
              </p>

              {/* Access Button */}
              <div className="mt-auto">
                <Link
                  to={role.loginPath}
                  className="inline-flex items-center px-5 py-2.5 font-medium text-sm rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  Access Portal
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-2"
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
            </div>

            {/* Decorative hover glow */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-blue-200/20 via-indigo-200/10 to-transparent blur-2xl pointer-events-none"></div>
          </div>
        ))}
      </main>

      {/* Footer */}
      <footer className="text-center pb-8 text-gray-500 text-sm">
        <p>
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold text-gray-700">
            University ERP System
          </span>
          . All rights reserved.
        </p>
      </footer>
    </div>
  );
}
