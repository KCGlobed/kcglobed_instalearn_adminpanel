import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useModal } from "../../context/ModalContext";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { addTrailStudent, getTrailStudents } from "../../store/slices/trailStudent";
import { fetchTrailCoursesListApi } from "../../services/apiServices";
import toast from "react-hot-toast";
import { UserPlus, Loader2, AlertCircle } from "lucide-react";

interface Option { label: string; value: number; }

const schema = yup.object().shape({
    first_name: yup.string().required("First name is mandatory").min(2, "First name must be at least 2 characters"),
    last_name: yup.string().required("Last name is mandatory").min(2, "Last name must be at least 2 characters"),
    email: yup.string().email("Invalid email address").required("Email is mandatory"),
    phone: yup.string()
        .required("Phone number is required")
        .matches(/^[6-9]/, "Please enter a valid number")
        .matches(/^[0-9]{10}$/, "Enter a valid 10-digit phone number"),
    course_id: yup.array().of(
        yup.object().shape({
            label: yup.string().required(),
            value: yup.number().required(),
        })
    ).min(1, "At least one course must be selected").required("Trail Courses are mandatory").default([]),
});

type FormData = yup.InferType<typeof schema>;

const TrailStudentForm: React.FC = () => {
    const [courseOptions, setCourseOptions] = useState<Option[]>([]);
    const [coursesLoading, setCoursesLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const dispatch = useAppDispatch();
    const { hideModal } = useModal();

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema) as any,
        defaultValues: {
            first_name: "",
            last_name: "",
            email: "",
            phone: "",
            course_id: [],
        },
    });

    useEffect(() => {
        const loadCourses = async () => {
            setCoursesLoading(true);
            try {
                const res = await fetchTrailCoursesListApi();
                if (res?.data) {
                    const options = res.data.map((c: any) => ({
                        label: c.name,
                        value: c.id
                    }));
                    setCourseOptions(options);
                }
            } catch {
                toast.error('Failed to load trail courses');
            } finally {
                setCoursesLoading(false);
            }
        };
        loadCourses();
    }, []);

    const onSubmit = async (data: FormData) => {
        try {
            setSaving(true);
            const payload = {
                first_name: data.first_name.trim(),
                last_name: data.last_name.trim(),
                email: data.email.trim(),
                phone: data.phone.trim(),
                course_id: data.course_id.map((c: any) => Number(c.value)),
            };

            await dispatch(addTrailStudent(payload)).unwrap();
            dispatch(getTrailStudents({ page: 1 }));
            toast.success("Trail student registered successfully");
            hideModal();
        } catch (err: any) {
            console.error("Trail student registration failed:", err);
            toast.error(err || "Failed to register trail student");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 max-h-[75vh] overflow-y-auto custom-scrollbar px-2 pb-2">
            {/* Header info */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
                <span className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <UserPlus size={18} />
                </span>
                <div>
                    <p className="text-sm font-semibold text-blue-800">Register Trail Student</p>
                    <p className="text-xs text-blue-500 mt-0.5">Register a new trail student and assign courses.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* First Name */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                        First Name <span className="text-red-500">*</span>
                    </label>
                    <Controller
                        name="first_name"
                        control={control}
                        render={({ field }) => (
                            <input
                                {...field}
                                type="text"
                                placeholder="e.g. John"
                                disabled={saving}
                                className={`w-full px-4 py-3 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all ${errors.first_name
                                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30'
                                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 hover:border-gray-300'
                                    }`}
                            />
                        )}
                    />
                    {errors.first_name && (
                        <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                            <AlertCircle size={13} /> {errors.first_name.message}
                        </p>
                    )}
                </div>

                {/* Last Name */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                        Last Name <span className="text-red-500">*</span>
                    </label>
                    <Controller
                        name="last_name"
                        control={control}
                        render={({ field }) => (
                            <input
                                {...field}
                                type="text"
                                placeholder="e.g. Doe"
                                disabled={saving}
                                className={`w-full px-4 py-3 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all ${errors.last_name
                                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30'
                                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 hover:border-gray-300'
                                    }`}
                            />
                        )}
                    />
                    {errors.last_name && (
                        <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                            <AlertCircle size={13} /> {errors.last_name.message}
                        </p>
                    )}
                </div>

                {/* Email */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <input
                                {...field}
                                type="email"
                                placeholder="e.g. john@example.com"
                                disabled={saving}
                                className={`w-full px-4 py-3 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all ${errors.email
                                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30'
                                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 hover:border-gray-300'
                                    }`}
                            />
                        )}
                    />
                    {errors.email && (
                        <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                            <AlertCircle size={13} /> {errors.email.message}
                        </p>
                    )}
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                        Phone <span className="text-red-500">*</span>
                    </label>
                    <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                            <input
                                {...field}
                                type="text"
                                maxLength={10}
                                disabled={saving}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                                    field.onChange(val);
                                }}
                                className={`w-full px-4 py-3 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all ${errors.phone
                                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30'
                                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 hover:border-gray-300'
                                    }`}
                                placeholder="Enter 10-digit Phone"
                            />
                        )}
                    />
                    {errors.phone && (
                        <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                            <AlertCircle size={13} /> {errors.phone.message}
                        </p>
                    )}
                </div>
            </div>

            {/* Course Select */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Trail Courses <span className="text-red-500">*</span>
                </label>
                {coursesLoading && courseOptions.length === 0 ? (
                    <div className="flex items-center gap-2 py-4 text-gray-400 text-sm">
                        <Loader2 size={16} className="animate-spin" /> Loading courses...
                    </div>
                ) : (
                    <Controller
                        name="course_id"
                        control={control}
                        render={({ field }) => (
                            <Select
                                {...field}
                                options={courseOptions}
                                isMulti
                                isClearable
                                placeholder="Search and select courses..."
                                classNamePrefix="react-select"
                                isDisabled={saving}
                                styles={{
                                    control: (base, state) => ({
                                        ...base,
                                        borderRadius: '12px',
                                        borderColor: errors.course_id ? '#ef4444' : state.isFocused ? '#3b82f6' : '#e5e7eb',
                                        boxShadow: errors.course_id ? '0 0 0 3px rgba(239,68,68,0.15)' : state.isFocused ? '0 0 0 3px rgba(59,130,246,0.15)' : 'none',
                                        fontSize: '14px',
                                        '&:hover': { borderColor: errors.course_id ? '#ef4444' : '#3b82f6' },
                                        minHeight: '46px',
                                    }),
                                    menu: (base) => ({
                                        ...base,
                                        borderRadius: '12px',
                                        border: '1px solid #e5e7eb',
                                    }),
                                    multiValue: (base) => ({
                                        ...base,
                                        backgroundColor: '#eff6ff',
                                        borderRadius: '6px',
                                    }),
                                    multiValueLabel: (base) => ({
                                        ...base,
                                        color: '#1d4ed8',
                                        fontWeight: 600,
                                    }),
                                    multiValueRemove: (base) => ({
                                        ...base,
                                        color: '#1d4ed8',
                                        ':hover': {
                                            backgroundColor: '#dbeafe',
                                            color: '#1e3a8a',
                                        },
                                    }),
                                }}
                            />
                        )}
                    />
                )}
                {errors.course_id && (
                    <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                        <AlertCircle size={13} /> {errors.course_id.message}
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
                    className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm flex items-center gap-2"
                >
                    {saving && <Loader2 size={14} className="animate-spin" />}
                    {saving ? 'Registering...' : 'Register Trail Student'}
                </button>
            </div>
        </form>
    );
};

export default TrailStudentForm;
