import { useState } from 'react';
import toast from 'react-hot-toast';
import { useModal } from '../../context/ModalContext';
import { Video, Link as LinkIcon, Upload, Loader2, X, Image as ImageIcon, Clock } from 'lucide-react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { uploadCourseSampleVideo } from '../../store/slices/courceSlice';

type UploadMode = 'url' | 'file';

interface AssignSampleVideoFormProps {
    courseId: number | string;
}

const AssignSampleVideoForm: React.FC<AssignSampleVideoFormProps> = ({ courseId }) => {
    const [mode, setMode] = useState<UploadMode>('file'); // Default to file as per API requirement
    const [name, setName] = useState('');
    const [duration, setDuration] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [thumbPreviewUrl, setThumbPreviewUrl] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const { hideModal } = useModal();
    const dispatch = useAppDispatch();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const picked = e.target.files?.[0] ?? null;
        setFile(picked);
        if (picked) {
            setPreviewUrl(URL.createObjectURL(picked));
            
            // Auto-calculate duration
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                setDuration(Math.round(video.duration).toString());
            };
            video.src = URL.createObjectURL(picked);
        } else {
            setPreviewUrl(null);
            setDuration('');
        }
    };

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const picked = e.target.files?.[0] ?? null;
        setThumbnail(picked);
        if (picked) {
            setThumbPreviewUrl(URL.createObjectURL(picked));
        } else {
            setThumbPreviewUrl(null);
        }
    };

    const clearFile = () => {
        setFile(null);
        setPreviewUrl(null);
    };

    const clearThumbnail = () => {
        setThumbnail(null);
        setThumbPreviewUrl(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error('Please enter a video name.');
            return;
        }
        if (mode === 'file' && !duration) {
            toast.error('Waiting for video metadata... Please try again in a moment.');
            return;
        }
        if (!thumbnail) {
            toast.error('Please select a thumbnail image.');
            return;
        }

        if (mode === 'url' && !videoUrl.trim()) {
            toast.error('Please enter a video URL.');
            return;
        }
        if (mode === 'file' && !file) {
            toast.error('Please select a video file.');
            return;
        }

        try {
            setSaving(true);
            const formData = new FormData();
            formData.append('course_id', courseId.toString());
            formData.append('name', name);
            formData.append('duration', duration);
            formData.append('thumbnail', thumbnail);
            
            if (mode === 'file' && file) {
                formData.append('videos', file);
            } else if (mode === 'url') {
                formData.append('video_url', videoUrl);
            }

            const resultAction = await dispatch(uploadCourseSampleVideo(formData));
            if (uploadCourseSampleVideo.fulfilled.match(resultAction)) {
                toast.success('Sample video assigned successfully!');
                hideModal();
            } else {
                toast.error(resultAction.payload as string || 'Failed to assign sample video.');
            }
        } catch {
            toast.error('An unexpected error occurred.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Header info */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-violet-50 border border-violet-100">
                <span className="p-2 bg-violet-100 rounded-lg text-violet-600">
                    <Video size={18} />
                </span>
                <div>
                    <p className="text-sm font-semibold text-violet-800">Assign Sample Video</p>
                    <p className="text-xs text-violet-500 mt-0.5">Add a sample/preview video via URL or direct file upload.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Video Name</label>
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Course Introduction"
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder:text-gray-400 text-gray-700"
                    />
                </div>
            </div>

            {/* Thumbnail Upload */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Thumbnail Image</label>
                {!thumbnail ? (
                    <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition-all group">
                        <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-violet-100 group-hover:text-violet-600 transition-colors">
                            <ImageIcon size={20} className="text-gray-400 group-hover:text-violet-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600 group-hover:text-violet-700">Choose thumbnail...</p>
                            <p className="text-[10px] text-gray-400">JPG, PNG up to 2MB</p>
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />
                    </label>
                ) : (
                    <div className="flex items-center gap-4 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                        <img src={thumbPreviewUrl!} className="w-16 h-10 object-cover rounded-lg border border-gray-200" alt="Thumbnail preview" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-700 truncate">{thumbnail.name}</p>
                            <p className="text-[10px] text-gray-400">{(thumbnail.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button type="button" onClick={clearThumbnail} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                            <X size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
                <button
                    type="button"
                    onClick={() => setMode('file')}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${mode === 'file'
                            ? 'bg-white text-violet-700 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Upload size={13} /> Upload File
                </button>
                <button
                    type="button"
                    onClick={() => setMode('url')}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${mode === 'url'
                            ? 'bg-white text-violet-700 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <LinkIcon size={13} /> Video URL
                </button>
            </div>

            {/* URL Input */}
            {mode === 'url' && (
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                        Video URL
                    </label>
                    <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all placeholder:text-gray-400 text-gray-700"
                    />
                </div>
            )}

            {/* File Upload */}
            {mode === 'file' && (
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                        Video File
                    </label>

                    {!file ? (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-violet-200 rounded-xl cursor-pointer bg-violet-50/50 hover:bg-violet-50 transition-all group">
                            <Upload size={24} className="text-violet-400 mb-2 group-hover:text-violet-600 transition-colors" />
                            <p className="text-sm font-medium text-violet-500 group-hover:text-violet-700">
                                Click to upload video
                            </p>
                            <p className="text-[10px] text-gray-400 mt-1">MP4, MOV up to 500MB</p>
                            <input
                                type="file"
                                accept="video/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </label>
                    ) : (
                        <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-black">
                            <video
                                src={previewUrl!}
                                controls
                                className="w-full max-h-40 object-contain"
                            />
                            <button
                                type="button"
                                onClick={clearFile}
                                className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black/80 rounded-full text-white transition-all"
                            >
                                <X size={14} />
                            </button>
                            <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                                <p className="text-[10px] font-medium text-gray-600 truncate max-w-[200px]">{file.name}</p>
                                <p className="text-[10px] text-gray-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button
                    type="button"
                    onClick={hideModal}
                    className="px-5 py-2 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm flex items-center gap-2"
                >
                    {saving && <Loader2 size={14} className="animate-spin" />}
                    {saving ? 'Saving...' : 'Assign Video'}
                </button>
            </div>
        </form>
    );
};

export default AssignSampleVideoForm;
