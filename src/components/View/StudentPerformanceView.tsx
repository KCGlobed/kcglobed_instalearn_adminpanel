import React from 'react';
import moment from 'moment';
import {
    Calendar,
    BookOpen,
    Clock,
    Mail,
    Phone,
    PlayCircle,
    User,
    Activity,
    CheckCircle,
    XCircle,
    Tag,
} from 'lucide-react';

interface StudentPerformanceViewProps {
    performance: any;
}

const StudentPerformanceView: React.FC<StudentPerformanceViewProps> = ({ performance }) => {
    if (!performance) {
        return (
            <div className="p-8 text-center text-gray-500 text-sm">
                No student performance data found.
            </div>
        );
    }

    const { user_detail, course_detail, performance_report } = performance;

    // Helper to format watch time in hours, minutes and seconds
    const formatWatchTime = (totalSeconds: number) => {
        if (!totalSeconds) return '0 mins 0 secs';
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);

        if (totalSeconds >= 3600) {
            return `${hours} hr${hours > 1 ? 's' : ''} ${minutes} min${minutes !== 1 ? 's' : ''} ${seconds} sec${seconds !== 1 ? 's' : ''}`;
        }
        return `${minutes} mins ${seconds} secs`;
    };

    const studentFullName = `${user_detail?.first_name || ''} ${user_detail?.last_name || ''}`.trim() || 'N/A';

    return (
        <div className="flex flex-col gap-6">
            {/* Top Notice Card */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                <span className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <Activity size={18} />
                </span>
                <div>
                    <p className="text-sm font-semibold text-indigo-800">Student Performance Details</p>
                    <p className="text-xs text-indigo-500 mt-0.5">
                        Viewing engagement analytics, total watch time, and enrolled course progress.
                    </p>
                </div>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-1">
                {/* Student Name */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <User size={14} /> Student Name
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-semibold text-sm">
                        {studentFullName}
                    </div>
                </div>

                {/* Email Address */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Mail size={14} /> Email Address
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-medium text-sm truncate" title={user_detail?.email}>
                        {user_detail?.email || 'N/A'}
                    </div>
                </div>

                {/* Mobile */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Phone size={14} /> Mobile Number
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-medium text-sm">
                        {user_detail?.phone1 || 'N/A'}
                    </div>
                </div>

                {/* Account Status */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        Account Status
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2">
                        {user_detail?.is_locked ? (
                            <span className="flex items-center gap-1.5 text-red-700 font-semibold text-sm bg-red-100 px-3 py-1 rounded-full border border-red-200">
                                <XCircle size={14} /> Locked
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 text-green-700 font-semibold text-sm bg-green-100 px-3 py-1 rounded-full border border-green-200">
                                <CheckCircle size={14} /> Active
                            </span>
                        )}
                    </div>
                </div>

                {/* Category */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Tag size={14} /> Category
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-semibold text-sm">
                        {user_detail?.category || 'General'}
                    </div>
                </div>

                {/* Date Joined */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Calendar size={14} /> Date Joined
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm">
                        {user_detail?.date_joined ? moment(user_detail.date_joined).format('MMM DD, YYYY') : 'N/A'}
                    </div>
                </div>

                {/* Engagement Analytics (Full Width) */}
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Activity size={14} /> Engagement Analytics
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Watch Time */}
                        <div className="p-5 bg-gradient-to-br from-indigo-50/70 to-purple-50/40 rounded-xl border border-indigo-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl text-indigo-600 flex items-center justify-center shadow-2xs border border-indigo-100 shrink-0">
                                <Clock size={22} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    Total Watch Time
                                </span>
                                <span className="text-base font-extrabold text-gray-900 mt-0.5">
                                    {formatWatchTime(performance_report?.watch_time)}
                                </span>
                            </div>
                        </div>

                        {/* Videos Watched */}
                        <div className="p-5 bg-gradient-to-br from-purple-50/70 to-indigo-50/40 rounded-xl border border-purple-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl text-purple-600 flex items-center justify-center shadow-2xs border border-purple-100 shrink-0">
                                <PlayCircle size={22} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    Videos Watched
                                </span>
                                <span className="text-base font-extrabold text-gray-900 mt-0.5">
                                    {performance_report?.total_video_watched || 0} Videos
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enrolled Course Details (Full Width) */}
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <BookOpen size={14} /> Enrolled Course Details
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        {course_detail ? (
                            <div className="p-3.5 bg-white rounded-lg border border-gray-200/80 shadow-2xs flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0 border border-indigo-100">
                                        <BookOpen size={15} />
                                    </div>
                                    <span className="font-semibold text-gray-800 text-sm truncate">
                                        {course_detail.name}
                                    </span>
                                </div>
                                {course_detail.id && (
                                    <span className="text-[11px] font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-200 shrink-0">
                                        ID: #{course_detail.id}
                                    </span>
                                )}
                            </div>
                        ) : (
                            <div className="py-6 text-center text-gray-400 text-xs italic">
                                No enrolled course data found for this record.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentPerformanceView;
