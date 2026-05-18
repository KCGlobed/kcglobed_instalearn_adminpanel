import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getStudentDetail, getStudentReports } from "../../store/slices/studentSlice";
import { downloadVideoWatchReportPdfApi, downloadVideoWatchReportExcelApi } from "../../services/apiServices";
import { FileText, Info, Download, BookOpen } from "lucide-react";
import toast from "react-hot-toast";
import { useAppDispatch } from "../../hooks/useAppDispatch";

interface StudentReportViewProps {
    studentId: number;
}

const StudentReportView = ({ studentId }: StudentReportViewProps) => {
    const dispatch = useAppDispatch();
    const { 
        selectedStudent: studentData, 
        selectedStudentLoading: loading,
        selectedStudentReports: studentReports,
        selectedStudentReportsLoading: loadingReports
    } = useSelector((state:any) => state.students);

    const [selectedCourseId, setSelectedCourseId] = useState<string>("");
    const courses = studentData?.courses || [];

    useEffect(() => {
        if (studentId) {
            dispatch(getStudentDetail(studentId));
        }
    }, [dispatch, studentId]);

    useEffect(() => {
        if (courses.length > 0 && !selectedCourseId) {
            setSelectedCourseId(courses[0]?.course_detail?.id?.toString());
        }
    }, [courses, selectedCourseId]);

    useEffect(() => {
        if (studentId && selectedCourseId) {
            dispatch(getStudentReports({ id: studentId, courseId: selectedCourseId }));
        }
    }, [dispatch, studentId, selectedCourseId]);

    const formatDuration = (seconds: number) => {
        if (!seconds) return "0 sec";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (mins === 0) return `${secs} sec`;
        return `${mins} min ${secs} sec`;
    };

    const handleDownload = async (type: 'pdf' | 'excel') => {
        if (!studentId || !selectedCourseId) {
            toast.error("Please select a course first");
            return;
        }

        try {
            const apiCall = type === 'pdf' ? downloadVideoWatchReportPdfApi : downloadVideoWatchReportExcelApi;
            const response: any = await apiCall(studentId, selectedCourseId);

            const extension = type === 'excel' ? 'csv' : 'pdf';
            const fileName = `student_report_${studentId}_${new Date().toISOString().split('T')[0]}.${extension}`;

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

            const errMsg = response?.message || response?.detail || "Invalid format returned from Server";
            throw new Error(errMsg);

        } catch (error: any) {
            console.error(`Failed to download ${type} report`, error);
            toast.error(error?.message || `Failed to download ${type} report`);
        }
    };

    if (loading && !studentData) {
        return (
            <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-500 font-medium animate-pulse">Loading student details...</p>
            </div>
        );
    }

    if (!studentData) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center text-red-500 min-h-[300px]">
                <Info size={48} className="mb-4 opacity-20" />
                <p className="font-bold text-lg">Student data not found</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6 p-1 max-h-[75vh] overflow-hidden">
            <div className="w-full lg:w-1/3 flex flex-col gap-6 overflow-y-auto pr-2 pb-4">

                {/* Course Selector Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <BookOpen size={16} className="text-indigo-600" /> Select Course
                    </h3>
                    {courses.length > 0 ? (
                        <select
                            value={selectedCourseId}
                            onChange={(e) => setSelectedCourseId(e.target.value)}
                            className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all bg-gray-50 hover:bg-white"
                        >
                            {courses.map((course: any, index: number) => (
                                <option key={`course-${course?.id || course?.course_detail?.id}-${index}`} value={course?.course_detail?.id}>
                                    {course?.course_detail?.name}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <div className="p-3 bg-yellow-50 text-yellow-700 rounded-xl text-sm font-medium border border-yellow-100">
                            No courses enrolled.
                        </div>
                    )}
                </div>

                {/* Student Info Card */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white rounded-xl text-indigo-600 shadow-sm border border-indigo-50">
                            <FileText size={24} />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 leading-tight">
                                {studentData?.first_name} {studentData?.last_name}
                            </h2>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">
                                ID: #{studentData?.id}
                            </p>
                        </div>
                    </div>

                    {studentData?.date_joined && (
                        <div className="grid grid-cols-1 gap-4 pt-4 border-t border-gray-200/60">
                            <div className="flex items-start gap-3">
                                <div className="text-gray-400 mt-0.5"><Info size={16} /></div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Joined On</p>
                                    <p className="text-sm font-semibold text-gray-700">
                                        {new Date(studentData.date_joined).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Summary Card */}
                {selectedCourseId && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Report Summary</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-indigo-50 rounded-xl p-4">
                                <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">Total Videos</p>
                                <h4 className="text-2xl font-bold text-indigo-700 mt-1">
                                    {studentReports?.total_video_watched || 0}
                                </h4>
                            </div>
                            <div className="bg-green-50 rounded-xl p-4">
                                <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Duration</p>
                                <h4 className="text-xl font-bold text-green-700 mt-1">
                                    {formatDuration(
                                        studentReports?.total_duration_video_watched || 0
                                    )}
                                </h4>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Actions Card */}
                {selectedCourseId && (
                    <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100">
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

            {/* Right Section: Progress Viewer */}
            <div className="w-full lg:w-2/3 bg-gray-900 rounded-2xl overflow-hidden shadow-2xl relative border-4 border-white min-h-[500px] flex flex-col">
                {/* macOS-style Header */}
                <div className="p-3 bg-gray-800 flex items-center justify-between border-b border-gray-700/50">
                    <div className="flex items-center gap-2 text-gray-300">
                        <FileText size={16} />
                        <span className="text-xs font-bold truncate">Chapter Progress</span>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-gray-50 relative overflow-y-auto p-6">
                    {loadingReports ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
                            <p className="text-gray-500 font-medium">Loading report data...</p>
                        </div>
                    ) : !selectedCourseId ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                            <BookOpen size={48} className="mb-4 opacity-30" />
                            <p className="font-bold text-lg text-gray-500">Select a course to view progress</p>
                        </div>
                    ) : studentReports?.report_data && studentReports.report_data.length > 0 ? (
                        <div className="flex flex-col gap-4 max-w-3xl mx-auto">
                            {studentReports.report_data.map((item: any, index: number) => (
                                <div key={`report-${item.id || item.chapter_info?.id}-${index}`} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 gap-2">
                                        <h4 className="font-bold text-gray-800 text-lg">
                                            {item.chapter_info?.name || "Unknown Chapter"}
                                        </h4>
                                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-100">
                                            {item.progress}% Completed
                                        </span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-4 border border-gray-200/50">
                                        <div
                                            className="h-full bg-indigo-600 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${item.progress}%` }}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 rounded-lg p-3 border border-gray-100">
                                        <div className="flex flex-col">
                                            <span className="text-gray-500 text-xs font-semibold uppercase mb-0.5">Videos Watched</span>
                                            <span className="font-bold text-gray-800">
                                                {item.total_video_watched} <span className="text-gray-400 font-medium">/ {item.chapter_info?.no_of_videos || 0}</span>
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-gray-500 text-xs font-semibold uppercase mb-0.5">Duration</span>
                                            <span className="font-bold text-gray-800">
                                                {formatDuration(item.video_watched)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                            <Info size={48} className="mb-4 opacity-30" />
                            <p className="font-bold text-lg text-gray-500">No chapter progress recorded yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentReportView;
