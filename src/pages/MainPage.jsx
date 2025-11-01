import { Link } from 'react-router-dom';
import { 
  Shield, 
  GraduationCap, 
  UserCog, 
  Users, 
  BarChart4, 
  Award,
  FileText
} from 'lucide-react';

const roles = [
  {
    title: 'Administrator',
    description: 'Manage system configurations, user accounts, and institutional settings',
    loginPath: '/login/admin',
    icon: <Shield className="w-8 h-8 text-blue-600" />,
    color: 'bg-blue-100'
  },
  {
    title: 'Student Portal',
    description: 'Access academic records, course materials, and registration services',
    loginPath: '/login/student',
    icon: <GraduationCap className="w-8 h-8 text-green-600" />,
    color: 'bg-green-100'
  },
  {
    title: 'Faculty Dashboard',
    description: 'Manage courses, submit grades, and track student progress',
    loginPath: '/login/faculty',
    icon: <UserCog className="w-8 h-8 text-purple-600" />,
    color: 'bg-purple-100'
  },
  {
    title: 'Department Chair',
    description: 'Oversee academic programs and faculty performance metrics',
    loginPath: '/login/chairman',
    icon: <Users className="w-8 h-8 text-amber-600" />,
    color: 'bg-amber-100'
  },
  {
    title: 'Executive Portal',
    description: 'High-level access for Vice Chancellor and Executive members to manage analytics, governance, and institutional strategy',
    loginPath: '/login/executive',
    icon: (
      <div className="flex space-x-1">
        <Award className="w-6 h-6 text-red-500" />
      </div>
    ),
    color: 'bg-indigo-100'
  },
  {
    title: 'Exam Department',
    description: 'Manage examinations, results processing, scheduling, and coordination with departments',
    loginPath: '/login/exam',
    icon: <FileText className="w-8 h-8 text-orange-600" />,
    color: 'bg-orange-100'
  },
];

export default function MainPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6">
      {/* Header */}
      <div className="text-center mb-16 animate-fadeIn">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            University ERP System
          </span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Unified platform for academic management and institutional administration
        </p>
      </div>

      {/* Role Cards */}
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
        {roles.map((role, index) => (
          <div
            key={index}
            className={`group relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${role.color}`}
          >
            <div className="p-6 flex flex-col h-full">
              {/* Icon */}
              <div className="w-14 h-14 flex items-center justify-center rounded-lg bg-white mb-4 shadow-sm">
                {role.icon}
              </div>
              
              <h2 className="text-xl font-bold text-gray-800 mb-2">{role.title}</h2>
              <p className="text-gray-600 mb-6 flex-grow">{role.description}</p>
              
              <div className="mt-auto">
                <Link
                  to={role.loginPath}
                  className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg bg-white text-blue-600 hover:bg-blue-50 border border-blue-100 transition-all duration-200 shadow-sm group-hover:shadow-md"
                >
                  Access Portal
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Decorative line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 group-hover:opacity-50 transition-opacity"></div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-20 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} University ERP System. All rights reserved.</p>
      </div>
    </div>
  );
}
