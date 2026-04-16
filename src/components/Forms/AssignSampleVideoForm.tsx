import { useState } from 'react';
import toast from 'react-hot-toast';
import { useModal } from '../../context/ModalContext';
import { Video, Link as LinkIcon, Upload, Loader2, X } from 'lucide-react';

type UploadMode = 'url' | 'file';

interface AssignSampleVideoFormProps {
    courseId: number | string;
}

const AssignSampleVideoForm: React.FC<AssignSampleVideoFormProps> = ({ courseId }) => {
    const [mode, setMode] = useState<UploadMode>('url');
    const [videoUrl, setVideoUrl] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const { hideModal } = useModal();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const picked = e.target.files?.[0] ?? null;
        setFile(picked);
        if (picked) {
            setPreviewUrl(URL.createObjectURL(picked));
        } else {
            setPreviewUrl(null);
        }
    };

    const clearFile = () => {
        setFile(null);
        setPreviewUrl(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

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
            // TODO: call your assign-sample-video API here
            // const formData = new FormData();
            // if (mode === 'url') formData.append('video_url', videoUrl);
            // if (mode === 'file' && file) formData.append('video_file', file);
            // await assignSampleVideoApi(courseId, formData);
            console.log('Assigning sample video:', {
                courseId,
                mode,
                videoUrl: mode === 'url' ? videoUrl : undefined,
                file: mode === 'file' ? file?.name : undefined,
            });
            toast.success('Sample video assigned successfully!');
            hideModal();
        } catch {
            toast.error('Failed to assign sample video.');
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

            {/* Mode Toggle */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
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

                    {/* Inline URL preview */}
                    {videoUrl.trim() && (
                        <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 bg-black aspect-video">
                            <iframe
                                src={videoUrl.replace('watch?v=', 'embed/')}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title="Sample video preview"
                            />
                        </div>
                    )}
                </div>
            )}

            {/* File Upload */}
            {mode === 'file' && (
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                        Video File
                    </label>

                    {!file ? (
                        <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-violet-200 rounded-xl cursor-pointer bg-violet-50/50 hover:bg-violet-50 transition-all group">
                            <Upload size={24} className="text-violet-400 mb-2 group-hover:text-violet-600 transition-colors" />
                            <p className="text-sm font-medium text-violet-500 group-hover:text-violet-700">
                                Click to upload video
                            </p>
                            <p className="text-xs text-gray-400 mt-1">MP4, MOV, AVI up to 500MB</p>
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
                                className="w-full max-h-48 object-contain"
                            />
                            <button
                                type="button"
                                onClick={clearFile}
                                className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black/80 rounded-full text-white transition-all"
                            >
                                <X size={14} />
                            </button>
                            <div className="px-3 py-2 bg-gray-50 border-t border-gray-200">
                                <p className="text-xs font-medium text-gray-600 truncate">{file.name}</p>
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
