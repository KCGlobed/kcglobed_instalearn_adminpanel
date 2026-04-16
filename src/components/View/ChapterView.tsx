import { FileText, Calendar, Info, CheckCircle, XCircle, Hash, Activity } from "lucide-react";
import moment from "moment";
import { useEffect, useState } from "react";
import { fetchChapterViewData } from "../../services/apiServices";

type Chapter = {
    id: number;
    name: string;
    status: boolean;
    created_at: string;
};

const ChapterView = ({ chapterData }: { chapterData: any }) => {
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const handleFetchChapter = async (id: number) => {
        setLoading(true);
        try {
            const res = await fetchChapterViewData(id);
            if (res.success) {
                setChapter(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch chapter data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (chapterData?.id) {
            handleFetchChapter(chapterData.id);
        }
    }, [chapterData]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-500 font-medium animate-pulse text-sm">Loading details...</p>
            </div>
        );
    }

    if (!chapter) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center text-red-500 min-h-[300px] bg-red-50 rounded-2xl border border-red-100">
                <Info size={40} className="mb-3 opacity-30" />
                <p className="font-bold text-lg">No Chapter Information Available</p>
                <p className="text-sm opacity-70 mt-1">Please try again or contact support if the issue persists.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5 p-1 max-h-[85vh] overflow-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Main Information Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-900/5">
                <div className="flex items-start gap-4 mb-8">
                    <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
                        <FileText size={22} strokeWidth={2.2} />
                    </div>

                    <div className="flex-1 pt-0.5">
                        <div className="flex items-center gap-2 mb-1">
                            <Hash size={12} className="text-indigo-400" />
                            <span className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">
                                Chapter ID: {chapter.id}
                            </span>
                        </div>
                        <h2 className="text-xl font-black text-gray-900 leading-tight tracking-tight">
                            {chapter.name}
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Status Box */}
                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-2.5 group transition-all hover:bg-white hover:shadow-md">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Activity size={14} />
                            <p className="text-[9px] font-black uppercase tracking-widest">Account Status</p>
                        </div>
                        
                        {chapter.status ? (
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 border border-green-200">
                                    <CheckCircle size={16} fill="currentColor" className="text-white" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-green-700">Currently Active</p>
                                    <p className="text-[9px] text-green-600/70 font-medium">Visible to all users</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 border border-red-200">
                                    <XCircle size={16} fill="currentColor" className="text-white" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-red-700">Inactive</p>
                                    <p className="text-[9px] text-red-600/70 font-medium">Hidden from platforms</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Date Box */}
                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-2.5 group transition-all hover:bg-white hover:shadow-md">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Calendar size={14} />
                            <p className="text-[9px] font-black uppercase tracking-widest">Registration Date</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                                <Calendar size={15} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-800">
                                    {moment(chapter.created_at).format("MMM DD, YYYY")}
                                </p>
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">
                                    at {moment(chapter.created_at).format("hh:mm A")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChapterView;