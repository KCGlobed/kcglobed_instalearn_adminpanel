import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Select from "react-select";
import { useModal } from "../../context/ModalContext";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { addSupportSubTopic, editSupportSubTopic } from "../../store/slices/supportSubTopicSlice";
import { fetchSupportTopicList } from "../../services/apiServices";
import toast from "react-hot-toast";
import { MessageSquare, Loader2, AlertCircle } from "lucide-react";
import type { supportSubTopic } from "../../utils/types";
import LexicalEditor from "../TextEditor";

const schema = yup.object().shape({
    title: yup.string().required("Title is mandatory").min(2, "Title must be at least 2 characters"),
    main_topic: yup.object().shape({
        label: yup.string().required(),
        value: yup.string().required(),
    }).required("Main topic is mandatory"),
});

type FormData = yup.InferType<typeof schema>;

type Props = {
    subTopicData?: supportSubTopic;
}

const SupportSubTopicForm: React.FC<Props> = ({ subTopicData }) => {
    const [saving, setSaving] = useState(false);
    const [topicOptions, setTopicOptions] = useState<{ label: string; value: string }[]>([]);
    const [loadingTopics, setLoadingTopics] = useState(true);
    const dispatch = useAppDispatch();
    const { hideModal } = useModal();

    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            title: "",
            main_topic: undefined,
        },
    });

    useEffect(() => {
        const getTopics = async () => {
            try {
                const response = await fetchSupportTopicList();
                // Assuming response returns an array of topics directly or inside data
                const topics = response?.data || response || [];
                const options = topics.map((t: any) => ({
                    label: t.title,
                    value: String(t.id)
                }));
                setTopicOptions(options);

                if (subTopicData?.main_topic) {
                    const selected = options.find((o: any) => o.value === String(subTopicData.main_topic.id));
                    if (selected) {
                        setValue("main_topic", selected);
                    } else {
                        // Fallback if not found in list for some reason
                        setValue("main_topic", {
                            label: subTopicData.main_topic.title,
                            value: String(subTopicData.main_topic.id)
                        });
                    }
                }
            } catch (error) {
                console.error("Failed to load topics:", error);
                toast.error("Failed to load topics");
            } finally {
                setLoadingTopics(false);
            }
        };
        getTopics();
    }, [subTopicData, setValue]);

    useEffect(() => {
        if (subTopicData) {
            setValue("title", subTopicData.title || "");
        }
    }, [subTopicData, setValue]);

    const onSubmit = async (data: FormData) => {
        try {
            setSaving(true);
            const payload = {
                title: data.title.trim(),
                main_topic: data.main_topic.value
            };

            if (subTopicData?.id) {
                await dispatch(editSupportSubTopic({ id: subTopicData.id, topicData: payload })).unwrap();
                toast.success("Support Subtopic updated successfully");
            } else {
                await dispatch(addSupportSubTopic(payload)).unwrap();
                toast.success("Support Subtopic created successfully");
            }

            hideModal();
        } catch (err: any) {
            console.error("Support Subtopic submission failed:", err);
            toast.error(err || "Failed to save support subtopic");
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
                        <p className="text-sm font-semibold text-indigo-800">{subTopicData ? 'Edit Support Subtopic' : 'Add Support Subtopic'}</p>
                        <p className="text-xs text-indigo-500 mt-0.5">{subTopicData ? 'Update details of the support subtopic.' : 'Create a new support subtopic.'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5">
                    {/* Main Topic Selection */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                            Main Topic <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="main_topic"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    options={topicOptions}
                                    isLoading={loadingTopics}
                                    placeholder="Select a main topic..."
                                    classNamePrefix="react-select"
                                    isDisabled={saving || loadingTopics}
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
                                            zIndex: 50
                                        }),
                                    }}
                                />
                            )}
                        />
                        {errors.main_topic && (
                            <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                                <AlertCircle size={13} /> {(errors.main_topic as any).message || (errors.main_topic?.label?.message) || "Main topic is mandatory"}
                            </p>
                        )}
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                            Subtopic Title <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="title"
                            control={control}
                            render={({ field: { value, onChange } }) => (
                                <div className={`rounded-xl overflow-hidden border ${errors.title ? 'border-red-400' : 'border-gray-200'}`}>
                                    <LexicalEditor
                                        type="title"
                                        value={value || ''}
                                        onChange={onChange}
                                    />
                                </div>
                            )}
                        />
                        {errors.title && (
                            <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                                <AlertCircle size={13} /> {errors.title.message}
                            </p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 mt-2">
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
                        {saving ? 'Saving...' : (subTopicData ? 'Update Subtopic' : 'Add Subtopic')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SupportSubTopicForm;
