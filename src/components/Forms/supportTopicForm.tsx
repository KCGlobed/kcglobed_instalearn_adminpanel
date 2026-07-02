import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useModal } from "../../context/ModalContext";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { addSupportTopic, editSupportTopic } from "../../store/slices/supportTopicSlice";
import toast from "react-hot-toast";
import { MessageSquare, Loader2, AlertCircle } from "lucide-react";
import { CropperModal } from "../ImageCropper/components/CropperModal";
import type { CropResult } from "../ImageCropper/utils/cropCanvas";

const schema = yup.object().shape({
    title: yup.string().required("Title is mandatory").min(2, "Title must be at least 2 characters"),
    description: yup.string().required("Description is mandatory").min(2, "Description must be at least 2 characters"),
    image: yup.mixed().nullable().default(null),
});

type FormData = yup.InferType<typeof schema>;

type Props = {
    topicData?: {
        id: number;
        title: string;
        description: string;
        image: string;
    };
}

const SupportTopicForm: React.FC<Props> = ({ topicData }) => {
    const [saving, setSaving] = useState(false);
    const dispatch = useAppDispatch();
    const { hideModal } = useModal();

    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
    const [originalImageFormat, setOriginalImageFormat] = useState<'image/png' | 'image/jpeg'>('image/png');
    const [previewUrl, setPreviewUrl] = useState<string | null>(topicData?.image || null);
    const [imageError, setImageError] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            title: "",
            description: "",
            image: null,
        },
    });

    useEffect(() => {
        if (topicData) {
            setValue("title", topicData.title || "");
            setValue("description", topicData.description || "");
        }
    }, [topicData, setValue]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const isJpeg = file.type === 'image/jpeg' || file.type === 'image/jpg';
            setOriginalImageFormat(isJpeg ? 'image/jpeg' : 'image/png');

            const r = new FileReader();
            r.onloadend = () => {
                setRawImageSrc(r.result as string);
                setIsCropperOpen(true);
            };
            r.readAsDataURL(file);
            e.target.value = '';
        }
    };

    const handleCropComplete = (result: CropResult) => {
        setValue("image", result.file as any, { shouldValidate: true });
        setPreviewUrl(result.dataUrl);
        setImageError(null);
    };

    const onSubmit = async (data: FormData) => {
        try {
            setSaving(true);
            const formData = new window.FormData();
            formData.append('title', data.title.trim());
            formData.append('description', data.description.trim());

            if (data.image instanceof File) {
                formData.append('image', data.image);
            }

            if (topicData?.id) {
                await dispatch(editSupportTopic({ id: topicData.id, topicData: formData })).unwrap();
                toast.success("Support Topic updated successfully");
            } else {
                await dispatch(addSupportTopic(formData)).unwrap();
                toast.success("Support Topic created successfully");
            }

            hideModal();
        } catch (err: any) {
            console.error("Support Topic submission failed:", err);
            toast.error(err || "Failed to save support topic");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="relative">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                {/* Header info */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                    <span className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                        <MessageSquare size={18} />
                    </span>
                    <div>
                        <p className="text-sm font-semibold text-indigo-800">{topicData ? 'Edit Support Topic' : 'Add Support Topic'}</p>
                        <p className="text-xs text-indigo-500 mt-0.5">{topicData ? 'Update details of the support topic.' : 'Create a new support topic.'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Title */}
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                            Topic Title <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="title"
                            control={control}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    type="text"
                                    placeholder="e.g. Account & Billing"
                                    disabled={saving}
                                    className={`w-full px-4 py-3 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all ${
                                        errors.title 
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30' 
                                        : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-300'
                                    }`}
                                />
                            )}
                        />
                        {errors.title && (
                            <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                                <AlertCircle size={13} /> {errors.title.message}
                            </p>
                        )}
                    </div>
                </div>

                {/* Description Textarea */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                        Description <span className="text-red-500">*</span>
                    </label>
                    <Controller
                        name="description"
                        control={control}
                        render={({ field: { value, onChange, onBlur, ref } }) => (
                            <textarea
                                value={value || ''}
                                onChange={onChange}
                                onBlur={onBlur}
                                ref={ref}
                                placeholder="Enter support topic description..."
                                rows={4}
                                disabled={saving}
                                className={`w-full px-4 py-3 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all resize-y ${
                                    errors.description 
                                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30' 
                                    : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-300'
                                }`}
                            />
                        )}
                    />
                    {errors.description && (
                        <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                            <AlertCircle size={13} /> {errors.description.message}
                        </p>
                    )}
                </div>

                {/* Image */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                        Topic Image
                    </label>
                    <div className="flex items-center gap-4">
                        {previewUrl && (
                            <div className="h-16 w-16 rounded-xl border border-gray-200 overflow-hidden flex-shrink-0 bg-gray-50 flex items-center justify-center">
                                <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                            </div>
                        )}
                        <div className="flex-1">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                disabled={saving}
                                className={`w-full px-4 py-3 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer ${
                                    imageError 
                                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30' 
                                    : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-300'
                                }`}
                            />
                            {imageError && (
                                <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                                    <AlertCircle size={13} /> {imageError}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={hideModal}
                        disabled={saving}
                        className="px-5 py-2 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm flex items-center gap-2"
                    >
                        {saving && <Loader2 size={14} className="animate-spin" />}
                        {saving ? 'Saving...' : (topicData ? 'Update Topic' : 'Add Topic')}
                    </button>
                </div>
            </form>

            <CropperModal
                imageSrc={rawImageSrc}
                isOpen={isCropperOpen}
                onClose={() => setIsCropperOpen(false)}
                onCropComplete={handleCropComplete}
                initialFormat={originalImageFormat}
            />
        </div>
    );
};

export default SupportTopicForm;
