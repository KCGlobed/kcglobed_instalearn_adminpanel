import React, { useEffect } from 'react';
import moment from 'moment';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { viewCourseAnnouncement } from '../../store/slices/courseAnnouncementSlice';
import { useAppSelector } from '../../hooks/useRedux';
import { Calendar, BookOpen, Clock, ShieldCheck, Megaphone, Info, Briefcase, Award } from 'lucide-react';

interface CourseAnnouncementViewProps {
    id: string | number;
    hideModal: () => void;
}

const CourseAnnouncementView: React.FC<CourseAnnouncementViewProps> = ({ id, hideModal }) => {
    const dispatch = useAppDispatch();
    const { currentAnnouncement, currentAnnouncementLoading, error } = useAppSelector(state => state.courseAnnouncement);

    useEffect(() => {
        if (id) {
            dispatch(viewCourseAnnouncement(id));
        }
    }, [dispatch, id]);

    if (currentAnnouncementLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-16 min-h-[400px] gap-6">
                <div className="relative flex justify-center items-center">
                    <div className="w-16 h-16 border-4 border-indigo-100 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                    <Megaphone className="w-6 h-6 text-indigo-500 absolute animate-pulse" />
                </div>
                <div className="flex flex-col items-center gap-2">
                    <span className="text-lg font-bold text-gray-800">Fetching Details</span>
                    <span className="text-sm font-medium text-gray-400">Loading the announcement for you...</span>
                </div>
            </div>
        );
    }

    if (error && !currentAnnouncement) {
        return (
            <div className="flex flex-col items-center justify-center p-12 min-h-[300px] gap-4 bg-red-50/30 rounded-2xl m-4 border border-red-100 ">
                <div className="w-16 h-16 bg-red-100 text-red-500 flex items-center justify-center rounded-full mb-2">
                    <Info size={28} />
                </div>
                <span className="text-red-600 font-bold text-xl">Failed to load data</span>
                <span className="text-sm text-red-400/80 text-center max-w-xs">{error}</span>
                <button onClick={hideModal} className="mt-6 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95">Go Back</button>
            </div>
        );
    }

    if (!currentAnnouncement) {
        return null;
    }

    const { course, title, description, created_at, status, instructor } = currentAnnouncement;

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
                            <Megaphone size={22} className="text-white" />
                        </div>
                        <span className="text-white/90 text-xs font-bold uppercase tracking-widest">Course Announcement</span>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="flex flex-col gap-6 px-6 py-8 -mt-6 relative z-10">
                {/* Title & Status */}
                <div className="flex flex-col gap-4 bg-white p-6 rounded-2xl shadow-xl shadow-indigo-100/20 border border-gray-200">
                    <div className="flex items-start justify-between gap-4">
                        <h1 className="text-xl font-black text-gray-900 leading-tight">
                            {title || 'Untitled Announcement'}
                        </h1>
                        <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border-gray-200 ${status
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                            {status ? 'Active' : 'Inactive'}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-2">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <BookOpen size={14} className="text-indigo-500" />
                            <span className="font-semibold text-gray-800">{course?.name || '-'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Calendar size={14} className="text-purple-500" />
                            <span className="font-medium">{created_at ? moment(created_at).format('MMM DD, YYYY') : '-'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Clock size={14} className="text-orange-400" />
                            <span className="font-medium">{created_at ? moment(created_at).format('hh:mm A') : '-'}</span>
                        </div>
                    </div>
                </div>

                {/* Announcement Body */}
                <div className="flex flex-col gap-2 bg-white p-5 rounded-2xl shadow-xl shadow-indigo-100/20 border border-gray-200">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Message Content</h2>
                    <div className="prose prose-sm max-w-none text-gray-700">
                        <p className="whitespace-pre-wrap leading-relaxed">
                            {description || <span className="text-gray-400 italic">No detailed message provided for this announcement.</span>}
                        </p>
                    </div>
                </div>

                {/* Instructor Details */}
                {instructor && (
                    <div className="flex flex-col gap-2">
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2">Posted By</h2>
                        <div className="flex items-center justify-between bg-gradient-to-br from-indigo-50/80 to-purple-50/50 p-4 rounded-2xl border border-indigo-100/50 shadow-sm transition-all hover:shadow-md group">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    {instructor.image ? (
                                        <img
                                            src={instructor.image}
                                            alt={instructor.text_1}
                                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                            onError={(e) => {
                                                (e.target as HTMLElement).style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center font-bold text-indigo-700 border-2 border-white shadow-sm text-lg">
                                            {instructor.text_1 ? instructor.text_1.charAt(0).toUpperCase() : 'I'}
                                        </div>
                                    )}
                                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                </div>
                                <div className="flex flex-col w-full">
                                    <span className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">{instructor.text_1 || 'Unknown Instructor'}</span>

                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                                        {instructor.text_2 && (
                                            <span className="text-gray-500 font-medium text-[11px] sm:text-xs flex items-center gap-1">
                                                <ShieldCheck size={12} className="text-indigo-400" />
                                                {instructor.text_2}
                                            </span>
                                        )}

                                        {instructor.text_3 && (
                                            <span className="text-gray-500 font-medium text-[11px] sm:text-xs flex items-center gap-1">
                                                <Briefcase size={12} className="text-purple-400" />
                                                {instructor.text_3}
                                            </span>
                                        )}

                                        {instructor.experience && (
                                            <span className="text-gray-500 font-medium text-[11px] sm:text-xs flex items-center gap-1">
                                                <Award size={12} className="text-orange-400" />
                                                {instructor.experience}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Comments Section */}
                {currentAnnouncement.announcement_comments && currentAnnouncement.announcement_comments.length > 0 && (
                    <div className="flex flex-col gap-3 mt-2">
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2">
                            Comments ({currentAnnouncement.announcement_comments.length})
                        </h2>
                        <div className="flex flex-col gap-3">
                            {currentAnnouncement.announcement_comments.map((comment:any) => (
                                <div key={comment.id} className="flex gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
                                    {comment.user.image ? (
                                        <img
                                            src={comment.user.image}
                                            alt={comment.user.first_name}
                                            className="w-10 h-10 rounded-full object-cover border border-gray-100 shrink-0 shadow-sm"
                                            onError={(e) => {
                                                (e.target as HTMLElement).style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0 border border-indigo-100 shadow-sm">
                                            {comment.user.first_name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-1.5 w-full">
                                        <div className="flex justify-between items-start w-full">
                                            <span className="font-bold text-gray-900 text-sm">
                                                {comment.user.first_name} {comment.user.last_name}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-semibold tracking-wide">
                                                {moment(comment.created_at).format('MMM DD, YYYY - hh:mm A')}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 leading-relaxed">
                                            {comment.user.email}
                                        </p>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {comment.content}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};

export default CourseAnnouncementView;
