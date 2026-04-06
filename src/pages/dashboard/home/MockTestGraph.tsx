import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAppSelector } from "../../../hooks/useRedux";
import { useAppDispatch } from "../../../hooks/useAppDispatch";
import { useEffect, useState } from "react";
import { getPracticeChart } from "../../../store/slices/dasboardPracticeChartSlice";

export default function MockTestGraph() {
  const { data, loading } = useAppSelector((state) => state.dashboardPracticeChart);
  const dispatch = useAppDispatch();
  const [filter, setFilter] = useState("week"); // default filter

  useEffect(() => {
    dispatch(getPracticeChart({ id: filter }));
  }, [filter, dispatch]);

  return (
    <div
      style={{
        width: "100%",
        height: 350,
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>
          Student Pracitce Test
        </h4>

        {/* Filter Buttons */}
        <div style={{ display: "flex", gap: "6px" }}>
          {["week", "month", "year"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "4px 10px",
                fontSize: "12px",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                background: filter === f ? "#4f46e5" : "#f3f4f6",
                color: filter === f ? "#fff" : "#374151",
                cursor: "pointer",
              }}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Area Chart */}
      <div style={{ flex: 1 }}>
        <ResponsiveContainer>
          <AreaChart data={data || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="start_date"
              tick={{ fontSize: 11, fill: "#6b7280" }}
            />
            <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                fontSize: "12px",
              }}
            />
            <Area
              type="monotone"
              dataKey="total_practice_test_created"
              stroke="#4f46e5"
              fill="#4f46e5"
              fillOpacity={0.2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Loader / No Data */}
      {loading && (
        <p style={{ textAlign: "center", marginTop: 8, fontSize: "13px" }}>
          Loading...
        </p>
      )}
      {!loading && (!data || data.length === 0) && (
        <p style={{ textAlign: "center", marginTop: 8, fontSize: "13px" }}>
          No data available
        </p>
      )}
    </div>
  );
}
