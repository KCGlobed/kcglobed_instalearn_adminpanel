import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import type { Testimonials } from "../../utils/types";
import { useModal } from "../../context/ModalContext";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { addTestimonial, editTestimonial } from "../../store/slices/testimonialSlice";
import toast from "react-hot-toast";
import { MessageSquare, Loader2, AlertCircle } from "lucide-react";
import { CropperModal } from "../ImageCropper/components/CropperModal";
import type { CropResult } from "../ImageCropper/utils/cropCanvas";

interface Option { label: string; value: string; }

const testimonialTypeOptions: Option[] = [
    { label: "Placement", value: "1" },
    { label: "Institutions", value: "2" },
    { label: "Corporate", value: "3" },
    { label: "Student", value: "4" },
];

const schema = yup.object().shape({
    name: yup.string().required("Name is mandatory"),
    testimonials_type: yup.object().shape({
        label: yup.string().required(),
        value: yup.string().required(),
    }).required("Type is mandatory"),
    qualification: yup.string().required("Qualification is mandatory"),
    college: yup.string().required("College is mandatory"),
    content: yup.string().required("Content is mandatory").min(10, "Content must be at least 10 characters"),
    image: yup.mixed().nullable().default(null),
});

type FormData = yup.InferType<typeof schema>;

interface TestimonialFormProps {
    testimonialData?: Testimonials;
}

const TestimonialForm: React.FC<TestimonialFormProps> = ({ testimonialData }) => {
    const [saving, setSaving] = useState(false);
    const dispatch = useAppDispatch();
    const { hideModal } = useModal();

    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
    const [originalImageFormat, setOriginalImageFormat] = useState<'image/png' | 'image/jpeg'>('image/png');
    const [previewUrl, setPreviewUrl] = useState<string | null>(testimonialData?.image || null);
    const [imageError, setImageError] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            name: "",
            testimonials_type: testimonialTypeOptions[0], // default to placement
            qualification: "",
            college: "",
            content: "",
            image: null,
        },
    });

    useEffect(() => {
        if (testimonialData) {
            setValue("name", testimonialData.name || "");
            
            const typeOption = testimonialTypeOptions.find(opt => opt.value === String(testimonialData.testimonials_type));
            if (typeOption) {
                setValue("testimonials_type", typeOption);
            }

            setValue("qualification", testimonialData.qualification || "");
            setValue("college", testimonialData.college || "");
            setValue("content", testimonialData.content || "");
            // Note: image preview is already set in state
        }
    }, [testimonialData, setValue]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const isJpeg = file.type === 'image/jpeg' || file.type === 'image/jpg';
            setOriginalImageFormat(isJpeg ? 'image/jpeg' : 'image/png');

            const r = new FileReader();
            r.onloadend = () => {
                setRawImageSrc(r.result as string);
                setIsCropperOpen(true);
            };
            r.readAsDataURL(file);
            e.target.value = '';
        }
    };

    const handleCropComplete = (result: CropResult) => {
        setValue("image", result.file as any, { shouldValidate: true });
        setPreviewUrl(result.dataUrl);
        setImageError(null);
    };

    const onSubmit = async (data: FormData) => {
        // Custom Image Validation for creation
        if (!testimonialData?.id && !data.image) {
            setImageError("Image is mandatory");
            return;
        }

        try {
            setSaving(true);
            const formData = new window.FormData();
            formData.append('name', data.name.trim());
            if (data.testimonials_type?.value) {
                formData.append('testimonials_type', data.testimonials_type.value);
            }
            formData.append('qualification', data.qualification.trim());
            formData.append('college', data.college.trim());
            formData.append('content', data.content.trim());

            if (data.image instanceof File) {
                formData.append('image', data.image);
            }

            if (testimonialData?.id) {
                await dispatch(editTestimonial({ id: testimonialData.id, testimonialData: formData })).unwrap();
                toast.success("Testimonial updated successfully");
            } else {
                await dispatch(addTestimonial(formData)).unwrap();
                toast.success("Testimonial created successfully");
            }

            hideModal();
        } catch (err: any) {
            console.error("Testimonial submission failed:", err);
            toast.error(err || "Failed to save testimonial");
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
                        <p className="text-sm font-semibold text-indigo-800">{testimonialData ? 'Edit Testimonial' : 'Add Testimonial'}</p>
                        <p className="text-xs text-indigo-500 mt-0.5">{testimonialData ? 'Update details of the testimonial.' : 'Create a new testimonial.'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Name */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    type="text"
                                    placeholder="e.g. Samridhi Vashisth"
                                    disabled={saving}
                                    className={`w-full px-4 py-3 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all ${
                                        errors.name 
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30' 
                                        : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-300'
                                    }`}
                                />
                            )}
                        />
                        {errors.name && (
                            <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                                <AlertCircle size={13} /> {errors.name.message}
                            </p>
                        )}
                    </div>

                    {/* Testimonial Type */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                            Type <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="testimonials_type"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    options={testimonialTypeOptions}
                                    placeholder="Select type..."
                                    classNamePrefix="react-select"
                                    isDisabled={saving}
                                    styles={{
                                        control: (base, state) => ({
                                            ...base,
                                            borderRadius: '12px',
                                            borderColor: errors.testimonials_type ? '#ef4444' : state.isFocused ? '#4f46e5' : '#e5e7eb',
                                            boxShadow: errors.testimonials_type ? '0 0 0 3px rgba(239,68,68,0.15)' : state.isFocused ? '0 0 0 3px rgba(79,70,229,0.15)' : 'none',
                                            fontSize: '14px',
                                            padding: '2px 0',
                                            '&:hover': { borderColor: errors.testimonials_type ? '#ef4444' : '#4f46e5' },
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
                        {errors.testimonials_type && (
                            <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                                <AlertCircle size={13} /> {(errors.testimonials_type as any).message || (errors.testimonials_type?.label?.message) || "Type is mandatory"}
                            </p>
                        )}
                    </div>

                    {/* Qualification */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                            Qualification <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="qualification"
                            control={control}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    type="text"
                                    placeholder="e.g. Consultant"
                                    disabled={saving}
                                    className={`w-full px-4 py-3 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all ${
                                        errors.qualification 
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30' 
                                        : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-300'
                                    }`}
                                />
                            )}
                        />
                        {errors.qualification && (
                            <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                                <AlertCircle size={13} /> {errors.qualification.message}
                            </p>
                        )}
                    </div>

                    {/* College */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                            College / Company <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="college"
                            control={control}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    type="text"
                                    placeholder="e.g. EY"
                                    disabled={saving}
                                    className={`w-full px-4 py-3 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all ${
                                        errors.college 
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30' 
                                        : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-300'
                                    }`}
                                />
                            )}
                        />
                        {errors.college && (
                            <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                                <AlertCircle size={13} /> {errors.college.message}
                            </p>
                        )}
                    </div>
                </div>

                {/* Content Textarea */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                        Content <span className="text-red-500">*</span>
                    </label>
                    <Controller
                        name="content"
                        control={control}
                        render={({ field: { value, onChange, onBlur, ref } }) => (
                            <textarea
                                value={value || ''}
                                onChange={onChange}
                                onBlur={onBlur}
                                ref={ref}
                                placeholder="Enter testimonial content..."
                                rows={4}
                                disabled={saving}
                                className={`w-full px-4 py-3 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all resize-y ${
                                    errors.content 
                                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30' 
                                    : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-300'
                                }`}
                            />
                        )}
                    />
                    {errors.content && (
                        <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                            <AlertCircle size={13} /> {errors.content.message}
                        </p>
                    )}
                </div>

                {/* Image */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                        Image <span className="text-red-500">{testimonialData?.id ? '' : '*'}</span>
                    </label>
                    <div className="flex items-center gap-4">
                        {previewUrl && (
                            <div className="h-16 w-16 rounded-xl border border-gray-200 overflow-hidden flex-shrink-0 bg-gray-50 flex items-center justify-center">
                                <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                            </div>
                        )}
                        <div className="flex-1">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                disabled={saving}
                                className={`w-full px-4 py-3 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer ${
                                    imageError 
                                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30' 
                                    : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-300'
                                }`}
                            />
                            {imageError && (
                                <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                                    <AlertCircle size={13} /> {imageError}
                                </p>
                            )}
                        </div>
                    </div>
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
                        {saving ? 'Saving...' : (testimonialData ? 'Update Testimonial' : 'Add Testimonial')}
                    </button>
                </div>
            </form>

            <CropperModal
                imageSrc={rawImageSrc}
                isOpen={isCropperOpen}
                onClose={() => setIsCropperOpen(false)}
                onCropComplete={handleCropComplete}
                initialFormat={originalImageFormat}
            />
        </div>
    );
};

export default TestimonialForm;
