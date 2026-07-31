import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useModal } from "../../context/ModalContext";
import { updateInstructorPublicProfileApi } from "../../services/apiServices";
import toast from "react-hot-toast";
import { Linkedin, Briefcase, Type, UploadCloud, AlertCircle, Loader2, FileImage, X, Building2, Book } from "lucide-react";
import { CropperModal } from "../ImageCropper/components/CropperModal";
import type { CropResult } from "../ImageCropper/utils/cropCanvas";

const schema = yup.object().shape({
    title_1: yup.string().required("Name is required"),
    title_2: yup.string().required("Qualification is required"),
    title_3: yup.string().required("Company name is required"),
    experience: yup.string().required("Experience is required"),
    linkedin_url: yup.string()
        .transform((curr, orig) => orig === '' ? null : curr)
        .nullable()
        .notRequired()
        .test('is-url', 'Please enter a valid LinkedIn profile URL', (value) => {
            if (!value) return true;
            return /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/.+$/i.test(value);
        }),
    image: yup.mixed().nullable().default(null),
    company_image_1: yup.mixed().nullable().default(null),
    company_image_2: yup.mixed().nullable().default(null),
});

type FormValues = {
    title_1: string;
    title_2: string;
    title_3: string;
    experience: string;
    linkedin_url?: string | null;
    image?: any;
    company_image_1?: any;
    company_image_2?: any;
};

const InstructorPublicProfileForm = ({ instructorId }: { instructorId: string | number }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { hideModal } = useModal();
    const [imagePreviews, setImagePreviews] = useState<{
        image?: string;
        company_image_1?: string;
        company_image_2?: string;
    }>({});

    // Image error states
    const [imageError, setImageError] = useState<string | null>(null);
    const [companyImage1Error, setCompanyImage1Error] = useState<string | null>(null);
    const [companyImage2Error, setCompanyImage2Error] = useState<string | null>(null);

    // Cropper State
    const [rawImageSrc, setRawImageSrc] = useState<string>('');
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [originalImageFormat, setOriginalImageFormat] = useState<'image/jpeg' | 'image/png'>('image/jpeg');
    const [activeCropField, setActiveCropField] = useState<'image' | 'company_image_1' | 'company_image_2' | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: yupResolver(schema) as any,
        defaultValues: {
            title_1: '',
            title_2: '',
            title_3: '',
            experience: '',
            linkedin_url: '',
            image: null,
            company_image_1: null,
            company_image_2: null,
        }
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'image' | 'company_image_1' | 'company_image_2') => {
        const file = e.target.files?.[0];
        if (file) {
            setActiveCropField(fieldName);
            const isJpeg = file.type === 'image/jpeg' || file.type === 'image/jpg';
            setOriginalImageFormat(isJpeg ? 'image/jpeg' : 'image/png');

            const r = new FileReader();
            r.onloadend = () => {
                setRawImageSrc(r.result as string);
                setIsCropperOpen(true);
            };
            r.readAsDataURL(file);
            e.target.value = ''; // Reset to allow selecting same file again
        }
    };

    const handleCropComplete = (result: CropResult) => {
        if (activeCropField) {
            setValue(activeCropField, result.file as File, { shouldValidate: true });
            setImagePreviews(prev => ({ ...prev, [activeCropField]: result.dataUrl }));
            
            // Clear errors
            if (activeCropField === 'image') setImageError(null);
            if (activeCropField === 'company_image_1') setCompanyImage1Error(null);
            if (activeCropField === 'company_image_2') setCompanyImage2Error(null);
        }
        setIsCropperOpen(false);
        setActiveCropField(null);
    };

    const handleRemoveFile = (fieldName: 'image' | 'company_image_1' | 'company_image_2') => {
        setValue(fieldName, null, { shouldValidate: true });
        setImagePreviews(prev => {
            const copy = { ...prev };
            delete copy[fieldName];
            return copy;
        });
    };

    const onSubmit = async (data: FormValues) => {
        // Image validation
        let hasImageError = false;
        if (!imagePreviews.image && !data.image) {
            setImageError("Profile picture is required");
            hasImageError = true;
        } else {
            setImageError(null);
        }

        if (!imagePreviews.company_image_1 && !data.company_image_1) {
            setCompanyImage1Error("Company image 1 is required");
            hasImageError = true;
        } else {
            setCompanyImage1Error(null);
        }
        
        if (!imagePreviews.company_image_2 && !data.company_image_2) {
            setCompanyImage2Error("Company image 2 is required");
            hasImageError = true;
        } else {
            setCompanyImage2Error(null);
        }

        if (hasImageError) return;

        setIsSubmitting(true);
        try {
            const formData = new window.FormData();
            formData.append('title_1', (data.title_1 || '').trim());
            formData.append('title_2', (data.title_2 || '').trim());
            formData.append('title_3', (data.title_3 || '').trim());
            formData.append('experience', (data.experience || '').trim());
            formData.append('linkedin_url', (data.linkedin_url || '').trim());

            if (data.image instanceof File) {
                formData.append('image', data.image);
            }
            if (data.company_image_1 instanceof File) {
                formData.append('company_image_1', data.company_image_1);
            }
            if (data.company_image_2 instanceof File) {
                formData.append('company_image_2', data.company_image_2);
            }

            await updateInstructorPublicProfileApi(instructorId, formData);
            toast.success("Public profile updated successfully!");
            hideModal();
        } catch (err: unknown) {
            console.error("Failed to update public profile:", err);
            const errorMessage = err instanceof Error ? err.message : (err as any)?.message || "Failed to update public profile";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Compact Header */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex gap-3 items-center">
                    <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 flex-shrink-0">
                        <FileImage size={18} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xs font-semibold text-indigo-950">Instructor Public Profile</h3>
                        <p className="text-[11px] text-indigo-600/80 mt-0.5">
                            Configure public titles, professional experience, LinkedIn link, and company logos.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* Title 1 / Name */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1.5">
                            <Type size={13} className="text-gray-400" /> Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Lead Instructor"
                            {...register('title_1')}
                            className={`w-full px-3 py-2 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all ${
                                errors.title_1
                                ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10 bg-red-50/10'
                                : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/10 hover:border-gray-300'
                            }`}
                        />
                        {errors.title_1 && (
                            <p className="flex items-center gap-1 mt-1 text-xs font-medium text-red-500">
                                <AlertCircle size={12} /> {errors.title_1.message}
                            </p>
                        )}
                    </div>

                    {/* Qualification */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1.5">
                            <Book size={13} className="text-gray-400" /> Qualification <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Senior Software Architect"
                            {...register('title_2')}
                            className={`w-full px-3 py-2 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all ${
                                errors.title_2
                                ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10 bg-red-50/10'
                                : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/10 hover:border-gray-300'
                            }`}
                        />
                        {errors.title_2 && (
                            <p className="flex items-center gap-1 mt-1 text-xs font-medium text-red-500">
                                <AlertCircle size={12} /> {errors.title_2.message}
                            </p>
                        )}
                    </div>

                    {/* Company Name */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1.5">
                            <Building2 size={13} className="text-gray-400" /> Company Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Ex-Google Engineer"
                            {...register('title_3')}
                            className={`w-full px-3 py-2 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all ${
                                errors.title_3
                                ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10 bg-red-50/10'
                                : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/10 hover:border-gray-300'
                            }`}
                        />
                        {errors.title_3 && (
                            <p className="flex items-center gap-1 mt-1 text-xs font-medium text-red-500">
                                <AlertCircle size={12} /> {errors.title_3.message}
                            </p>
                        )}
                    </div>

                    {/* Experience */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1.5">
                            <Briefcase size={13} className="text-gray-400" /> Experience <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. 10+ Years of Experience"
                            {...register('experience')}
                            className={`w-full px-3 py-2 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all ${
                                errors.experience
                                ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10 bg-red-50/10'
                                : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/10 hover:border-gray-300'
                            }`}
                        />
                        {errors.experience && (
                            <p className="flex items-center gap-1 mt-1 text-xs font-medium text-red-500">
                                <AlertCircle size={12} /> {errors.experience.message}
                            </p>
                        )}
                    </div>

                    {/* LinkedIn URL */}
                    <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1.5">
                            <Linkedin size={13} className="text-blue-500" /> LinkedIn Profile URL
                        </label>
                        <input
                            type="url"
                            placeholder="https://linkedin.com/in/username"
                            {...register('linkedin_url')}
                            className={`w-full px-3 py-2 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all ${
                                errors.linkedin_url
                                ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/10'
                                : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/10 hover:border-gray-300'
                            }`}
                        />
                        {errors.linkedin_url && (
                            <p className="flex items-center gap-1.5 mt-1.5 text-xs font-medium text-red-500">
                                <AlertCircle size={13} /> {errors.linkedin_url?.message}
                            </p>
                        )}
                    </div>
                </div>

                {/* Compact Media/Image Files Grid */}
                <div className="space-y-3 pt-3 border-t border-gray-100">
                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Branding & Logo Images</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        
                        {/* Image */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-600">Profile Picture <span className="text-red-500">*</span></label>
                            <div className={`relative border border-dashed hover:border-indigo-400 transition-colors rounded-xl p-1 flex items-center justify-center bg-gray-50/50 min-h-[56px] h-[56px] ${
                                imageError ? 'border-red-400 bg-red-50/10' : 'border-gray-200'
                            }`}>
                                {imagePreviews.image ? (
                                    <div className="relative flex items-center gap-2.5 w-full h-full px-2">
                                        <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 shadow-inner flex-shrink-0">
                                            <img src={imagePreviews.image} alt="Profile" className="w-full h-full object-cover" />
                                        </div>
                                        <span className="text-[10px] text-gray-500 font-medium truncate flex-1">Image selected</span>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveFile('image');
                                            }}
                                            className="absolute top-1 right-1 bg-red-50 text-red-500 hover:bg-red-100 p-1 rounded-full transition-colors flex items-center justify-center shadow-sm flex-shrink-0"
                                            title="Remove image"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="cursor-pointer flex items-center justify-center gap-2 w-full h-full">
                                        <UploadCloud size={16} className="text-indigo-500" />
                                        <span className="text-xs font-bold text-indigo-600">Upload Image</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'image')}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>
                            {imageError && (
                                <p className="flex items-center gap-1 mt-1 text-xs font-medium text-red-500">
                                    <AlertCircle size={12} /> {imageError}
                                </p>
                            )}
                        </div>

                        {/* Company Image 1 */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-600">Company Image 1 <span className="text-red-500">*</span></label>
                            <div className={`relative border border-dashed hover:border-indigo-400 transition-colors rounded-xl p-1 flex items-center justify-center bg-gray-50/50 min-h-[56px] h-[56px] ${
                                companyImage1Error ? 'border-red-400 bg-red-50/10' : 'border-gray-200'
                            }`}>
                                {imagePreviews.company_image_1 ? (
                                    <div className="relative flex items-center gap-2.5 w-full h-full px-2">
                                        <div className="w-9 h-9 rounded-lg overflow-hidden border border-gray-200 bg-white flex items-center justify-center p-0.5 flex-shrink-0">
                                            <img src={imagePreviews.company_image_1} alt="Logo" className="max-w-full max-h-full object-contain" />
                                        </div>
                                        <span className="text-[10px] text-gray-500 font-medium truncate flex-1">Logo selected</span>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveFile('company_image_1');
                                            }}
                                            className="absolute top-1 right-1 bg-red-50 text-red-500 hover:bg-red-100 p-1 rounded-full transition-colors flex items-center justify-center shadow-sm flex-shrink-0"
                                            title="Remove logo"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="cursor-pointer flex items-center justify-center gap-2 w-full h-full">
                                        <UploadCloud size={16} className="text-indigo-500" />
                                        <span className="text-xs font-bold text-indigo-600">Upload Logo</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'company_image_1')}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>
                            {companyImage1Error && (
                                <p className="flex items-center gap-1 mt-1 text-xs font-medium text-red-500">
                                    <AlertCircle size={12} /> {companyImage1Error}
                                </p>
                            )}
                        </div>

                        {/* Company Image 2 */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-600">Company Image 2 <span className="text-red-500">*</span></label>
                            <div className={`relative border border-dashed hover:border-indigo-400 transition-colors rounded-xl p-1 flex items-center justify-center bg-gray-50/50 min-h-[56px] h-[56px] ${
                                companyImage2Error ? 'border-red-400 bg-red-50/10' : 'border-gray-200'
                            }`}>
                                {imagePreviews.company_image_2 ? (
                                    <div className="relative flex items-center gap-2.5 w-full h-full px-2">
                                        <div className="w-9 h-9 rounded-lg overflow-hidden border border-gray-200 bg-white flex items-center justify-center p-0.5 flex-shrink-0">
                                            <img src={imagePreviews.company_image_2} alt="Logo" className="max-w-full max-h-full object-contain" />
                                        </div>
                                        <span className="text-[10px] text-gray-500 font-medium truncate flex-1">Logo selected</span>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveFile('company_image_2');
                                            }}
                                            className="absolute top-1 right-1 bg-red-50 text-red-500 hover:bg-red-100 p-1 rounded-full transition-colors flex items-center justify-center shadow-sm flex-shrink-0"
                                            title="Remove logo"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="cursor-pointer flex items-center justify-center gap-2 w-full h-full">
                                        <UploadCloud size={16} className="text-indigo-500" />
                                        <span className="text-xs font-bold text-indigo-600">Upload Logo</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'company_image_2')}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>
                            {companyImage2Error && (
                                <p className="flex items-center gap-1 mt-1 text-xs font-medium text-red-500">
                                    <AlertCircle size={12} /> {companyImage2Error}
                                </p>
                            )}
                        </div>

                    </div>
                </div>

                {/* Compact Form Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={hideModal}
                        disabled={isSubmitting}
                        className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95 shadow-indigo-100 flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={15} className="animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Profile"
                        )}
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

export default InstructorPublicProfileForm;