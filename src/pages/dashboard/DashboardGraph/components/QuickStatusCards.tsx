import React from "react";
import { GraduationCap, FileText, Tag } from "lucide-react";

export const QuickStatusCards: React.FC = () => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <GraduationCap size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Platform Instructors</p>
            <span className="text-sm font-bold text-gray-900">Active Faculty</span>
          </div>
        </div>
        <span className="text-lg font-bold text-indigo-600">12</span>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Published Articles</p>
            <span className="text-sm font-bold text-gray-900">Knowledge Base</span>
          </div>
        </div>
        <span className="text-lg font-bold text-emerald-600">24</span>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <Tag size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Featured Campaign</p>
            <span className="text-sm font-bold text-gray-900">Active Discount</span>
          </div>
        </div>
        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
          FLAT50OFF
        </span>
      </div>
    </section>
  );
};

export default QuickStatusCards;
