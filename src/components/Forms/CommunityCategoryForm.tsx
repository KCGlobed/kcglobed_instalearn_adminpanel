import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useModal } from '../../context/ModalContext';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addCommunityCategory, editCommunityCategory, getCommunityCategory } from '../../store/slices/communityCategorySlice';
import toast from 'react-hot-toast';
import { CropperModal } from '../ImageCropper/components/CropperModal';
import type { CropResult } from '../ImageCropper/utils/cropCanvas';
import { Globe2, Loader2, AlertCircle } from 'lucide-react';
import LexicalEditor from '../TextEditor';

const stripHtml = (html?: string) => (html || '').replace(/<[^>]*>?/gm, '').trim();

const schema = yup.object().shape({
    title: yup.string().required("Title is mandatory")
        .min(2, "Title must be at least 2 characters")
        .test("not-empty", "Title cannot be empty or only spaces", value => value.trim().length > 0),
    description: yup
        .string()
        .test("required", "Description is mandatory", (value) => stripHtml(value).length > 0)
        .test("min", "Description must be at least 10 characters", (value) => {
            const text = stripHtml(value);
            return text.length === 0 || text.length >= 10;
        })
        .required("Description is mandatory"),
    image: yup.mixed().nullable().default(null),
});

type FormData = yup.InferType<typeof schema>;

type Props = {
    categoryData?: {
        id: number;
        title: string;
        description: string;
        image?: string;
    };
};

const CommunityCategoryForm = ({ categoryData }: Props) => {
    const [saving, setSaving] = useState(false);
    const dispatch = useAppDispatch();
    const { hideModal } = useModal();

    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
    const [originalImageFormat, setOriginalImageFormat] = useState<'image/png' | 'image/jpeg'>('image/png');
    const [previewUrl, setPreviewUrl] = useState<string | null>(categoryData?.image || null);
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
        if (categoryData) {
            setValue("title", categoryData.title || "");
            setValue("description", categoryData.description || "");
            // Note: image preview is already set in state
        }
    }, [categoryData, setValue]);

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
        // Custom Image Validation for creation
        if (!categoryData?.id && !data.image) {
            setImageError("Image is mandatory");
            return;
        }

        try {
            setSaving(true);
            const formData = new window.FormData();
            formData.append('title', data.title.trim());
            formData.append('description', data.description.trim());

            if (data.image instanceof File) {
                formData.append('image', data.image);
            }

            if (categoryData?.id) {
                await dispatch(editCommunityCategory({ id: categoryData.id, categoryData: formData })).unwrap();
                toast.success("Community Category updated successfully");
            } else {
                await dispatch(addCommunityCategory(formData)).unwrap();
                toast.success("Community Category added successfully");
            }
            dispatch(getCommunityCategory({}));

            hideModal();
        } catch (err: any) {
            console.error('Community Category submission failed:', err);
            toast.error(err || "Failed to save category");
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
                        <Globe2 size={18} />
                    </span>
                    <div>
                        <p className="text-sm font-semibold text-indigo-800">{categoryData ? 'Edit Community Category' : 'Add Community Category'}</p>
                        <p className="text-xs text-indigo-500 mt-0.5">{categoryData ? 'Update details of the category.' : 'Create a new community category.'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5">
                    {/* Title */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="title"
                            control={control}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    type="text"
                                    placeholder="e.g. Branding"
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

                    {/* Description (Lexical Editor) */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field: { value, onChange } }) => (
                                <div className={`rounded-xl overflow-hidden border transition-all ${
                                    errors.description
                                        ? 'border-red-400 focus-within:ring-4 focus-within:ring-red-500/20 bg-red-50/30'
                                        : 'border-gray-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/20 hover:border-gray-300'
                                    }`}>
                                    <LexicalEditor
                                        type="description"
                                        value={value || ""}
                                        onChange={onChange}
                                        placeholder="Enter category description..."
                                    />
                                </div>
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
                            Category Image <span className="text-red-500">{categoryData?.id ? '' : '*'}</span>
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
                        {saving ? 'Saving...' : (categoryData ? 'Update Category' : 'Add Category')}
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

export default CommunityCategoryForm;
