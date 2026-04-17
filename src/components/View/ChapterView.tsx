import {
    Calendar,
    Video,
    Book,
    Clock,
    LayoutList,
    Search,
    Info,
    X,
    FileText
} from "lucide-react";
import moment from "moment";
import { useEffect, useState, useMemo } from "react";
import { fetchChapterViewData } from "../../services/apiServices";

type AssignedLecture = {
    assignedId: string;
    id: number;
    name: string;
    type: 'video' | 'ebook';
    duration?: number;
    fileUrl?: string;
    order?: number;
};

type Chapter = {
    id: number;
    name: string;
    description?: string;
    status: boolean;
    created_at: string;
    chapter_lectures: any[];
};

const ChapterView = ({ chapterData }: { chapterData: any }) => {
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [previewItem, setPreviewItem] = useState<AssignedLecture | null>(null);

    const handleFetchChapter = async (id: number) => {
        setLoading(true);
        try {
            const res = await fetchChapterViewData(id);
            const responseData = res.data || res;
            setChapter(responseData);
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

    const mappedLectures = useMemo(() => {
        if (!chapter) return [];
        const raw = chapter.chapter_lectures || [];
        return raw.map((item: any) => {
            const isVideo = item.lecture_type === 1;
            const asset = isVideo ? item.video : item.ebook;
            return {
                assignedId: `item-${item.id}`,
                id: asset?.id || 0,
                name: asset?.name || asset?.title || "Untitled Asset",
                type: isVideo ? ('video' as const) : ('ebook' as const),
                duration: isVideo ? (asset?.video_duration || asset?.duration) : undefined,
                fileUrl: isVideo ? asset?.video_file : asset?.ebook_file,
                order: item.order
            };
        }).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    }, [chapter]);

    const filteredLectures = useMemo(() => {
        return mappedLectures.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [mappedLectures, searchTerm]);

    const stats = useMemo(() => {
        const videos = mappedLectures.filter(l => l.type === 'video');
        const totalSeconds = videos.reduce((acc, v) => acc + (v.duration || 0), 0);
        return {
            total: mappedLectures.length,
            videoCount: videos.length,
            ebookCount: mappedLectures.length - videos.length,
            totalTime: `${Math.floor(totalSeconds / 3600)}h ${Math.floor((totalSeconds % 3600) / 60)}m`
        };
    }, [mappedLectures]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 min-h-[500px]">
                <div className="w-5 h-5 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!chapter) return null;

    return (
        <div className="bg-white min-h-[600px] max-h-[85vh] flex overflow-hidden font-sans text-slate-900 border border-slate-100 rounded-3xl animate-in fade-in duration-500 relative">

            {/* Sidebar (Left) */}
            <div className="w-[320px] border-r border-slate-100 p-8 flex flex-col bg-slate-50/30">
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Asset ID: {chapter.id}</span>
                    </div>
                    <h1 className="text-xl font-semibold tracking-tight leading-tight mb-2">{chapter.name}</h1>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${chapter.status ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>
                        <div className={`w-1 h-1 rounded-full ${chapter.status ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                        {chapter.status ? "Status: Live" : "Status: Draft"}
                    </div>
                </div>

                <div className="space-y-6 mb-10">
                    <div>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Metrics Overview</span>
                        <div className="space-y-3">
                            {[
                                { label: "Total Asset", val: stats.total, icon: LayoutList },
                                { label: "Video Count", val: stats.videoCount, icon: Video },
                                { label: "Ebook Count", val: stats.ebookCount, icon: Book },
                                { label: "Est. Time", val: stats.totalTime, icon: Clock }
                            ].map((s, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <s.icon size={13} />
                                        <span className="text-[10px] font-medium">{s.label}</span>
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-900">{s.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-auto space-y-4">
                    <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <span className="block text-[9px] text-slate-400 font-bold uppercase mb-2">Timeline Metadata</span>
                        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-700">
                            <Calendar size={13} className="text-blue-500" />
                            Registered {moment(chapter.created_at).format("MMM DD, YYYY")}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content (Right) */}
            <div className="flex-1 flex flex-col">
                {/* Search / Filter Bar */}
                <div className="h-[72px] border-b border-slate-100 px-10 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-3 flex-1 max-w-md">
                        <Search size={14} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Filter curriculum by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none outline-none text-[11px] placeholder:text-slate-300 w-full"
                        />
                    </div>
                </div>

                {/* List Area */}
                <div className="flex-1 overflow-y-auto p-10 bg-white">
                    <div className="flex items-center gap-3 mb-10">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Curriculum Structure</h2>
                        <div className="h-[1px] flex-1 bg-slate-100"></div>
                    </div>

                    <div className="space-y-px bg-slate-100 rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                        {filteredLectures.length > 0 ? (
                            filteredLectures.map((item, idx) => (
                                <div
                                    key={item.assignedId}
                                    onClick={() => setPreviewItem(item)}
                                    className="group flex items-center gap-6 py-4 px-6 bg-white hover:bg-slate-50/50 transition-all duration-300 cursor-pointer"
                                >
                                    <div className="w-8 text-[11px] font-mono text-slate-300 group-hover:text-slate-900">
                                        {String(idx + 1).padStart(2, '0')}
                                    </div>

                                    <div className={`p-1.5 rounded-lg border ${item.type === 'video'
                                            ? 'bg-blue-50 text-blue-500 border-blue-100'
                                            : 'bg-emerald-50 text-emerald-500 border-emerald-100'
                                        }`}>
                                        {item.type === 'video' ? <Video size={14} /> : <Book size={14} />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-[13px] font-medium text-slate-700 group-hover:text-slate-900 transition-colors truncate">
                                            {item.name}
                                        </h4>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        {item.duration && (
                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-300 font-bold uppercase tracking-widest whitespace-nowrap">
                                                <Clock size={11} />
                                                {Math.floor(item.duration / 60)}m {item.duration % 60}s
                                            </div>
                                        )}
                                        <div className="w-[1px] h-4 bg-slate-100"></div>
                                        <div className="p-1 px-2 rounded-md bg-slate-50 text-[9px] font-bold text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all uppercase tracking-widest">
                                            Preview
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-24 text-center bg-white flex flex-col items-center justify-center gap-3">
                                <Info size={32} className="text-slate-100" />
                                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No matching curriculum items</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Preview Overlay */}
            {previewItem && (
                <div className="absolute inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex flex-col animate-in fade-in duration-300">
                    <div className="h-16 flex items-center justify-between px-8 border-b border-white/10">
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${previewItem.type === 'video' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'}`}>
                                {previewItem.type === 'video' ? <Video size={16} /> : <Book size={16} />}
                            </div>
                            <div>
                                <h3 className="text-white text-sm font-medium">{previewItem.name}</h3>
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Preview Mode • {previewItem.type}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setPreviewItem(null)}
                            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 flex items-center justify-center p-12 overflow-hidden">
                        {previewItem.fileUrl ? (
                            <div className="w-full h-full max-w-6xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                                {previewItem.type === 'video' ? (
                                    <video
                                        src={previewItem.fileUrl}
                                        controls
                                        autoPlay
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <iframe
                                        src={`${previewItem.fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                                        className="w-full h-full border-none"
                                        title={previewItem.name}
                                    />
                                )}
                            </div>
                        ) : (
                            <div className="text-center text-white/40">
                                <FileText size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="text-sm font-medium">Source file not found</p>
                                <p className="text-[10px] uppercase font-bold tracking-widest mt-2">Check media library configuration</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChapterView;