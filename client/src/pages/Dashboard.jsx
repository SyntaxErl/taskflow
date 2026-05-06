import { useState, useEffect } from "react";
import DashboardSkeleton from "../components/DashboardSkeleton";
import api from "../api/axios";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/tasks/dashboard/stats");
        setStats(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="p-6" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6 animate-fadeInUp">
        {/* Total Tasks */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats?.stats.total}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                All tasks across categories
              </p>
            </div>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#ede9fe" }}
            >
              <span
                className="material-icons"
                style={{ color: "#5b4fcf", fontSize: "22px" }}
              >
                assignment
              </span>
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-500 font-medium">Completed</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats?.stats.completed}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {stats?.stats.total > 0
                  ? `${Math.round((stats.stats.completed / stats.stats.total) * 100)}% completion rate`
                  : "0% completion rate"}
              </p>
              {/* Progress bar */}
              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                <div
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width:
                      stats?.stats.total > 0
                        ? `${Math.round((stats.stats.completed / stats.stats.total) * 100)}%`
                        : "0%",
                    backgroundColor: "#22c55e",
                  }}
                />
              </div>
            </div>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center ml-4"
              style={{ backgroundColor: "#dcfce7" }}
            >
              <span
                className="material-icons"
                style={{ color: "#22c55e", fontSize: "22px" }}
              >
                check_circle
              </span>
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Pending</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats?.stats.pending}
              </p>
              <p className="text-xs text-gray-400 mt-1">Todo or In Progress</p>
            </div>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#fef9c3" }}
            >
              <span
                className="material-icons"
                style={{ color: "#eab308", fontSize: "22px" }}
              >
                schedule
              </span>
            </div>
          </div>
        </div>

        {/* Overdue */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Overdue</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats?.stats.overdue}
              </p>
              <p className="text-xs text-gray-400 mt-1">Tasks past due date</p>
            </div>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#fee2e2" }}
            >
              <span
                className="material-icons"
                style={{ color: "#ef4444", fontSize: "22px" }}
              >
                warning
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
