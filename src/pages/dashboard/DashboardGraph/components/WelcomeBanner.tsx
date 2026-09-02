import React from "react";
import moment from "moment";
import { Link } from "react-router-dom";
import { BookOpen, Users } from "lucide-react";

export const WelcomeBanner: React.FC = () => {
  return (
    <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          Welcome back, Admin 👋
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {moment().format("dddd, MMMM D, YYYY")} &bull; Platform Overview &amp; Analytics
        </p>
      </div>
      <div className="flex flex-wrap gap-2.5">
        <Link
          to="/dashboard/courses"
          className="bg-indigo-600 text-white py-2 px-4 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-sm flex items-center gap-2"
        >
          <BookOpen size={16} /> Manage Courses
        </Link>
        <Link
          to="/dashboard/students"
          className="bg-white border border-gray-200 text-gray-700 py-2 px-4 rounded-xl text-sm font-semibold hover:bg-gray-50 transition shadow-sm flex items-center gap-2"
        >
          <Users size={16} /> View Students
        </Link>
      </div>
    </section>
  );
};

export default WelcomeBanner;
