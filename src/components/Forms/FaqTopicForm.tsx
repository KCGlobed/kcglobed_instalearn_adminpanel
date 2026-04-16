import { toast } from 'react-hot-toast';
import { addFaqTopic, updateFaqTopic } from '../../store/slices/faqTopicSlice';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useModal } from '../../context/ModalContext';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

type FaqFormValue = {
    title: string,
    description: string,
    icon: FileList | null;
};

type Props = {
    faqData?: {
        id: number;
        title: string;
        description: string;
        icon: string;
    };
}


const FaqFrom = ({ faqData }: Props) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dispatch = useAppDispatch();
    const { hideModal } = useModal();

    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<FaqFormValue>({
        defaultValues: {
            title: faqData?.title || "",
            description: faqData?.description || "",
            icon: null,
        },
    });

    const iconFile = watch('icon');
    const [previewUrl, setPreviewUrl] = useState<string | null>(faqData?.icon || null);

    useEffect(() => {
        if (iconFile && iconFile.length > 0) {
            const url = URL.createObjectURL(iconFile[0]);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
        else if (faqData?.icon) {
            setPreviewUrl(faqData.icon);
        }
    }, [iconFile, faqData]);

    const onSubmit = async (data: FaqFormValue) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', data.title.trim());
            formData.append('description', data.description);

            if (data.icon && data.icon.length > 0) {
                formData.append('icon', data.icon[0]);
            }

            if (faqData?.id) {
                await dispatch(updateFaqTopic({ id: faqData.id, payload: formData })).unwrap();
                toast.success('FAQ Topic updated successfully');
            } else {
                await dispatch(addFaqTopic(formData)).unwrap();
                toast.success('FAQ Topic created successfully');
            }
            hideModal();
            reset();
        } catch (error: any) {
            toast.error(error || "Failed to save FAQ Topic");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="relative">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            FAQ Topic Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...register('title', {
                                required: 'Title is required',
                                minLength: { value: 2, message: 'Title must be at least 2 characters' },
                                validate: value => value.trim().length > 0 || 'Title cannot be empty or only spaces'
                            })}
                            className="w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-2 rounded-md"
                            placeholder="Enter FAQ topic title"
                        />
                        {errors.title && (
                            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
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
                </div>

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
                        ) : faqData ? 'Update Faq' : 'Create Faq'}
                    </button>
                </div>
            </form>
        </div>
    )
}
export default FaqFrom;
