import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Users } from "lucide-react";

export default function FacultyPerformanceReport() {
  const data = [
    { name: "Computer Science", avgScore: 92 },
    { name: "Engineering", avgScore: 88 },
    { name: "Mathematics", avgScore: 95 },
    { name: "Business", avgScore: 90 },
    { name: "Arts", avgScore: 87 },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md p-8 mb-10">
      <div className="flex items-center gap-3 mb-6">
        <Users className="text-blue-600 w-6 h-6" />
        <h2 className="text-2xl font-semibold text-gray-800">Faculty Performance Report</h2>
      </div>
      <p className="text-gray-600 mb-6">
        This report highlights the teaching efficiency and research productivity of faculty members across departments.
      </p>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Bar dataKey="avgScore" fill="#3b82f6" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6 text-sm text-gray-600">
        <strong>Note:</strong> AI model will later predict future faculty performance based on teaching outcomes and research indices.
      </div>
    </div>
  );
}
