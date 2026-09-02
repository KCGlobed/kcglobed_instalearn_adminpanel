import React, { useEffect } from 'react';
import moment from 'moment';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { viewCourseAnnouncement } from '../../store/slices/courseAnnouncementSlice';
import { useAppSelector } from '../../hooks/useRedux';
import {
    Loader2,
    Calendar,
    FileText,
    BookOpen,
    CheckCircle,
    XCircle,
    Megaphone,
    User,
    Briefcase,
    MessageSquare,
} from 'lucide-react';

interface CourseAnnouncementViewProps {
    id: string | number;
    hideModal?: () => void;
}

const CourseAnnouncementView: React.FC<CourseAnnouncementViewProps> = ({ id }) => {
    const dispatch = useAppDispatch();
    const { currentAnnouncement, currentAnnouncementLoading, error } = useAppSelector(
        (state) => state.courseAnnouncement
    );

    useEffect(() => {
        if (id) {
            dispatch(viewCourseAnnouncement(id));
        }
    }, [dispatch, id]);

    if (currentAnnouncementLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-10 h-64 gap-3">
                <Loader2 size={32} className="animate-spin text-indigo-600" />
                <p className="text-sm font-medium text-gray-500">Loading announcement details...</p>
            </div>
        );
    }

    if (error && !currentAnnouncement) {
        return (
            <div className="p-8 text-center text-rose-500 font-medium text-sm">
                Failed to load announcement details.
            </div>
        );
    }

    if (!currentAnnouncement) {
        return (
            <div className="p-8 text-center text-gray-500 text-sm">
                No announcement data found.
            </div>
        );
    }

    const { course, title, description, created_at, status, instructor } = currentAnnouncement;
    const comments = currentAnnouncement.announcement_comments || [];

    return (
        <div className="flex flex-col gap-6">
            {/* Top Notice Card */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                <span className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <Megaphone size={18} />
                </span>
                <div>
                    <p className="text-sm font-semibold text-indigo-800">Course Announcement Details</p>
                    <p className="text-xs text-indigo-500 mt-0.5">Viewing detailed information for this course announcement.</p>
                </div>
            </div>

            {/* Grid Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-1">
                {/* Title */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Megaphone size={14} /> Announcement Title
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-semibold text-sm">
                        {title || 'N/A'}
                    </div>
                </div>

                {/* Course */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <BookOpen size={14} /> Course
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-semibold text-sm">
                        {course?.name || 'N/A'}
                    </div>
                </div>

                {/* Status */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        Status
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2">
                        {status ? (
                            <span className="flex items-center gap-1.5 text-green-700 font-semibold text-sm bg-green-100 px-3 py-1 rounded-full border border-green-200">
                                <CheckCircle size={14} /> Active
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 text-red-700 font-semibold text-sm bg-red-100 px-3 py-1 rounded-full border border-red-200">
                                <XCircle size={14} /> Inactive
                            </span>
                        )}
                    </div>
                </div>

                {/* Created Date */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Calendar size={14} /> Posted On
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm font-medium">
                        {created_at ? moment(created_at).format('MMM DD, YYYY hh:mm A') : '-'}
                    </div>
                </div>

                {/* Instructor Name (if exists) */}
                {instructor && (
                    <>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                <User size={14} /> Instructor
                            </label>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                                {instructor.image ? (
                                    <img
                                        src={instructor.image}
                                        alt={instructor.text_1}
                                        className="w-9 h-9 rounded-full object-cover border border-gray-200 bg-white"
                                        onError={(e) => {
                                            (e.target as HTMLElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                                        {instructor.text_1 ? instructor.text_1.charAt(0).toUpperCase() : 'I'}
                                    </div>
                                )}
                                <div className="flex flex-col">
                                    <span className="text-gray-800 text-sm font-semibold">{instructor.text_1 || 'N/A'}</span>
                                    {instructor.experience && (
                                        <span className="text-xs text-gray-500 font-medium">Experience: {instructor.experience}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                <Briefcase size={14} /> Role &amp; Organization
                            </label>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm font-medium">
                                {instructor.text_2 || instructor.text_3 ? (
                                    <span>
                                        {instructor.text_2}
                                        {instructor.text_2 && instructor.text_3 ? ' | ' : ''}
                                        {instructor.text_3}
                                    </span>
                                ) : (
                                    'N/A'
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* Description (Full Width) */}
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <FileText size={14} /> Description / Message
                    </label>
                    <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm max-w-none break-words overflow-x-auto leading-relaxed">
                        {description ? (
                            <div
                                className="prose prose-sm max-w-none text-gray-700"
                                dangerouslySetInnerHTML={{ __html: description }}
                            />
                        ) : (
                            <span className="text-gray-400 italic">No description provided.</span>
                        )}
                    </div>
                </div>

                {/* Comments Section (Full Width) */}
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <MessageSquare size={14} /> Comments ({comments.length})
                    </label>
                    <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm flex flex-col gap-3">
                        {comments.length > 0 ? (
                            comments.map((comment: any) => (
                                <div
                                    key={comment.id}
                                    className="p-3.5 bg-white rounded-lg border border-gray-200/80 shadow-2xs flex gap-3"
                                >
                                    {comment.user?.image ? (
                                        <img
                                            src={comment.user.image}
                                            alt={comment.user.first_name}
                                            className="w-8 h-8 rounded-full object-cover border border-gray-100 shrink-0"
                                            onError={(e) => {
                                                (e.target as HTMLElement).style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0 border border-indigo-100">
                                            {comment.user?.first_name ? comment.user.first_name.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                    )}
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-semibold text-gray-800 text-xs truncate">
                                                {comment.user?.first_name} {comment.user?.last_name}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-medium shrink-0">
                                                {comment.created_at ? moment(comment.created_at).fromNow() : ''}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1 whitespace-pre-wrap leading-relaxed">
                                            {comment.content}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <span className="text-gray-400 italic text-xs">No comments on this announcement yet.</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseAnnouncementView;
