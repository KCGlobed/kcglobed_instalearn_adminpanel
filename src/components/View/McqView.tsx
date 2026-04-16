import React from "react";
import { FiCheckCircle, FiInfo, FiTag, FiBarChart2, FiLayers, FiHelpCircle } from "react-icons/fi";

interface McqViewProps {
    mcqData: any;
}

const McqView: React.FC<McqViewProps> = ({ mcqData }) => {
    const getLevelBadge = (level: number) => {
        switch (level) {
            case 1:
                return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider rounded-full border border-emerald-100 italic">Level 1: Beginner</span>;
            case 2:
                return <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wider rounded-full border border-amber-100 italic">Level 2: Intermediate</span>;
            case 3:
                return <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold uppercase tracking-wider rounded-full border border-rose-100 italic">Level 3: Advanced</span>;
            default:
                return <span className="px-3 py-1 bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-wider rounded-full border border-gray-100 italic">Undefined Level</span>;
        }
    };

    const rightOptionId = mcqData?.right_option?.id;

    return (
        <div className="flex flex-col gap-8 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
            {/* ── Metadata Header ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-gray-50/50 rounded-2xl border border-gray-100">
                <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                        <FiTag className="text-indigo-400" /> ID Number
                    </span>
                    <p className="text-sm font-bold text-gray-800 tracking-tight">{mcqData?.id_number || "N/A"}</p>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                        <FiBarChart2 className="text-indigo-400" /> Difficulty
                    </span>
                    <div className="mt-0.5">{getLevelBadge(mcqData?.level)}</div>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                        <FiLayers className="text-indigo-400" /> Pass Rule
                    </span>
                    <p className="text-sm font-bold text-gray-800 tracking-tight">{mcqData?.pass_percentage}% Score Required</p>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                        <FiInfo className="text-indigo-400" /> Chapter Link
                    </span>
                    <p className="text-sm font-bold text-gray-800 tracking-tight truncate" title={mcqData?.chapter?.name}>
                        {mcqData?.chapter?.name || "No Chapter Linked"}
                    </p>
                </div>
            </div>

            {/* ── Question Content ── */}
            <div className="flex flex-col gap-4">
                <h3 className="flex items-center gap-2.5 text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">
                    <FiHelpCircle className="text-indigo-600" /> Primary Question
                </h3>
                <div
                    className="prose prose-sm max-w-none p-6 bg-white border border-gray-200 rounded-2xl shadow-sm text-gray-700 leading-relaxed font-medium"
                    dangerouslySetInnerHTML={{ __html: mcqData?.question_detail?.question || mcqData?.question || "No question text provided." }}
                />
            </div>

            {/* ── Options Listing ── */}
            <div className="flex flex-col gap-6">
                <h3 className="flex items-center gap-2.5 text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">
                    <FiCheckCircle className="text-emerald-500" /> Answer Options
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    {mcqData?.options?.map((opt: any, index: number) => {
                        const isCorrect = opt.id === rightOptionId;
                        return (
                            <div
                                key={opt.id || index}
                                className={`relative p-5 rounded-2xl border transition-all ${isCorrect
                                        ? "bg-emerald-50/40 border-emerald-200 ring-2 ring-emerald-100 shadow-md shadow-emerald-50"
                                        : "bg-white border-gray-100 hover:border-indigo-100 hover:bg-gray-50/30"
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-xl font-bold text-xs ${isCorrect ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-400"
                                        }`}>
                                        {String.fromCharCode(65 + index)}
                                    </div>
                                    <div
                                        className={`prose prose-sm max-w-none text-sm font-medium ${isCorrect ? "text-emerald-900" : "text-gray-600"}`}
                                        dangerouslySetInnerHTML={{ __html: opt.option || opt.value || opt }}
                                    />
                                </div>
                                {isCorrect && (
                                    <span className="absolute -top-2.5 -right-2 px-2.5 py-1 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-tighter rounded-full shadow-lg border-2 border-white">
                                        Correct Choice
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Solution Section ── */}
            {(mcqData?.question_detail?.solution_description || mcqData?.solution_description) && (
                <div className="flex flex-col gap-4 mt-4 mb-2">
                    <h3 className="flex items-center gap-2.5 text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">
                        <FiInfo className="text-indigo-600" /> Expert Explanation
                    </h3>
                    <div className="bg-gradient-to-br from-white to-indigo-50/20 border border-indigo-100/60 rounded-2xl p-6 shadow-sm">
                        <div
                            className="prose prose-sm max-w-none text-gray-600 font-medium italic leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: mcqData?.question_detail?.solution_description || mcqData?.solution_description }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default McqView;