import React, { useEffect, useState } from 'react';
import moment from 'moment';
import {
    Loader2,
    AlertCircle,
    User,
    CheckCircle,
    XCircle,
    FileText,
    GraduationCap,
    School,
    Calendar,
    Tag,
} from 'lucide-react';
import type { Testimonials } from '../../utils/types';
import { useAppDispatch } from '../../hooks/useRedux';
import { viewTestimonial } from '../../store/slices/testimonialSlice';

export interface ViewTestimonialProps {
    id?: number | string;
    testimonialData?: Partial<Testimonials>;
}

const testimonialTypeOptions: Record<string, string> = {
    "1": "Placement",
    "2": "Institutions",
    "3": "Corporate",
    "4": "Student",
};

const ViewTestimonial: React.FC<ViewTestimonialProps> = ({ id, testimonialData }) => {
    const dispatch = useAppDispatch();
    const [testimonial, setTestimonial] = useState<any>(testimonialData || null);
    const [loading, setLoading] = useState<boolean>(!testimonialData && !!id);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            setLoading(true);
            setError(null);
            dispatch(viewTestimonial(id))
                .unwrap()
                .then((res: any) => {
                    setTestimonial(res);
                })
                .catch((err: any) => {
                    setError(err || 'Failed to fetch testimonial details');
                })
                .finally(() => {
                    setLoading(false);
                });
        } else if (testimonialData) {
            setTestimonial(testimonialData);
        }
    }, [id, testimonialData, dispatch]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 gap-3 min-h-[220px]">
                <Loader2 size={32} className="animate-spin text-indigo-600" />
                <span className="text-sm font-medium text-gray-500">Loading Testimonial details...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-rose-50 rounded-xl border border-rose-100 text-center gap-2">
                <AlertCircle size={24} className="text-rose-600" />
                <span className="text-sm font-semibold text-rose-700">{error}</span>
            </div>
        );
    }

    if (!testimonial) {
        return (
            <div className="p-8 text-center text-gray-500 text-sm">
                No testimonial data found.
            </div>
        );
    }

    const typeLabel = testimonial.testimonials_type ? testimonialTypeOptions[testimonial.testimonials_type.toString()] || "Unknown" : "N/A";

    return (
        <div className="flex flex-col gap-6">
            {/* Top Notice Card */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                <span className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <User size={18} />
                </span>
                <div>
                    <p className="text-sm font-semibold text-indigo-800">Testimonial Details</p>
                    <p className="text-xs text-indigo-500 mt-0.5">
                        Viewing complete testimonial information, feedback, and author details.
                    </p>
                </div>
            </div>

            {/* Profile Image & Basic Info */}
            {testimonial.image && (
                <div className="flex justify-center mb-2">
                    <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-white shadow-md">
                        <img 
                            src={testimonial.image} 
                            alt={testimonial.name} 
                            className="object-cover h-full w-full"
                            onError={(e: any) => { e.target.src = '/default-avatar.png'; }}
                        />
                    </div>
                </div>
            )}

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-1">
                {/* Name */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <User size={14} /> Author Name
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-900 font-semibold text-sm">
                        {testimonial.name || 'N/A'}
                    </div>
                </div>

                {/* Testimonial Type */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Tag size={14} /> Category Type
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-semibold text-sm">
                        {typeLabel}
                    </div>
                </div>

                {/* Qualification */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <GraduationCap size={14} /> Qualification
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-semibold text-sm">
                        {testimonial.qualification || 'N/A'}
                    </div>
                </div>

                {/* College / Organization */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <School size={14} /> College / Organization
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-semibold text-sm">
                        {testimonial.college || 'N/A'}
                    </div>
                </div>

                {/* Status */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        Status
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2">
                        {testimonial.status ? (
                            <span className="flex items-center gap-1.5 text-green-700 font-semibold text-sm bg-green-100 px-3 py-1 rounded-full border border-green-200">
                                <CheckCircle size={14} /> Active
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 text-red-700 font-semibold text-sm bg-red-100 px-3 py-1 rounded-full border border-red-200">
                                <XCircle size={14} /> Inactive
                            </span>
                        )}
                    </div>
                </div>

                {/* Created On */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Calendar size={14} /> Created On
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm">
                        {testimonial.created_at ? moment(testimonial.created_at).format('MMM DD, YYYY hh:mm A') : 'N/A'}
                    </div>
                </div>

                {/* Content (Full Width) */}
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <FileText size={14} /> Feedback / Content
                    </label>
                    <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 text-sm leading-relaxed max-w-none break-words">
                        {testimonial.content ? (
                            <div
                                className="prose prose-sm max-w-none text-gray-800"
                                dangerouslySetInnerHTML={{ __html: testimonial.content }}
                            />
                        ) : (
                            <span className="text-gray-400 italic">No content provided.</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewTestimonial;
