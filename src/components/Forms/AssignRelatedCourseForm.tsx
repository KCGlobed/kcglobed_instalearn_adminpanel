import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import toast from 'react-hot-toast';
import {
    assignRelatedCourseApi,
    courseDetailApi,
    fetchRelatedCourseOptionsApi
} from '../../services/apiServices';
import { useModal } from '../../context/ModalContext';
import { Layers, Loader2, AlertCircle } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Option {
    label: string;
    value: any;
}

interface AssignRelatedCourseFormValues {
    related_courses: Option[];
}

interface AssignRelatedCourseFormProps {
    courseId: number | string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const AssignRelatedCourseForm: React.FC<AssignRelatedCourseFormProps> = ({ courseId }) => {
    const [options, setOptions] = useState<Option[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const { hideModal } = useModal();

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setValue,
    } = useForm<AssignRelatedCourseFormValues>({
        defaultValues: { related_courses: [] },
    });

    // ── Load course options and currently assigned courses ──
    useEffect(() => {
        const loadData = async () => {
            setLoadingOptions(true);
            try {
                // Fetch both concurrently to avoid race conditions and glitching
                const [optionsRes, detailRes] = await Promise.all([
                    fetchRelatedCourseOptionsApi(),
                    courseDetailApi(courseId)
                ]);

                // Process options and filter out duplicates
                if (optionsRes && optionsRes.data) {
                    const uniqueOptionsMap = new Map();
                    optionsRes.data.forEach((item: any) => {
                        if (item && item.id) {
                            uniqueOptionsMap.set(item.id, { label: item.name, value: item.id });
                        }
                    });
                    setOptions(Array.from(uniqueOptionsMap.values()));
                }

                // Process currently assigned courses and filter out duplicates
                if (detailRes && detailRes.data && detailRes.data.related_courses) {
                    const uniqueAssignedMap = new Map();
                    detailRes.data.related_courses.forEach((item: any) => {
                        if (item && item.course_info && item.course_info.id) {
                            uniqueAssignedMap.set(item.course_info.id, {
                                label: item.course_info.name,
                                value: item.course_info.id
                            });
                        }
                    });
                    setValue('related_courses', Array.from(uniqueAssignedMap.values()));
                } else {
                    setValue('related_courses', []);
                }
            } catch (error) {
                toast.error('Failed to load course assignments.');
                console.error(error);
            } finally {
                setLoadingOptions(false);
            }
        };

        if (courseId) {
            loadData();
        }
    }, [courseId, setValue]);

    // ── Submit handler ──
 const onSubmit = async (data: AssignRelatedCourseFormValues) => {
    try {

        const uniqueIds = [...new Set(
            data.related_courses.map((c) => Number(c.value))
        )];

        const payload = {
            course_id: courseId,
            related_course_id: uniqueIds.join(",")
        };

        const res = await assignRelatedCourseApi(payload);

        if (res.status) {
            toast.success(res.message || 'Related courses updated!');
            hideModal();
        } else {
            toast.error(res.message || 'Failed to update.');
        }

    } catch (err: any) {
        toast.error(err?.message || 'Something went wrong. Please try again.');
    }
};

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
            {/* Header Banner - Emerald Premium Theme */}
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-emerald-50 border border-emerald-100 shadow-sm">
                <div className="p-3 bg-white rounded-xl text-emerald-500 shadow-sm border border-emerald-100">
                    <Layers size={22} />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-emerald-900 tracking-tight">Assign Related Courses</h3>
                    <p className="text-[11px] text-emerald-600/80 font-medium mt-0.5">
                        These courses will be recommended to students on the course detail page.
                    </p>
                </div>
            </div>

            {/* Multi-Select Field */}
            <div className="space-y-3">
                <label className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        Select Related Courses <span className="text-rose-500">*</span>
                    </span>
                </label>

                {loadingOptions ? (
                    <div className="flex items-center gap-2 py-4 text-slate-400 text-sm">
                        <Loader2 size={16} className="animate-spin text-emerald-500" />
                        Loading courses...
                    </div>
                ) : (
                    <>
                        <Controller
                            name="related_courses"
                            control={control}
                            rules={{
                                validate: (val) => val.length > 0 || 'Please select at least one course.'
                            }}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    isMulti
                                    options={options.filter(o => o.value !== Number(courseId))} // Prevent self-referencing
                                    placeholder="Search courses..."
                                    classNamePrefix="emerald-select"
                                    closeMenuOnSelect={false}
                                    isDisabled={isSubmitting}
                                    styles={{
                                        control: (base, state) => ({
                                            ...base,
                                            borderRadius: '16px',
                                            padding: '6px',
                                            backgroundColor: '#fff',
                                            borderColor: errors.related_courses ? '#fda4af' : state.isFocused ? '#10b981' : '#f1f5f9',
                                            borderWidth: '2px',
                                            boxShadow: 'none',
                                            '&:hover': { borderColor: errors.related_courses ? '#f43f5e' : '#10b981' },
                                            transition: 'all 0.2s ease',
                                            minHeight: '52px'
                                        }),
                                        multiValue: (base) => ({
                                            ...base,
                                            backgroundColor: '#f0fdf4',
                                            borderRadius: '10px',
                                            border: '1px solid #d1fae5',
                                        }),
                                        multiValueLabel: (base) => ({
                                            ...base,
                                            color: '#065f46',
                                            fontWeight: 700,
                                            fontSize: '12px',
                                            padding: '2px 8px',
                                        }),
                                        multiValueRemove: (base) => ({
                                            ...base,
                                            color: '#059669',
                                            borderRadius: '0 10px 10px 0',
                                            '&:hover': {
                                                backgroundColor: '#059669',
                                                color: 'white',
                                            },
                                        }),
                                        placeholder: (base) => ({
                                            ...base,
                                            color: '#94a3b8',
                                            fontSize: '13px',
                                            fontWeight: '500'
                                        }),
                                        menu: (base) => ({
                                            ...base,
                                            borderRadius: '20px',
                                            padding: '8px',
                                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                            border: '1px solid #f1f5f9',
                                            zIndex: 50
                                        }),
                                        option: (base, state) => ({
                                            ...base,
                                            borderRadius: '12px',
                                            margin: '2px 0',
                                            backgroundColor: state.isSelected ? '#10b981' : state.isFocused ? '#f0fdf4' : 'transparent',
                                            color: state.isSelected ? 'white' : '#475569',
                                            fontWeight: state.isSelected ? 700 : 500,
                                            fontSize: '13px',
                                            cursor: 'pointer',
                                            '&:active': { backgroundColor: '#059669' },
                                        }),
                                    }}
                                />
                            )}
                        />

                        {/* Validation & Feedback */}
                        {errors.related_courses ? (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 text-rose-600 animate-in fade-in slide-in-from-top-1">
                                <AlertCircle size={14} />
                                <span className="text-[11px] font-bold uppercase tracking-wider">{errors.related_courses.message}</span>
                            </div>
                        ) : (
                            <p className="text-[10px] text-slate-400 font-bold px-2 italic tracking-tight">
                                * You can link multiple courses as related.
                            </p>
                        )}
                    </>
                )}
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                    type="button"
                    onClick={() => hideModal()}
                    className="px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 hover:text-slate-900 transition-all"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting || loadingOptions}
                    className="flex items-center gap-2 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-200 hover:shadow-emerald-300 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 size={14} className="animate-spin" />
                            Updating...
                        </>
                    ) : (
                        'Assign Courses'
                    )}
                </button>
            </div>
        </form>
    );
};

export default AssignRelatedCourseForm;