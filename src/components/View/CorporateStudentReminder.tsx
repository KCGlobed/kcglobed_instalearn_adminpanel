import React, { useEffect, useState } from 'react';
import { BookOpen, Info, Bell, Download, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import {
    fetchStudentReminderListingApi,
    downloadStudentReminderReportPdfApi,
    downloadStudentReminderReportExcelApi
} from '../../services/apiServices';
import moment from 'moment';

interface CorporateStudentReminderProps {
    studentId: number;
    courses: any[];
}

export const formatReminderDateTime = (reminder: any): string | null => {
    if (!reminder) return null;

    // 1. Direct full datetime field (e.g., "2026-08-04T15:30:00Z" or "2026-08-04 15:30:00")
    const datetimeStr = reminder.reminder_datetime || reminder.datetime || reminder.scheduled_at;
    if (datetimeStr && moment(datetimeStr).isValid()) {
        return moment(datetimeStr).format('MMM DD, YYYY • hh:mm A');
    }

    const rawDate = reminder.reminder_date || reminder.date || reminder.reminder_day;
    const rawTime = reminder.reminder_time || reminder.time || reminder.schedule_time || reminder.start_time;

    // 2. Both date and time provided separately
    if (rawDate && rawTime) {
        const formattedDate = moment(rawDate).isValid() ? moment(rawDate).format('MMM DD, YYYY') : rawDate;
        const mTime = moment(rawTime, ['HH:mm:ss', 'HH:mm', 'hh:mm A', 'hh:mm:ss A', 'h:mm A', 'H:mm']);
        const formattedTime = mTime.isValid() ? mTime.format('hh:mm A') : rawTime;
        return `${formattedDate} • ${formattedTime}`;
    }

    // 3. Only time provided (e.g. daily/weekly recurring reminder)
    if (rawTime && !rawDate) {
        const mTime = moment(rawTime, ['HH:mm:ss', 'HH:mm', 'hh:mm A', 'hh:mm:ss A', 'h:mm A', 'H:mm']);
        return mTime.isValid() ? mTime.format('hh:mm A') : rawTime;
    }

    // 4. Only date provided
    if (rawDate) {
        // If string contains explicit time (ISO format with T or space)
        if (typeof rawDate === 'string' && (rawDate.includes('T') || (rawDate.includes(' ') && rawDate.length > 10))) {
            const m = moment(rawDate);
            if (m.isValid()) {
                if (m.hours() !== 0 || m.minutes() !== 0 || m.seconds() !== 0) {
                    return m.format('MMM DD, YYYY • hh:mm A');
                }
                return m.format('MMM DD, YYYY');
            }
        }
        return moment(rawDate).isValid() ? moment(rawDate).format('MMM DD, YYYY') : rawDate;
    }

    // 5. Fallback to created_at
    if (reminder.created_at && moment(reminder.created_at).isValid()) {
        return moment(reminder.created_at).format('MMM DD, YYYY • hh:mm A');
    }

    return null;
};

const CorporateStudentReminder: React.FC<CorporateStudentReminderProps> = ({ studentId, courses }) => {
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [reminders, setReminders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [downloadingPdf, setDownloadingPdf] = useState(false);
    const [downloadingExcel, setDownloadingExcel] = useState(false);

    useEffect(() => {
        if (courses && courses.length > 0 && !selectedCourseId) {
            setSelectedCourseId(courses[0]?.course_detail?.id?.toString() || courses[0]?.id?.toString());
        }
    }, [courses, selectedCourseId]);

    useEffect(() => {
        const loadReminders = async () => {
            if (!studentId || !selectedCourseId) return;
            try {
                setLoading(true);
                setError(null);
                const response = await fetchStudentReminderListingApi(studentId, selectedCourseId);
                if (response?.results) {
                    setReminders(response.results);
                } else if (response?.data) {
                    setReminders(Array.isArray(response.data) ? response.data : []);
                } else if (Array.isArray(response)) {
                    setReminders(response);
                } else {
                    setReminders([]);
                }
            } catch (err: any) {
                setError(err?.message || 'Failed to load reminders');
            } finally {
                setLoading(false);
            }
        };

        loadReminders();
    }, [studentId, selectedCourseId]);

    const handleDownload = async (type: 'pdf' | 'excel') => {
        if (!studentId || !selectedCourseId) {
            toast.error('Please select a course first');
            return;
        }

        const setDownloading = type === 'pdf' ? setDownloadingPdf : setDownloadingExcel;
        const toastId = toast.loading(`Generating ${type.toUpperCase()} report...`);
        try {
            setDownloading(true);
            const apiCall = type === 'pdf' ? downloadStudentReminderReportPdfApi : downloadStudentReminderReportExcelApi;
            const response: any = await apiCall(studentId, selectedCourseId);

            const extension = type === 'excel' ? 'csv' : 'pdf';
            const fileName = `student_reminders_report_${studentId}_course_${selectedCourseId}_${new Date().toISOString().split('T')[0]}.${extension}`;

            if (response?.data?.report_url) {
                const fileUrl = response.data.report_url;
                const link = document.createElement('a');
                link.href = fileUrl;
                link.target = '_blank';
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.dismiss(toastId);
                toast.success(`${type.toUpperCase()} report downloaded`);
                return;
            }

            if (response && typeof response.blob === 'function') {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                toast.dismiss(toastId);
                toast.success(`${type.toUpperCase()} report downloaded`);
                return;
            }

            if (response?.data && typeof response.data === 'string' && response.data.startsWith('http')) {
                const fileUrl = response.data;
                const link = document.createElement('a');
                link.href = fileUrl;
                link.target = '_blank';
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.dismiss(toastId);
                toast.success(`${type.toUpperCase()} report downloaded`);
                return;
            }

            toast.dismiss(toastId);
            toast.error(`Failed to download ${type.toUpperCase()}`);
        } catch (downloadErr: any) {
            console.error('Download error:', downloadErr);
            toast.dismiss(toastId);
            toast.error(downloadErr?.message || `Failed to download ${type.toUpperCase()}`);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 p-1 min-h-[600px] h-[75vh]">
            <div className="flex flex-col lg:flex-row gap-6 h-full">
                {/* Left side: Course Selection & Summary */}
                <div className="w-full lg:w-1/3 flex flex-col gap-6 overflow-y-auto pr-2 pb-4">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <BookOpen size={16} className="text-indigo-600" /> Select Course
                        </h3>
                        {courses && courses.length > 0 ? (
                            <select
                                value={selectedCourseId}
                                onChange={(e) => setSelectedCourseId(e.target.value)}
                                className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all bg-gray-50 hover:bg-white"
                            >
                                {courses.map((course: any, index: number) => (
                                    <option key={`course-${course?.course_detail?.id || course?.id}-${index}`} value={course?.course_detail?.id || course?.id}>
                                        {course?.course_detail?.name || 'Unknown Course'}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div className="p-3 bg-yellow-50 text-yellow-700 rounded-xl text-sm font-medium border border-yellow-100">
                                No courses enrolled.
                            </div>
                        )}
                    </div>

                    {reminders && reminders.length > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Reminders Summary</h3>
                            <div className="bg-blue-50 rounded-xl p-4">
                                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Total Reminders</p>
                                <h4 className="text-2xl font-bold text-blue-700 mt-1">
                                    {reminders.length}
                                </h4>
                            </div>
                        </div>
                    )}

                    {reminders && reminders.length > 0 && selectedCourseId && (
                        <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100 mt-auto">
                            <h3 className="font-bold mb-3 flex items-center gap-2">Quick Actions</h3>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => handleDownload('pdf')}
                                    disabled={downloadingPdf}
                                    className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white text-indigo-600 rounded-xl font-bold text-sm transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                                >
                                    <Download size={18} /> {downloadingPdf ? 'Downloading PDF...' : 'Download PDF'}
                                </button>
                                <button
                                    onClick={() => handleDownload('excel')}
                                    disabled={downloadingExcel}
                                    className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-indigo-500/50 text-white rounded-xl font-bold text-sm border border-indigo-400/30 transition-all hover:bg-indigo-500/80 disabled:opacity-50"
                                >
                                    <Download size={18} /> {downloadingExcel ? 'Downloading Excel...' : 'Download Excel'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right side: Student Reminders List */}
                <div className="w-full lg:w-2/3 bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden shadow-sm relative flex flex-col h-full">
                    <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <Bell size={18} className="text-indigo-600" /> Student Reminders
                        </h3>
                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {reminders.length} Reminders
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-3"></div>
                                <p className="text-gray-500 font-medium">Loading reminders...</p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center h-full text-center text-red-500 py-10">
                                <Info size={40} className="mb-3 opacity-30" />
                                <p className="font-bold text-sm">{error}</p>
                            </div>
                        ) : !selectedCourseId ? (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 py-10">
                                <BookOpen size={40} className="mb-3 opacity-30" />
                                <p className="font-bold text-sm">Select a course</p>
                            </div>
                        ) : reminders && reminders.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {reminders.map((reminder: any, index: number) => {
                                    const formattedDateTime = formatReminderDateTime(reminder);
                                    const title = reminder.title || reminder.name || reminder.reminder_title || `Reminder #${index + 1}`;
                                    const message = reminder.message || reminder.description || reminder.content || reminder.notes || reminder.reminder_text;
                                    const status = reminder.status ?? reminder.is_active;

                                    return (
                                        <div
                                            key={reminder.id || index}
                                            className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                                        >
                                            <div>
                                                <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-gray-100">
                                                    <div className="min-w-0 flex-1">
                                                        <h4 className="font-bold text-xs text-gray-900 truncate" title={title}>
                                                            {title}
                                                        </h4>
                                                        {reminder.chapter_info?.name && (
                                                            <p className="text-[10px] text-blue-600 font-semibold uppercase mt-0.5 truncate">
                                                                {reminder.chapter_info.name}
                                                            </p>
                                                        )}
                                                    </div>
                                                   
                                                </div>

                                                {message && (
                                                    <div className="text-xs text-gray-600 line-clamp-4 mb-3">
                                                        {typeof message === 'string' && message.includes('<') ? (
                                                            <div dangerouslySetInnerHTML={{ __html: message }} />
                                                        ) : (
                                                            <p>{message}</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-500">
                                                {formattedDateTime ? (
                                                    <div className="flex items-center gap-1 text-blue-600 font-medium">
                                                        <Clock size={12} />
                                                        <span>{formattedDateTime}</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1 text-gray-400">
                                                        <Clock size={12} />
                                                        <span>No schedule set</span>
                                                    </div>
                                                )}

                                                {status !== undefined && (
                                                    <span
                                                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                                            status === 1 || status === true || status === 'active' || status === 'completed'
                                                                ? 'bg-emerald-50 text-emerald-600'
                                                                : 'bg-gray-100 text-gray-600'
                                                        }`}
                                                    >
                                                        {typeof status === 'boolean'
                                                            ? status
                                                                ? 'Active'
                                                                : 'Inactive'
                                                            : typeof status === 'number'
                                                            ? status === 1
                                                                ? 'Active'
                                                                : 'Inactive'
                                                            : status}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 py-10">
                                <Bell size={40} className="mb-3 opacity-30 text-blue-500" />
                                <p className="font-bold text-sm">No reminders found for this course.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CorporateStudentReminder;
