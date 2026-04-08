import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useModal } from '../../context/ModalContext';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addTag, updateTag } from '../../store/slices/tagSlice';
import toast from 'react-hot-toast';

type TagFormValues = {
    name: string;
};

type Props = {
    tagData?: {
        id: number;
        name: string;
    };
};

const TagForm = ({ tagData }: Props) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dispatch = useAppDispatch();
    const { hideModal } = useModal();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<TagFormValues>({
        defaultValues: {
            name: '',
        },
    });

    // Set default values on edit
    useEffect(() => {
        if (tagData) {
            reset({
                name: tagData.name,
            });
        }
    }, [tagData, reset]);

    // Submit handler
    const onSubmit = async (data: TagFormValues) => {
        setIsSubmitting(true);
        try {
            const payload = {
                name: data.name.trim(),
            };

            if (tagData?.id) {
                const formData = new FormData();
                formData.append('name', data.name.trim());
                await dispatch(updateTag({ id: tagData.id, tagData: formData })).unwrap();
                toast.success("Tag updated successfully");
            } else {
                await dispatch(addTag(payload)).unwrap();
                toast.success("Tag added successfully");
            }

            reset();
            hideModal();
        } catch (err: any) {
            console.error('Tag submission failed:', err);
            toast.error(err || "Failed to add tag");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                    {/* Name */}
                    <div>
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
                            placeholder="Enter tag name"
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                        )}
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
                        ) : tagData ? 'Update Tag' : 'Create Tag'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TagForm;
