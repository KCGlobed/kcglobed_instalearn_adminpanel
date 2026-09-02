import React from 'react';
import {
    BookOpen,
    CalendarDays,
    FileText,
    Layers,
    CheckCircle,
    XCircle,
    Hash,
} from 'lucide-react';
import moment from 'moment';

interface TrailCourseViewProps {
    trailCourseData: any;
}

const TrailCourseView: React.FC<TrailCourseViewProps> = ({ trailCourseData }) => {
    const chapters = trailCourseData?.chapter_info || [];
    const courseName = trailCourseData?.course_detail?.name || trailCourseData?.name || 'N/A';
    const courseId = trailCourseData?.course_detail?.id || trailCourseData?.id;
    const status = trailCourseData?.status !== undefined ? trailCourseData.status : true;

    return (
        <div className="flex flex-col gap-6">
            {/* Top Notice Card */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                <span className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <BookOpen size={18} />
                </span>
                <div>
                    <p className="text-sm font-semibold text-indigo-800">Trail Course Details</p>
                    <p className="text-xs text-indigo-500 mt-0.5">Viewing detailed curriculum and chapter information for this trail course.</p>
                </div>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-1">
                {/* Course Name */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <BookOpen size={14} /> Course Name
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-semibold text-sm">
                        {courseName}
                    </div>
                </div>

                {/* Total Chapters */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Layers size={14} /> Total Chapters
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-semibold text-sm flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-xs font-bold">
                            {chapters.length}
                        </span>
                        <span>{chapters.length === 1 ? 'Chapter Included' : 'Chapters Included'}</span>
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

                {/* Course ID */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Hash size={14} /> Course Identifier
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 font-medium text-sm">
                        {courseId ? `#${courseId}` : 'N/A'}
                    </div>
                </div>

                {/* Included Chapters List (Full Width) */}
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <FileText size={14} /> Included Chapters ({chapters.length})
                    </label>

                    <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs overflow-hidden">
                        {chapters.length > 0 ? (
                            <div className="flex flex-col divide-y divide-gray-100">
                                {chapters.map((chapter: any, index: number) => {
                                    const chapterName =
                                        chapter?.chapter_detail?.name ||
                                        chapter?.chapter_detail?.chapter_detail?.name ||
                                        `Chapter ${index + 1}`;
                                    const chapterDesc =
                                        chapter?.chapter_detail?.description ||
                                        chapter?.chapter_detail?.chapter_detail?.description;
                                    const createdAt =
                                        chapter?.chapter_detail?.created_at ||
                                        chapter?.chapter_detail?.chapter_detail?.created_at ||
                                        chapter?.created_at;

                                    return (
                                        <div
                                            key={chapter.id || index}
                                            className="p-4 hover:bg-gray-50/70 transition-colors flex items-start gap-4"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center font-bold text-xs shrink-0">
                                                {index + 1}
                                            </div>

                                            <div className="flex flex-col flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <span className="font-semibold text-gray-800 text-sm">
                                                        {chapterName}
                                                    </span>
                                                    {createdAt && (
                                                        <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                                                            <CalendarDays size={12} />
                                                            {moment(createdAt).format('MMM DD, YYYY')}
                                                        </span>
                                                    )}
                                                </div>

                                                {chapterDesc ? (
                                                    <p className="text-xs text-gray-600 mt-1 leading-relaxed line-clamp-2">
                                                        {chapterDesc}
                                                    </p>
                                                ) : (
                                                    <p className="text-xs text-gray-400 italic mt-0.5">
                                                        No description provided for this chapter.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                                    <Layers size={18} />
                                </div>
                                <p className="text-xs font-semibold text-gray-600">No Chapters Attached</p>
                                <p className="text-[11px] text-gray-400 max-w-xs">
                                    This trail course does not have any specific chapters configured yet.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrailCourseView;