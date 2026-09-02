import React from "react";
import moment from "moment";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

export interface RecentCorporateAdminsTableProps {
  recentCorporateAdmins: any[];
  loading: boolean;
  initialLoading?: boolean;
}

export const RecentCorporateAdminsTable: React.FC<RecentCorporateAdminsTableProps> = ({
  recentCorporateAdmins,
  loading,
  initialLoading = false,
}) => {
  const adminList = Array.isArray(recentCorporateAdmins) ? recentCorporateAdmins : [];
  const isLoading = loading || (initialLoading && adminList.length === 0);

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-gray-900">
            Recent Corporate Admins
          </h3>
          <Link
            to="/dashboard/corporate-admin"
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
              <p className="text-xs text-gray-400 font-medium">Loading corporate admins...</p>
            </div>
          ) : adminList.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="pb-3.5 pr-3 font-bold">ADMIN</th>
                  <th className="pb-3.5 px-3 font-bold">EMAIL</th>
                  <th className="pb-3.5 px-3 font-bold">PHONE</th>
                  <th className="pb-3.5 pl-3 font-bold text-right">DATE JOINED</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {adminList.slice(0, 5).map((admin: any) => {
                  const fullName =
                    [admin.first_name, admin.last_name].filter(Boolean).join(" ").trim() ||
                    "Corporate Admin";
                  const initial = (admin.first_name?.[0] || fullName[0] || "C").toUpperCase();
                  const joinedFormatted =
                    admin.date_joined || admin.created_at
                      ? moment(admin.date_joined || admin.created_at).format("MMM DD, YYYY")
                      : "-";

                  return (
                    <tr
                      key={admin.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      {/* ADMIN Avatar + Name */}
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
                        title={admin.email}
                      >
                        {admin.email || "-"}
                      </td>

                      {/* PHONE */}
                      <td className="py-3.5 px-3 text-xs text-gray-500 whitespace-nowrap">
                        {admin.phone1 || "-"}
                      </td>

                      {/* DATE JOINED */}
                      <td className="py-3.5 pl-3 text-xs text-gray-500 text-right whitespace-nowrap">
                        {joinedFormatted}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-8 flex flex-col items-center justify-center text-center text-gray-400">
              <p className="text-xs text-gray-400 font-medium">No corporate admins found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentCorporateAdminsTable;
