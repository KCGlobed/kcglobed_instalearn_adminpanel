import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import toast from 'react-hot-toast';
import {
    fetchRelatedCourseOptionsApi,
    fetchCourseChaptersApi
} from '../../services/apiServices';
import { useModal } from '../../context/ModalContext';
import { BookOpen, Loader2, AlertCircle } from 'lucide-react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { getTrailCourse, addTrailCourse } from '../../store/slices/trailCourseSlice';

interface Option {
    label: string;
    value: any;
}

interface AddTrailCourseFormValues {
    course: Option | null;
    chapters: Option[];
}

const AddTrailCourseForm: React.FC = () => {
    const [courseOptions, setCourseOptions] = useState<Option[]>([]);
    const [chapterOptions, setChapterOptions] = useState<Option[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingChapters, setLoadingChapters] = useState(false);
    const { hideModal } = useModal();
    const dispatch = useAppDispatch();

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        watch,
        setValue,
    } = useForm<AddTrailCourseFormValues>({
        defaultValues: { course: null, chapters: [] },
    });

    const selectedCourse = watch('course');

    useEffect(() => {
        const loadCourses = async () => {
            try {
                const res = await fetchRelatedCourseOptionsApi();

                if (res?.data) {
                    setCourseOptions(
                        res.data.map((item: any) => ({ label: item.name, value: item.id }))
                    );
                }
            } catch (error) {
                toast.error('Failed to load courses.');
            } finally {
                setLoadingCourses(false);
            }
        };
        loadCourses();
    }, []);

    useEffect(() => {
        const loadChapters = async () => {
            // Clear chapters selection when course changes
            setValue('chapters', []);

            if (!selectedCourse) {
                setChapterOptions([]);
                return;
            }

            setLoadingChapters(true);
            try {
                const res = await fetchCourseChaptersApi(selectedCourse.value);
                if (res?.data) {
                    setChapterOptions(
                        res.data.map((item: any) => ({ 
                            label: item.chapter_detail?.chapter_detail?.name || item.chapter_detail?.name || `Chapter ${item.id}`, 
                            value: item.id 
                        }))
                    );
                } else {
                    setChapterOptions([]);
                }
            } catch (error) {
                console.error('Error fetching chapters:', error);
                toast.error('Failed to load chapters for this course.');
                setChapterOptions([]);
            } finally {
                setLoadingChapters(false);
            }
        };
        loadChapters();
    }, [selectedCourse, setValue]);

    const onSubmit = async (data: AddTrailCourseFormValues) => {
        if (!data.course) {
            toast.error('Please select a course.');
            return;
        }

        try {
            const payload = {
                course_id: data.course.value,
                chapter_id: data.chapters.map((c) => c.value),
            };

            const res = await dispatch(addTrailCourse(payload)).unwrap();

            toast.success(res.message || 'Trail course added successfully!');
            dispatch(getTrailCourse({ page: 1 }));
            reset();
            hideModal();
        } catch (error: any) {
            toast.error(error || 'Something went wrong. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-indigo-50 border border-indigo-100 shadow-sm">
                <div className="p-3 bg-white rounded-xl text-indigo-500 shadow-sm border border-indigo-100">
                    <BookOpen size={22} />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-indigo-900 tracking-tight">Add Trail Course</h3>
                    <p className="text-[11px] text-indigo-600/80 font-medium mt-0.5">
                        Select a course and chapters to create a trail course.
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {/* Course Selection */}
                <div>
                    <label className="flex items-center justify-between px-1 mb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            Select Course <span className="text-rose-500">*</span>
                        </span>
                        {loadingCourses && (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-500 animate-pulse">
                                <Loader2 size={12} className="animate-spin" />
                                Fetching...
                            </div>
                        )}
                    </label>

                    <Controller
                        name="course"
                        control={control}
                        rules={{ required: 'Please select a course.' }}
                        render={({ field }) => (
                            <Select
                                {...field}
                                options={courseOptions}
                                isLoading={loadingCourses}
                                placeholder="Search course..."
                                classNamePrefix="react-select"
                                isDisabled={isSubmitting}
                                isClearable
                                styles={{
                                    control: (base, state) => ({
                                        ...base,
                                        borderRadius: '12px',
                                        borderColor: errors.course
                                            ? '#ef4444'
                                            : state.isFocused
                                                ? '#6366f1'
                                                : '#e5e7eb',
                                        boxShadow: errors.course
                                            ? '0 0 0 3px rgba(239,68,68,0.15)'
                                            : state.isFocused
                                                ? '0 0 0 3px rgba(99,102,241,0.15)'
                                                : 'none',
                                        fontSize: '14px',
                                        transition: 'border-color 0.2s, box-shadow 0.2s',
                                        '&:hover': {
                                            borderColor: errors.course ? '#ef4444' : '#6366f1',
                                        },
                                    }),
                                    singleValue: (base) => ({
                                        ...base,
                                        color: '#111827',
                                        fontSize: '14px',
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
                    {errors.course && (
                        <div className="flex items-center gap-2 p-2 mt-1 rounded-xl bg-rose-50 text-rose-600 animate-in fade-in slide-in-from-top-1">
                            <AlertCircle size={14} />
                            <span className="text-[11px] font-bold uppercase tracking-wider">{errors.course.message}</span>
                        </div>
                    )}
                </div>

                {/* Chapters Selection */}
                <div>
                    <label className="flex items-center justify-between px-1 mb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            Select Chapters <span className="text-rose-500">*</span>
                        </span>
                        {loadingChapters && (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-500 animate-pulse">
                                <Loader2 size={12} className="animate-spin" />
                                Fetching...
                            </div>
                        )}
                    </label>

                    <Controller
                        name="chapters"
                        control={control}
                        rules={{
                            validate: (val) => val.length > 0 || 'Please select at least one chapter.'
                        }}
                        render={({ field }) => (
                            <Select
                                {...field}
                                isMulti
                                options={chapterOptions}
                                isLoading={loadingChapters}
                                placeholder="Search chapters..."
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
                    {errors.chapters && (
                        <div className="flex items-center gap-2 p-2 mt-1 rounded-xl bg-rose-50 text-rose-600 animate-in fade-in slide-in-from-top-1">
                            <AlertCircle size={14} />
                            <span className="text-[11px] font-bold uppercase tracking-wider">{errors.chapters.message}</span>
                        </div>
                    )}
                    {!errors.chapters && (
                        <p className="text-[10px] text-slate-400 font-bold px-2 mt-1 italic tracking-tight">
                            * You can select one or multiple chapters.
                        </p>
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
                    disabled={isSubmitting || loadingCourses || loadingChapters}
                    className="flex items-center gap-2 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] text-white bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 size={14} className="animate-spin" />
                            Adding...
                        </>
                    ) : (
                        'Add Trail Course'
                    )}
                </button>
            </div>
        </form>
    );
};



export default AddTrailCourseForm;
