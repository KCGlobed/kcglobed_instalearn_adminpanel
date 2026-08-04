import { toast } from 'react-hot-toast';
import { addFaqTopic, updateFaqTopic } from '../../store/slices/faqTopicSlice';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useModal } from '../../context/ModalContext';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { FiAlertCircle } from 'react-icons/fi';
import LexicalEditor from '../TextEditor';

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

    const { register, handleSubmit, formState: { errors }, reset, watch, control } = useForm<FaqFormValue>({
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
                    <div className="md:col-span-2 space-y-4">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-3">
                            <span className="w-2 h-2 bg-indigo-600 rounded-full"></span> 1. FAQ Topic Title
                        </h2>
                        <div className={`rounded-xl border overflow-hidden transition-all bg-gray-50/10 ${errors.title ? 'border-red-500 ring-4 ring-red-50' : 'border-gray-200 focus-within:border-indigo-400'}`}>
                            <Controller
                                name="title"
                                control={control}
                                rules={{
                                    required: 'Title is required',
                                    validate: value => (value && value.replace(/<[^>]*>?/gm, '').trim().length > 0) || 'Title cannot be empty'
                                }}
                                render={({ field }) => (
                                    <LexicalEditor
                                        type="title"
                                        value={field.value || ""}
                                        onChange={field.onChange}
                                        placeholder="Enter FAQ topic title"
                                    />
                                )}
                            />
                        </div>
                        {errors.title && (
                            <p className="text-xs text-red-500 font-bold flex items-center gap-1.5 ml-2 tracking-tight"><FiAlertCircle /> {errors.title.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2 space-y-4">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-3">
                            <span className="w-2 h-2 bg-indigo-600 rounded-full"></span> 2. Description
                        </h2>
                        <div className={`rounded-xl border overflow-hidden transition-all bg-gray-50/10 ${errors.description ? 'border-red-500 ring-4 ring-red-50' : 'border-gray-200 focus-within:border-indigo-400'}`}>
                            <Controller
                                name="description"
                                control={control}
                                rules={{
                                    required: 'Description is required',
                                    validate: value => (value && value.replace(/<[^>]*>?/gm, '').trim().length > 0) || 'Description cannot be empty'
                                }}
                                render={({ field }) => (
                                    <LexicalEditor
                                        type="description"
                                        value={field.value || ""}
                                        onChange={field.onChange}
                                        placeholder="Enter category description"
                                    />
                                )}
                            />
                        </div>
                        {errors.description && (
                            <p className="text-xs text-red-500 font-bold flex items-center gap-1.5 ml-2 tracking-tight"><FiAlertCircle /> {errors.description.message}</p>
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
