import { useEffect, useState } from 'react';
import { BookOpen, Info, FileText, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { 
    fetchCorporateStudentNotesApi,
    downloadCorporateStudentNotesReportPdfApi,
    downloadCorporateStudentNotesReportExcelApi
} from '../../services/apiServices';
import moment from 'moment';

const CorporateStudentNotes = ({ studentId, courses }: { studentId: number, courses: any[] }) => {
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [notes, setNotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (courses && courses.length > 0 && !selectedCourseId) {
            setSelectedCourseId(courses[0]?.course_detail?.id?.toString() || courses[0]?.id?.toString());
        }
    }, [courses, selectedCourseId]);

    useEffect(() => {
        const loadNotes = async () => {
            if (!studentId || !selectedCourseId) return;
            try {
                setLoading(true);
                setError(null);
                const response = await fetchCorporateStudentNotesApi(studentId, selectedCourseId);
                // Notes might be in response.data or response.results depending on the API format
                if (response?.results) {
                    setNotes(response.results);
                } else if (response?.data) {
                    setNotes(Array.isArray(response.data) ? response.data : []);
                } else {
                    setNotes([]);
                }
            } catch (err: any) {
                setError(err.message || "Failed to load notes");
            } finally {
                setLoading(false);
            }
        };
        loadNotes();
    }, [studentId, selectedCourseId]);

    const handleDownload = async (type: 'pdf' | 'excel') => {
        if (!studentId || !selectedCourseId) {
            toast.error("Please select a course first");
            return;
        }

        try {
            const apiCall = type === 'pdf' ? downloadCorporateStudentNotesReportPdfApi : downloadCorporateStudentNotesReportExcelApi;
            const response: any = await apiCall(studentId, selectedCourseId);

            const extension = type === 'excel' ? 'csv' : 'pdf';
            const fileName = `student_notes_report_${studentId}_${new Date().toISOString().split('T')[0]}.${extension}`;

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
                    
                    {notes && notes.length > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Notes Summary</h3>
                            <div className="bg-indigo-50 rounded-xl p-4">
                                <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">Total Notes</p>
                                <h4 className="text-2xl font-bold text-indigo-700 mt-1">
                                    {notes.length}
                                </h4>
                            </div>
                        </div>
                    )}

                    {notes && notes.length > 0 && selectedCourseId && (
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

                {/* Right side: Student Notes */}
                <div className="w-full lg:w-2/3 bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden shadow-sm relative flex flex-col h-full">
                    <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <FileText size={18} className="text-indigo-600" /> Student Notes
                        </h3>
                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {notes.length} Notes
                        </span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-3"></div>
                                <p className="text-gray-500 font-medium">Loading notes...</p>
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
                        ) : notes && notes.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {notes.map((note: any, index: number) => {
                                    const videoName = note.lecture_info?.video_info?.name;
                                    const ebookName = note.lecture_info?.ebook_info?.name;
                                    const title = videoName || ebookName || note.title || "Untitled Note";
                                    
                                    let timestampStr = "";
                                    if (note.duration) {
                                        const secs = parseInt(note.duration, 10);
                                        if (!isNaN(secs)) {
                                            const m = Math.floor(secs / 60);
                                            const s = secs % 60;
                                            timestampStr = `${m}:${s.toString().padStart(2, '0')}`;
                                        }
                                    }

                                    return (
                                    <div key={index} className="bg-white border border-yellow-200 bg-yellow-50/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-2 border-b border-yellow-200/60 pb-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <h4 className="font-bold text-gray-900 text-sm truncate" title={title}>
                                                        {title}
                                                    </h4>
                                                    {note.note_type && (
                                                        <span className="text-[8px] font-black uppercase tracking-widest bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
                                                            {note.note_type}
                                                        </span>
                                                    )}
                                                    {timestampStr && (
                                                        <span className="text-[9px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                                                 {timestampStr}
                                                        </span>
                                                    )}
                                                </div>
                                                {note.chapter_info ? (
                                                    <p className="text-[10px] text-gray-500 font-semibold uppercase mt-0.5">
                                                        Chapter: {note.chapter_info.name}
                                                    </p>
                                                ) : note.lecture_info?.chapter ? (
                                                    <p className="text-[10px] text-gray-500 font-semibold uppercase mt-0.5">
                                                        Chapter ID: {note.lecture_info.chapter}
                                                    </p>
                                                ) : null}
                                            </div>
                                            {note.created_at && (
                                                <span className="text-[10px] font-bold text-gray-500 shrink-0 bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm mt-1 sm:mt-0">
                                                    {moment(note.created_at).format('MMM DD, YYYY hh:mm A')}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 text-lg font-bold text-gray-800 leading-relaxed max-h-64 overflow-y-auto custom-scrollbar pr-2 prose prose-lg prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0 break-words prose-p:font-bold">
                                            {note.note_content ? (
                                                <div dangerouslySetInnerHTML={{ __html: note.note_content }} />
                                            ) : (
                                                note.description || note.content || "No content."
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 py-10">
                                <FileText size={40} className="mb-3 opacity-30" />
                                <p className="font-bold text-sm">No notes found for this course.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CorporateStudentNotes;
