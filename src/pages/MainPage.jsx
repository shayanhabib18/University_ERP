import { Link } from 'react-router-dom';

const roles = [
  {
    title: 'Admin',
    description: 'Login as Admin to manage the ERP system.',
    loginPath: '/login/admin',
  },
  {
    title: 'Student',
    description: 'Login as student to access your portal.',
    loginPath: '/login/student',
  },
  {
    title: 'Faculty',
    description: 'Faculty login to manage classes and attendance.',
    loginPath: '/login/faculty',
  },
  {
    title: 'Chairman',
    description: 'Chairman login to monitor departments.',
    loginPath: '/login/chairman',
  },
  {
    title: 'Vice Chancellor',
    description: 'VC login to review reports and analytics.',
    loginPath: '/login/vc',
  },
  {
    title: 'Chancellor',
    description: 'Chancellor login to view system summaries.',
    loginPath: '/login/chancellor',
  },
];

export default function MainPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-10 px-4">
      <h1 className="text-4xl md:text-5xl font-extrabold text-center text-blue-700 mb-12 transition-opacity duration-1000 animate-fadeIn">
        University ERP System
      </h1>

      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
        {roles.map((role, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center border border-gray-200 
                       transform transition duration-500 ease-in-out hover:-translate-y-2 hover:shadow-2xl animate-fadeUp"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              {role.title}
            </h2>
            <p className="text-gray-600 mb-4">{role.description}</p>

            <div className="flex gap-3 justify-center">
              <Link
                to={role.loginPath}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Login
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
