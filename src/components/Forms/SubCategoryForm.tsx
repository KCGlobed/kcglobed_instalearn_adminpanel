import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useModal } from '../../context/ModalContext';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addSubcategory, editSubcategory } from '../../store/slices/subcategorySlice';
import { fetchSubCategoryParentList } from '../../services/apiServices';
import toast from 'react-hot-toast';
type SubCategoryFormValues = {
    name: string;
    description: string;
    parent: number | string;
    bg_code: string;
    text_code: string;
    icon: FileList | string | null;
};

type ParentCategory = {
    id: number;
    name: string;
};

type Props = {
    categoryData?: {
        id: number;
        name: string;
        description: string;
        parent: {
            id: number;
            name: string;
            description?: string;
            bg_code?: string;
            text_code?: string;
            icon?: string;
        };
        bg_code?: string;
        text_code?: string;
        icon?: string;
    };
};

const SubCategoryForm = ({ categoryData }: Props) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dispatch = useAppDispatch();
    const { hideModal } = useModal();

    const [parentCategories, setParentCategories] = useState<ParentCategory[]>([]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue,
    } = useForm<SubCategoryFormValues>({
        defaultValues: {
            name: '',
            description: '',
            parent: '',
            bg_code: '#ffffff',
            text_code: '#000000',
            icon: null,
        },
    });

    const bgCode = watch('bg_code');
    const textCode = watch('text_code');

    // Helper to ensure color picker always receives a valid hex
    const isValidHex = (hex: string) => /^#[0-9A-Fa-f]{6}$/i.test(hex);

    const iconFile = watch('icon');
    const [previewUrl, setPreviewUrl] = useState<string | null>(categoryData?.icon || null);

    useEffect(() => {
        if (iconFile) {
            if (typeof iconFile === 'string') {
                setPreviewUrl(iconFile);
            } else if (iconFile.length > 0) {
                const url = URL.createObjectURL(iconFile[0]);
                setPreviewUrl(url);
                return () => URL.revokeObjectURL(url);
            }
        } else if (categoryData?.icon) {
            setPreviewUrl(categoryData.icon);
        } else {
            setPreviewUrl(null);
        }
    }, [iconFile, categoryData]);

    // Set default values on edit
    useEffect(() => {
        if (categoryData) {
            reset({
                name: categoryData.name,
                description: categoryData.description,
                parent: (typeof (categoryData as any).parent === 'object'
                    ? (categoryData as any).parent?.id
                    : (categoryData as any).parent) || '',
                bg_code: categoryData.bg_code || '#ffffff',
                text_code: categoryData.text_code || '#000000',
            });
        }
    }, [categoryData, reset]);

    // Ensure parent field is synced once parentCategories are loaded
    useEffect(() => {
        if (parentCategories.length > 0 && categoryData) {
            const parentId = (typeof (categoryData as any).parent === 'object'
                ? (categoryData as any).parent?.id
                : (categoryData as any).parent) || '';
            setValue('parent', parentId);
        }
    }, [parentCategories, categoryData, setValue]);

    // Submit handler
    const onSubmit = async (data: SubCategoryFormValues) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('name', data.name.trim());
            formData.append('description', data.description.trim());
            formData.append('parent', String(data.parent));
            formData.append('bg_code', data.bg_code);
            formData.append('text_code', data.text_code);

            const isNewFileSelected = data.icon && typeof data.icon !== 'string' && (data.icon as FileList).length > 0;

            if (isNewFileSelected) {
                formData.append('icon', (data.icon as FileList)[0]);
            } else if (!categoryData?.id) {
                formData.append('icon', '');
            }

            if (categoryData?.id) {
                await dispatch(editSubcategory({ id: categoryData.id, subcategoryData: formData })).unwrap();
                toast.success("Subcategory updated successfully");
            } else {
                await dispatch(addSubcategory(formData)).unwrap();
                toast.success("Subcategory created successfully");
            }

            reset();
            hideModal();
        } catch (err: any) {
            console.error('Subcategory submission failed:', err);
            const errorMessage = typeof err === 'string' ? err : err?.message || "An unexpected network or validation error occurred. Please try again.";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleFetchParentCategory = async () => {
        try {
            const res = await fetchSubCategoryParentList();
            if (res && res.data) {
                setParentCategories(res.data);
            } else if (res && res.results) {
                setParentCategories(res.results);
            } else if (Array.isArray(res)) {
                setParentCategories(res);
            } else {
                toast.error("Failed to load parent categories due to unexpected response format.");
            }
        } catch (error: any) {
            console.error("Failed to fetch parent categories:", error);
            const errorMessage = typeof error === 'string' ? error : error?.message || "Network error while fetching parent categories.";
            toast.error(errorMessage);
        }
    };

    useEffect(() => {
        handleFetchParentCategory();
    }, []);

    return (
        <div className="relative">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...register('name', {
                                required: 'Name is required',
                                minLength: { value: 2, message: 'Name must be at least 2 characters' },
                                validate: value => value.trim().length > 0 || 'Name cannot be empty or only spaces'
                            })}
                            className="w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-2 rounded-md"
                            placeholder="Enter subcategory name"
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Parent Category */}
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Parent Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            {...register('parent', {
                                required: 'Parent Category is required'
                            })}
                            className="w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-2 rounded-md bg-white"
                        >
                            <option value="">Select a parent</option>
                            {parentCategories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        {errors.parent && (
                            <p className="mt-1 text-sm text-red-600">{errors.parent.message}</p>
                        )}
                    </div>

                    {/* Background Color */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Background Color <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 bg-white">
                            <input
                                type="color"
                                value={bgCode && isValidHex(bgCode) ? bgCode : '#ffffff'}
                                onChange={(e) => setValue('bg_code', e.target.value, { shouldValidate: true })}
                                className="h-10 w-14 cursor-pointer p-0 border-0 bg-transparent"
                            />
                            <div className="h-6 w-[1px] bg-gray-300 mx-1"></div>
                            <input
                                type="text"
                                {...register('bg_code', { required: 'Background color is required' })}
                                className="flex-1 w-full px-3 py-2 uppercase text-sm border-0 focus:ring-0 focus:outline-none bg-transparent"
                                placeholder="#FFFFFF"
                            />
                        </div>
                        {errors.bg_code && (
                            <p className="mt-1 text-sm text-red-600">{errors.bg_code.message}</p>
                        )}
                    </div>

                    {/* Text Color */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Text Color <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 bg-white">
                            <input
                                type="color"
                                value={textCode && isValidHex(textCode) ? textCode : '#000000'}
                                onChange={(e) => setValue('text_code', e.target.value, { shouldValidate: true })}
                                className="h-10 w-14 cursor-pointer p-0 border-0 bg-transparent"
                            />
                            <div className="h-6 w-[1px] bg-gray-300 mx-1"></div>
                            <input
                                type="text"
                                {...register('text_code', { required: 'Text color is required' })}
                                className="flex-1 w-full px-3 py-2 uppercase text-sm border-0 focus:ring-0 focus:outline-none bg-transparent"
                                placeholder="#000000"
                            />
                        </div>
                        {errors.text_code && (
                            <p className="mt-1 text-sm text-red-600">{errors.text_code.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            {...register('description', {
                                required: 'Description is required',
                                minLength: { value: 2, message: 'Description must be at least 2 characters' },
                                validate: value => value.trim().length > 0 || 'Description cannot be empty or only spaces'
                            })}
                            rows={3}
                            placeholder="Enter category description"
                            className="w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-2 rounded-md"
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                        )}
                    </div>

                    {/* Category Icon */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category Icon <span className="text-red-500">{categoryData?.id ? '' : '*'}</span>
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
                                    {...register('icon', {
                                        validate: (value) => {
                                            if (categoryData?.id) return true;
                                            if (value && value.length > 0) return true;
                                            return 'Icon file is required';
                                        }
                                    })}
                                    className="w-full border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 px-2 py-2 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                                />
                                {errors.icon && (
                                    <p className="mt-1 text-sm text-red-600">{errors.icon.message as string}</p>
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
                        ) : categoryData ? 'Update Subcategory' : 'Create Subcategory'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SubCategoryForm;

