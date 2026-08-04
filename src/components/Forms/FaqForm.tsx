import { toast } from 'react-hot-toast';
import { addFaq, updateFaq } from '../../store/slices/faqSlice';
import { fetchParentFaqApi } from '../../services/apiServices';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useModal } from '../../context/ModalContext';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { FiAlertCircle } from 'react-icons/fi';
import LexicalEditor from '../TextEditor';

type FaqFormValue = {
    title: string,
    description: string,
    faq_topic_id: number | string,
    icon: FileList | null;
};

type ParentTopic = {
    id: number;
    title: string;
};

type Props = {
    faqData?: {
        id: number;
        title: string;
        description: string;
        faq_topic_id?: number;
        faq_topic?: {
            id: number;
            title: string;
        };
        icon: string;
    };
}


const ManageFaqForm = ({ faqData }: Props) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dispatch = useAppDispatch();
    const { hideModal } = useModal();

    const [parentTopics, setParentTopics] = useState<ParentTopic[]>([]);

    const { register, handleSubmit, formState: { errors }, reset, watch, setValue, control } = useForm<FaqFormValue>({
        defaultValues: {
            title: "",
            description: "",
            faq_topic_id: "",
            icon: null,
        },
    });

    const iconFile = watch('icon');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Set preview URL and handle cleanup
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

    // Handle initial data loading/reset
    useEffect(() => {
        if (faqData) {
            reset({
                title: faqData.title || "",
                description: faqData.description || "",
                faq_topic_id: (typeof (faqData as any).faq_topic === 'object'
                    ? (faqData as any).faq_topic?.id
                    : (faqData as any).faq_topic_id) || "",
                icon: null,
            });
            if (faqData.icon) {
                setPreviewUrl(faqData.icon);
            }
        }
    }, [faqData, reset]);

    const handleFetchParentTopic = async () => {
        try {
            const res = await fetchParentFaqApi();
            if (res && res.data) {
                setParentTopics(res.data);
            } else if (res && res.results) {
                setParentTopics(res.results);
            } else if (Array.isArray(res)) {
                setParentTopics(res);
            }
        } catch (error) {
            console.error("Failed to fetch parent topics:", error);
        }
    };

    useEffect(() => {
        handleFetchParentTopic();
    }, []);

    // Ensure parent field is synced once parentTopics are loaded
    useEffect(() => {
        if (parentTopics.length > 0 && faqData) {
            const topicId = (typeof (faqData as any).faq_topic === 'object'
                ? (faqData as any).faq_topic?.id
                : (faqData as any).faq_topic_id) || '';
            setValue('faq_topic_id', topicId);
        }
    }, [parentTopics, faqData, setValue]);

    const onSubmit = async (data: FaqFormValue) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', data.title.trim());
            formData.append('description', data.description.trim());
            formData.append('faq_topic_id', String(data.faq_topic_id));

            // Only append icon if a new file was selected
            if (data.icon && data.icon.length > 0) {
                formData.append('icon', data.icon[0]);
            }

            if (faqData?.id) {
                // Corrected property name from 'payload' to 'faqData' to match slice
                await dispatch(updateFaq({ id: faqData.id, faqData: formData })).unwrap();
                toast.success('FAQ updated successfully');
            } else {
                await dispatch(addFaq(formData)).unwrap();
                toast.success('FAQ created successfully');
            }
            hideModal();
            reset();
        } catch (error: any) {
            toast.error(error || "Failed to save FAQ");
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
                            <span className="w-2 h-2 bg-indigo-600 rounded-full"></span> 1. FAQ Title
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
                                        placeholder="Enter FAQ title"
                                    />
                                )}
                            />
                        </div>
                        {errors.title && (
                            <p className="text-xs text-red-500 font-bold flex items-center gap-1.5 ml-2 tracking-tight"><FiAlertCircle /> {errors.title.message}</p>
                        )}
                    </div>

                    {/* Parent Topic */}
                    <div className="md:col-span-2 space-y-4">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-3">
                            <span className="w-2 h-2 bg-indigo-600 rounded-full"></span> 2. Parent Topic
                        </h2>
                        <div className={`rounded-xl border overflow-hidden transition-all bg-gray-50/10 ${errors.faq_topic_id ? 'border-red-500 ring-4 ring-red-50' : 'border-gray-200 focus-within:border-indigo-400'}`}>
                            <select
                                {...register('faq_topic_id', {
                                    required: 'Parent Topic is required'
                                })}
                                className="w-full bg-transparent focus:outline-none px-4 py-3 text-gray-700"
                            >
                                <option value="">Select a topic</option>
                                {parentTopics.map((topic) => (
                                    <option key={topic.id} value={topic.id}>
                                        {topic.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {errors.faq_topic_id && (
                            <p className="text-xs text-red-500 font-bold flex items-center gap-1.5 ml-2 tracking-tight"><FiAlertCircle /> {errors.faq_topic_id.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2 space-y-4">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-3">
                            <span className="w-2 h-2 bg-indigo-600 rounded-full"></span> 3. Description
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
                                        placeholder="Enter FAQ description"
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
export default ManageFaqForm;
