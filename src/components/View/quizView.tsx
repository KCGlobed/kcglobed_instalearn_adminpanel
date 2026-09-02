import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { viewQuiz } from '../../store/slices/QuizSlice';
import { useAppSelector } from '../../hooks/useRedux';
import {
    BookOpen,
    Calendar,
    HelpCircle,
    CheckCircle,
    XCircle,
    ChevronDown,
    Loader2,
    FileText,
    Percent,
    ListOrdered,
    Image as ImageIcon,
} from 'lucide-react';

interface QuizViewProps {
    id: string | number;
    hideModal?: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({ id }) => {
    const dispatch = useAppDispatch();
    const { currentQuiz, currentQuizLoading, error } = useAppSelector((state) => state.quiz);
    const [openIndexes, setOpenIndexes] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (id) {
            dispatch(viewQuiz(id));
        }
    }, [dispatch, id]);

    // Open first question by default when loaded
    useEffect(() => {
        if (currentQuiz?.quiz_questions && currentQuiz.quiz_questions.length > 0) {
            setOpenIndexes(new Set([0]));
        }
    }, [currentQuiz]);

    const toggleAccordion = (index: number) => {
        setOpenIndexes((prev) => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    };

    if (currentQuizLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-10 h-64 gap-3">
                <Loader2 size={32} className="animate-spin text-indigo-600" />
                <p className="text-sm font-medium text-gray-500">Loading quiz details...</p>
            </div>
        );
    }

    if (error && !currentQuiz) {
        return (
            <div className="p-8 text-center text-rose-500 font-medium text-sm">
                Failed to load quiz details.
            </div>
        );
    }

    if (!currentQuiz) {
        return (
            <div className="p-8 text-center text-gray-500 text-sm">
                No quiz data found.
            </div>
        );
    }

    const {
        name,
        description,
        thumbnail,
        chapter,
        created_at,
        status,
        pass_percentage,
        total_question,
        quiz_questions,
    } = currentQuiz;

    const questionsList = quiz_questions || [];

    return (
        <div className="flex flex-col gap-6">
            {/* Top Notice Card */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                <span className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <HelpCircle size={18} />
                </span>
                <div>
                    <p className="text-sm font-semibold text-indigo-800">Quiz Details</p>
                    <p className="text-xs text-indigo-500 mt-0.5">
                        Viewing detailed configuration, passing criteria, and questions for this quiz.
                    </p>
                </div>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-1">
                {/* Quiz Name */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <HelpCircle size={14} /> Quiz Name
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-semibold text-sm">
                        {name || 'N/A'}
                    </div>
                </div>

                {/* Chapter */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <BookOpen size={14} /> Chapter
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-semibold text-sm">
                        {chapter?.name || 'No Chapter Linked'}
                    </div>
                </div>

                {/* Status */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        Status
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2">
                        {status ? (
                            <span className="flex items-center gap-1.5 text-green-700 font-semibold text-sm bg-green-100 px-3 py-1 rounded-full border border-green-200">
                                <CheckCircle size={14} /> Active
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 text-red-700 font-semibold text-sm bg-red-100 px-3 py-1 rounded-full border border-red-200">
                                <XCircle size={14} /> Inactive
                            </span>
                        )}
                    </div>
                </div>

                {/* Passing Percentage */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Percent size={14} /> Passing Mark
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-semibold text-sm">
                        {pass_percentage !== undefined ? `${pass_percentage}% Score Required` : 'N/A'}
                    </div>
                </div>

                {/* Total Questions */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <ListOrdered size={14} /> Total Questions
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-semibold text-sm flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-xs font-bold">
                            {total_question || questionsList.length || 0}
                        </span>
                        <span>Questions</span>
                    </div>
                </div>

                {/* Created On */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Calendar size={14} /> Created On
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm font-medium">
                        {created_at ? moment(created_at).format('MMM DD, YYYY hh:mm A') : 'N/A'}
                    </div>
                </div>

                {/* Thumbnail Preview if available */}
                {thumbnail && (
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                            <ImageIcon size={14} /> Thumbnail Image
                        </label>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center">
                            <img
                                src={thumbnail}
                                alt={name || 'Thumbnail'}
                                className="max-h-48 rounded-xl object-contain border border-gray-200 bg-white"
                            />
                        </div>
                    </div>
                )}

                {/* Description (Full Width) */}
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <FileText size={14} /> Description / Instructions
                    </label>
                    <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm max-w-none break-words overflow-x-auto leading-relaxed">
                        {description ? (
                            <p className="whitespace-pre-wrap">{description}</p>
                        ) : (
                            <span className="text-gray-400 italic">No description provided.</span>
                        )}
                    </div>
                </div>

                {/* Questions Section (Full Width) */}
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <ListOrdered size={14} /> Questions ({questionsList.length})
                    </label>

                    {questionsList.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            {questionsList.map((q: any, index: number) => {
                                const qDetail =
                                    q.question_detail?.question_detail ||
                                    q.question_detail ||
                                    q;
                                const questionText =
                                    qDetail?.question || 'No question text available.';
                                const solutionText =
                                    qDetail?.solution_description || qDetail?.solution;
                                const idNumber =
                                    q.question_detail?.id_number || qDetail?.id_number;
                                const options = qDetail?.options || q.options;
                                const rightOptionId =
                                    qDetail?.right_option?.id || q.right_option?.id;
                                const isOpen = openIndexes.has(index);

                                return (
                                    <div
                                        key={q.id || index}
                                        className="bg-white rounded-xl border border-gray-200/80 shadow-2xs overflow-hidden transition-all"
                                    >
                                        {/* Accordion Header */}
                                        <button
                                            type="button"
                                            onClick={() => toggleAccordion(index)}
                                            className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left cursor-pointer hover:bg-gray-50/70 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <span className="shrink-0 w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center text-xs font-bold">
                                                    {index + 1}
                                                </span>
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="text-xs font-bold text-gray-800">
                                                        Question {index + 1}
                                                    </span>
                                                    {idNumber && (
                                                        <span className="text-[10px] text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                                            {idNumber}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <ChevronDown
                                                size={16}
                                                className={`shrink-0 text-gray-400 transition-transform duration-200 ${
                                                    isOpen ? 'rotate-180 text-indigo-600' : ''
                                                }`}
                                            />
                                        </button>

                                        {/* Accordion Content */}
                                        {isOpen && (
                                            <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex flex-col gap-4 bg-gray-50/30">
                                                {/* Question Text */}
                                                <div>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                                        Question Text
                                                    </span>
                                                    <div
                                                        className="text-sm text-gray-800 bg-white p-4 rounded-xl border border-gray-200 leading-relaxed overflow-x-auto"
                                                        dangerouslySetInnerHTML={{
                                                            __html: questionText,
                                                        }}
                                                    />
                                                </div>

                                                {/* Options if available */}
                                                {options && options.length > 0 && (
                                                    <div>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                                                            Options
                                                        </span>
                                                        <div className="grid grid-cols-1 gap-2">
                                                            {options.map((opt: any, optIdx: number) => {
                                                                const isCorrect =
                                                                    opt.id === rightOptionId ||
                                                                    opt.is_correct;
                                                                return (
                                                                    <div
                                                                        key={opt.id || optIdx}
                                                                        className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-3 ${
                                                                            isCorrect
                                                                                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 font-medium'
                                                                                : 'bg-white border-gray-200 text-gray-700'
                                                                        }`}
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <span
                                                                                className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] ${
                                                                                    isCorrect
                                                                                        ? 'bg-emerald-600 text-white'
                                                                                        : 'bg-gray-100 text-gray-500'
                                                                                }`}
                                                                            >
                                                                                {String.fromCharCode(65 + optIdx)}
                                                                            </span>
                                                                            <div
                                                                                dangerouslySetInnerHTML={{
                                                                                    __html:
                                                                                        opt.option ||
                                                                                        opt.value ||
                                                                                        opt,
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        {isCorrect && (
                                                                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                                                                                Correct
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Solution Description */}
                                                {solutionText && (
                                                    <div>
                                                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1 mb-1">
                                                            <CheckCircle size={12} /> Solution / Explanation
                                                        </span>
                                                        <div
                                                            className="text-xs text-gray-700 bg-emerald-50/40 p-3.5 rounded-xl border border-emerald-100 leading-relaxed overflow-x-auto"
                                                            dangerouslySetInnerHTML={{
                                                                __html: solutionText,
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-center bg-gray-50 rounded-xl border border-gray-100 gap-2">
                            <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                                <HelpCircle size={18} />
                            </div>
                            <p className="text-xs font-semibold text-gray-600">No Questions Added</p>
                            <p className="text-[11px] text-gray-400 max-w-xs">
                                There are no questions associated with this quiz yet.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizView;
