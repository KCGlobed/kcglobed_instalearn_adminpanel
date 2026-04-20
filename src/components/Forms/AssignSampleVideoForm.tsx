import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useModal } from '../../context/ModalContext';
import { Video, Upload, Loader2, X, Image as ImageIcon, Clock, FileText, AlertCircle, Play, Trash2 } from 'lucide-react';
import { assignSampleVideoApi, fetchCourseDetailApi, deleteSampleVideoApi } from '../../services/apiServices';

interface AssignSampleVideoFormProps {
    courseId: number | string;
}

interface SampleVideoFormData {
    name: string;
    duration: string;
}

const AssignSampleVideoForm: React.FC<AssignSampleVideoFormProps> = ({ courseId }) => {
    // ─── Form Setup ─────────────────────────────────────────────────────────────
    const { register, handleSubmit, setValue, formState: { errors } } = useForm<SampleVideoFormData>();

    // ─── State for Files & Previews ──────────────────────────────────────────────
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [videoPreview, setVideoPreview] = useState<string | null>(null);
    const [thumbPreview, setThumbPreview] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'assign' | 'view'>('assign');
    const [existingVideos, setExistingVideos] = useState<any[]>([]);
    const [fetching, setFetching] = useState(false);
    const [playingIdx, setPlayingIdx] = useState<number | null>(null);

    const { hideModal } = useModal();

    const fetchExistingVideos = async () => {
        setFetching(true);
        try {
            const res = await fetchCourseDetailApi(courseId);
            console.log(res)
            if (res.status && res.data) {
                const videos = res.data.sample_videos || [];
                setExistingVideos(videos);
                if (videos.length > 0 && playingIdx === null) {
                    setPlayingIdx(0);
                }
            }
        } catch (error) {
            console.error("Failed to fetch existing videos", error);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'view') {
            fetchExistingVideos();
        }
    }, [activeTab]);

    const handleDelete = async (e: React.MouseEvent, id: string | number) => {
        e.stopPropagation(); // Don't trigger 'select' when clicking delete
        if (!window.confirm('Are you sure you want to delete this sample video?')) return;

        try {
            const res = await deleteSampleVideoApi(id);
            if (res.status) {
                toast.success('Sample video deleted');
                fetchExistingVideos(); // Refresh library
            } else {
                toast.error(res.message || 'Failed to delete');
            }
        } catch (error) {
            toast.error('Error deleting video');
        }
    };

    // Cleanup object URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            if (videoPreview) URL.revokeObjectURL(videoPreview);
            if (thumbPreview) URL.revokeObjectURL(thumbPreview);
        };
    }, [videoPreview, thumbPreview]);

    // ─── Handlers ───────────────────────────────────────────────────────────────

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const picked = e.target.files?.[0] ?? null;
        setVideoFile(picked);
        if (picked) {
            const url = URL.createObjectURL(picked);
            setVideoPreview(url);

            // Auto-calculate duration
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                const dur = Math.round(video.duration).toString();
                setValue('duration', dur, { shouldValidate: true });
            };
            video.src = url;
        } else {
            setVideoPreview(null);
            setValue('duration', '', { shouldValidate: true });
        }
    };

    const handleThumbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const picked = e.target.files?.[0] ?? null;
        setThumbnail(picked);
        if (picked) {
            setThumbPreview(URL.createObjectURL(picked));
        } else {
            setThumbPreview(null);
        }
    };

    const clearVideo = () => {
        setVideoFile(null);
        setVideoPreview(null);
        setValue('duration', '', { shouldValidate: true });
    };

    const clearThumb = () => {
        setThumbnail(null);
        setThumbPreview(null);
    };

    const onSubmit = async (data: SampleVideoFormData) => {
        // Additional file validation
        if (!videoFile) return toast.error('Please select a video file.');
        if (!thumbnail) return toast.error('Please select a thumbnail image.');

        try {
            setSaving(true);

            const formData = new FormData();
            formData.append('course_id', String(courseId));
            formData.append('name', data.name);
            formData.append('duration', data.duration);
            formData.append('videos', videoFile);
            formData.append('thumbnail', thumbnail);

            const res = await assignSampleVideoApi(formData);

            if (res.status) {
                toast.success(res.message || 'Sample video assigned successfully!');
                hideModal();
            } else {
                toast.error(res.message || 'Failed to assign sample video.');
            }
        } catch (error) {
            console.error("Submission Error:", error);
            toast.error('Failed to assign sample video. Please check your connection.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 max-h-[85vh] overflow-y-auto px-1">
            {/* ─── Header Section ─── */}
            <div className="flex items-center justify-between p-5 rounded-2xl bg-indigo-50 border border-indigo-100 shadow-sm transition-all duration-300">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl text-indigo-600 shadow-sm border border-indigo-100">
                        <Video size={20} className="animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                            {activeTab === 'assign' ? 'Assign Sample Video' : 'View Sample Videos'}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            {activeTab === 'assign' ? 'Upload a new preview video' : 'Review currently assigned preview materials'}
                        </p>
                    </div>
                </div>
            </div>

            {/* ─── Modern Tab Toggle ─── */}
            <div className="flex p-1.5 bg-slate-100/80 rounded-2xl w-full">
                <button
                    onClick={() => setActiveTab('assign')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'assign'
                        ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-100'
                        : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    <Upload size={14} /> Assign Video
                </button>
                <button
                    onClick={() => setActiveTab('view')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'view'
                        ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-100'
                        : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    <Video size={14} /> View Videos
                </button>
            </div>

            {activeTab === 'assign' ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    {/* ─── Information Fields ─── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                <FileText size={12} className="text-indigo-400" /> Video Name
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    {...register('name', { required: 'Video name is required' })}
                                    placeholder="e.g. Course Introduction"
                                    className={`w-full px-4 py-3 bg-white border rounded-2xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300 text-slate-600 shadow-sm ${errors.name ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
                                        }`}
                                />
                                {errors.name && (
                                    <span className="flex items-center gap-1 mt-1 text-[10px] font-bold text-rose-500 ml-1">
                                        <AlertCircle size={10} /> {errors.name.message}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                <Clock size={12} className="text-indigo-400" /> Duration (Secs) {videoFile && !thumbnail && <span className="text-[8px] text-indigo-500 animate-pulse">(Calculating...)</span>}
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    {...register('duration', { required: 'Duration is required' })}
                                    placeholder="Auto-calculated"
                                    className={`w-full px-4 py-3 bg-white border rounded-2xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300 text-slate-600 shadow-sm ${errors.duration ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
                                        }`}
                                />
                                {errors.duration && (
                                    <span className="flex items-center gap-1 mt-1 text-[10px] font-bold text-rose-500 ml-1">
                                        <AlertCircle size={10} /> {errors.duration.message}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ─── File Uploads ─── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Thumbnail Upload */}
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Cover Image
                            </label>
                            {!thumbnail ? (
                                <label className={`flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-[2rem] cursor-pointer bg-slate-50 hover:bg-slate-100/50 transition-all group overflow-hidden ${!thumbnail && errors.duration ? 'border-rose-200' : 'border-slate-200 hover:border-indigo-300'
                                    }`}>
                                    <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                                        <ImageIcon size={24} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                    </div>
                                    <p className="text-xs font-bold text-slate-500 mt-4 group-hover:text-indigo-600">Upload Thumbnail</p>
                                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">JPG, PNG up to 2MB</p>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleThumbChange} />
                                </label>
                            ) : (
                                <div className="relative h-44 rounded-[2rem] overflow-hidden border border-slate-200 bg-slate-100 group shadow-lg">
                                    <img src={thumbPreview!} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-4">
                                        <p className="text-[10px] font-bold text-white truncate max-w-full drop-shadow-md">{thumbnail.name}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={clearThumb}
                                        className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-md rounded-xl text-rose-500 shadow-xl hover:bg-rose-500 hover:text-white transition-all transform hover:-translate-y-0.5"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Video Upload */}
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Video Source
                            </label>
                            {!videoFile ? (
                                <label className={`flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-[2rem] cursor-pointer bg-slate-50 hover:bg-slate-100/50 transition-all group overflow-hidden ${!videoFile && errors.duration ? 'border-rose-200' : 'border-slate-200 hover:border-indigo-300'
                                    }`}>
                                    <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                                        <Video size={24} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                    </div>
                                    <p className="text-xs font-bold text-slate-500 mt-4 group-hover:text-indigo-600">Select Video File</p>
                                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">MP4, MOV up to 200MB</p>
                                    <input type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
                                </label>
                            ) : (
                                <div className="relative h-44 rounded-[2rem] overflow-hidden border border-slate-200 bg-black group shadow-lg">
                                    <video src={videoPreview!} controls className="w-full h-full object-contain" />
                                    <div className="absolute top-3 right-3 flex gap-2">
                                        <button
                                            type="button"
                                            onClick={clearVideo}
                                            className="p-2 bg-white/90 backdrop-blur-md rounded-xl text-rose-500 shadow-xl hover:bg-rose-500 hover:text-white transition-all transform hover:-translate-y-0.5 pointer-events-auto"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ─── Actions ─── */}
                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={hideModal}
                            disabled={saving}
                            className="px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-3 px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 hover:shadow-indigo-300 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
                        >
                            {saving ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Uploading Data...
                                </>
                            ) : (
                                <>
                                    <Upload size={16} />
                                    Publish Video
                                </>
                            )}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="flex flex-col lg:flex-row gap-6 min-h-[450px] max-h-[600px] bg-white rounded-3xl overflow-hidden border border-slate-100 p-2">
                    {fetching ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-20">
                            <Loader2 size={32} className="text-indigo-500 animate-spin mb-4" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Gathering Workspace...</p>
                        </div>
                    ) : existingVideos.length > 0 ? (
                        <>
                            {/* Left side (Grid 1): Playlist */}
                            <div className="flex-[0.8] overflow-y-auto pr-2 custom-scrollbar space-y-4 py-2">
                                <div className="px-3 py-1 bg-slate-50 rounded-lg inline-block">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Course Curriculum Library</p>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {existingVideos.map((item, idx) => {
                                        const isActive = playingIdx === idx || (playingIdx === null && idx === 0);
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => setPlayingIdx(idx)}
                                                className={`group relative flex items-center gap-4 p-3 rounded-2xl border transition-all duration-500 text-left ${isActive
                                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100 -translate-y-1'
                                                    : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/30'
                                                    }`}
                                            >
                                                <div className="w-20 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 relative shadow-inner">
                                                    {item.thumbnail ? (
                                                        <img src={item.thumbnail} className="w-full h-full object-cover" alt={item.name} />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-200">
                                                            <Video size={16} />
                                                        </div>
                                                    )}
                                                    {isActive && (
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                            <div className="flex gap-0.5">
                                                                <div className="w-1 h-3 bg-white rounded-full animate-bounce [animation-duration:0.6s]"></div>
                                                                <div className="w-1 h-4 bg-white rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.1s]"></div>
                                                                <div className="w-1 h-2 bg-white rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.2s]"></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-800'}`}>
                                                        {item.name}
                                                    </h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`text-[9px] font-black uppercase tracking-tighter ${isActive ? 'text-indigo-200' : 'text-indigo-500'}`}>
                                                            {item.duration}s
                                                        </span>
                                                        <span className={isActive ? 'text-indigo-300' : 'text-slate-200'}>•</span>
                                                        <span className={`text-[9px] font-bold uppercase truncate ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>
                                                            {item.videos?.split('/').pop()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        onClick={(e) => handleDelete(e, item.id)}
                                                        className={`p-2 rounded-xl transition-all ${isActive
                                                            ? 'bg-white/10 text-white hover:bg-red-500'
                                                            : 'bg-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50'
                                                            }`}
                                                        title="Delete Library Asset"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                    <div className={`p-2 rounded-xl transition-all ${isActive
                                                        ? 'bg-white/20 text-white'
                                                        : 'bg-slate-50 text-slate-300 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                                                        }`}>
                                                        {isActive ? <Video size={14} className="fill-white" /> : <Play size={14} />}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Right side (Grid 2): Dynamic Player */}
                            <div className="flex-1 flex flex-col gap-4">
                                {existingVideos[playingIdx ?? 0] ? (
                                    <div className="sticky top-0 space-y-4">
                                        <div className="relative group rounded-[2rem] overflow-hidden bg-black shadow-2xl aspect-video ring-4 ring-indigo-50 border border-slate-200">
                                            <video
                                                key={existingVideos[playingIdx ?? 0].videos}
                                                src={existingVideos[playingIdx ?? 0].videos}
                                                controls
                                                autoPlay
                                                className="w-full h-full object-contain"
                                            />
                                            <div className="absolute top-4 left-4">
                                                <div className="px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-xl border border-white/20 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Active Draft</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-6 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1">Asset Information</p>
                                                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                                                        {existingVideos[playingIdx ?? 0].name}
                                                    </h4>
                                                </div>
                                                <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                                                    <Play size={16} className="text-indigo-600 fill-indigo-600" />
                                                </div>
                                            </div>
                                            <div className="mt-6 flex items-center gap-6">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Duration</span>
                                                    <span className="text-xs font-bold text-slate-700">{existingVideos[playingIdx ?? 0].duration} Seconds</span>
                                                </div>
                                                <div className="w-px h-8 bg-slate-200"></div>
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Source</span>
                                                    <span className="text-xs font-bold text-slate-700 truncate max-w-[150px]">
                                                        {existingVideos[playingIdx ?? 0].videos?.split('/').pop()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center group">
                                        <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                            <Video size={32} className="text-slate-200" />
                                        </div>
                                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Preview Unvailable</h4>
                                        <p className="text-[11px] text-slate-400/80 mt-2 leading-relaxed">Please select a valid video from the curriculum library to begin reviewing.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center py-24 text-center px-10">
                            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6">
                                <Video size={32} className="text-slate-200" />
                            </div>
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Library Found</h4>
                            <p className="text-[11px] text-slate-400 mt-2">Initialize your course material in the upload tab.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AssignSampleVideoForm;
