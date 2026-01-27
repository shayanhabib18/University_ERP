import { useState, useEffect } from "react";
import { Activity, Users, Clock, TrendingUp } from "lucide-react";

const LoginHeatmap = () => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [stats, setStats] = useState({ totalLogins: 0, uniqueUsers: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(7);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  useEffect(() => {
    fetchHeatmapData();
  }, [selectedDays]);

  const fetchHeatmapData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/login-activities/heatmap?days=${selectedDays}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch heatmap data");
      }

      const result = await response.json();
      setHeatmapData(result.heatmapData || []);
      setStats({
        totalLogins: result.totalLogins || 0,
        uniqueUsers: result.uniqueUsers || 0,
      });
    } catch (error) {
      console.error("Error fetching heatmap:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get color intensity based on count
  const getHeatColor = (count) => {
    if (count === 0) return "bg-gray-50";
    if (count <= 5) return "bg-blue-100";
    if (count <= 15) return "bg-blue-200";
    if (count <= 30) return "bg-blue-300";
    if (count <= 50) return "bg-blue-400";
    return "bg-blue-500";
  };

  // Get tooltip text color based on count
  const getTextColor = (count) => {
    return count > 30 ? "text-white" : "text-gray-700";
  };

  // Format hour for display
  const formatHour = (hour) => {
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}${ampm}`;
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="animate-spin text-indigo-600 mx-auto mb-2" size={32} />
            <p className="text-gray-500">Loading login activity...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Activity className="text-indigo-600" size={20} />
            Login Activity Heatmap
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            User login patterns over time
          </p>
        </div>
        <select
          value={selectedDays}
          onChange={(e) => setSelectedDays(parseInt(e.target.value))}
          className="text-sm border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
          <option value={60}>Last 60 days</option>
        </select>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-indigo-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <TrendingUp className="text-indigo-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Logins</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalLogins}</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Users className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">User Types</p>
              <p className="text-2xl font-bold text-gray-800">{stats.uniqueUsers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Hour labels (top) */}
          <div className="flex mb-2">
            <div className="w-12"></div> {/* Spacer for day labels */}
            {hours.filter(h => h % 3 === 0).map((hour) => (
              <div key={hour} className="flex-1 text-center">
                <span className="text-xs text-gray-500">{formatHour(hour)}</span>
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          {daysOfWeek.map((day, dayIndex) => (
            <div key={dayIndex} className="flex items-center mb-1">
              {/* Day label */}
              <div className="w-12 text-sm font-medium text-gray-700">{day}</div>
              
              {/* Hour cells */}
              <div className="flex-1 flex gap-1">
                {hours.map((hour) => {
                  const dataPoint = heatmapData.find(
                    (d) => d.dayIndex === dayIndex && d.hour === hour
                  );
                  const count = dataPoint?.count || 0;
                  
                  return (
                    <div
                      key={hour}
                      className={`flex-1 h-10 ${getHeatColor(count)} rounded transition-all hover:scale-110 cursor-pointer relative group`}
                      title={`${day} ${formatHour(hour)}: ${count} logins`}
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 -top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-10">
                        {day} {formatHour(hour)}
                        <br />
                        <strong>{count}</strong> logins
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-2">
        <span className="text-sm text-gray-600">Less</span>
        <div className="flex gap-1">
          <div className="w-6 h-6 bg-gray-50 border border-gray-200 rounded"></div>
          <div className="w-6 h-6 bg-blue-100 rounded"></div>
          <div className="w-6 h-6 bg-blue-200 rounded"></div>
          <div className="w-6 h-6 bg-blue-300 rounded"></div>
          <div className="w-6 h-6 bg-blue-400 rounded"></div>
          <div className="w-6 h-6 bg-blue-500 rounded"></div>
        </div>
        <span className="text-sm text-gray-600">More</span>
      </div>
    </div>
  );
};

export default LoginHeatmap;
