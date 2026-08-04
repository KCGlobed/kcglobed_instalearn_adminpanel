import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useRedux';
import { getStudentDetail } from '../../store/slices/studentSlice';
import {
    Mail, Phone, MapPin, Calendar, BookOpen,
    ArrowLeft, Smartphone, Check,
    Monitor, Award, CheckSquare, Bell, Clock, XCircle,
    Download, FileText, PlayCircle, Eye, Info, HelpCircle, CheckCircle
} from 'lucide-react';
import moment from 'moment';
import toast from 'react-hot-toast';
import {
    fetchStudentVideoReportsApi,
    downloadVideoWatchReportPdfApi,
    downloadVideoWatchReportExcelApi,
    downloadStudentLoginActivityPdfApi,
    downloadStudentLoginActivityExcelApi,
    fetchCorporateStudentNotesApi,
    downloadCorporateStudentNotesReportPdfApi,
    downloadCorporateStudentNotesReportExcelApi,
    fetchStudentAttemptedQuizApi
} from '../../services/apiServices';

const CARD = 'bg-white rounded-2xl border border-gray-200 shadow-sm';

const SkeletonLoader = () => (
    <div className="max-w-[1400px] mx-auto p-4 sm:p-6 space-y-6 animate-pulse bg-[#F8FAFC] min-h-screen">
        <div className="h-5 w-28 bg-gray-200 rounded-md"></div>
        {/* Hero Card Skeleton */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 flex flex-col md:flex-row gap-5 items-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full shrink-0"></div>
            <div className="flex-1 space-y-2.5 text-center md:text-left">
                <div className="h-6 w-1/4 bg-gray-200 rounded-md"></div>
                <div className="h-3 w-1/3 bg-gray-200 rounded-md"></div>
                <div className="flex gap-2 justify-center md:justify-start">
                    <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
                    <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
                </div>
            </div>
        </div>
        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 h-24"></div>
            ))}
        </div>
        {/* Two Column Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-gray-200 h-96"></div>
            <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-200 h-96"></div>
        </div>
    </div>
);

const StudentProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { selectedStudent, selectedStudentLoading, selectedStudentError } = useAppSelector((state) => state.students);

    const [imgError, setImgError] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [activeReportTab, setActiveReportTab] = useState<'video' | 'notes' | 'quizzes'>('video');

    const [reportData, setReportData] = useState<any>(null);
    const [loadingReport, setLoadingReport] = useState<boolean>(false);
    const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);
    const [downloadingExcel, setDownloadingExcel] = useState<boolean>(false);
    const [downloadingLoginPdf, setDownloadingLoginPdf] = useState<boolean>(false);
    const [downloadingLoginExcel, setDownloadingLoginExcel] = useState<boolean>(false);

    const [notes, setNotes] = useState<any[]>([]);
    const [loadingNotes, setLoadingNotes] = useState<boolean>(false);
    const [downloadingNotesPdf, setDownloadingNotesPdf] = useState<boolean>(false);
    const [downloadingNotesExcel, setDownloadingNotesExcel] = useState<boolean>(false);

    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [loadingQuizzes, setLoadingQuizzes] = useState<boolean>(false);

    useEffect(() => {
        if (id) {
            dispatch(getStudentDetail(id));
            setImgError(false);
        }
    }, [dispatch, id]);

    const courses = selectedStudent?.courses || [];

    // Auto-select first course when courses are loaded
    useEffect(() => {
        if (courses && courses.length > 0) {
            const firstId = courses[0]?.course_detail?.id?.toString() || courses[0]?.id?.toString();
            if (!selectedCourseId || !courses.some((c: any) => (c?.course_detail?.id?.toString() || c?.id?.toString()) === selectedCourseId)) {
                setSelectedCourseId(firstId);
            }
        } else {
            setSelectedCourseId('');
            setReportData(null);
            setNotes([]);
            setQuizzes([]);
        }
    }, [courses]);

    // Fetch video report whenever selected course or student ID changes
    useEffect(() => {
        const loadVideoReport = async () => {
            if (!id || !selectedCourseId) {
                setReportData(null);
                return;
            }
            try {
                setLoadingReport(true);
                const res: any = await fetchStudentVideoReportsApi(id, selectedCourseId);
                const data = res?.data?.data || res?.data || (res?.status ? res : null);
                setReportData(data);
            } catch (err) {
                console.error("Failed to load video report", err);
                setReportData(null);
            } finally {
                setLoadingReport(false);
            }
        };

        loadVideoReport();
    }, [id, selectedCourseId]);

    // Fetch student notes whenever selected course or student ID changes
    useEffect(() => {
        const loadNotes = async () => {
            if (!id || !selectedCourseId) {
                setNotes([]);
                return;
            }
            try {
                setLoadingNotes(true);
                const response = await fetchCorporateStudentNotesApi(id, selectedCourseId);
                if (response?.results) {
                    setNotes(response.results);
                } else if (response?.data) {
                    setNotes(Array.isArray(response.data) ? response.data : []);
                } else {
                    setNotes([]);
                }
            } catch (err) {
                console.error("Failed to load notes", err);
                setNotes([]);
            } finally {
                setLoadingNotes(false);
            }
        };

        loadNotes();
    }, [id, selectedCourseId]);

    // Fetch attempted quizzes whenever selected course or student ID changes
    useEffect(() => {
        const loadQuizzes = async () => {
            if (!id || !selectedCourseId) {
                setQuizzes([]);
                return;
            }
            try {
                setLoadingQuizzes(true);
                const response = await fetchStudentAttemptedQuizApi(id, selectedCourseId);
                if (response?.results) {
                    setQuizzes(response.results);
                } else if (response?.data) {
                    setQuizzes(Array.isArray(response.data) ? response.data : []);
                } else if (Array.isArray(response)) {
                    setQuizzes(response);
                } else {
                    setQuizzes([]);
                }
            } catch (err) {
                console.error("Failed to load attempted quizzes", err);
                setQuizzes([]);
            } finally {
                setLoadingQuizzes(false);
            }
        };

        loadQuizzes();
    }, [id, selectedCourseId]);

    const formatDuration = (seconds: number) => {
        if (!seconds) return "0 sec";
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours} hr ${mins} min ${secs} sec`;
        }
        if (mins === 0) return `${secs} sec`;
        return `${mins} min ${secs} sec`;
    };

    const handleDownloadFile = async (
        apiCall: () => Promise<any>,
        type: 'pdf' | 'excel' | 'csv',
        fileNamePrefix: string,
        setLoadingState?: (loading: boolean) => void
    ) => {
        if (setLoadingState) setLoadingState(true);
        const toastId = toast.loading(`Preparing ${type.toUpperCase()} report download...`);
        try {
            const response: any = await apiCall();
            const extension = type === 'excel' ? 'csv' : type;
            const fileName = `${fileNamePrefix}_${new Date().toISOString().split('T')[0]}.${extension}`;

            if (response?.data?.report_url) {
                const fileUrl = response.data.report_url;
                const link = document.createElement('a');
                link.href = fileUrl;
                link.target = '_blank';
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success(`${type.toUpperCase()} report downloaded`, { id: toastId });
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
                toast.success(`${type.toUpperCase()} report downloaded`, { id: toastId });
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
                toast.success(`${type.toUpperCase()} report downloaded`, { id: toastId });
                return;
            }

            toast.dismiss(toastId);
            toast.error(`Could not generate ${type.toUpperCase()} report`);
        } catch (error: any) {
            console.error(`Failed to download ${type}`, error);
            toast.error(error?.message || `Failed to download ${type.toUpperCase()} report`, { id: toastId });
        } finally {
            if (setLoadingState) setLoadingState(false);
        }
    };

    if (selectedStudentLoading) return <SkeletonLoader />;

    if (selectedStudentError || !selectedStudent) {
        return (
            <div className="flex flex-col items-center justify-center p-14 min-h-[420px] text-center bg-white rounded-2xl border border-gray-200 mx-4 shadow-sm mt-6">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-5 border border-gray-100">
                    <Info className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Profile Not Found</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto mb-6">
                    {selectedStudentError || "We couldn't retrieve the student information. The profile might have been removed."}
                </p>
                <button
                    onClick={() => navigate('/dashboard/students')}
                    className="px-5 py-2.5 bg-[#4318FF] text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-all shadow-sm"
                >
                    Back to Students
                </button>
            </div>
        );
    }

    const { user_devices } = selectedStudent;
    const announcements = (selectedStudent as any).announcements || [];

    const totalCourses = courses?.length || 0;
    const completedCourses = courses?.filter((c: any) => c.progress === 100)?.length || 0;
    const totalDevices = user_devices?.length || 0;
    const certificates = completedCourses;

    const selectedCourse = courses?.find((c: any) => (c?.course_detail?.id?.toString() || c?.id?.toString()) === selectedCourseId);

    return (
        <div className="bg-[#F8FAFC] min-h-screen pb-12 font-sans text-slate-800">
            <div className="max-w-[1400px] mx-auto p-4 sm:p-6 space-y-6">

                {/* Back to Students Navigation */}
                <button
                    onClick={() => navigate('/dashboard/students')}
                    className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors group"
                >
                    <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
                    <span>Back to Students</span>
                </button>

                {/* Student Profile Hero Header Card */}
                <div className={`${CARD} p-6 sm:p-7`}>
                    <div className="flex flex-col md:flex-row gap-5 items-center md:items-center">
                        <div className="relative shrink-0">
                            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden flex items-center justify-center text-white font-black text-2xl uppercase bg-[#2400FF] shadow-sm">
                                {selectedStudent.image && !imgError ? (
                                    <img
                                        src={selectedStudent.image}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                        onError={() => setImgError(true)}
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    selectedStudent.first_name?.charAt(0) || 'U'
                                )}
                            </div>
                            <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${(selectedStudent.is_active ?? selectedStudent.status) !== false ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-2.5">
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                                    {selectedStudent.first_name} {selectedStudent.last_name}
                                </h1>
                                <div className="text-xs text-gray-500 font-medium mt-1 flex items-center justify-center md:justify-start gap-4 flex-wrap">
                                    <span className="flex items-center gap-1.5">
                                        <Mail size={13} className="text-gray-400" />
                                        {selectedStudent.email}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <MapPin size={13} className="text-gray-400" />
                                        {selectedStudent.city || 'Unknown'}, {selectedStudent.country || 'Unknown'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-0.5">
                                <span className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-3 py-0.5 rounded-full">
                                    # ID {selectedStudent.id}
                                </span>
                                {(selectedStudent.is_active ?? selectedStudent.status) !== false ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-full">
                                        <Check size={12} className="stroke-[2.5]" /> Active
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-0.5 rounded-full">
                                        <XCircle size={12} /> Inactive
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5 KPI Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {/* Card 1: Enrolled Courses */}
                    <div className={`${CARD} p-5`}>
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center mb-3">
                            <BookOpen size={16} />
                        </div>
                        <p className="text-2xl font-black text-gray-900 leading-none">{totalCourses}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-2">Enrolled Courses</p>
                    </div>

                    {/* Card 2: Completed */}
                    <div className={`${CARD} p-5`}>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center mb-3">
                            <CheckSquare size={16} />
                        </div>
                        <p className="text-2xl font-black text-gray-900 leading-none">{completedCourses}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-2">Completed</p>
                    </div>

                    {/* Card 3: Course Notes */}
                    <div className={`${CARD} p-5`}>
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center mb-3">
                            <FileText size={16} />
                        </div>
                        <p className="text-2xl font-black text-gray-900 leading-none">{notes?.length || 0}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-2">Course Notes</p>
                    </div>

                    {/* Card 4: Devices */}
                    <div className={`${CARD} p-5`}>
                        <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center mb-3">
                            <Monitor size={16} />
                        </div>
                        <p className="text-2xl font-black text-gray-900 leading-none">{totalDevices}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-2">Devices</p>
                    </div>

                    {/* Card 5: Certificates */}
                    <div className={`${CARD} p-5`}>
                        <div className="w-8 h-8 rounded-lg bg-yellow-50 text-yellow-500 flex items-center justify-center mb-3">
                            <Award size={16} />
                        </div>
                        <p className="text-2xl font-black text-gray-900 leading-none">{certificates}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-2">Certificates</p>
                    </div>
                </div>

                {/* 2-Column Section: Enrolled Courses on Left & Tabbed Reports (Video, Notes, Quizzes) on Right */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Left Column: Enrolled Courses List (4 cols) */}
                    <div className="lg:col-span-4 xl:col-span-4">
                        <div className={`${CARD} p-5 sm:p-6 flex flex-col h-full`}>
                            <div className="flex items-start justify-between gap-2 mb-4">
                                <div>
                                    <h2 className="text-base font-bold text-gray-900">Enrolled Courses</h2>
                                    <p className="text-xs text-gray-400 mt-0.5">Click a course to view details</p>
                                </div>
                                <span className="text-xs font-semibold px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                    {courses?.length || 0} Courses
                                </span>
                            </div>

                            {courses && courses.length > 0 ? (
                                <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
                                    {courses.map((course: any) => {
                                        const courseIdStr = course.course_detail?.id?.toString() || course.id?.toString();
                                        const isSelected = selectedCourseId === courseIdStr;
                                        return (
                                            <div
                                                key={course.id}
                                                onClick={() => setSelectedCourseId(courseIdStr)}
                                                className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all cursor-pointer ${isSelected
                                                    ? 'border-2 border-[#4318FF] bg-indigo-50/30'
                                                    : 'border-gray-200 bg-white hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#4318FF] text-white' : 'bg-blue-50 text-blue-500'
                                                        }`}>
                                                        <BookOpen size={16} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-[#4318FF]' : 'text-blue-500'
                                                            }`}>
                                                            {course.course_detail?.category?.name || 'GENERAL'}
                                                        </p>
                                                        <h3 className={`text-xs font-bold truncate mt-0.5 ${isSelected ? 'text-gray-900' : 'text-gray-800'}`}>
                                                            {course.course_detail?.name}
                                                        </h3>
                                                    </div>
                                                </div>

                                                <div className="shrink-0">
                                                    {isSelected ? (
                                                        <div className="w-8 h-8 rounded-lg bg-[#4318FF] text-white flex items-center justify-center">
                                                            <Eye size={15} />
                                                        </div>
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-lg text-gray-300 flex items-center justify-center">
                                                            <Eye size={15} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <BookOpen size={32} className="text-gray-300 mb-2" />
                                    <p className="text-xs font-bold text-gray-700">No Enrolled Courses</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Tabbed Sections (Video Reports, Notes, Attempted Quizzes) (8 cols) */}
                    <div className="lg:col-span-8 xl:col-span-8">
                        <div className={`${CARD} flex flex-col h-full overflow-hidden`}>
                            {/* Navigation Tabs Header */}
                            <div className="flex items-center gap-6 border-b border-gray-200 px-6 pt-4 bg-white shrink-0">
                                <button
                                    onClick={() => setActiveReportTab('video')}
                                    className={`flex items-center gap-2 pb-3.5 text-xs font-bold transition-all border-b-2 ${activeReportTab === 'video'
                                        ? 'border-[#4318FF] text-[#4318FF]'
                                        : 'border-transparent text-gray-500 hover:text-gray-800'
                                        }`}
                                >
                                    <PlayCircle size={15} />
                                    <span>Video Reports</span>
                                </button>
                                <button
                                    onClick={() => setActiveReportTab('notes')}
                                    className={`flex items-center gap-2 pb-3.5 text-xs font-bold transition-all border-b-2 ${activeReportTab === 'notes'
                                        ? 'border-[#4318FF] text-[#4318FF]'
                                        : 'border-transparent text-gray-500 hover:text-gray-800'
                                        }`}
                                >
                                    <FileText size={15} />
                                    <span>Notes</span>
                                    {notes && notes.length > 0 && (
                                        <span className="text-[10px] font-semibold bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded-full">
                                            {notes.length}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveReportTab('quizzes')}
                                    className={`flex items-center gap-2 pb-3.5 text-xs font-bold transition-all border-b-2 ${activeReportTab === 'quizzes'
                                        ? 'border-[#4318FF] text-[#4318FF]'
                                        : 'border-transparent text-gray-500 hover:text-gray-800'
                                        }`}
                                >
                                    <HelpCircle size={15} />
                                    <span>Attempted Quizzes</span>
                                    {quizzes && quizzes.length > 0 && (
                                        <span className="text-[10px] font-semibold bg-purple-50 text-purple-600 border border-purple-200 px-1.5 py-0.5 rounded-full">
                                            {quizzes.length}
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* TAB 1: Video Reports */}
                            {activeReportTab === 'video' && (
                                <div className="p-5 sm:p-6 flex flex-col flex-1">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 mb-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                                <PlayCircle size={20} />
                                            </div>
                                            <div>
                                                <h2 className="text-base font-bold text-gray-900">Course Video Report</h2>
                                                <p className="text-xs font-bold text-indigo-600 truncate max-w-md">
                                                    {selectedCourse?.course_detail?.name || 'Select a course to view video progress'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 self-end sm:self-auto">
                                            <button
                                                onClick={() => handleDownloadFile(
                                                    () => downloadVideoWatchReportPdfApi(selectedStudent.id, selectedCourseId),
                                                    'pdf',
                                                    `video_report_${selectedStudent.id}_course_${selectedCourseId}`,
                                                    setDownloadingPdf
                                                )}
                                                disabled={!selectedCourseId || downloadingPdf}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-indigo-600 hover:bg-indigo-50 font-bold text-xs rounded-lg border border-indigo-200 transition-all disabled:opacity-50"
                                            >
                                                <FileText size={13} />
                                                <span>PDF</span>
                                            </button>
                                            <button
                                                onClick={() => handleDownloadFile(
                                                    () => downloadVideoWatchReportExcelApi(selectedStudent.id, selectedCourseId),
                                                    'excel',
                                                    `video_report_${selectedStudent.id}_course_${selectedCourseId}`,
                                                    setDownloadingExcel
                                                )}
                                                disabled={!selectedCourseId || downloadingExcel}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-emerald-600 hover:bg-emerald-50 font-bold text-xs rounded-lg border border-emerald-200 transition-all disabled:opacity-50"
                                            >
                                                <Download size={13} />
                                                <span>Excel</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        {loadingReport ? (
                                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-3"></div>
                                                <p className="text-xs font-medium text-gray-500">Loading course video progress...</p>
                                            </div>
                                        ) : !selectedCourseId ? (
                                            <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
                                                <BookOpen size={36} className="mb-2 text-gray-300" />
                                                <p className="font-bold text-xs text-gray-600">Select an enrolled course</p>
                                            </div>
                                        ) : reportData?.report_data && reportData.report_data.length > 0 ? (
                                            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                                                {reportData.report_data.map((item: any, index: number) => {
                                                    const progressVal = Number(item.progress) || 0;
                                                    return (
                                                        <div
                                                            key={`report-${item.id || item.chapter_info?.id || index}`}
                                                            className="p-4 rounded-xl border border-gray-200 bg-white"
                                                        >
                                                            <div className="flex items-center justify-between gap-3 mb-1">
                                                                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                                                                    Chapter {index + 1}
                                                                </span>
                                                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600">
                                                                    {progressVal}% Completed
                                                                </span>
                                                            </div>

                                                            <h4 className="font-bold text-gray-900 text-sm mb-3">
                                                                {item.chapter_info?.name || "Introduction"}
                                                            </h4>

                                                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                                                                <div
                                                                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                                                                    style={{ width: `${progressVal}%` }}
                                                                />
                                                            </div>

                                                            <div className="flex items-center justify-between text-xs pt-1">
                                                                <div>
                                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Videos Watched</p>
                                                                    <p className="font-bold text-gray-900 mt-0.5">
                                                                        {item.total_video_watched || 0} / {item.chapter_info?.no_of_videos || 0}
                                                                    </p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Watch Duration</p>
                                                                    <p className="font-bold text-gray-900 mt-0.5">
                                                                        {formatDuration(item.video_watched)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
                                                <Info size={28} className="text-gray-300 mb-2" />
                                                <p className="font-bold text-xs text-gray-600">No Chapter Progress Recorded</p>
                                                <p className="text-[11px] text-gray-400 mt-0.5">No video watch activity has been recorded yet for this course.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: Notes */}
                            {activeReportTab === 'notes' && (
                                <div className="p-5 sm:p-6 flex flex-col flex-1">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 mb-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                                                <FileText size={16} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h2 className="text-base font-bold text-gray-900">Student Notes</h2>
                                                    <span className="text-[11px] font-semibold px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-full">
                                                        {notes?.length || 0} Notes
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    Notes taken for <strong className="text-gray-800">{selectedCourse?.course_detail?.name || 'Selected Course'}</strong>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 self-end sm:self-auto">
                                            <button
                                                onClick={() => handleDownloadFile(
                                                    () => downloadCorporateStudentNotesReportPdfApi(selectedStudent.id, selectedCourseId),
                                                    'pdf',
                                                    `student_notes_${selectedStudent.id}_course_${selectedCourseId}`,
                                                    setDownloadingNotesPdf
                                                )}
                                                disabled={!selectedCourseId || downloadingNotesPdf || notes.length === 0}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-indigo-600 hover:bg-indigo-50 font-bold text-xs rounded-lg border border-indigo-200 transition-all disabled:opacity-50"
                                            >
                                                <FileText size={13} />
                                                <span>PDF</span>
                                            </button>
                                            <button
                                                onClick={() => handleDownloadFile(
                                                    () => downloadCorporateStudentNotesReportExcelApi(selectedStudent.id, selectedCourseId),
                                                    'excel',
                                                    `student_notes_${selectedStudent.id}_course_${selectedCourseId}`,
                                                    setDownloadingNotesExcel
                                                )}
                                                disabled={!selectedCourseId || downloadingNotesExcel || notes.length === 0}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-emerald-600 hover:bg-emerald-50 font-bold text-xs rounded-lg border border-emerald-200 transition-all disabled:opacity-50"
                                            >
                                                <Download size={13} />
                                                <span>Excel</span>
                                            </button>
                                        </div>
                                    </div>

                                    {loadingNotes ? (
                                        <div className="flex flex-col items-center justify-center py-16 text-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mb-2"></div>
                                            <p className="text-xs text-gray-500">Loading student notes...</p>
                                        </div>
                                    ) : notes && notes.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[520px] overflow-y-auto pr-1">
                                            {notes.map((note: any, index: number) => (
                                                <div key={note.id || index} className="p-4 rounded-xl border border-gray-200 bg-white">
                                                    <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-gray-100">
                                                        <h4 className="font-bold text-xs text-gray-900 truncate">
                                                            {note.lecture_info?.video_info?.name || note.title || 'Note'}
                                                        </h4>
                                                        <span className="text-[9px] font-bold text-gray-400 shrink-0">
                                                            {note.created_at ? moment(note.created_at).format('MMM DD, YYYY') : ''}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-600 line-clamp-3">
                                                        {note.note_content ? (
                                                            <div dangerouslySetInnerHTML={{ __html: note.note_content }} />
                                                        ) : (
                                                            note.description || note.content || 'No content'
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-16 text-center">
                                            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center mb-3">
                                                <FileText size={22} />
                                            </div>
                                            <h4 className="text-sm font-bold text-gray-900 mb-1">No Notes Recorded</h4>
                                            <p className="text-xs text-gray-400">No notes have been taken by the student for this course yet.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB 3: Attempted Quizzes */}
                            {activeReportTab === 'quizzes' && (
                                <div className="p-5 sm:p-6 flex flex-col flex-1">
                                    <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-5">
                                        <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                            <HelpCircle size={16} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h2 className="text-base font-bold text-gray-900">Attempted Quizzes</h2>
                                                <span className="text-[11px] font-semibold px-2 py-0.5 bg-purple-50 text-purple-600 border border-purple-200 rounded-full">
                                                    {quizzes?.length || 0} Quizzes
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Quizzes attempted for <strong className="text-gray-800">{selectedCourse?.course_detail?.name || 'Selected Course'}</strong>
                                            </p>
                                        </div>
                                    </div>

                                    {loadingQuizzes ? (
                                        <div className="flex flex-col items-center justify-center py-16 text-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
                                            <p className="text-xs text-gray-500">Loading attempted quizzes...</p>
                                        </div>
                                    ) : quizzes && quizzes.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[520px] overflow-y-auto pr-1">
                                            {quizzes.map((attempt: any, index: number) => {
                                                const passed = attempt.result === 'Pass' || attempt.is_passed || attempt.status === 'passed';
                                                const quizDetails = attempt.quiz || attempt.quiz_info || {};
                                                return (
                                                    <div key={attempt.id || index} className="p-4 rounded-xl border border-gray-200 bg-white flex flex-col justify-between">
                                                        <div>
                                                            <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-gray-100">
                                                                <div>
                                                                    <h4 className="font-bold text-xs text-gray-900 truncate">
                                                                        {quizDetails.name || attempt.name || 'Quiz'}
                                                                    </h4>
                                                                    {attempt.chapter_info?.name && (
                                                                        <p className="text-[10px] text-purple-600 font-bold uppercase mt-0.5">
                                                                            {attempt.chapter_info.name}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${passed ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                                    {passed ? 'Passed' : 'Failed'}
                                                                </span>
                                                            </div>
                                                            <div className="grid grid-cols-3 gap-2 text-center text-xs mt-3 bg-gray-50 p-2.5 rounded-lg">
                                                                <div>
                                                                    <p className="text-[9px] text-gray-400 font-bold uppercase">Score</p>
                                                                    <p className="font-bold text-gray-900 mt-0.5">{attempt.score ?? 0}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[9px] text-emerald-600 font-bold uppercase">Right</p>
                                                                    <p className="font-bold text-emerald-700 mt-0.5">{attempt.total_right_answer_given ?? '-'}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[9px] text-red-600 font-bold uppercase">Wrong</p>
                                                                    <p className="font-bold text-red-700 mt-0.5">{attempt.total_wrong_answer_given ?? '-'}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-16 text-center">
                                            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center mb-3">
                                                <HelpCircle size={22} />
                                            </div>
                                            <h4 className="text-sm font-bold text-gray-900 mb-1">No Attempted Quizzes</h4>
                                            <p className="text-xs text-gray-400">No quizzes have been attempted by the student for this course yet.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom 3-Column Section: Student Information, Recent Devices, Announcements */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* 1. Student Information */}
                    <div className={`${CARD} p-5 sm:p-6`}>
                        <h2 className="text-base font-bold text-gray-900 mb-4">Student Information</h2>
                        <div className="space-y-4 text-xs">
                            <div className="flex items-start gap-3">
                                <Mail size={16} className="text-gray-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</p>
                                    <p className="text-xs font-semibold text-gray-800 mt-0.5 break-all">{selectedStudent.email}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Phone size={16} className="text-gray-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone Number</p>
                                    <p className="text-xs font-semibold text-gray-800 mt-0.5">
                                        {selectedStudent.phone1 || (selectedStudent as any).phone || 'Not provided'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Calendar size={16} className="text-gray-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Created On</p>
                                    <p className="text-xs font-semibold text-gray-800 mt-0.5">
                                        {(selectedStudent as any).created_at || (selectedStudent as any).date_joined
                                            ? moment((selectedStudent as any).created_at || (selectedStudent as any).date_joined).format('MMMM DD, YYYY')
                                            : 'Unknown'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Location</p>
                                    <p className="text-xs font-semibold text-gray-800 mt-0.5">
                                        {selectedStudent.address || 'No address'}<br />
                                        {selectedStudent.city ? `${selectedStudent.city}, ` : ''}{selectedStudent.state || ''}<br />
                                        {selectedStudent.country || ''} {selectedStudent.pincode ? `- ${selectedStudent.pincode}` : ''}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Recent Devices */}
                    <div className={`${CARD} p-5 sm:p-6`}>
                        <div className="flex items-start justify-between gap-2 mb-4">
                            <div>
                                <h2 className="text-base font-bold text-gray-900">Recent Devices</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Login activity & registered devices</p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                    onClick={() => handleDownloadFile(
                                        () => downloadStudentLoginActivityPdfApi(selectedStudent.id),
                                        'pdf',
                                        `student_login_activity_${selectedStudent.id}`,
                                        setDownloadingLoginPdf
                                    )}
                                    disabled={downloadingLoginPdf}
                                    className="flex items-center gap-1 px-2.5 py-1 bg-white text-indigo-600 hover:bg-indigo-50 font-bold text-xs rounded-lg border border-indigo-200 transition-all disabled:opacity-50"
                                >
                                    <FileText size={12} />
                                    <span>PDF</span>
                                </button>
                                <button
                                    onClick={() => handleDownloadFile(
                                        () => downloadStudentLoginActivityExcelApi(selectedStudent.id),
                                        'excel',
                                        `student_login_activity_${selectedStudent.id}`,
                                        setDownloadingLoginExcel
                                    )}
                                    disabled={downloadingLoginExcel}
                                    className="flex items-center gap-1 px-2.5 py-1 bg-white text-emerald-600 hover:bg-emerald-50 font-bold text-xs rounded-lg border border-emerald-200 transition-all disabled:opacity-50"
                                >
                                    <Download size={12} />
                                    <span>Excel</span>
                                </button>
                            </div>
                        </div>

                        {user_devices && user_devices.length > 0 ? (
                            <div className="space-y-3">
                                {user_devices.map((device: any, index: number) => (
                                    <div key={device.id || index} className="p-3 rounded-xl border border-gray-200 bg-white flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                                            {device.device_type === 'desktop' ? <Monitor size={16} /> : <Smartphone size={16} />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-bold text-gray-900 uppercase">{device.device_type || 'DESKTOP'}</p>
                                                {index === 0 && (
                                                    <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full uppercase">
                                                        Active
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[10px] font-mono text-gray-400 truncate mt-0.5">{device.device_id}</p>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                                                {moment(device.created_at).format('MMM DD, YYYY • hh:mm A')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400">
                                <Monitor size={24} className="mb-2 text-gray-300" />
                                <p className="font-bold text-xs text-gray-600">No Devices</p>
                            </div>
                        )}
                    </div>

                    {/* 3. Announcements */}
                    <div className={`${CARD} p-5 sm:p-6`}>
                        <h2 className="text-base font-bold text-gray-900 mb-4">Announcements</h2>

                        {announcements && announcements.length > 0 ? (
                            <div className="space-y-3">
                                {announcements.map((ann: any, idx: number) => (
                                    <div key={idx} className="p-3 rounded-xl border border-gray-200 bg-white">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                                            {moment(ann.date).fromNow()}
                                        </p>
                                        <h4 className="text-xs font-bold text-gray-900">{ann.title}</h4>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ann.description}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mb-2.5">
                                    <Bell size={18} />
                                </div>
                                <h4 className="text-xs font-bold text-gray-800">No Announcements</h4>
                                <p className="text-[11px] text-gray-400 mt-0.5">No recent announcements to show.</p>
                            </div>
                        )}
                    </div>

                </div>

            </div>
        </div>
    );
};

export default StudentProfile;