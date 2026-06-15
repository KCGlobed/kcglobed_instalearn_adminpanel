import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import toast from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { createCourseAnnouncementApi, fetchCourseListWithInstructorApi, viewCourseAnnouncementApi } from '../../services/apiServices';
import { useModal } from '../../context/ModalContext';
import { Megaphone, Loader2, AlertCircle, UserCheck } from 'lucide-react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { getCourseAnnouncement, updateCourseAnnouncement } from '../../store/slices/courseAnnouncementSlice';

interface Option { label: string; value: any; meta?: any; }

const schema = yup.object().shape({
    course: yup.object().shape({
        label: yup.string().required(),
        value: yup.mixed().required(),
    }).required("Please select a course").nullable(),
    instructor: yup.array()
        .of(
            yup.object().shape({
                label: yup.string().required(),
                value: yup.mixed().required(),
            })
        )
        .min(1, "Please select at least one instructor")
        .required("Please select at least one instructor"),
    title: yup.string().required("Title is mandatory"),
    description: yup.string().required("Description is mandatory"),
});

type FormData = yup.InferType<typeof schema>;

interface CourseAnnouncementFormProps {
    announcementId?: string | number;
}

const CourseAnnouncementForm: React.FC<CourseAnnouncementFormProps> = ({ announcementId }) => {
    const [courses, setCourses] = useState<any[]>([]);
    const [courseOptions, setCourseOptions] = useState<Option[]>([]);
    const [instructorOptions, setInstructorOptions] = useState<Option[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { hideModal } = useModal();
    const dispatch = useAppDispatch();

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            course: null,
            instructor: [],
            title: '',
            description: '',
        },
    });

    const selectedCourse = watch('course');

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetchCourseListWithInstructorApi();
                // Assuming res.data is an array of courses, and each course has a name, id, and an array of instructors
                const data = res?.data || [];
                setCourses(data);
                
                const cOptions = data.map((item: any) => ({
                    label: item.name || item.course_name || `Course ${item.id}`,
                    value: item.id,
                    instructors: item.instructor_list || item.instructors || item.instructor_info || []
                }));
                setCourseOptions(cOptions);

                if (announcementId) {
                    const detail = await viewCourseAnnouncementApi(announcementId);
                    if (detail) {
                        setValue('title', detail.title || '');
                        setValue('description', detail.description || '');
                        if (detail.course) {
                            setValue('course', {
                                label: detail.course.name,
                                value: detail.course.id
                            } as any);
                        }
                        if (detail.instructor) {
                            setValue('instructor', [{
                                label: detail.instructor.text_1 || `Instructor ${detail.instructor.id}`,
                                value: detail.instructor.id,
                                meta: {
                                    qualification: detail.instructor.text_2,
                                    company: detail.instructor.text_3,
                                    experience: detail.instructor.experience,
                                    avatar: detail.instructor.image
                                }
                            }] as any);
                        }
                    }
                }
            } catch {
                toast.error('Failed to load form data.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [announcementId, setValue]);

    useEffect(() => {
        if (selectedCourse) {
            const courseData = courses.find(c => c.id === selectedCourse.value);
            const instructors = courseData?.instructor_list || courseData?.instructors || courseData?.instructor_info || [];
            
            // Format instructors for the select dropdown
            const iOptions = instructors.map((inst: any) => {
                // Determine the nested object if applicable
                const info = inst.instructor_info || inst;
                return {
                    label: info.text_1 || info.name || info.first_name || `Instructor ${info.id}`,
                    value: info.id,
                    meta: {
                        qualification: info.text_2,
                        company: info.text_3,
                        experience: info.experience,
                        avatar: info.image || info.profile_image
                    }
                };
            });
            setInstructorOptions(iOptions);
            
            // If editing and we just loaded options, we don't want to clear the selected instructor 
            // if it exists in the new options list.
            const currentInstructors = watch('instructor') || [];
            if (currentInstructors.length > 0) {
                 const validInstructors = currentInstructors.filter((ci: any) => 
                     iOptions.some((io: any) => io.value === ci.value)
                 );
                 if (validInstructors.length !== currentInstructors.length) {
                     setValue('instructor', validInstructors);
                 }
            } else {
                 // Clear existing instructor selection if it's no longer valid for the new course
                 setValue('instructor', []);
            }
        } else {
            setInstructorOptions([]);
            setValue('instructor', []);
        }
    }, [selectedCourse, courses, setValue, watch]);

    const onSubmit = async (data: FormData) => {
        try {
            setSaving(true);
            const payload = {
                course_id: data.course?.value,
                instructor_id: data.instructor.map((item: any) => item.value).join(","),
                title: data.title,
                description: data.description
            };
            
            let res;
            if (announcementId) {
                res = await dispatch(updateCourseAnnouncement({ id: announcementId, payload })).unwrap();
            } else {
                res = await createCourseAnnouncementApi(payload);
            }
            
            if (res?.status) {
                toast.success(res?.message || (announcementId ? 'Announcement updated successfully' : 'Announcement created successfully'));
                dispatch(getCourseAnnouncement({ page: 1 }));
                hideModal();
            } else {
                toast.error(res?.message || (announcementId ? 'Failed to update announcement' : 'Failed to create announcement'));
            }
        } catch (error) {
            toast.error('Failed to create announcement.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            {/* Header info */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                <span className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <Megaphone size={18} />
                </span>
                <div>
                    <p className="text-sm font-semibold text-indigo-800">{announcementId ? 'Edit Course Announcement' : 'Add Course Announcement'}</p>
                    <p className="text-xs text-indigo-500 mt-0.5">{announcementId ? 'Update details of the announcement.' : 'Create a new announcement for enrolled students.'}</p>
                </div>
            </div>

            {/* Course Select */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Course
                </label>
                {loading ? (
                    <div className="flex items-center gap-2 py-4 text-gray-400 text-sm">
                        <Loader2 size={16} className="animate-spin" /> Loading courses...
                    </div>
                ) : (
                    <Controller
                        name="course"
                        control={control}
                        render={({ field }) => (
                            <Select
                                {...field}
                                options={courseOptions}
                                placeholder="Search and select course..."
                                classNamePrefix="react-select"
                                isDisabled={saving}
                                styles={{
                                    control: (base, state) => ({
                                        ...base,
                                        borderRadius: '12px',
                                        borderColor: errors.course ? '#ef4444' : state.isFocused ? '#4f46e5' : '#e5e7eb',
                                        boxShadow: errors.course ? '0 0 0 3px rgba(239,68,68,0.15)' : state.isFocused ? '0 0 0 3px rgba(79,70,229,0.15)' : 'none',
                                        fontSize: '14px',
                                        '&:hover': { borderColor: errors.course ? '#ef4444' : '#4f46e5' },
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
                )}
                {errors.course && (
                    <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                        <AlertCircle size={13} /> {errors.course.message}
                    </p>
                )}
            </div>

            {/* Instructor Select */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Instructor(s)
                </label>
                <Controller
                    name="instructor"
                    control={control}
                    render={({ field }) => (
                        <Select
                            {...field}
                            isMulti
                            options={instructorOptions}
                            placeholder={!selectedCourse ? "Select a course first..." : "Search and select instructor..."}
                            classNamePrefix="react-select"
                            closeMenuOnSelect={false}
                            isDisabled={saving || !selectedCourse || instructorOptions.length === 0}
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
                                    borderColor: errors.instructor ? '#ef4444' : state.isFocused ? '#4f46e5' : '#e5e7eb',
                                    boxShadow: errors.instructor ? '0 0 0 3px rgba(239,68,68,0.15)' : state.isFocused ? '0 0 0 3px rgba(79,70,229,0.15)' : 'none',
                                    fontSize: '14px',
                                    '&:hover': { borderColor: errors.instructor ? '#ef4444' : '#4f46e5' },
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
                {errors.instructor && (
                    <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                        <AlertCircle size={13} /> {errors.instructor.message}
                    </p>
                )}
                {selectedCourse && instructorOptions.length === 0 && !loading && (
                    <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-orange-500">
                        <AlertCircle size={13} /> No instructors found for this course.
                    </p>
                )}
            </div>

            {/* Title Input */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Announcement Title <span className="text-red-500">*</span>
                </label>
                <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                        <input
                            {...field}
                            type="text"
                            placeholder="Enter announcement title..."
                            disabled={saving}
                            className={`w-full px-4 py-3 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all ${
                                errors.title 
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

            {/* Description Textarea */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Description <span className="text-red-500">*</span>
                </label>
                <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                        <textarea
                            {...field}
                            placeholder="Type the full announcement message here..."
                            rows={4}
                            disabled={saving}
                            className={`w-full px-4 py-3 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all resize-y ${
                                errors.description 
                                ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30' 
                                : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-300'
                            }`}
                        />
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
                    disabled={saving || loading}
                    className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm flex items-center gap-2"
                >
                    {saving && <Loader2 size={14} className="animate-spin" />}
                    {saving ? 'Saving...' : (announcementId ? 'Update Announcement' : 'Add Announcement')}
                </button>
            </div>
        </form>
    );
};

export default CourseAnnouncementForm;
