import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import toast from 'react-hot-toast';
import { assignChapterApi, courseDetailApi, fetchChapterOptionsApi, fetchCourseDetailApi } from '../../services/apiServices';
import { useModal } from '../../context/ModalContext';
import { BookOpen, Loader2, AlertCircle } from 'lucide-react';
import { useAppDispatch } from '../../hooks/useAppDispatch';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Option {
    label: string;
    value: any;
}

interface AssignChapterFormValues {
    chapters: Option[];
}

interface AssignChapterFormProps {
    courseId: number | string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const AssignChapterForm: React.FC<AssignChapterFormProps> = ({ courseId }) => {
    const [options, setOptions] = useState<Option[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const { hideModal } = useModal();
    const dispatch = useAppDispatch();

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setValue,
    } = useForm<AssignChapterFormValues>({
        defaultValues: { chapters: [] },
    });

    useEffect(() => {
        const load = async () => {
            try {
                const optionsRes = await fetchChapterOptionsApi();
                const allOptions: Option[] = (optionsRes.data || optionsRes || []).map((item: any) => ({
                    label: item.name || item.title || 'Unknown',
                    value: item.id,
                }));
                setOptions(allOptions);

                try {
                    // Switching to fetchCourseDetailApi because assign-chapter-course GET returns 405
                    const res = await fetchCourseDetailApi(courseId);
                    const courseData = res.data || res;

                    if (courseData.chapters_info && Array.isArray(courseData.chapters_info)) {
                        const assignedOptions: Option[] = courseData.chapters_info.map((item: any) => {
                            const info = item.chapter_info || {};
                            const id = info.id || item.id;
                            const name = info.name || info.title || `Chapter ${id}`;

                            // Match with allOptions to get the correct label
                            const matchedOption = allOptions.find(opt => opt.value == id);
                            return matchedOption || { label: name, value: id };
                        });

                        // reset() is the most reliable way to pre-populate controlled selects
                        reset({ chapters: assignedOptions });
                    }
                } catch (error) {
                    console.error('Error fetching course chapters:', error);
                }
            } catch {
                toast.error('Failed to load chapters.');
            } finally {
                setLoadingOptions(false);
            }
        };
        load();
    }, [courseId, setValue]);

    const onSubmit = async (data: AssignChapterFormValues) => {
        try {
            // TODO: call your assign-chapter API here
            // await assignChaptersApi(courseId, data.chapters.map(c => c.value));
            console.log('Assigning chapters:', {
                courseId,
                chapters: data.chapters.map((c) => c.value),
            });
            let payload = {
                chapters: data.chapters.map((c) => c.value)
            }
            const res = await assignChapterApi(courseId, payload);
            if (res.status) {
                toast.success(res.message);
                reset();
                hideModal();
            } else {
                toast.error(res.message);
            }
        } catch {
            toast.error('Failed to assign chapters. Please try again.');
        }
    };

    const fetchChapterOptions = async (courseId: number | string) => {
        setLoadingOptions(true);
        try {
            const res = await courseDetailApi(courseId);
            setValue('chapters', res.data.chapters_info?.map((item: any) => ({ label: item.chapter_info?.name, value: item.chapter_info?.id })));
        } catch {
            toast.error('Failed to load chapters.');
        } finally {
            setLoadingOptions(false);
        }
    };

    useEffect(() => {
        if (courseId) {
            fetchChapterOptions(courseId);
        }
    }, [courseId])

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">

            <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                <span className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <BookOpen size={18} />
                </span>
                <div>
                    <p className="text-sm font-semibold text-indigo-800">Assign Chapters</p>
                    <p className="text-xs text-indigo-500 mt-0.5">
                        Select one or more chapters to link to this course.
                    </p>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Chapters <span className="text-red-500">*</span>
                </label>

                {loadingOptions ? (
                    <div className="flex items-center gap-2 py-4 text-gray-400 text-sm">
                        <Loader2 size={16} className="animate-spin" />
                        Loading chapters...
                    </div>
                ) : (
                    <Controller
                        name="chapters"
                        control={control}
                        rules={{
                            validate: (val) =>
                                val.length > 0 || 'Please select at least one chapter.',
                        }}
                        render={({ field }) => (
                            <Select
                                {...field}
                                isMulti
                                options={options}
                                placeholder="Search and select chapters..."
                                classNamePrefix="react-select"
                                closeMenuOnSelect={false}
                                isDisabled={isSubmitting}
                                styles={{
                                    control: (base, state) => ({
                                        ...base,
                                        borderRadius: '12px',
                                        borderColor: errors.chapters
                                            ? '#ef4444'
                                            : state.isFocused
                                                ? '#6366f1'
                                                : '#e5e7eb',
                                        boxShadow: errors.chapters
                                            ? '0 0 0 3px rgba(239,68,68,0.15)'
                                            : state.isFocused
                                                ? '0 0 0 3px rgba(99,102,241,0.15)'
                                                : 'none',
                                        fontSize: '14px',
                                        transition: 'border-color 0.2s, box-shadow 0.2s',
                                        '&:hover': {
                                            borderColor: errors.chapters ? '#ef4444' : '#6366f1',
                                        },
                                    }),
                                    multiValue: (base) => ({
                                        ...base,
                                        backgroundColor: '#eef2ff',
                                        borderRadius: '8px',
                                    }),
                                    multiValueLabel: (base) => ({
                                        ...base,
                                        color: '#4f46e5',
                                        fontWeight: 600,
                                        fontSize: '12px',
                                    }),
                                    multiValueRemove: (base) => ({
                                        ...base,
                                        color: '#6366f1',
                                        borderRadius: '0 8px 8px 0',
                                        '&:hover': {
                                            backgroundColor: '#c7d2fe',
                                            color: '#4338ca',
                                        },
                                    }),
                                    placeholder: (base) => ({
                                        ...base,
                                        color: '#9ca3af',
                                        fontSize: '14px',
                                    }),
                                    menu: (base) => ({
                                        ...base,
                                        borderRadius: '12px',
                                        boxShadow:
                                            '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)',
                                        border: '1px solid #e5e7eb',
                                        overflow: 'hidden',
                                    }),
                                    option: (base, state) => ({
                                        ...base,
                                        backgroundColor: state.isSelected
                                            ? '#eef2ff'
                                            : state.isFocused
                                                ? '#f5f3ff'
                                                : 'white',
                                        color: state.isSelected ? '#4338ca' : '#111827',
                                        fontWeight: state.isSelected ? 600 : 400,
                                        fontSize: '14px',
                                    }),
                                }}
                            />
                        )}
                    />
                )}

                {errors.chapters && (
                    <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                        <AlertCircle size={13} />
                        {errors.chapters.message}
                    </p>
                )}

                {!errors.chapters && !loadingOptions && (
                    <p className="mt-1.5 text-[11px] text-gray-400">
                        You can select multiple chapters. They will be linked to this course immediately.
                    </p>
                )}
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button
                    type="button"
                    onClick={() => { reset(); hideModal(); }}
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting || loadingOptions}
                    className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm flex items-center gap-2"
                >
                    {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                    {isSubmitting ? 'Saving...' : 'Assign Chapters'}
                </button>
            </div>
        </form>
    );
};

export default AssignChapterForm;
