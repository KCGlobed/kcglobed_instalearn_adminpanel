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
    instructor: yup.object().shape({
        label: yup.string().required(),
        value: yup.mixed().required(),
    }).nullable().required('Please select an instructor'),
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
            instructor: undefined,
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
                instructor_id: data.instructor?.value
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
                    setValue('instructor', {
                        label: instructor.text_1,
                        value: instructor.id,
                        meta: {
                            qualification: instructor.text_2,
                            company: instructor.text_3,
                            experience: instructor.experience,
                            avatar: instructor.image
                        }
                    } as any);
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
                    <>
                        <Controller
                            name="instructor"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    options={options}
                                    placeholder="Search and select instructor..."
                                    classNamePrefix="react-select"
                                    formatOptionLabel={(option: any) => (
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
                                    )}
                                    styles={{
                                        control: (base) => ({
                                            ...base,
                                            borderRadius: '16px',
                                            borderColor: errors.instructor ? '#ef4444' : '#e2e8f0',
                                            boxShadow: 'none',
                                            padding: '4px',
                                            fontSize: '14px',
                                            transition: 'all 0.3s ease',
                                            '&:hover': { borderColor: errors.instructor ? '#ef4444' : '#10b981', boxShadow: '0 4px 12px -2px rgba(16, 185, 129, 0.1)' },
                                        }),
                                        option: (base, state) => ({
                                            ...base,
                                            backgroundColor: state.isSelected ? '#10b981' : state.isFocused ? '#f8fafc' : 'white',
                                            color: state.isSelected ? 'white' : '#111827',
                                            transition: 'all 0.2s',
                                            padding: '10px 12px',
                                            cursor: 'pointer',
                                        }),
                                        menu: (base) => ({
                                            ...base,
                                            borderRadius: '20px',
                                            overflow: 'hidden',
                                            marginTop: '8px',
                                            border: '1px solid #f1f5f9',
                                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                        }),
                                    }}
                                />
                            )}
                        />
                        {errors.instructor && (
                            <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle size={12} /> {errors.instructor.message}
                            </p>
                        )}
                    </>
                )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button
                    type="button"
                    onClick={hideModal}
                    className="px-5 py-2 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={saving || loading}
                    className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
                >
                    {saving ? 'Saving...' : 'Assign Instructor'}
                </button>
            </div>
        </form>
    );
};

export default AssignInstructorForm;
