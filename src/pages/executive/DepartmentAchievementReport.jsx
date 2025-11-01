import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Building2 } from "lucide-react";

export default function DepartmentAchievementReport() {
  const data = [
    { year: "2020", Research: 60, Innovation: 40, Outreach: 30 },
    { year: "2021", Research: 70, Innovation: 50, Outreach: 45 },
    { year: "2022", Research: 80, Innovation: 65, Outreach: 55 },
    { year: "2023", Research: 90, Innovation: 75, Outreach: 70 },
    { year: "2024", Research: 95, Innovation: 82, Outreach: 78 },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md p-8">
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="text-indigo-600 w-6 h-6" />
        <h2 className="text-2xl font-semibold text-gray-800">Department Achievement Report</h2>
      </div>

      <p className="text-gray-600 mb-6">
        Trend analysis of departmental progress in research, innovation, and outreach activities.
      </p>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data}>
          <XAxis dataKey="year" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="Research" stroke="#3b82f6" strokeWidth={2} />
          <Line type="monotone" dataKey="Innovation" stroke="#10b981" strokeWidth={2} />
          <Line type="monotone" dataKey="Outreach" stroke="#f59e0b" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-6 text-sm text-gray-600">
        <strong>AI Insight (Future):</strong> Models will auto-detect underperforming departments and suggest growth strategies.
      </div>
    </div>
  );
}
