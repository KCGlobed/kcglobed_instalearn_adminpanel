import { useEffect, useState } from 'react';
import { BookOpen, Info, Clock, PlayCircle, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { 
    fetchStudentCourseVideoReportApi,
    downloadUniversityStudentVideoReportPdfApi,
    downloadUniversityStudentVideoReportExcelApi
} from '../../services/apiServices';

const UniversityStudentVideoReport = ({ studentId, courses }: { studentId: number, courses: any[] }) => {
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (courses && courses.length > 0 && !selectedCourseId) {
            setSelectedCourseId(courses[0]?.course_detail?.id?.toString() || courses[0]?.id?.toString());
        }
    }, [courses, selectedCourseId]);

    useEffect(() => {
        const loadReport = async () => {
            if (!studentId || !selectedCourseId) return;
            try {
                setLoading(true);
                setError(null);
                const response = await fetchStudentCourseVideoReportApi(studentId, selectedCourseId);
                if (response?.data) {
                    setReportData(response.data);
                } else {
                    setReportData(null);
                }
            } catch (err: any) {
                setError(err.message || "Failed to load video report");
            } finally {
                setLoading(false);
            }
        };
        loadReport();
    }, [studentId, selectedCourseId]);

    const formatDuration = (seconds: number) => {
        if (!seconds) return "0 sec";
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (seconds >= 3600) {
            return `${hours} hr ${mins} min ${secs} sec`;
        }
        if (mins === 0) return `${secs} sec`;
        return `${mins} min ${secs} sec`;
    };

    const handleDownload = async (type: 'pdf' | 'excel') => {
        if (!studentId || !selectedCourseId) {
            toast.error("Please select a course first");
            return;
        }

        try {
            const apiCall = type === 'pdf' ? downloadUniversityStudentVideoReportPdfApi : downloadUniversityStudentVideoReportExcelApi;
            const response: any = await apiCall(studentId, selectedCourseId);

            const extension = type === 'excel' ? 'csv' : 'pdf';
            const fileName = `student_video_report_${studentId}_${new Date().toISOString().split('T')[0]}.${extension}`;

            if (response?.data?.report_url) {
                const fileUrl = response.data.report_url;
                const link = document.createElement('a');
                link.href = fileUrl;
                link.target = '_blank';
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
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
                toast.success(`${type.toUpperCase()} report downloaded`);
                return;
            }

            toast.error(`Failed to download ${type.toUpperCase()}`);
        } catch (error) {
            console.error("Download error:", error);
            toast.error(`Failed to download ${type.toUpperCase()}`);
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

                    {reportData && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Report Summary</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-indigo-50 rounded-xl p-4">
                                    <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">Total Videos</p>
                                    <h4 className="text-2xl font-bold text-indigo-700 mt-1">
                                        {reportData?.total_video_watched || 0}
                                    </h4>
                                </div>
                                <div className="bg-green-50 rounded-xl p-4">
                                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Duration</p>
                                    <h4 className="text-xl font-bold text-green-700 mt-1">
                                        {formatDuration(reportData?.total_duration_video_watched || 0)}
                                    </h4>
                                </div>
                            </div>
                        </div>
                    )}

                    {reportData && (
                        <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100 mt-auto">
                            <h3 className="font-bold mb-3 flex items-center gap-2">Quick Actions</h3>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => handleDownload('pdf')}
                                    className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white text-indigo-600 rounded-xl font-bold text-sm transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    <Download size={18} /> Download PDF
                                </button>
                                <button
                                    onClick={() => handleDownload('excel')}
                                    className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-indigo-500/50 text-white rounded-xl font-bold text-sm border border-indigo-400/30 transition-all hover:bg-indigo-500/80"
                                >
                                    <Download size={18} /> Download Excel
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right side: Chapters Progress */}
                <div className="w-full lg:w-2/3 bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden shadow-sm relative flex flex-col h-full">
                    <div className="p-4 bg-white border-b border-gray-100">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <PlayCircle size={18} className="text-indigo-600" /> Chapter Progress
                        </h3>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-3"></div>
                                <p className="text-gray-500 font-medium">Loading report...</p>
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
                        ) : reportData?.report_data && reportData.report_data.length > 0 ? (
                            <div className="flex flex-col gap-4">
                                {reportData.report_data.map((item: any, index: number) => (
                                    <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 shadow-[0_2px_10px_rgba(15,23,42,0.02)]">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                                            <h4 className="font-bold text-gray-800 text-sm">
                                                {item.chapter_info?.name || "Unknown Chapter"}
                                            </h4>
                                            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold border border-indigo-100 shrink-0">
                                                {item.progress}% Completed
                                            </span>
                                        </div>

                                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                                            <div
                                                className="h-full bg-indigo-600 rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${item.progress || 0}%` }}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 rounded-lg p-3 border border-gray-100">
                                            <div className="flex flex-col">
                                                <span className="text-gray-500 text-[10px] font-semibold uppercase mb-0.5">Videos Watched</span>
                                                <span className="font-bold text-gray-800 text-xs">
                                                    {item.total_video_watched} <span className="text-gray-400 font-medium">/ {item.chapter_info?.no_of_videos || 0}</span>
                                                </span>
                                            </div>
                                            <div className="flex flex-col border-l border-gray-200 pl-3">
                                                <span className="text-gray-500 text-[10px] font-semibold uppercase mb-0.5 flex items-center gap-1"><Clock size={10}/> Duration</span>
                                                <span className="font-bold text-gray-800 text-xs">
                                                    {formatDuration(item.video_watched)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 py-10">
                                <Info size={40} className="mb-3 opacity-30" />
                                <p className="font-bold text-sm">No progress recorded yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UniversityStudentVideoReport;

