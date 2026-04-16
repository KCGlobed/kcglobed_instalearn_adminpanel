import { useEffect, useState } from "react";
import { videoDetailApi } from "../../services/apiServices";
import {
    PlayCircle,
    Clock,
    Calendar,
    CheckCircle,
    XCircle,
    Info,
    FileVideo,
    UploadCloud,
    Hash,
    AlignLeft,
} from "lucide-react";
import moment from "moment";

const VideoView = ({ id }: { id: string | number }) => {
    const [videoData, setVideoData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const handleFetch = async () => {
        setLoading(true);
        try {
            const res = await videoDetailApi(id);
            setVideoData(res.data);
        } catch (error) {
            console.error("Failed to fetch video data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            handleFetch();
        }
    }, [id]);

    /** Format seconds → mm:ss or hh:mm:ss */
    const formatDuration = (seconds: number | string | null | undefined) => {
        if (!seconds && seconds !== 0) return "—";
        const s = Number(seconds);
        if (isNaN(s)) return "—";
        return moment.utc(s * 1000).format(s >= 3600 ? "HH:mm:ss" : "mm:ss");
    };

    // ─── Loading ──────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4" />
                <p className="text-gray-500 font-medium animate-pulse">Loading video details...</p>
            </div>
        );
    }

    // ─── Empty ────────────────────────────────────────────────────────────────
    if (!videoData) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center text-red-500 min-h-[300px]">
                <Info size={48} className="mb-4 opacity-20" />
                <p className="font-bold text-lg">Video data not found</p>
            </div>
        );
    }

    const isActive = videoData.status === true || videoData.status === 1;
    const isUploaded = videoData.is_uploaded === true || videoData.is_uploaded === 1;
    const isCompleted = videoData.is_completed === true || videoData.is_completed === 1;

    return (
        <div className="flex flex-col lg:flex-row gap-6 p-1 max-h-[85vh] overflow-hidden">

            {/* ── Left: Metadata ─────────────────────────────────────────────── */}
            <div className="w-full lg:w-5/12 flex flex-col gap-5 overflow-y-auto pr-1 custom-scrollbar">

                {/* Header Card */}
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 shadow-sm">
                    {/* Icon + Title */}
                    <div className="flex items-start gap-4 mb-4">
                        <div className="p-3 bg-white rounded-xl text-indigo-600 shadow-sm border border-indigo-50 shrink-0">
                            <PlayCircle size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-bold text-gray-900 leading-tight truncate" title={videoData.name}>
                                {videoData.name}
                            </h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1 flex items-center gap-1">
                                <Hash size={10} /> {videoData.id}
                            </p>
                        </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        {isActive ? (
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wider border border-green-200">
                                <CheckCircle size={11} /> Active
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-bold uppercase tracking-wider border border-red-200">
                                <XCircle size={11} /> Inactive
                            </span>
                        )}

                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${isUploaded
                            ? "bg-blue-100 text-blue-700 border-blue-200"
                            : "bg-amber-100 text-amber-700 border-amber-200"
                            }`}>
                            <UploadCloud size={11} />
                            {isUploaded ? "Uploaded" : "Not Uploaded"}
                        </span>

                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${isCompleted
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                            : "bg-gray-100 text-gray-500 border-gray-200"
                            }`}>
                            <FileVideo size={11} />
                            {isCompleted ? "Processing Done" : "Processing..."}
                        </span>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200/60">
                        {/* Duration */}
                        <div className="flex items-start gap-2.5">
                            <div className="text-indigo-400 mt-0.5 shrink-0"><Clock size={15} /></div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Duration</p>
                                <p className="text-sm font-bold text-gray-800 tabular-nums">
                                    {formatDuration(videoData.video_duration)}
                                    <span className="text-[10px] font-medium text-gray-400 ml-1">min</span>
                                </p>
                            </div>
                        </div>

                        {/* Created At */}
                        <div className="flex items-start gap-2.5">
                            <div className="text-indigo-400 mt-0.5 shrink-0"><Calendar size={15} /></div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Added On</p>
                                <p className="text-sm font-semibold text-gray-700">
                                    {moment(videoData.created_at).format("MMM DD, YYYY")}
                                </p>
                                <p className="text-[10px] text-gray-400 font-medium">
                                    {moment(videoData.created_at).format("hh:mm A")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description Card */}
                {videoData.description && (
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                        <h3 className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                            <AlignLeft size={12} className="text-indigo-400" /> Description
                        </h3>
                        <p className="text-sm text-gray-600 font-medium leading-relaxed">
                            {videoData.description}
                        </p>
                    </div>
                )}

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        {
                            label: "Duration",
                            value: formatDuration(videoData.video_duration),
                            icon: <Clock size={16} />,
                            color: "indigo",
                        },
                        {
                            label: "Uploaded",
                            value: isUploaded ? "Yes" : "No",
                            icon: <UploadCloud size={16} />,
                            color: isUploaded ? "blue" : "amber",
                        },
                        {
                            label: "Status",
                            value: isActive ? "Active" : "Inactive",
                            icon: isActive ? <CheckCircle size={16} /> : <XCircle size={16} />,
                            color: isActive ? "green" : "red",
                        },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl border text-center bg-${stat.color}-50 border-${stat.color}-100`}
                        >
                            <span className={`text-${stat.color}-500`}>{stat.icon}</span>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{stat.label}</p>
                            <p className={`text-xs font-bold text-${stat.color}-700 tabular-nums`}>{stat.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Right: Video Player ─────────────────────────────────────────── */}
            <div className="w-full lg:w-7/12 flex flex-col gap-4">
                <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border-4 border-white flex flex-col">
                    {/* Fake browser bar */}
                    <div className="p-3 bg-gray-800 flex items-center justify-between border-b border-gray-700/50">
                        <div className="flex items-center gap-2 text-gray-300">
                            <PlayCircle size={15} />
                            <span className="text-xs font-bold truncate max-w-[200px]">{videoData.name}</span>
                        </div>
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                        </div>
                    </div>

                    {/* Player body */}
                    <div className="relative min-h-[300px] bg-black flex-1 flex items-center justify-center">
                        {!!videoData.video_file ? (
                            <video
                                src={videoData.video_file}
                                controls
                                className="w-full h-full max-h-[420px] object-contain"
                                preload="metadata"
                            />
                        ) : (
                            /* Placeholder when no playable URL is yet available */
                            <div className="flex flex-col items-center justify-center gap-4 py-16 px-8 text-center">
                                <div className="p-6 rounded-full bg-white/5 border border-white/10">
                                    <PlayCircle size={48} className="text-white/30" />
                                </div>
                                <div>
                                    <p className="text-white/70 font-bold text-sm">Video Preview Unavailable</p>
                                    <p className="text-white/40 text-xs mt-1">
                                        {isUploaded
                                            ? "Video is uploaded — direct stream URL not exposed via this API."
                                            : "This video hasn't been uploaded yet."}
                                    </p>
                                </div>

                                {/* Duration badge */}
                                {videoData.video_duration && (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/10 mt-2">
                                        <Clock size={13} className="text-indigo-400" />
                                        <span className="text-white/80 text-xs font-bold tabular-nums">
                                            {formatDuration(videoData.video_duration)} duration
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom caption strip */}
                <div className="flex items-center justify-between px-4 py-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-lg">
                            <FileVideo size={16} className="text-white" />
                        </div>
                        <div>
                            <p className="text-white text-xs font-bold truncate max-w-[220px]">{videoData.name}</p>
                            <p className="text-white/60 text-[10px] font-medium">
                                ID #{videoData.id}  ·  {formatDuration(videoData.video_duration)} min
                            </p>
                        </div>
                    </div>
                    <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full border ${isActive
                        ? "bg-white/20 text-white border-white/20"
                        : "bg-red-400/30 text-red-100 border-red-300/20"
                        }`}>
                        {isActive ? "● Active" : "○ Inactive"}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default VideoView;