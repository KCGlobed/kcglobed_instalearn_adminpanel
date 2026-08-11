import React, { useEffect, useState } from 'react';
import { BookOpen, Info, HelpCircle, CheckCircle, XCircle, Download, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import {
    fetchStudentAttemptedQuizApi,
    downloadStudentQuizReportPdfApi,
    downloadStudentQuizReportExcelApi
} from '../../services/apiServices';
import moment from 'moment';

interface CorporateStudentQuizReportProps {
    studentId: number;
    courses: any[];
}

const CorporateStudentQuizReport: React.FC<CorporateStudentQuizReportProps> = ({ studentId, courses }) => {
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);
    const [downloadingExcel, setDownloadingExcel] = useState<boolean>(false);

    useEffect(() => {
        if (courses && courses.length > 0 && !selectedCourseId) {
            setSelectedCourseId(courses[0]?.course_detail?.id?.toString() || courses[0]?.id?.toString());
        }
    }, [courses, selectedCourseId]);

    useEffect(() => {
        const loadQuizzes = async () => {
            if (!studentId || !selectedCourseId) return;
            try {
                setLoading(true);
                setError(null);
                const response = await fetchStudentAttemptedQuizApi(studentId, selectedCourseId);
                if (response?.results) {
                    setQuizzes(response.results);
                } else if (response?.data) {
                    setQuizzes(Array.isArray(response.data) ? response.data : []);
                } else if (Array.isArray(response)) {
                    setQuizzes(response);
                } else {
                    setQuizzes([]);
                }
            } catch (err: any) {
                setError(err.message || 'Failed to load attempted quizzes');
            } finally {
                setLoading(false);
            }
        };
        loadQuizzes();
    }, [studentId, selectedCourseId]);

    const handleDownload = async (type: 'pdf' | 'excel') => {
        if (!studentId || !selectedCourseId) {
            toast.error('Please select a course first');
            return;
        }

        const setDownloading = type === 'pdf' ? setDownloadingPdf : setDownloadingExcel;
        const toastId = toast.loading(`Generating ${type.toUpperCase()} quiz report...`);
        try {
            setDownloading(true);
            const apiCall = type === 'pdf' ? downloadStudentQuizReportPdfApi : downloadStudentQuizReportExcelApi;
            const response: any = await apiCall(studentId, selectedCourseId);

            const extension = type === 'excel' ? 'csv' : 'pdf';
            const fileName = `student_quiz_report_${studentId}_course_${selectedCourseId}_${new Date().toISOString().split('T')[0]}.${extension}`;

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
            toast.error(`Failed to download ${type.toUpperCase()} report`);
        } catch (error: any) {
            console.error('Quiz download error:', error);
            toast.dismiss(toastId);
            toast.error(error?.message || `Failed to download ${type.toUpperCase()} report`);
        } finally {
            setDownloading(false);
        }
    };

    const passedCount = quizzes.filter(
        (a: any) => a.result === 'Pass' || a.is_passed || a.status === 'passed'
    ).length;
    const failedCount = quizzes.length - passedCount;

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
                                    <option
                                        key={`course-${course?.course_detail?.id || course?.id}-${index}`}
                                        value={course?.course_detail?.id || course?.id}
                                    >
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

                    {quizzes && quizzes.length > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Quiz Summary</h3>
                            <div className="space-y-3">
                                <div className="bg-purple-50 rounded-xl p-4">
                                    <p className="text-[10px] text-purple-600 font-bold uppercase tracking-widest">
                                        Total Attempted Quizzes
                                    </p>
                                    <h4 className="text-2xl font-bold text-purple-700 mt-1">
                                        {quizzes.length}
                                    </h4>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                                            Passed
                                        </p>
                                        <h5 className="text-lg font-black text-emerald-700 mt-0.5">
                                            {passedCount}
                                        </h5>
                                    </div>
                                    <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                                        <p className="text-[10px] text-red-600 font-bold uppercase tracking-wider">
                                            Failed
                                        </p>
                                        <h5 className="text-lg font-black text-red-700 mt-0.5">
                                            {failedCount}
                                        </h5>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {quizzes && quizzes.length > 0 && selectedCourseId && (
                        <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100 mt-auto">
                            <h3 className="font-bold mb-3 flex items-center gap-2">Quick Actions</h3>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => handleDownload('pdf')}
                                    disabled={downloadingPdf}
                                    className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white text-indigo-600 rounded-xl font-bold text-sm transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                                >
                                    <FileText size={18} /> {downloadingPdf ? 'Downloading...' : 'Download PDF'}
                                </button>
                                <button
                                    onClick={() => handleDownload('excel')}
                                    disabled={downloadingExcel}
                                    className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-indigo-500/50 text-white rounded-xl font-bold text-sm border border-indigo-400/30 transition-all hover:bg-indigo-500/80 disabled:opacity-50"
                                >
                                    <Download size={18} /> {downloadingExcel ? 'Downloading...' : 'Download Excel'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right side: Attempted Quizzes List */}
                <div className="w-full lg:w-2/3 bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden shadow-sm relative flex flex-col h-full">
                    <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <HelpCircle size={18} className="text-purple-600" /> Attempted Quizzes
                            </h3>
                            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                {quizzes.length} Quizzes
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-3"></div>
                                <p className="text-gray-500 font-medium">Loading quizzes...</p>
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
                        ) : quizzes && quizzes.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {quizzes.map((attempt: any, index: number) => {
                                    const passed =
                                        attempt.result === 'Pass' ||
                                        attempt.is_passed ||
                                        attempt.status === 'passed';
                                    const quizDetails = attempt.quiz || attempt.quiz_info || {};
                                    const chapterName =
                                        quizDetails.chapter?.name || attempt.chapter_info?.name;

                                    let timeTakenStr = '-';
                                    if (attempt.total_time_taken) {
                                        const secs =
                                            attempt.total_time_taken > 1000
                                                ? Math.floor(attempt.total_time_taken / 1000)
                                                : attempt.total_time_taken;
                                        const m = Math.floor(secs / 60);
                                        const s = secs % 60;
                                        timeTakenStr = m > 0 ? `${m}m ${s}s` : `${s}s`;
                                    } else if (attempt.start_time && attempt.end_time) {
                                        const start = moment(attempt.start_time);
                                        const end = moment(attempt.end_time);
                                        const duration = moment.duration(end.diff(start));
                                        timeTakenStr = `${duration.minutes()}m ${duration.seconds()}s`;
                                    }

                                    return (
                                        <div
                                            key={attempt.id || index}
                                            className="bg-white border border-gray-200 rounded-xl p-5 shadow-[0_2px_10px_rgba(15,23,42,0.02)] hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                                        >
                                            <div className="flex-1 space-y-3">
                                                <div>
                                                    <h4 className="font-bold text-gray-900 text-base mb-1">
                                                        {quizDetails.name || attempt.name || 'Unknown Quiz'}
                                                    </h4>
                                                    {quizDetails.description && (
                                                        <p className="text-xs text-gray-500 mb-2">
                                                            {quizDetails.description}
                                                        </p>
                                                    )}
                                                    {chapterName && (
                                                        <p className="text-[10px] text-purple-600 font-semibold uppercase mb-2">
                                                            Chapter: {chapterName}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2">
                                                    {attempt.start_time && (
                                                        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                            Attempted:{' '}
                                                            {moment(attempt.start_time).format(
                                                                'MMM DD, YYYY · hh:mm A'
                                                            )}
                                                        </span>
                                                    )}
                                                    {timeTakenStr !== '-' && (
                                                        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                            Time: {timeTakenStr}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-3 gap-2 mt-2 max-w-sm">
                                                    <div className="bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
                                                        <p className="text-[9px] text-gray-400 font-bold uppercase">
                                                            Questions
                                                        </p>
                                                        <p className="text-sm font-black text-gray-700">
                                                            {attempt.total_question ||
                                                                quizDetails.total_question ||
                                                                '-'}
                                                        </p>
                                                    </div>
                                                    <div className="bg-emerald-50 rounded-lg p-2 text-center border border-emerald-100">
                                                        <p className="text-[9px] text-emerald-500 font-bold uppercase">
                                                            Right
                                                        </p>
                                                        <p className="text-sm font-black text-emerald-700">
                                                            {attempt.total_right_answer_given ?? '-'}
                                                        </p>
                                                    </div>
                                                    <div className="bg-red-50 rounded-lg p-2 text-center border border-red-100">
                                                        <p className="text-[9px] text-red-400 font-bold uppercase">
                                                            Wrong
                                                        </p>
                                                        <p className="text-sm font-black text-red-600">
                                                            {attempt.total_wrong_answer_given ?? '-'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 shrink-0 h-full">
                                                <div className="flex flex-col md:items-end">
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                                                        Score
                                                    </span>
                                                    <span className="text-2xl font-black text-gray-900 leading-none">
                                                        {attempt.score ?? 0}
                                                        {quizDetails.pass_percentage && (
                                                            <span className="text-xs text-gray-400 font-bold ml-1">
                                                                (Pass: {quizDetails.pass_percentage}%)
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                                <div
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold w-full justify-center md:w-auto ${
                                                        passed
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                            : 'bg-red-50 text-red-700 border border-red-200'
                                                    }`}
                                                >
                                                    {passed ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                                    {passed ? 'Passed' : 'Failed'}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 py-10">
                                <HelpCircle size={40} className="mb-3 opacity-30" />
                                <p className="font-bold text-sm">
                                    No attempted quizzes found for this course.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CorporateStudentQuizReport;
