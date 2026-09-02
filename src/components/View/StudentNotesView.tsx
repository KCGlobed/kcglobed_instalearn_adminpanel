import React, { useEffect, useState } from 'react';
import moment from 'moment';
import Select from 'react-select';
import {
    Calendar,
    Clock,
    User,
    Mail,
    FileText,
    Loader2,
    BookOpen,
} from 'lucide-react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useRedux';
import { getStudentNotesDetail, clearStudentNotesDetail } from '../../store/slices/studentNotesSlice';

interface StudentNotesViewProps {
    userId: string | number;
    courses: { id: number; name: string; notes_count: number }[];
    initialCourseId?: string | number;
}

const StudentNotesView: React.FC<StudentNotesViewProps> = ({ userId, courses, initialCourseId }) => {
    const dispatch = useAppDispatch();
    const { detailData, detailLoading, error } = useAppSelector((state) => state.studentNotes);
    const [selectedCourseId, setSelectedCourseId] = useState<number | string>(
        initialCourseId || (courses && courses.length > 0 ? courses[0].id : '')
    );

    // Format course options for react-select
    const courseOptions = courses.map((course) => ({
        value: course.id,
        label: `${course.name} (${course.notes_count || 0} Notes)`,
    }));

    useEffect(() => {
        if (userId && selectedCourseId) {
            dispatch(getStudentNotesDetail({ userId, courseId: selectedCourseId }));
        }

        return () => {
            dispatch(clearStudentNotesDetail());
        };
    }, [dispatch, userId, selectedCourseId]);

    // Format duration from seconds to readable string
    const formatDuration = (seconds: string | number) => {
        if (!seconds) return '0s';
        const totalSeconds = Number(seconds);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}m ${secs}s`;
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Top Notice Card */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                <span className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <FileText size={18} />
                </span>
                <div>
                    <p className="text-sm font-semibold text-indigo-800">Student Notes Details</p>
                    <p className="text-xs text-indigo-500 mt-0.5">
                        Viewing recorded video lecture notes, lecture timestamps, and content saved by the student.
                    </p>
                </div>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-1">
                {/* Student Username */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <User size={14} /> Student Username
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-semibold text-sm">
                        {detailData?.username || 'N/A'}
                    </div>
                </div>

                {/* Student ID */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Mail size={14} /> Student User ID
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm font-medium">
                        {detailData?.user_id ? `#${detailData.user_id}` : (userId ? `#${userId}` : 'N/A')}
                    </div>
                </div>

                {/* Course Selection Dropdown (Full Width) */}
                {courses && courses.length > 0 && (
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                            <BookOpen size={14} /> Select Enrolled Course
                        </label>
                        <Select
                            options={courseOptions}
                            value={courseOptions.find((option) => option.value === selectedCourseId)}
                            onChange={(option: any) => option && setSelectedCourseId(option.value)}
                            placeholder="Select course to view notes..."
                            classNamePrefix="react-select"
                            styles={{
                                control: (base, state) => ({
                                    ...base,
                                    padding: '4px',
                                    borderRadius: '12px',
                                    backgroundColor: '#f9fafb',
                                    borderColor: state.isFocused ? '#4f46e5' : '#f3f4f6',
                                    boxShadow: state.isFocused ? '0 0 0 3px rgba(79,70,229,0.12)' : 'none',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    '&:hover': { borderColor: '#4f46e5' },
                                }),
                                menu: (base) => ({
                                    ...base,
                                    borderRadius: '12px',
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                                    zIndex: 50,
                                }),
                            }}
                        />
                    </div>
                )}

                {/* Notes Listing (Full Width) */}
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <FileText size={14} /> Recorded Notes ({detailData?.user_notes?.length || 0})
                    </label>

                    <div className="min-h-[140px] flex flex-col justify-center">
                        {detailLoading ? (
                            <div className="flex flex-col items-center justify-center p-10 bg-gray-50 rounded-xl border border-gray-100 gap-2">
                                <Loader2 size={28} className="animate-spin text-indigo-600" />
                                <span className="text-xs font-medium text-gray-500">Loading student notes...</span>
                            </div>
                        ) : error ? (
                            <div className="p-6 bg-rose-50/50 rounded-xl border border-rose-100 text-center">
                                <span className="text-xs font-semibold text-rose-600">Failed to load notes: {error}</span>
                            </div>
                        ) : detailData?.user_notes && detailData.user_notes.length > 0 ? (
                            <div className="flex flex-col gap-3">
                                {detailData.user_notes.map((note) => (
                                    <div
                                        key={note.id}
                                        className="p-4 bg-white rounded-xl border border-gray-200/80 shadow-2xs flex flex-col gap-2.5"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                                            <div className="flex items-center gap-2 text-indigo-700 font-semibold text-xs">
                                                <FileText size={14} />
                                                <span>{note.chapter_lecture?.name || 'Lecture Note'}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-[11px] text-gray-400 font-medium">
                                                <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                                                    <Clock size={11} /> At {formatDuration(note.duration)}
                                                </span>
                                                {note.created_at && (
                                                    <span className="inline-flex items-center gap-1">
                                                        <Calendar size={11} /> {moment(note.created_at).format('MMM DD, YYYY hh:mm A')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div
                                            className="text-xs text-gray-700 leading-relaxed prose prose-sm max-w-none pt-1"
                                            dangerouslySetInnerHTML={{ __html: note.note_content || '' }}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-center bg-gray-50 rounded-xl border border-gray-100 gap-2">
                                <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                                    <FileText size={18} />
                                </div>
                                <p className="text-xs font-semibold text-gray-600">No Notes Recorded</p>
                                <p className="text-[11px] text-gray-400 max-w-xs">
                                    No notes have been recorded by the student for this selected course.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentNotesView;
