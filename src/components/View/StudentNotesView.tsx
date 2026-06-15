import React, { useEffect, useState } from 'react';
import moment from 'moment';
import Select from 'react-select';
import {
    Calendar,
    Clock,
    UserCircle,
    Mail,
    FileText,
    Loader2
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
    const courseOptions = courses.map(course => ({
        value: course.id,
        label: `${course.name} (${course.notes_count || 0})`
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

    if (error && !detailData) {
        return (
            <div className="flex flex-col items-center justify-center p-12 h-64 bg-red-50/50">
                <span className="text-sm font-semibold text-red-600 bg-red-100 px-4 py-2 rounded-full border border-red-200">
                    Failed to load notes: {error}
                </span>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full max-h-[85vh] overflow-y-auto bg-gray-50/30 custom-scrollbar relative animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Gradient Banner */}
            <div className="relative w-full h-32 bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-800 shrink-0 overflow-hidden rounded-2xl">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>

                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl text-white shadow-sm border border-white/20">
                            <FileText size={22} className="text-white" />
                        </div>
                        <span className="text-white/90 text-xs font-bold uppercase tracking-widest">Student Notes Details</span>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="flex flex-col gap-6 px-6 py-8 -mt-6 relative z-10">
                {/* User & Course Info */}
                <div className="flex flex-col gap-4 bg-white p-6 rounded-2xl shadow-xl shadow-indigo-100/20 border border-gray-200">
                    <h1 className="text-xl font-black text-gray-900 leading-tight flex items-center gap-2">
                        <UserCircle className="text-indigo-600" size={24} />
                        {detailData?.username || '-'}
                    </h1>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-3 mt-1">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Mail size={14} className="text-indigo-500" />
                            <span className="font-semibold text-gray-800">{detailData?.user_id || '-'}</span>
                        </div>
                    </div>

                    {/* Course Selection Dropdown */}
                    {courses && courses.length > 0 && (
                        <div className="flex flex-col gap-2 mt-2">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select Course:</span>
                            <Select
                                options={courseOptions}
                                value={courseOptions.find(option => option.value === selectedCourseId)}
                                onChange={(option: any) => option && setSelectedCourseId(option.value)}
                                placeholder="Select course..."
                                classNamePrefix="react-select"
                                styles={{
                                    control: (base, state) => ({
                                        ...base,
                                        borderRadius: '12px',
                                        borderColor: state.isFocused ? '#4f46e5' : '#e5e7eb',
                                        boxShadow: state.isFocused ? '0 0 0 3px rgba(79,70,229,0.15)' : 'none',
                                        fontSize: '14px',
                                        '&:hover': { borderColor: '#4f46e5' },
                                    }),
                                    menu: (base) => ({
                                        ...base,
                                        borderRadius: '12px',
                                        border: '1px solid #e5e7eb',
                                        zIndex: 50,
                                    }),
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Notes Listing */}
                <div className="flex flex-col gap-3">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2">
                        Recorded Notes ({detailData?.user_notes?.length || 0})
                    </h2>

                    <div className="flex flex-col gap-4 min-h-[150px] justify-center relative">
                        {detailLoading ? (
                            <div className="flex flex-col items-center justify-center p-12 w-full">
                                <Loader2 size={32} className="animate-spin text-indigo-500 mb-2" />
                                <span className="text-sm font-medium text-gray-500">Loading student notes...</span>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center p-8 bg-red-50/50 rounded-2xl border border-red-100 text-center gap-3">
                                <span className="text-sm font-semibold text-red-600">Failed to load notes: {error}</span>
                            </div>
                        ) : detailData?.user_notes && detailData.user_notes.length > 0 ? (
                            detailData.user_notes.map((note) => (
                                <div key={note.id} className="flex flex-col gap-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
                                    <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3">
                                        <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm">
                                            <FileText size={16} />
                                            <span>{note.chapter_lecture?.name || 'Unknown Chapter/Lecture'}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} className="text-indigo-500" />
                                                At {formatDuration(note.duration)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12} className="text-blue-500" />
                                                {note.created_at ? moment(note.created_at).format('MMM DD, YYYY hh:mm A') : '-'}
                                            </span>
                                        </div>
                                    </div>

                                    <div
                                        className="text-gray-700 text-sm leading-relaxed prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{ __html: note.note_content || '' }}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-gray-200 text-center gap-3 shadow-sm w-full">
                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                                    <FileText size={24} className="text-gray-300" />
                                </div>
                                <span className="text-sm font-medium text-gray-400">No notes found for this course.</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentNotesView;
