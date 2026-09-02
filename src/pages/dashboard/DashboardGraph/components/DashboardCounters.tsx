import React from "react";
import { Users, Building2, ShoppingBag, Crown, PlayCircle, Video, TrendingUp } from "lucide-react";

export interface DashboardCountersProps {
  counters: {
    total_students?: number;
    new_students_current_month?: number;
    total_corporate_admins?: number;
    total_active_orders?: number;
    total_active_subscription?: number;
    total_duration_watched?: number;
    total_duration?: number;
    [key: string]: any;
  } | null;
}

const formatMinutes = (minutes: number = 0): string => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins} mins`;
  if (mins === 0) return `${hrs.toLocaleString()} hrs`;
  return `${hrs.toLocaleString()} hrs ${mins} mins`;
};

export const DashboardCounters: React.FC<DashboardCountersProps> = ({ counters }) => {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {/* Metric 1: Total Students + Monthly Growth */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Total Students
            </p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              {counters?.total_students?.toLocaleString() ?? 0}
            </h3>
          </div>
          <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
            <Users size={18} />
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-2">
          <TrendingUp size={13} />
          <span>+{counters?.new_students_current_month ?? 0} this month</span>
        </div>
      </div>

      {/* Metric 2: Corporate Admins */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Corporate Admins
            </p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              {counters?.total_corporate_admins?.toLocaleString() ?? 0}
            </h3>
          </div>
          <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
            <Building2 size={18} />
          </div>
        </div>
        <p className="text-[11px] text-gray-400 font-medium mt-2">
          Institutions &amp; Enterprises
        </p>
      </div>

      {/* Metric 3: Active Orders */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Active Orders
            </p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              {counters?.total_active_orders?.toLocaleString() ?? 0}
            </h3>
          </div>
          <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
            <ShoppingBag size={18} />
          </div>
        </div>
        <p className="text-[11px] text-gray-400 font-medium mt-2">
          Total course orders
        </p>
      </div>

      {/* Metric 4: Active Subscriptions */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Active Subscriptions
            </p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              {counters?.total_active_subscription?.toLocaleString() ?? 0}
            </h3>
          </div>
          <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
            <Crown size={18} />
          </div>
        </div>
        <p className="text-[11px] text-gray-400 font-medium mt-2">
          Active recurring plans
        </p>
      </div>

      {/* Metric 5: Total Watch Time */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Watch Time (Learned)
            </p>
            <h3 className="text-xl font-bold text-gray-900 mt-1">
              {formatMinutes(counters?.total_duration_watched)}
            </h3>
          </div>
          <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
            <PlayCircle size={18} />
          </div>
        </div>
        <p className="text-[11px] text-amber-700 font-medium mt-2">
          Across all video streams
        </p>
      </div>

      {/* Metric 6: Total Library Duration */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Content Duration
            </p>
            <h3 className="text-xl font-bold text-gray-900 mt-1">
              {formatMinutes(counters?.total_duration)}
            </h3>
          </div>
          <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
            <Video size={18} />
          </div>
        </div>
        <p className="text-[11px] text-gray-400 font-medium mt-2">
          Total video catalog
        </p>
      </div>
    </section>
  );
};

export default DashboardCounters;
