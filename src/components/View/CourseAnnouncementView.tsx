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
        <div className="flex flex-col w-full max-h-[85vh] overflow-y-auto bg-white custom-scrollbar">
            {/* Header Area */}
            <div className="px-8 pt-8 pb-6 border-b border-gray-100 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                Announcement
                            </span>
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${status
                                ? 'bg-green-50 text-green-700'
                                : 'bg-red-50 text-red-700'
                                }`}>
                                {status ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 leading-tight">
                            {title || 'Untitled Announcement'}
                        </h1>
                        <p className="text-sm font-medium text-gray-500 mt-1">
                            {course?.name || 'No Course Associated'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-6 mt-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="font-medium">{created_at ? moment(created_at).format('MMMM DD, YYYY') : '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock size={16} className="text-gray-400" />
                        <span className="font-medium">{created_at ? moment(created_at).format('hh:mm A') : '-'}</span>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="px-8 py-8 flex flex-col gap-8">
                {/* Announcement Body */}
                <div className="flex flex-col gap-4 p-6 rounded-2xl border border-gray-200 bg-white shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]">
                    <div className="prose prose-base max-w-none text-gray-800 editor-content leading-relaxed">
                        {description ? (
                            <div dangerouslySetInnerHTML={{ __html: description }} />
                        ) : (
                            <span className="text-gray-400 italic">No detailed message provided for this announcement.</span>
                        )}
                    </div>
                </div>

                {/* Instructor Details */}
                {instructor && (
                    <div className="flex flex-col gap-4 p-6 rounded-2xl border border-indigo-100 bg-indigo-50/30">
                        <h2 className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Posted By</h2>
                        <div className="flex items-center gap-4">
                            {instructor.image ? (
                                <img
                                    src={instructor.image}
                                    alt={instructor.text_1}
                                    className="w-14 h-14 rounded-full object-cover bg-white border-2 border-white shadow-sm"
                                    onError={(e) => {
                                        (e.target as HTMLElement).style.display = 'none';
                                    }}
                                />
                            ) : (
                                <div className="w-14 h-14 rounded-full bg-white text-indigo-600 flex items-center justify-center font-bold text-xl border-2 border-white shadow-sm">
                                    {instructor.text_1 ? instructor.text_1.charAt(0).toUpperCase() : 'I'}
                                </div>
                            )}
                            <div className="flex flex-col">
                                <span className="font-bold text-gray-900">{instructor.text_1 || 'Unknown Instructor'}</span>
                                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500 font-medium">
                                    {instructor.text_2 && (
                                        <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-gray-100">
                                            <ShieldCheck size={14} className="text-indigo-400" />
                                            {instructor.text_2}
                                        </span>
                                    )}
                                    {instructor.text_3 && (
                                        <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-gray-100">
                                            <Briefcase size={14} className="text-purple-400" />
                                            {instructor.text_3}
                                        </span>
                                    )}
                                    {instructor.experience && (
                                        <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-gray-100">
                                            <Award size={14} className="text-orange-400" />
                                            {instructor.experience}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Comments Section */}
                {currentAnnouncement.announcement_comments && currentAnnouncement.announcement_comments.length > 0 && (
                    <div className="flex flex-col gap-5 p-6 rounded-2xl border border-gray-100 bg-gray-50/50">
                        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                            Comments ({currentAnnouncement.announcement_comments.length})
                        </h2>
                        <div className="flex flex-col gap-4">
                            {currentAnnouncement.announcement_comments.map((comment:any) => (
                                <div key={comment.id} className="flex gap-4 p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
                                    {comment.user.image ? (
                                        <img
                                            src={comment.user.image}
                                            alt={comment.user.first_name}
                                            className="w-10 h-10 rounded-full object-cover border border-gray-100 shrink-0"
                                            onError={(e) => {
                                                (e.target as HTMLElement).style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-sm shrink-0 border border-gray-200">
                                            {comment.user.first_name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-1 w-full pt-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-bold text-gray-900 text-sm">
                                                {comment.user.first_name} {comment.user.last_name}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-medium">
                                                {moment(comment.created_at).fromNow()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700 leading-relaxed mt-1">
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
