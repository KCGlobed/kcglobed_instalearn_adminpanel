import React from 'react';
import moment from 'moment';
import {
    Calendar,
    BookOpen,
    Clock,
    ShieldCheck,
    Mail,
    Phone,
    PlayCircle,
    UserCircle,
    Activity
} from 'lucide-react';

interface StudentPerformanceViewProps {
    performance: any;
}

const StudentPerformanceView: React.FC<StudentPerformanceViewProps> = ({ performance }) => {
    if (!performance) {
        return null;
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

    return (
        <div className="flex flex-col w-full max-h-[85vh] overflow-y-auto bg-gray-50/30 custom-scrollbar relative animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Gradient Banner */}
            <div className="relative w-full h-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 shrink-0 overflow-hidden rounded-2xl">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>

                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl text-white shadow-sm border border-white/20">
                            <Activity size={22} className="text-white" />
                        </div>
                        <span className="text-white/90 text-xs font-bold uppercase tracking-widest">Student Performance Details</span>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="flex flex-col gap-6 px-6 py-8 -mt-6 relative z-10">
                {/* Student Info & Status */}
                <div className="flex flex-col gap-4 bg-white p-6 rounded-2xl shadow-xl shadow-indigo-100/20 border border-gray-200">
                    <div className="flex items-start justify-between gap-4">
                        <h1 className="text-xl font-black text-gray-900 leading-tight flex items-center gap-2">
                            <UserCircle className="text-indigo-600" size={24} />
                            {user_detail?.first_name} {user_detail?.last_name}
                        </h1>
                        <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border ${user_detail?.is_locked ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'
                            }`}>
                            {user_detail?.is_locked ? 'Locked' : 'Active'}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-2">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Mail size={14} className="text-indigo-500" />
                            <span className="font-semibold text-gray-800">{user_detail?.email || '-'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Phone size={14} className="text-purple-500" />
                            <span className="font-medium text-gray-800">{user_detail?.phone1 || '-'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <ShieldCheck size={14} className="text-orange-400" />
                            <span className="font-medium">Category: {user_detail?.category || '-'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Calendar size={14} className="text-blue-400" />
                            <span className="font-medium">Joined: {user_detail?.date_joined ? moment(user_detail.date_joined).format('MMM DD, YYYY') : '-'}</span>
                        </div>
                    </div>
                </div>

                {/* Details Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Performance Info */}
                    <div className="flex flex-col gap-2">
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2">Engagement Analytics</h2>
                        <div className="flex items-center justify-between bg-gradient-to-br from-indigo-50/80 to-purple-50/50 p-5 rounded-2xl border border-indigo-100/50 shadow-sm transition-all hover:shadow-md group h-full">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white rounded-xl text-indigo-600 shadow-sm border border-indigo-100 flex items-center justify-center">
                                    <Clock size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Watch Time</span>
                                    <span className="font-extrabold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors">
                                        {formatWatchTime(performance_report?.watch_time)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Videos Info */}
                    <div className="flex flex-col gap-2">
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2">Video Completion</h2>
                        <div className="flex items-center justify-between bg-gradient-to-br from-purple-50/80 to-indigo-50/50 p-5 rounded-2xl border border-purple-100/50 shadow-sm transition-all hover:shadow-md group h-full">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white rounded-xl text-purple-600 shadow-sm border border-purple-100 flex items-center justify-center">
                                    <PlayCircle size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Videos Watched</span>
                                    <span className="font-bold text-gray-900 text-lg group-hover:text-purple-600 transition-colors">
                                        {performance_report?.total_video_watched || 0} Videos
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Course Details Section */}
                <div className="flex flex-col gap-3 mt-2">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2">
                        Enrolled Course Details
                    </h2>
                    <div className="flex flex-col gap-3">
                        {course_detail ? (
                            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
                                <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg shrink-0 border border-indigo-100 shadow-sm">
                                    <BookOpen size={20} />
                                </div>
                                <div className="flex flex-col gap-0.5 w-full">
                                    <span className="font-bold text-gray-900 text-sm">
                                        {course_detail.name}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-semibold tracking-wide">
                                        Course ID: {course_detail.id || '-'}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-gray-200 text-center gap-2">
                                <BookOpen size={24} className="text-gray-300 animate-pulse" />
                                <span className="text-sm font-medium text-gray-400">No course listed in this record.</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentPerformanceView;
