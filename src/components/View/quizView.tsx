import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { viewQuiz } from '../../store/slices/QuizSlice';
import { useAppSelector } from '../../hooks/useRedux';
import { BookOpen, Calendar, Clock, HelpCircle, CheckCircle, Info, ChevronDown } from 'lucide-react';

interface QuizViewProps {
    id: string | number;
    hideModal: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({ id, hideModal }) => {
    const dispatch = useAppDispatch();
    const { currentQuiz, currentQuizLoading, error } = useAppSelector(state => state.quiz);
    const [openIndexes, setOpenIndexes] = useState<Set<number>>(new Set());

    const toggleAccordion = (index: number) => {
        setOpenIndexes(prev => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    };

    useEffect(() => {
        if (id) {
            dispatch(viewQuiz(id));
        }
    }, [dispatch, id]);

    if (currentQuizLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-16 min-h-[400px] gap-6">
                <div className="relative flex justify-center items-center">
                    <div className="w-16 h-16 border-4 border-indigo-100 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                    <HelpCircle className="w-6 h-6 text-indigo-500 absolute animate-pulse" />
                </div>
                <div className="flex flex-col items-center gap-2">
                    <span className="text-lg font-bold text-gray-800">Fetching Details</span>
                    <span className="text-sm font-medium text-gray-400">Loading the quiz for you...</span>
                </div>
            </div>
        );
    }

    if (error && !currentQuiz) {
        return (
            <div className="flex flex-col items-center justify-center p-12 min-h-[300px] gap-4 bg-red-50/30 rounded-2xl m-4 border border-red-100 ">
                <div className="w-16 h-16 bg-red-100 text-red-500 flex items-center justify-center rounded-full mb-2">
                    <Info size={28} />
                </div>
                <span className="text-red-600 font-bold text-xl">Failed to load data</span>
                <span className="text-sm text-red-400/80 text-center max-w-xs">{error}</span>
                <button onClick={hideModal} className="mt-6 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95">Go Back</button>
            </div>
        );
    }

    if (!currentQuiz) {
        return null;
    }

    const { name, description, thumbnail, chapter, created_at, status, pass_percentage, total_question, quiz_questions } = currentQuiz;

    return (
        <div className="flex flex-col w-full max-h-[85vh] overflow-y-auto bg-gray-50/30 custom-scrollbar relative animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Gradient Banner */}
            <div className="relative w-full h-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 shrink-0 overflow-hidden rounded-2xl">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>

                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl text-white shadow-sm border border-white/20">
                            <HelpCircle size={22} className="text-white" />
                        </div>
                        <span className="text-white/90 text-xs font-bold uppercase tracking-widest">Quiz Details</span>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="flex flex-col gap-6 px-6 py-8 -mt-6 relative z-10">
                {/* Title & Status */}
                <div className="flex flex-col gap-4 bg-white p-6 rounded-2xl shadow-xl shadow-indigo-100/20 border border-gray-200">
                    <div className="flex items-start justify-between gap-4">
                        <h1 className="text-xl font-black text-gray-900 leading-tight">
                            {name || 'Untitled Quiz'}
                        </h1>
                        <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border-gray-200 ${status
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                            {status ? 'Active' : 'Inactive'}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-2">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <BookOpen size={14} className="text-indigo-500" />
                            <span className="font-semibold text-gray-800">{chapter?.name || '-'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Calendar size={14} className="text-purple-500" />
                            <span className="font-medium">{created_at ? moment(created_at).format('MMM DD, YYYY') : '-'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Clock size={14} className="text-orange-400" />
                            <span className="font-medium">{created_at ? moment(created_at).format('hh:mm A') : '-'}</span>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-2 bg-white p-5 rounded-2xl shadow-xl shadow-indigo-100/20 border border-gray-200">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Description</h2>
                    <div className="prose prose-sm max-w-none text-gray-700">
                        <p className="whitespace-pre-wrap leading-relaxed">
                            {description || <span className="text-gray-400 italic">No description provided.</span>}
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Passing Mark */}
                    <div className="bg-white p-6 rounded-2xl shadow-xl shadow-indigo-100/20 border border-gray-200 flex flex-col items-center justify-center">
                        <CheckCircle size={28} className="text-green-500 mb-2" />
                        <span className="text-3xl font-black text-gray-800">
                            {pass_percentage}%
                        </span>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                            Passing Mark
                        </span>
                    </div>

                    {/* Total Questions */}
                    <div className="bg-white p-6 rounded-2xl shadow-xl shadow-indigo-100/20 border border-gray-200 flex flex-col items-center justify-center">
                        <HelpCircle size={28} className="text-blue-500 mb-2" />
                        <span className="text-3xl font-black text-gray-800">
                            {total_question || quiz_questions?.length || 0}
                        </span>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                            Total Questions
                        </span>
                    </div>

                    {/* Thumbnail */}
                    {thumbnail && (
                        <div className="bg-white p-6 rounded-2xl shadow-xl shadow-indigo-100/20 border border-gray-200 flex items-center justify-center">
                            <img
                                src={thumbnail}
                                alt={name}
                                className="w-full h-40 object-contain rounded-xl"
                            />
                        </div>
                    )}
                </div>

                {/* Questions Accordion Section */}
                {quiz_questions && quiz_questions.length > 0 && (
                    <div className="flex flex-col gap-3">
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2">
                            Questions ({quiz_questions.length})
                        </h2>
                        {quiz_questions.map((q: any, index: number) => {
                            const qDetail = q.question_detail?.question_detail;
                            if (!qDetail) return null;
                            const isOpen = openIndexes.has(index);
                            return (
                                <div key={q.id || index} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
                                    {/* Accordion Header */}
                                    <button
                                        type="button"
                                        onClick={() => toggleAccordion(index)}
                                        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left cursor-pointer group transition-colors hover:bg-gray-50/80"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="shrink-0 w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-black">
                                                {index + 1}
                                            </span>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-bold text-gray-800 truncate">
                                                    Question {index + 1}
                                                </span>
                                                {q.question_detail?.id_number && (
                                                    <span className="text-[10px] text-gray-400 font-mono mt-0.5">
                                                        {q.question_detail.id_number}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <ChevronDown
                                            size={18}
                                            className={`shrink-0 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                                        />
                                    </button>

                                    {/* Accordion Content */}
                                    <div
                                        className="overflow-hidden transition-all duration-300 ease-in-out"
                                        style={{
                                            maxHeight: isOpen ? '2000px' : '0px',
                                            opacity: isOpen ? 1 : 0,
                                        }}
                                    >
                                        <div className="px-5 pb-5 flex flex-col gap-4 border-t border-gray-100 pt-4">
                                            <div
                                                className="text-sm text-gray-800 bg-gray-50 p-4 rounded-xl border border-gray-100 overflow-x-auto"
                                                dangerouslySetInnerHTML={{ __html: qDetail.question }}
                                            />

                                            {qDetail.solution_description && (
                                                <div>
                                                    <h4 className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                                                        <CheckCircle size={14} /> Solution / Explanation
                                                    </h4>
                                                    <div
                                                        className="text-sm text-gray-700 bg-green-50/50 p-4 rounded-xl border border-green-100 overflow-x-auto"
                                                        dangerouslySetInnerHTML={{ __html: qDetail.solution_description }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizView;
