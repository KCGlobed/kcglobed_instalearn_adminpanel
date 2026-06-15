import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useModal } from '../../context/ModalContext';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addBlogCategory, editBlogCategory } from '../../store/slices/blogCategorySlice';
import toast from 'react-hot-toast';
import type { BlogCategory } from '../../utils/types';
import { CropperModal } from "../ImageCropper/components/CropperModal";
import type { CropResult } from "../ImageCropper/utils/cropCanvas";

type BlogCategoryFormValues = {
    title: string;
    description: string;
    image: File | null;
};

type Props = {
    categoryData?: BlogCategory;
};

const BlogCategoryForm = ({ categoryData }: Props) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dispatch = useAppDispatch();
    const { hideModal } = useModal();

    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
    const [originalImageFormat, setOriginalImageFormat] = useState<'image/png' | 'image/jpeg'>('image/png');

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
    } = useForm<BlogCategoryFormValues>({
        defaultValues: {
            title: '',
            description: '',
            image: null,
        },
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(categoryData?.image || null);

    // Programmatically register the image field for validation
    useEffect(() => {
        register("image", {
            validate: (value) => {
                if (categoryData?.id) return true;
                if (value) return true;
                return "Image file is required";
            }
        });
    }, [register, categoryData]);

    // Set default values on edit
    useEffect(() => {
        if (categoryData) {
            reset({
                title: categoryData.title,
                description: categoryData.description,
            });
        }
    }, [categoryData, reset]);

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
        setValue("image", result.file, { shouldValidate: true });
        setPreviewUrl(result.dataUrl);
    };

    // Submit handler
    const onSubmit = async (data: BlogCategoryFormValues) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', data.title.trim());
            formData.append('description', data.description.trim());

            if (data.image instanceof File) {
                formData.append('image', data.image);
            }

            if (categoryData?.id) {
                await dispatch(editBlogCategory({ id: categoryData.id, categoryData: formData })).unwrap();
                toast.success("Blog Category updated successfully");
            } else {
                await dispatch(addBlogCategory(formData)).unwrap();
                toast.success("Blog Category added successfully");
            }

            reset();
            hideModal();
        } catch (err: any) {
            console.error('Blog Category submission failed:', err);
            toast.error(err || "Failed to save blog category");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...register('title', {
                                required: 'Title is required',
                                minLength: { value: 2, message: 'Title must be at least 2 characters' },
                                validate: value => value.trim().length > 0 || 'Title cannot be empty or only spaces'
                            })}
                            className="w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-2 rounded-md"
                            placeholder="Enter blog category title"
                        />
                        {errors.title && (
                            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            {...register('description', {
                                required: 'Description is required',
                                minLength: { value: 2, message: 'Description must be at least 2 characters' },
                                validate: value => value.trim().length > 0 || 'Description cannot be empty or only spaces'
                            })}
                            rows={4}
                            placeholder="Enter blog category description"
                            className="w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-2 rounded-md"
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                        )}
                    </div>

                    {/* Image */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                    className="w-full border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 px-2 py-2 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                                />
                                {errors.image && (
                                    <p className="mt-1 text-sm text-red-600">{errors.image.message as string}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4 border-t border-gray-200">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 transition duration-200 text-white font-semibold py-2.5 rounded-md ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isSubmitting ? (
                            <>
                                <svg
                                    className="animate-spin h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                    />
                                </svg>
                                Saving...
                            </>
                        ) : categoryData ? 'Update Blog Category' : 'Create Blog Category'}
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

export default BlogCategoryForm;
