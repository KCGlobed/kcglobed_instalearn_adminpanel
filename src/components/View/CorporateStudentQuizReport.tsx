import { useEffect, useState } from 'react';
import { BookOpen, Info, HelpCircle, CheckCircle, XCircle } from 'lucide-react';
import { fetchStudentAttemptedQuizApi } from '../../services/apiServices';
import moment from 'moment';

const CorporateStudentQuizReport = ({ studentId, courses }: { studentId: number, courses: any[] }) => {
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
                } else {
                    setQuizzes([]);
                }
            } catch (err: any) {
                setError(err.message || "Failed to load attempted quizzes");
            } finally {
                setLoading(false);
            }
        };
        loadQuizzes();
    }, [studentId, selectedCourseId]);

    return (
        <div className="flex flex-col gap-6 p-1 min-h-[600px] h-[75vh]">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 w-full flex flex-col md:flex-row items-center gap-4 shrink-0">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 whitespace-nowrap">
                    <BookOpen size={16} className="text-indigo-600" /> Select Course
                </h3>
                {courses && courses.length > 0 ? (
                    <select
                        value={selectedCourseId}
                        onChange={(e) => setSelectedCourseId(e.target.value)}
                        className="w-full md:max-w-md h-11 rounded-xl border border-gray-200 px-4 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all bg-gray-50 hover:bg-white"
                    >
                        {courses.map((course: any, index: number) => (
                            <option key={`course-${course?.course_detail?.id || course?.id}-${index}`} value={course?.course_detail?.id || course?.id}>
                                {course?.course_detail?.name || 'Unknown Course'}
                            </option>
                        ))}
                    </select>
                ) : (
                    <div className="p-2.5 bg-yellow-50 text-yellow-700 rounded-xl text-sm font-medium border border-yellow-100 w-full md:max-w-md">
                        No courses enrolled.
                    </div>
                )}
            </div>

            <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden shadow-sm relative flex flex-col min-h-[300px]">
                <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <HelpCircle size={18} className="text-indigo-600" /> Attempted Quizzes
                    </h3>
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {quizzes.length} Quizzes
                    </span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-3"></div>
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
                        <div className="grid grid-cols-1 gap-4 max-w-3xl mx-auto">
                            {quizzes.map((attempt: any, index: number) => {
                                const passed = attempt.result === 'Pass' || attempt.is_passed || attempt.status === 'passed';
                                const quizDetails = attempt.quiz || attempt.quiz_info || {};
                                const chapterName = quizDetails.chapter?.name || attempt.chapter_info?.name;
                                
                                // Format time taken if it exists (assuming it's in milliseconds if very large)
                                let timeTakenStr = "-";
                                if (attempt.total_time_taken) {
                                    const secs = attempt.total_time_taken > 1000 ? Math.floor(attempt.total_time_taken / 1000) : attempt.total_time_taken;
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
                                    <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 shadow-[0_2px_10px_rgba(15,23,42,0.02)] hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex-1 space-y-3">
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-base mb-1">
                                                    {quizDetails.name || attempt.name || "Unknown Quiz"}
                                                </h4>
                                                {quizDetails.description && (
                                                    <p className="text-xs text-gray-500 mb-2">{quizDetails.description}</p>
                                                )}
                                                {chapterName && (
                                                    <p className="text-[10px] text-gray-500 font-semibold uppercase mb-2">
                                                        Chapter: {chapterName}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2">
                                                {attempt.start_time && (
                                                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                        Attempted: {moment(attempt.start_time).format('MMM DD, YYYY · hh:mm A')}
                                                    </span>
                                                )}
                                                {timeTakenStr !== "-" && (
                                                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                        Time: {timeTakenStr}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-3 gap-2 mt-2 max-w-sm">
                                                <div className="bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
                                                    <p className="text-[9px] text-gray-400 font-bold uppercase">Questions</p>
                                                    <p className="text-sm font-black text-gray-700">{attempt.total_question || quizDetails.total_question || '-'}</p>
                                                </div>
                                                <div className="bg-emerald-50 rounded-lg p-2 text-center border border-emerald-100">
                                                    <p className="text-[9px] text-emerald-500 font-bold uppercase">Right</p>
                                                    <p className="text-sm font-black text-emerald-700">{attempt.total_right_answer_given ?? '-'}</p>
                                                </div>
                                                <div className="bg-red-50 rounded-lg p-2 text-center border border-red-100">
                                                    <p className="text-[9px] text-red-400 font-bold uppercase">Wrong</p>
                                                    <p className="text-sm font-black text-red-600">{attempt.total_wrong_answer_given ?? '-'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 shrink-0 h-full">
                                            <div className="flex flex-col md:items-end">
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Score</span>
                                                <span className="text-2xl font-black text-gray-900 leading-none">
                                                    {attempt.score ?? 0}
                                                    {quizDetails.pass_percentage && (
                                                        <span className="text-xs text-gray-400 font-bold ml-1">
                                                            (Pass: {quizDetails.pass_percentage}%)
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold w-full justify-center md:w-auto ${passed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                                {passed ? <CheckCircle size={14}/> : <XCircle size={14}/>}
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
                            <p className="font-bold text-sm">No attempted quizzes found for this course.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CorporateStudentQuizReport;
