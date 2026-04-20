import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Save,
    Clock,
    Trash2,
    ListChecks,
    Plus,
    ChevronUp,
    ChevronDown,
    Video,
    Book,
    GripVertical,
    Search,
    FileText,
    AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";
import { useForm, Controller } from "react-hook-form";
import { createAssignChapterLecture, fetchChapterViewData, getEbookListApi, getVideoListApi } from "../../services/apiServices";

// --- Types ---
type LectureType = 'video' | 'ebook';

interface BaseItem {
    assignedId: any;
    id: number;
    name: string;
    type: LectureType;
    duration?: number;
}

interface AssignedLecture extends BaseItem {
    assignedId: string;
}

interface FormValues {
    lectures: AssignedLecture[];
}

// --- Professional Sidebar Item ---
const SidebarItem = ({ item, onAdd }: { item: BaseItem, onAdd: (item: BaseItem) => void }) => {
    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData("item", JSON.stringify(item));
        e.dataTransfer.effectAllowed = "copy";
    };

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            className="flex items-center gap-3 p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl cursor-grab active:cursor-grabbing transition-all group shadow-sm hover:shadow-md"
        >
            <div className={`p-2 rounded-lg ${item.type === 'video' ? 'text-blue-600 bg-blue-50' : 'text-emerald-600 bg-emerald-50'}`}>
                {item.type === 'video' ? <Video size={16} /> : <Book size={16} />}
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate group-hover:text-slate-900">
                    {item.name}
                </p>
                {item.duration && (
                    <p className="text-[11px] text-slate-500 mt-0.5 font-semibold">
                        {Math.floor(item.duration / 60)}m {item.duration % 60}s
                    </p>
                )}
            </div>

            <button
                onClick={() => onAdd(item)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-600 text-slate-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
            >
                <Plus size={16} />
            </button>
        </div>
    );
};

// --- Clean Sidebar ---
const Sidebar = ({ title, items, type, loading, onAdd }: any) => {
    const [search, setSearch] = useState('');
    const filtered = items?.filter((i: any) => i?.name?.toLowerCase()?.includes(search.toLowerCase()));

    return (
        <div className="flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden h-[700px] shadow-sm">
            <div className="p-4 border-b border-slate-100 bg-slate-50/80">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        {type === 'video' ? <Video size={14} className="text-blue-600" /> : <Book size={14} className="text-emerald-600" />}
                        {title}
                    </h3>
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded-full text-slate-500 font-bold border border-slate-200">
                        {filtered.length}
                    </span>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                        type="text"
                        placeholder={`Search ${type}s...`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                {loading ? (
                    <div className="text-center py-10">
                        <div className="w-6 h-6 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Loading...</span>
                    </div>
                ) : filtered.length > 0 ? (
                    filtered.map((item: any) => <SidebarItem key={item.id} item={item} onAdd={onAdd} />)
                ) : (
                    <div className="text-center py-20 opacity-40">
                        <FileText size={32} className="mx-auto mb-2 text-slate-300" />
                        <p className="text-xs font-bold text-slate-500">No assets found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Main Application ---
const AssignChpaterLectureForm = () => {
    const { id: chapterId } = useParams();
    const navigate = useNavigate();

    const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
        defaultValues: { lectures: [] }
    });

    const assignedItems = watch("lectures");
    const [ebookList, setEbookList] = useState<BaseItem[]>([]);
    const [videoList, setVideoList] = useState<BaseItem[]>([]);
    const [chapterInfo, setChapterInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isOver, setIsOver] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!chapterId) return;
            try {
                setLoading(true);
                const [ebooks, videos, chapterRes] = await Promise.all([
                    getEbookListApi(),
                    getVideoListApi(),
                    fetchChapterViewData(String(chapterId))
                ]);

                // 1. Map Master Lists
                setEbookList((ebooks.data || []).map((b: any) => ({
                    id: Number(b.id),
                    name: b.name || b.title,
                    type: 'ebook' as const
                })));
                setVideoList((videos.data || []).map((v: any) => ({
                    id: Number(v.id),
                    name: v.name || v.title,
                    type: 'video' as const,
                    duration: v.video_duration || v.duration
                })));

                // 2. Map Existing Plan
                const responseData = chapterRes?.data || chapterRes;
                setChapterInfo(responseData);

                const rawLectures = responseData?.chapter_lectures || responseData?.assigned_lectures || responseData?.lectures || (Array.isArray(responseData) ? responseData : []);

                if (Array.isArray(rawLectures)) {
                    const mappedLectures: AssignedLecture[] = rawLectures.map((item: any) => {
                        const isVideo = item.lecture_type === 1;
                        const asset = isVideo ? item.video : item.ebook;

                        if (!asset) return null;

                        return {
                            assignedId: `existing-${item.id}`, // Unique ID for loop/removal
                            id: Number(asset.id),             // Asset ID for sidebar filtering
                            name: asset.name || asset.title,
                            type: isVideo ? 'video' : 'ebook',
                            duration: isVideo ? (asset.video_duration || asset.duration) : undefined
                        };
                    }).filter(Boolean) as AssignedLecture[];

                    setValue("lectures", mappedLectures, { shouldValidate: true });
                }

            } catch (error) {
                console.error("Fetch Error:", error);
                toast.error("Failed to fetch chapter assets");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [chapterId, setValue]);

    const availableVideos = useMemo(() => {
        return videoList.filter(v => !assignedItems.some(i => Number(i.id) === Number(v.id) && i.type === 'video'));
    }, [videoList, assignedItems]);

    const availableEbooks = useMemo(() => {
        return ebookList.filter(e => !assignedItems.some(i => Number(i.id) === Number(e.id) && i.type === 'ebook'));
    }, [ebookList, assignedItems]);

    const totalDuration = useMemo(() => {
        const seconds = assignedItems.reduce((acc, item) => acc + (item.duration || 0), 0);
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    }, [assignedItems]);

    const addLecture = (item: BaseItem) => {
        if (assignedItems.find(i => Number(i.id) === Number(item.id) && i.type === item.type)) {
            toast.error("This item is already in your plan");
            return;
        }
        setValue("lectures", [...assignedItems, { ...item, assignedId: `${item.type}-${item.id}-${Date.now()}` }], { shouldValidate: true });
        toast.success(`Added to plan`, { icon: '✅' });
    };

    const removeLecture = (assignedId: string) => {
        const newLectures = assignedItems.filter(i => i.assignedId !== assignedId);
        setValue("lectures", newLectures, { shouldValidate: true });
        toast.success("Removed from plan");
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsOver(false);
        try {
            const item: BaseItem = JSON.parse(e.dataTransfer.getData("item"));
            if (item.assignedId) return;
            addLecture(item);
        } catch (err) { }
    };

    const moveItem = (index: number, direction: 'up' | 'down') => {
        const newItems = [...assignedItems];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newItems.length) return;
        [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
        setValue("lectures", newItems);
    };

    const onSubmit = async (data: FormValues) => {
        console.log(data.lectures, "check data")
        const payload = {
            chapter: Number(chapterId),
            lecture_list: data.lectures.map(i => ({
                lecture_type: i.type === 'video' ? 1 : 2,
                [i.type === 'video' ? 'video' : 'book']: i.id
            }))
        };
        const res = await createAssignChapterLecture(payload);
        if (res.status) {
            toast.success(res.message);
            setTimeout(() => {
                navigate("/dashboard/chapter");
            }, 1000);
        } else {
            toast.error(res.message);
        }
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 1500)),
            {
                loading: 'Processing plan...',
                success: 'Lecture configuration saved',
                error: 'Failed to save configuration'
            }
        );
    };







    return (
        <div className="min-h-screen  text-slate-600 selection:bg-blue-600/10 ">
            {/* Header: Clean & Professional */}
            <div className="max-w-[1600px] mx-auto mb-8 bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-5">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 text-slate-500 active:scale-95 shadow-sm"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Chapter Settings</span>
                            <span className="text-slate-300">/</span>
                            <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest">Assign Lectures</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            {loading ? (
                                <div className="h-8 w-64 bg-slate-50 animate-pulse rounded-lg" />
                            ) : (
                                chapterInfo?.name ? `Edit: ${chapterInfo.name}` : 'Configure Chapter Lectures'
                            )}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-8 pr-2">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-1">Estimated Total Time</span>
                        <div className="flex items-center gap-2 text-slate-900 font-mono text-lg font-black">
                            <Clock size={16} className="text-blue-600" />
                            {totalDuration}
                        </div>
                    </div>
                    <div className="w-[1px] h-10 bg-slate-200" />
                    <button
                        onClick={handleSubmit(onSubmit)}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <Save size={18} /> Save Changes
                    </button>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto grid grid-cols-12 gap-6 items-start">
                {/* Left Panel */}
                <div className="col-span-3">
                    <Sidebar title="Available Videos" items={availableVideos} type="video" loading={loading} onAdd={addLecture} />
                </div>

                {/* Center Panel (Plan) */}
                <div className="col-span-6 flex flex-col gap-4">
                    <div className={`bg-white rounded-2xl border transition-all duration-300 shadow-sm overflow-hidden min-h-[700px] flex flex-col ${errors.lectures ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-200'
                        }`}>
                        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-1.5 rounded-lg ${errors.lectures ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                    <ListChecks size={18} />
                                </div>
                                <span className={`text-xs font-black uppercase tracking-widest ${errors.lectures ? 'text-red-700' : 'text-slate-800'}`}>
                                    {errors.lectures ? 'Validation Error: No Lectures Added' : `Chapter Plan (${assignedItems.length} items)`}
                                </span>
                            </div>
                            <button
                                onClick={() => setValue("lectures", [])}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <div
                            onDragOver={(e) => { e.preventDefault(); setIsOver(true); }}
                            onDragLeave={() => setIsOver(false)}
                            onDrop={handleDrop}
                            className={`flex-1 p-5 space-y-3 overflow-y-auto transition-colors ${isOver ? 'bg-blue-50/50' : ''}`}
                        >
                            <Controller
                                name="lectures"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <>
                                        {field.value.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full min-h-[400px] border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/30 text-slate-400 gap-4">
                                                <div className={`p-4 rounded-full border border-slate-200 ${isOver ? 'text-blue-600 border-blue-200 bg-blue-50' : 'text-slate-300 bg-white shadow-inner'}`}>
                                                    <Plus size={32} />
                                                </div>
                                                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Drag lectures here to build chapter</p>
                                                {errors.lectures && (
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-red-600 uppercase tracking-widest bg-red-50 px-4 py-2 rounded-full border border-red-100">
                                                        <AlertCircle size={12} /> Minimum 1 lecture required
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            field.value.map((item: any, idx: number) => (
                                                <div
                                                    key={item.assignedId}
                                                    draggable
                                                    onDragStart={(e) => {
                                                        e.dataTransfer.setData("dragIndex", idx.toString());
                                                        e.dataTransfer.setData("item", JSON.stringify(item));
                                                        e.dataTransfer.effectAllowed = "move";
                                                    }}
                                                    onDragOver={(e) => {
                                                        e.preventDefault();
                                                        e.currentTarget.classList.add('border-blue-400', 'bg-blue-50/50');
                                                    }}
                                                    onDragLeave={(e) => {
                                                        e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50/50');
                                                    }}
                                                    onDrop={(e) => {
                                                        e.preventDefault();
                                                        e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50/50');
                                                        const dragSrc = e.dataTransfer.getData("dragIndex");
                                                        if (!dragSrc || dragSrc === idx.toString()) return;

                                                        const newArr = [...field.value];
                                                        const [removed] = newArr.splice(parseInt(dragSrc), 1);
                                                        newArr.splice(idx, 0, removed);
                                                        setValue("lectures", newArr, { shouldValidate: true });
                                                    }}
                                                    className="flex items-center gap-4 p-3.5 bg-white border border-slate-200 rounded-xl group transition-all hover:border-slate-400 cursor-move shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md"
                                                >
                                                    <div className="text-slate-300 group-hover:text-blue-600 transition-colors cursor-move">
                                                        <GripVertical size={18} />
                                                    </div>

                                                    <div className={`p-2 rounded-lg ${item.type === 'video' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                                                        }`}>
                                                        {item.type === 'video' ? <Video size={18} /> : <Book size={18} />}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${item.type === 'video' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                                }`}>
                                                                {item.type.toUpperCase()}
                                                            </span>
                                                            {item.duration && (
                                                                <span className="text-[10px] text-slate-500 font-bold">
                                                                    {Math.floor(item.duration / 60)}m {item.duration % 60}s
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h4 className="text-sm font-bold text-slate-800 truncate">{item.name}</h4>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <div className="flex border border-slate-200 rounded-lg bg-slate-50 shadow-inner">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); moveItem(idx, 'up'); }}
                                                                className="p-1 px-1.5 text-slate-400 hover:text-blue-600 disabled:opacity-0 transition-all border-r border-slate-200"
                                                                disabled={idx === 0}
                                                            ><ChevronUp size={16} /></button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); moveItem(idx, 'down'); }}
                                                                className="p-1 px-1.5 text-slate-400 hover:text-blue-600 disabled:opacity-0 transition-all"
                                                                disabled={idx === field.value.length - 1}
                                                            ><ChevronDown size={16} /></button>
                                                        </div>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); removeLecture(item.assignedId); }}
                                                            className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </>
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="col-span-3">
                    <Sidebar title="Available Ebooks" items={availableEbooks} type="ebook" loading={loading} onAdd={addLecture} />
                </div>
            </div>
        </div>
    );
};

export default AssignChpaterLectureForm;


