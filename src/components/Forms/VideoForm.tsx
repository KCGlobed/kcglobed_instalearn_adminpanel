import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useModal } from '../../context/ModalContext';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { createVideo, updateVideoApi, markVideoCompleteApi, videoDetailApi } from '../../services/apiServices';
import { getVideoListing } from '../../store/slices/videoSlice';
import toast from 'react-hot-toast';
import { UploadCloud, CheckCircle2, Clock } from 'lucide-react';
import type { CourseVideo } from '../../utils/types';

type VideoFormValues = {
    name: string;
    description: string;
    duration: number;
    video: FileList | null;
};

interface VideoFormProps {
    videoData?: CourseVideo;
}

const VideoForm: React.FC<VideoFormProps> = ({ videoData }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStep, setUploadStep] = useState<'idle' | 'creating' | 'uploading' | 'finalizing'>('idle');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const { hideModal } = useModal();
    const dispatch = useAppDispatch();

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
        reset,
    } = useForm<VideoFormValues>({
        defaultValues: {
            name: videoData?.name || '',
            description: videoData?.description || '',
            duration: Number(videoData?.video_duration) || 0,
            video: null
        }
    });

    const videoFile = watch('video');

    // Fetch full data from view video api
    const fetchFullData = async () => {
        if (videoData?.id) {
            try {
                const response = await videoDetailApi(videoData.id);
                if (response.data) {
                    reset({
                        name: response.data.name || '',
                        description: response.data.description || '',
                        duration: Number(response.data.video_duration) || 0,
                        video: null
                    });
                    if (response.data.video_file) {
                        setPreviewUrl(response.data.video_file);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch video details:", error);
            }
        }
    }

    React.useEffect(() => {
        fetchFullData();
        return () => {
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        }
    }, [videoData?.id]);

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        setValue('video', files);

        if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }

        if (files && files.length > 0) {
            const file = files[0];
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            const videoEl = document.createElement('video');
            videoEl.preload = 'metadata';
            videoEl.onloadedmetadata = () => {
                const durationInSeconds = Math.round(videoEl.duration);
                setValue('duration', durationInSeconds);
            };
            videoEl.src = url;
        } else {
            setValue('duration', 0);
            setPreviewUrl(null);
        }
    };

    const onSubmit = async (data: VideoFormValues) => {
        // Validation: If creating, video is required.
        if (!videoData && (!data.video || data.video.length === 0)) {
            toast.error("Please select a video file");
            return;
        }

        const file = data.video && data.video.length > 0 ? data.video[0] : null;
        const update_video = videoData ? !!file : true;

        setIsSubmitting(true);
        setUploadStep('creating');

        try {
            const payload = {
                name: data.name.trim(),
                description: data.description.trim(),
                duration: data.duration,
                update_video: update_video
            };

            if (videoData) {
                // Editing existing video
                if (update_video) {
                    // Step 1: Update metadata and get signed URL for new file
                    const response = await updateVideoApi(videoData.id, payload);
                    const { signed_url } = response.data;
                    
                    if (signed_url && file) {
                        setUploadStep('uploading');
                        await performUpload(signed_url, file);
                        setUploadStep('finalizing');
                        await markVideoCompleteApi(videoData.id, { status: true });
                        toast.success("Video and details updated successfully");
                    }
                } else {
                    // update_video = false: Just updating metadata
                    await updateVideoApi(videoData.id, payload);
                    toast.success("Video details updated successfully");
                }
            } else {
                // Creating new video
                const response = await createVideo(payload);
                const { signed_url, id } = response.data;

                if (!signed_url) throw new Error("Failed to get upload URL");

                setUploadStep('uploading');
                await performUpload(signed_url, file!);
                
                setUploadStep('finalizing');
                await markVideoCompleteApi(id, { status: true });
                toast.success("Video uploaded successfully");
            }

            dispatch(getVideoListing({ page: 1 }));
            hideModal();
        } catch (error: any) {
            console.error("Video operation failed:", error);
            toast.error(error?.message || "Operation failed. Please try again.");
        } finally {
            setIsSubmitting(false);
            setUploadStep('idle');
            setUploadProgress(0);
        }
    };

    const performUpload = (url: string, file: File) => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', url, true);
            xhr.setRequestHeader('Content-Type', file.type);

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    setUploadProgress(percent);
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200 || xhr.status === 201) resolve(true);
                else reject(new Error(`Upload failed with status ${xhr.status}`));
            };

            xhr.onerror = () => reject(new Error("Network error during upload"));
            xhr.send(file);
        });
    };

    return (
        <div className="relative">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-1">
                <div className="grid grid-cols-1 gap-6">
                    {/* Video Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Video Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...register('name', { required: 'Title is required' })}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-gray-50/50"
                            placeholder="e.g. Introduction to Design"
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Duration */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Duration (seconds)
                                <span className="ml-1.5 text-[10px] font-medium text-indigo-500 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-md">Auto-detected</span>
                            </label>
                            <input
                                type="number"
                                {...register('duration', { 
                                    required: 'Duration is required',
                                    min: { value: 1, message: 'Duration must be positive' }
                                })}
                                disabled
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none bg-gray-100 text-gray-500 cursor-not-allowed select-none"
                                placeholder="Auto-filled on video selection"
                            />
                            {errors.duration && <p className="mt-1 text-xs text-red-500">{errors.duration.message}</p>}
                        </div>

                        {/* File Upload Trigger */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Video File <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={handleVideoChange}
                                    className="hidden"
                                    id="video-upload"
                                />
                                <label
                                    htmlFor="video-upload"
                                    className={`flex items-center justify-between px-4 py-2.5 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                                        videoFile && videoFile.length > 0 
                                        ? 'border-indigo-200 bg-indigo-50 text-indigo-700' 
                                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50 text-gray-500'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 truncate">
                                        <UploadCloud size={18} className={videoFile ? 'text-indigo-500' : 'text-gray-400'} />
                                        <span className="text-sm truncate">
                                            {videoFile && videoFile.length > 0 ? videoFile[0].name : 'Select video file'}
                                        </span>
                                    </div>
                                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-white rounded-md shadow-sm border border-gray-100">Browse</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Video Preview Section */}
                    {previewUrl && (
                        <div className="flex justify-center">
                            <div className="bg-gray-900 rounded-2xl overflow-hidden border-4 border-white shadow-lg aspect-video relative group max-w-sm w-full h-48">
                                <video 
                                    src={previewUrl} 
                                    className="w-full h-full object-contain"
                                    controls
                                />
                                <div className="absolute top-2 left-2 flex items-center gap-2">
                                    <span className="bg-indigo-600/90 text-white text-[8px] font-bold px-2 py-1 rounded-full backdrop-blur-sm border border-white/10">
                                        Preview
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Description
                        </label>
                        <textarea
                            {...register('description')}
                            rows={3}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-gray-50/50 resize-none"
                            placeholder="Briefly describe the video content..."
                        />
                    </div>
                </div>

                {/* Status and Progress Overlay */}
                {isSubmitting && (
                    <div className="bg-white/90 backdrop-blur-sm border border-indigo-100 rounded-2xl p-4 animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                    <Clock size={20} className="animate-pulse" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 capitalize">
                                        {uploadStep === 'creating' && 'Generating secure channel...'}
                                        {uploadStep === 'uploading' && 'Streaming video to cloud...'}
                                        {uploadStep === 'finalizing' && 'Finalizing processing...'}
                                    </p>
                                    <p className="text-[11px] text-gray-500 italic">Please do not close this window</p>
                                </div>
                            </div>
                            <span className="text-indigo-600 font-bold text-sm">{uploadProgress}%</span>
                        </div>
                        
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                            <div 
                                className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(79,70,229,0.3)]"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={hideModal}
                        className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-8 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-95 ${
                            isSubmitting ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:shadow-xl hover:shadow-indigo-200'
                        }`}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 size={18} />
                                Start Upload
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default VideoForm;
