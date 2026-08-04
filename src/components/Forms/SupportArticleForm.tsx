import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import type { supportArticle } from "../../utils/types";
import { useModal } from "../../context/ModalContext";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { addSupportArticle, editSupportArticle } from "../../store/slices/supportArticleSlice";
import { fetchSupportTopicAndSubList } from "../../services/apiServices";
import toast from "react-hot-toast";
import { MessageSquare, Loader2, AlertCircle } from "lucide-react";
import LexicalEditor from "../TextEditor";


interface Option { label: string; value: string | number; }

const schema = yup.object().shape({
    title: yup.string().required("Title is mandatory"),
    main_topic: yup.object().shape({
        label: yup.string().required(),
        value: yup.mixed().required(),
    }).required("Main topic is mandatory"),
    sub_topic: yup.object().shape({
        label: yup.string().required(),
        value: yup.mixed().required(),
    }).required("Sub topic is mandatory"),
    description: yup.string().required("Description is mandatory"),
});

type FormData = yup.InferType<typeof schema>;

interface SupportArticleFormProps {
    articleData?: supportArticle;
}

const SupportArticleForm: React.FC<SupportArticleFormProps> = ({ articleData }) => {
    const [saving, setSaving] = useState(false);
    const [topicsList, setTopicsList] = useState<any[]>([]);
    const [topicOptions, setTopicOptions] = useState<Option[]>([]);
    const [subTopicOptions, setSubTopicOptions] = useState<Option[]>([]);

    const dispatch = useAppDispatch();
    const { hideModal } = useModal();

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            title: "",
            description: "",
            main_topic: undefined,
            sub_topic: undefined,
        },
    });

    const watchMainTopic = watch("main_topic");

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const res = await fetchSupportTopicAndSubList();
                const data = res.data || res;
                setTopicsList(data);
                const opts = data.map((t: any) => ({ label: t.title, value: t.id }));
                setTopicOptions(opts);
            } catch (error) {
                console.error("Failed to fetch topics", error);
            }
        };
        fetchTopics();
    }, []);

    useEffect(() => {
        if (watchMainTopic?.value && topicsList.length > 0) {
            const selectedTopic = topicsList.find(t => t.id === watchMainTopic.value);
            if (selectedTopic && selectedTopic.subtopics) {
                const opts = selectedTopic.subtopics.map((st: any) => ({ label: st.title, value: st.id }));
                setSubTopicOptions(opts);
            } else {
                setSubTopicOptions([]);
            }
        } else {
            setSubTopicOptions([]);
        }
    }, [watchMainTopic, topicsList]);

    useEffect(() => {
        if (articleData && topicsList.length > 0) {
            setValue("title", articleData.title || "");
            setValue("description", articleData.description || "");

            if (articleData.main_topic) {
                setValue("main_topic", { label: articleData.main_topic.title, value: articleData.main_topic.id });

                const selectedTopic = topicsList.find(t => t.id === articleData.main_topic.id);
                if (selectedTopic && selectedTopic.subtopics) {
                    const opts = selectedTopic.subtopics.map((st: any) => ({ label: st.title, value: st.id }));
                    setSubTopicOptions(opts);

                    if (articleData.sub_topic) {
                        setValue("sub_topic", { label: articleData.sub_topic.title, value: articleData.sub_topic.id });
                    }
                }
            }
        }
    }, [articleData, topicsList, setValue]);

    const onSubmit = async (data: FormData) => {
        try {
            setSaving(true);
            const payload = {
                title: data.title.trim(),
                description: data.description.trim(),
                main_topic: data.main_topic.value,
                sub_topic: data.sub_topic.value,
                main_topic_id: data.main_topic.value,
                sub_topic_id: data.sub_topic.value,
                topic_id: data.main_topic.value,
                subtopic_id: data.sub_topic.value,
            };

            if (articleData?.id) {
                await dispatch(editSupportArticle({ id: articleData.id, articleData: payload })).unwrap();
                toast.success("Support Article updated successfully");
            } else {
                await dispatch(addSupportArticle(payload)).unwrap();
                toast.success("Support Article created successfully");
            }

            hideModal();
        } catch (err: any) {
            console.error("Support Article submission failed:", err);
            toast.error(err || "Failed to save support article");
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
                        <p className="text-sm font-semibold text-indigo-800">{articleData ? 'Edit Support Article' : 'Add Support Article'}</p>
                        <p className="text-xs text-indigo-500 mt-0.5">{articleData ? 'Update details of the support article.' : 'Create a new support article.'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Title */}
                    <div className="md:col-span-2">
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
                                    placeholder="Enter article title..."
                                    disabled={saving}
                                    className={`w-full px-4 py-3 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all ${errors.title
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

                    {/* Main Topic */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                            Topic <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="main_topic"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    options={topicOptions}
                                    placeholder="Select topic..."
                                    classNamePrefix="react-select"
                                    isDisabled={saving}
                                    onChange={(val) => {
                                        field.onChange(val);
                                        setValue("sub_topic", undefined as any);
                                    }}
                                    styles={{
                                        control: (base, state) => ({
                                            ...base,
                                            borderRadius: '12px',
                                            borderColor: errors.main_topic ? '#ef4444' : state.isFocused ? '#4f46e5' : '#e5e7eb',
                                            boxShadow: errors.main_topic ? '0 0 0 3px rgba(239,68,68,0.15)' : state.isFocused ? '0 0 0 3px rgba(79,70,229,0.15)' : 'none',
                                            fontSize: '14px',
                                            padding: '2px 0',
                                            '&:hover': { borderColor: errors.main_topic ? '#ef4444' : '#4f46e5' },
                                        }),
                                        menu: (base) => ({
                                            ...base,
                                            borderRadius: '12px',
                                            border: '1px solid #e5e7eb',
                                        }),
                                    }}
                                />
                            )}
                        />
                        {errors.main_topic && (
                            <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                                <AlertCircle size={13} /> {(errors.main_topic as any).message || (errors.main_topic?.label?.message) || "Topic is mandatory"}
                            </p>
                        )}
                    </div>

                    {/* Sub Topic */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                            Sub Topic <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="sub_topic"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    options={subTopicOptions}
                                    placeholder="Select sub topic..."
                                    classNamePrefix="react-select"
                                    isDisabled={saving || !watchMainTopic}
                                    styles={{
                                        control: (base, state) => ({
                                            ...base,
                                            borderRadius: '12px',
                                            borderColor: errors.sub_topic ? '#ef4444' : state.isFocused ? '#4f46e5' : '#e5e7eb',
                                            boxShadow: errors.sub_topic ? '0 0 0 3px rgba(239,68,68,0.15)' : state.isFocused ? '0 0 0 3px rgba(79,70,229,0.15)' : 'none',
                                            fontSize: '14px',
                                            padding: '2px 0',
                                            '&:hover': { borderColor: errors.sub_topic ? '#ef4444' : '#4f46e5' },
                                        }),
                                        menu: (base) => ({
                                            ...base,
                                            borderRadius: '12px',
                                            border: '1px solid #e5e7eb',
                                        }),
                                    }}
                                />
                            )}
                        />
                        {errors.sub_topic && (
                            <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                                <AlertCircle size={13} /> {(errors.sub_topic as any).message || (errors.sub_topic?.label?.message) || "Sub topic is mandatory"}
                            </p>
                        )}
                    </div>
                </div>

                {/* Description Text Editor */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                        Description <span className="text-red-500">*</span>
                    </label>
                    <Controller
                        name="description"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                            <div className={`rounded-xl overflow-hidden border ${errors.description ? 'border-red-400' : 'border-gray-200'}`}>
                                <LexicalEditor
                                    type="description"
                                    value={value || ''}
                                    onChange={onChange}
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
                        {saving ? 'Saving...' : (articleData ? 'Update Article' : 'Add Article')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SupportArticleForm;
