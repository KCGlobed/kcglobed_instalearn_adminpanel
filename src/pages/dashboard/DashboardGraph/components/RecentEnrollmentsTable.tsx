import React from "react";
import moment from "moment";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

export interface RecentEnrollmentsTableProps {
  recentStudents: any[];
  loading: boolean;
  initialLoading?: boolean;
}

export const RecentEnrollmentsTable: React.FC<RecentEnrollmentsTableProps> = ({
  recentStudents,
  loading,
  initialLoading = false,
}) => {
  const studentList = Array.isArray(recentStudents) ? recentStudents : [];
  const isLoading = loading || (initialLoading && studentList.length === 0);

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-gray-900">
            Recent Enrollments
          </h3>
          <Link
            to="/dashboard/students"
            className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold transition"
          >
            See all
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-10 flex flex-col items-center justify-center text-center">
              <Loader2 size={24} className="animate-spin text-indigo-600 mb-2" />
              <p className="text-xs text-gray-400 font-medium">Loading enrollments...</p>
            </div>
          ) : studentList.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="pb-3.5 pr-3 font-bold">STUDENT</th>
                  <th className="pb-3.5 px-3 font-bold">EMAIL</th>
                  <th className="pb-3.5 px-3 font-bold">DATE JOINED</th>
                  <th className="pb-3.5 pl-3 font-bold text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {studentList.slice(0, 5).map((student: any) => {
                  const fullName =
                    [student.first_name, student.last_name].filter(Boolean).join(" ").trim() ||
                    "Student";
                  const initial = (student.first_name?.[0] || fullName[0] || "S").toUpperCase();
                  const joinedFormatted =
                    student.date_joined || student.created_at
                      ? moment(student.date_joined || student.created_at).format("MMM DD, YYYY")
                      : "-";
                  const isActive =
                    student.is_active !== false && student.status !== false && !student.is_locked;

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      {/* STUDENT Avatar + Name */}
                      <td className="py-3.5 pr-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#EEF2FF] text-[#4F46E5] font-bold text-xs flex items-center justify-center shrink-0">
                            {initial}
                          </div>
                          <span className="font-medium text-gray-800 text-sm">{fullName}</span>
                        </div>
                      </td>

                      {/* EMAIL */}
                      <td
                        className="py-3.5 px-3 text-xs text-gray-500 max-w-[140px] truncate"
                        title={student.email}
                      >
                        {student.email || "-"}
                      </td>

                      {/* DATE JOINED */}
                      <td className="py-3.5 px-3 text-xs text-gray-500 whitespace-nowrap">
                        {joinedFormatted}
                      </td>

                      {/* STATUS */}
                      <td className="py-3.5 pl-3 text-right whitespace-nowrap">
                        {isActive ? (
                          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/80 uppercase tracking-wide">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200/80 uppercase tracking-wide">
                            INACTIVE
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-8 flex flex-col items-center justify-center text-center text-gray-400">
              <p className="text-xs text-gray-400 font-medium">No enrollments found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentEnrollmentsTable;
