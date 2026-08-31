import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useModal } from '../../context/ModalContext';
import toast from 'react-hot-toast';
import { Loader2, User, AlertCircle } from 'lucide-react';
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addUniversityStudent } from '../../store/slices/universitySlice';
import { CropperModal } from "../ImageCropper/components/CropperModal";
import type { CropResult } from "../ImageCropper/utils/cropCanvas";

const schema = yup.object().shape({
    first_name: yup.string().required("First name is required"),
    last_name: yup.string().required("Last name is required"),
    email: yup.string().email("Invalid email format").required("Email is required"),
    phone: yup.string().required("Phone number is required"),
});

type FormValues = yup.InferType<typeof schema>;

interface Props {
    universityId: number;
    onSuccess?: () => void;
}

const AddUniversityStudent: React.FC<Props> = ({ universityId, onSuccess }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
    const [originalImageFormat, setOriginalImageFormat] = useState<'image/png' | 'image/jpeg'>('image/png');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { hideModal } = useModal();

    const dispatch = useAppDispatch();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: yupResolver(schema),
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const isJpeg = file.type === 'image/jpeg' || file.type === 'image/jpg';
            setOriginalImageFormat(isJpeg ? 'image/jpeg' : 'image/png');

            const reader = new FileReader();
            reader.onloadend = () => {
                setRawImageSrc(reader.result as string);
                setIsCropperOpen(true);
            };
            reader.readAsDataURL(file);
            e.target.value = '';
        }
    };

    const handleCropComplete = (result: CropResult) => {
        setSelectedImage(result.file as any);
        setImagePreview(result.dataUrl);
    };

    const clearImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('university_id', String(universityId));
            formData.append('first_name', data.first_name);
            formData.append('last_name', data.last_name);
            formData.append('email', data.email);
            formData.append('phone', data.phone);

            if (selectedImage) {
                formData.append('image', selectedImage);
            }

            await dispatch(addUniversityStudent(formData)).unwrap();
            toast.success("Student added successfully");

            if (onSuccess) {
                onSuccess();
            }
            hideModal();
        } catch (err: any) {
            console.error('Add student failed:', err);
            toast.error(err || "Failed to add student");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                {/* Header info */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                    <span className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                        <User size={18} />
                    </span>
                    <div>
                        <p className="text-sm font-semibold text-indigo-800">Add New Student</p>
                        <p className="text-xs text-indigo-500 mt-0.5">Fill in the details below to add a student to this university.</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* First Name */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                            First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register("first_name")}
                            placeholder="John"
                            disabled={isSubmitting}
                            className={`w-full px-4 py-3 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all ${errors.first_name
                                ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30'
                                : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-300'
                                }`}
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
                        <input
                            {...register("last_name")}
                            placeholder="Doe"
                            disabled={isSubmitting}
                            className={`w-full px-4 py-3 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all ${errors.last_name
                                ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30'
                                : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-300'
                                }`}
                        />
                        {errors.last_name && (
                            <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                                <AlertCircle size={13} /> {errors.last_name.message}
                            </p>
                        )}
                    </div>
                </div>

                {/* Email */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                        Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register("email")}
                        placeholder="john.doe@example.com"
                        disabled={isSubmitting}
                        className={`w-full px-4 py-3 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all ${errors.email
                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30'
                            : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-300'
                            }`}
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
                        Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register("phone")}
                        placeholder="+1 (555) 000-0000"
                        disabled={isSubmitting}
                        className={`w-full px-4 py-3 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all ${errors.phone
                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30'
                            : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-300'
                            }`}
                    />
                    {errors.phone && (
                        <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                            <AlertCircle size={13} /> {errors.phone.message}
                        </p>
                    )}
                </div>

                {/* Thumbnail Image */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                        Profile Image
                    </label>
                    <div className="flex items-center gap-4">
                        {imagePreview && (
                            <div className="h-16 w-16 rounded-xl border border-gray-200 overflow-hidden flex-shrink-0 bg-gray-50 flex items-center justify-center">
                                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                            </div>
                        )}
                        <div className="flex-1">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                disabled={isSubmitting}
                                className={`w-full px-4 py-3 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-300`}
                            />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={hideModal}
                        disabled={isSubmitting}
                        className="px-5 py-2 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm flex items-center gap-2"
                    >
                        {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                        {isSubmitting ? 'Adding...' : 'Add Student'}
                    </button>
                </div>

                <CropperModal
                    isOpen={isCropperOpen}
                    onClose={() => setIsCropperOpen(false)}
                    imageSrc={rawImageSrc || ''}
                    onCropComplete={handleCropComplete}
                    initialFormat={originalImageFormat}
                />
            </form>
        </div>
    );
};

export default AddUniversityStudent;
