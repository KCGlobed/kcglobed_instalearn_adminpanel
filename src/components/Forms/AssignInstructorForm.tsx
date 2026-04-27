import { useEffect, useState } from 'react';
import Select from 'react-select';
import toast from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { assignInstructorApi, courseDetailApi, fetchInstructorOptionsApi } from '../../services/apiServices';
import { useModal } from '../../context/ModalContext';
import { UserCheck, Loader2, AlertCircle } from 'lucide-react';

interface Option { label: string; value: any; }

interface AssignInstructorFormProps {
    courseId: number | string;
}

const schema = yup.object().shape({
    instructor: yup.array()
        .of(
            yup.object().shape({
                label: yup.string().required(),
                value: yup.mixed().required(),
            })
        )
        .min(1, "Please select at least one instructor")
        .required("Please select at least one instructor"),
});

type FormData = yup.InferType<typeof schema>;

const AssignInstructorForm: React.FC<AssignInstructorFormProps> = ({ courseId }) => {
    const [options, setOptions] = useState<Option[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { hideModal } = useModal();

    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            instructor: [],
        },
    });

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetchInstructorOptionsApi();
                setOptions(
                    (res?.data || []).map((item: any) => ({
                        label: item.text_1,
                        value: item.id,
                        // Enhanced metadata for premium display
                        meta: {
                            qualification: item.text_2,
                            company: item.text_3,
                            experience: item.experience,
                            avatar: item.image
                        }
                    }))
                );
            } catch {
                toast.error('Failed to load instructors.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [courseId]);

    const onSubmit = async (data: FormData) => {
        try {
            setSaving(true);
            const res = await assignInstructorApi({
                course_id: courseId,
                instructor_id: data.instructor.map((item: any) => item.value).join(",")
            });
            if (res?.status) {
                toast.success(res?.message || 'Instructor assigned successfully');
                hideModal();
            } else {
                toast.error(res?.message || 'Failed to assign instructor');
            }
        } catch (error) {
            toast.error('Failed to assign instructor.');
        } finally {
            setSaving(false);
        }
    };

    const fetchInstructorDetails = async (courseId: number | string) => {
        try {
            const res = await courseDetailApi(courseId);
            if (res.data.instructors && res.data.instructors.length > 0) {
                const instructor = res.data.instructors[0].instructor_info;
                if (instructor) {
                    setValue('instructor', [{
                        label: instructor.text_1,
                        value: instructor.id,
                        meta: {
                            qualification: instructor.text_2,
                            company: instructor.text_3,
                            experience: instructor.experience,
                            avatar: instructor.image
                        }
                    }] as any);
                }
            }
        } catch {
            toast.error('Failed to load instructor details.');
        }
    };

    useEffect(() => {
        if (courseId) {
            fetchInstructorDetails(courseId);
        }
    }, [courseId])

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            {/* Header info */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                <span className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                    <UserCheck size={18} />
                </span>
                <div>
                    <p className="text-sm font-semibold text-emerald-800">Assign Instructor</p>
                    <p className="text-xs text-emerald-500 mt-0.5">Choose the instructor responsible for this course.</p>
                </div>
            </div>

            {/* Select */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Instructor
                </label>
                {loading ? (
                    <div className="flex items-center gap-2 py-4 text-gray-400 text-sm">
                        <Loader2 size={16} className="animate-spin" /> Loading instructors...
                    </div>
                ) : (
                    <Controller
                        name="instructor"
                        control={control}
                        render={({ field }) => (
                            <Select
                                {...field}
                                isMulti
                                options={options}
                                placeholder="Search and select instructor..."
                                classNamePrefix="react-select"
                                closeMenuOnSelect={false}
                                isDisabled={saving}
                                formatOptionLabel={(option: any, { context }: any) => (
                                    context === 'menu' ? (
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-100">
                                                {option.meta?.avatar ? (
                                                    <img src={option.meta.avatar} className="w-full h-full object-cover" alt="" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                        <UserCheck size={16} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-sm font-bold text-slate-900 truncate">{option.label}</p>
                                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                                        {option.meta?.experience}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <p className="text-[11px] font-medium text-slate-500 truncate">{option.meta?.qualification}</p>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                    <p className="text-[11px] font-medium text-slate-400 truncate">{option.meta?.company}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        option.label
                                    )
                                )}
                                styles={{
                                    control: (base, state) => ({
                                        ...base,
                                        borderRadius: '12px',
                                        borderColor: errors.instructor
                                            ? '#ef4444'
                                            : state.isFocused
                                                ? '#10b981'
                                                : '#e5e7eb',
                                        boxShadow: errors.instructor
                                            ? '0 0 0 3px rgba(239,68,68,0.15)'
                                            : state.isFocused
                                                ? '0 0 0 3px rgba(16,185,129,0.15)'
                                                : 'none',
                                        fontSize: '14px',
                                        transition: 'border-color 0.2s, box-shadow 0.2s',
                                        '&:hover': {
                                            borderColor: errors.instructor ? '#ef4444' : '#10b981',
                                        },
                                    }),
                                    multiValue: (base) => ({
                                        ...base,
                                        backgroundColor: '#ecfdf5',
                                        borderRadius: '8px',
                                    }),
                                    multiValueLabel: (base) => ({
                                        ...base,
                                        color: '#059669',
                                        fontWeight: 600,
                                        fontSize: '12px',
                                    }),
                                    multiValueRemove: (base) => ({
                                        ...base,
                                        color: '#10b981',
                                        borderRadius: '0 8px 8px 0',
                                        '&:hover': {
                                            backgroundColor: '#a7f3d0',
                                            color: '#047857',
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
                                            ? '#ecfdf5'
                                            : state.isFocused
                                                ? '#f0fdf4'
                                                : 'white',
                                        color: state.isSelected ? '#047857' : '#111827',
                                        fontWeight: state.isSelected ? 600 : 400,
                                        fontSize: '14px',
                                    }),
                                }}
                            />
                        )}
                    />
                )}

                {errors.instructor && (
                    <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                        <AlertCircle size={13} />
                        {errors.instructor.message}
                    </p>
                )}

                {!errors.instructor && !loading && (
                    <p className="mt-1.5 text-[11px] text-gray-400">
                        You can select multiple instructors. They will be linked to this course immediately.
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
                    disabled={saving || loading}
                    className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm flex items-center gap-2"
                >
                    {saving && <Loader2 size={14} className="animate-spin" />}
                    {saving ? 'Saving...' : 'Assign Instructor'}
                </button>
            </div>
        </form>
    );
};

export default AssignInstructorForm;
