import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useModal } from '../../context/ModalContext';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addUniversity } from '../../store/slices/universitySlice';
import toast from 'react-hot-toast';
import { GraduationCap, Loader2, AlertCircle } from 'lucide-react';

type UniversityFormValues = {
    first_name: string;
    last_name: string;
    phone_number: string;
    work_email: string;
    institution_type: string;
    institution_name: string;
    job_role: string;
    department: string;
    country: string;
};

const INSTITUTION_TYPE_CHOICES = [
    'University/4 Year College',
    '2 Year College',
    'Graduate or Professional School',
    'Ministry of Education',
    'Other',
];

const JOB_ROLE_CHOICES = [
    'President/Provost',
    'Chancellor/Rector',
    'Vice-Chancellor/Vice-Rector',
    'Vice-President/Vice-Provost',
    'Registrar',
    'CEO',
    'COO/CIO',
    'Dean',
    'Department Head',
    'Director',
    'Professor',
    'Student',
];

const DEPARTMENT_CHOICES = [
    'Academic Affairs',
    'Career Services',
    'Continuing Education',
    'Enrollment Management',
    'Executive Leadership',
    'International',
    'Strategic Planning',
    'Student Affairs',
    'Teaching/Faculty/Research',
    'Other',
];

const UniversityForm = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dispatch = useAppDispatch();
    const { hideModal } = useModal();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<UniversityFormValues>({
        defaultValues: {
            first_name: '',
            last_name: '',
            phone_number: '',
            work_email: '',
            institution_type: '',
            institution_name: '',
            job_role: '',
            department: '',
            country: '',
        },
    });

    const onSubmit = async (data: UniversityFormValues) => {
        setIsSubmitting(true);
        try {
            await dispatch(addUniversity(data)).unwrap();
            toast.success("University added successfully");
            reset();
            hideModal();
        } catch (err: any) {
            console.error('University submission failed:', err);
            toast.error(err || "Failed to add university");
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClasses = "w-full h-11 px-4 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400";
    const labelClasses = "flex items-center justify-between px-1 mb-2";
    const spanLabelClasses = "text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]";
    const errorContainerClasses = "flex items-center gap-2 p-2 mt-1 rounded-xl bg-rose-50 text-rose-600 animate-in fade-in slide-in-from-top-1";
    const errorTextClasses = "text-[11px] font-bold uppercase tracking-wider";

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-indigo-50 border border-indigo-100 shadow-sm">
                <div className="p-3 bg-white rounded-xl text-indigo-500 shadow-sm border border-indigo-100">
                    <GraduationCap size={22} />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-indigo-900 tracking-tight">Add University</h3>
                    <p className="text-[11px] text-indigo-600/80 font-medium mt-0.5">
                        Fill in the details to create a new university request.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                    <label className={labelClasses}>
                        <span className={spanLabelClasses}>
                            First Name <span className="text-rose-500">*</span>
                        </span>
                    </label>
                    <input
                        type="text"
                        {...register('first_name', { required: 'First Name is required' })}
                        className={inputClasses}
                        placeholder="e.g. Test"
                    />
                    {errors.first_name && (
                        <div className={errorContainerClasses}>
                            <AlertCircle size={14} />
                            <span className={errorTextClasses}>{errors.first_name.message}</span>
                        </div>
                    )}
                </div>

                <div>
                    <label className={labelClasses}>
                        <span className={spanLabelClasses}>
                            Last Name <span className="text-rose-500">*</span>
                        </span>
                    </label>
                    <input
                        type="text"
                        {...register('last_name', { required: 'Last Name is required' })}
                        className={inputClasses}
                        placeholder="e.g. User"
                    />
                    {errors.last_name && (
                        <div className={errorContainerClasses}>
                            <AlertCircle size={14} />
                            <span className={errorTextClasses}>{errors.last_name.message}</span>
                        </div>
                    )}
                </div>

                <div>
                    <label className={labelClasses}>
                        <span className={spanLabelClasses}>
                            Phone Number <span className="text-rose-500">*</span>
                        </span>
                    </label>
                    <input
                        type="text"
                        {...register('phone_number', { required: 'Phone Number is required' })}
                        className={inputClasses}
                        placeholder="e.g. 9915039343"
                    />
                    {errors.phone_number && (
                        <div className={errorContainerClasses}>
                            <AlertCircle size={14} />
                            <span className={errorTextClasses}>{errors.phone_number.message}</span>
                        </div>
                    )}
                </div>

                <div>
                    <label className={labelClasses}>
                        <span className={spanLabelClasses}>
                            Work Email <span className="text-rose-500">*</span>
                        </span>
                    </label>
                    <input
                        type="email"
                        {...register('work_email', { required: 'Work Email is required' })}
                        className={inputClasses}
                        placeholder="e.g. example@yopmail.com"
                    />
                    {errors.work_email && (
                        <div className={errorContainerClasses}>
                            <AlertCircle size={14} />
                            <span className={errorTextClasses}>{errors.work_email.message}</span>
                        </div>
                    )}
                </div>

                <div>
                    <label className={labelClasses}>
                        <span className={spanLabelClasses}>
                            Institution Type <span className="text-rose-500">*</span>
                        </span>
                    </label>
                    <select
                        {...register('institution_type', { required: 'Institution Type is required' })}
                        className={inputClasses}
                    >
                        <option value="">Select Institution Type</option>
                        {INSTITUTION_TYPE_CHOICES.map(choice => (
                            <option key={choice} value={choice}>{choice}</option>
                        ))}
                    </select>
                    {errors.institution_type && (
                        <div className={errorContainerClasses}>
                            <AlertCircle size={14} />
                            <span className={errorTextClasses}>{errors.institution_type.message}</span>
                        </div>
                    )}
                </div>

                <div>
                    <label className={labelClasses}>
                        <span className={spanLabelClasses}>
                            Institution Name <span className="text-rose-500">*</span>
                        </span>
                    </label>
                    <input
                        type="text"
                        {...register('institution_name', { required: 'Institution Name is required' })}
                        className={inputClasses}
                        placeholder="e.g. KCGLOBED"
                    />
                    {errors.institution_name && (
                        <div className={errorContainerClasses}>
                            <AlertCircle size={14} />
                            <span className={errorTextClasses}>{errors.institution_name.message}</span>
                        </div>
                    )}
                </div>

                <div>
                    <label className={labelClasses}>
                        <span className={spanLabelClasses}>
                            Job Role <span className="text-rose-500">*</span>
                        </span>
                    </label>
                    <select
                        {...register('job_role', { required: 'Job Role is required' })}
                        className={inputClasses}
                    >
                        <option value="">Select Job Role</option>
                        {JOB_ROLE_CHOICES.map(choice => (
                            <option key={choice} value={choice}>{choice}</option>
                        ))}
                    </select>
                    {errors.job_role && (
                        <div className={errorContainerClasses}>
                            <AlertCircle size={14} />
                            <span className={errorTextClasses}>{errors.job_role.message}</span>
                        </div>
                    )}
                </div>

                <div>
                    <label className={labelClasses}>
                        <span className={spanLabelClasses}>
                            Department <span className="text-rose-500">*</span>
                        </span>
                    </label>
                    <select
                        {...register('department', { required: 'Department is required' })}
                        className={inputClasses}
                    >
                        <option value="">Select Department</option>
                        {DEPARTMENT_CHOICES.map(choice => (
                            <option key={choice} value={choice}>{choice}</option>
                        ))}
                    </select>
                    {errors.department && (
                        <div className={errorContainerClasses}>
                            <AlertCircle size={14} />
                            <span className={errorTextClasses}>{errors.department.message}</span>
                        </div>
                    )}
                </div>

                <div className="md:col-span-2">
                    <label className={labelClasses}>
                        <span className={spanLabelClasses}>
                            Country <span className="text-rose-500">*</span>
                        </span>
                    </label>
                    <input
                        type="text"
                        {...register('country', { required: 'Country is required' })}
                        className={inputClasses}
                        placeholder="e.g. India"
                    />
                    {errors.country && (
                        <div className={errorContainerClasses}>
                            <AlertCircle size={14} />
                            <span className={errorTextClasses}>{errors.country.message}</span>
                        </div>
                    )}
                </div>
            </div>

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
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] text-white bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95 min-w-[160px]"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 size={14} className="animate-spin" />
                            Adding...
                        </>
                    ) : (
                        'Add University'
                    )}
                </button>
            </div>
        </form>
    );
};

export default UniversityForm;
