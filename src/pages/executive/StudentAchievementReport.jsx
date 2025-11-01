import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { GraduationCap } from "lucide-react";

export default function StudentAchievementReport() {
  const data = [
    { name: "Distinction (≥3.7 GPA)", value: 35 },
    { name: "Merit (3.3–3.6 GPA)", value: 40 },
    { name: "Pass (2.5–3.2 GPA)", value: 20 },
    { name: "Below Pass (<2.5 GPA)", value: 5 },
  ];

  const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444"];

  return (
    <div className="bg-white rounded-2xl shadow-md p-8 mb-10">
      <div className="flex items-center gap-3 mb-6">
        <GraduationCap className="text-green-600 w-6 h-6" />
        <h2 className="text-2xl font-semibold text-gray-800">Student Achievement Report</h2>
      </div>

      <p className="text-gray-600 mb-6">
        Distribution of student performance based on GPA ranges for the current academic year.
      </p>

      <div className="flex justify-center">
        <ResponsiveContainer width="90%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius={120}
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <strong>AI Integration:</strong> Future backend will forecast pass/fail trends and identify at-risk students.
      </div>
    </div>
  );
}
