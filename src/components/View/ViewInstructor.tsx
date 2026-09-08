import React, { useEffect, useState } from 'react';
import moment from 'moment';
import {
    Loader2,
    AlertCircle,
    User,
    CheckCircle,
    XCircle,
    Calendar,
    MapPin,
    Mail,
    Globe,
    Building,
    Map,
    Briefcase,
    Linkedin,
    Type,
    Book,
    Image as ImageIcon
} from 'lucide-react';
import type { Instructor } from '../../utils/types';
import { useAppDispatch } from '../../hooks/useRedux';
import { viewInstructor } from '../../store/slices/instructorSlice';

export interface ViewInstructorProps {
    id?: number | string;
    instructorData?: Partial<Instructor>;
}

const ViewInstructor: React.FC<ViewInstructorProps> = ({ id, instructorData }) => {
    const dispatch = useAppDispatch();
    const [instructor, setInstructor] = useState<any>(instructorData || null);
    const [loading, setLoading] = useState<boolean>(!instructorData && !!id);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            setLoading(true);
            setError(null);
            dispatch(viewInstructor(id))
                .unwrap()
                .then((res: any) => {
                    setInstructor(res);
                })
                .catch((err: any) => {
                    setError(err || 'Failed to fetch instructor details');
                })
                .finally(() => {
                    setLoading(false);
                });
        } else if (instructorData) {
            setInstructor(instructorData);
        }
    }, [id, instructorData, dispatch]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 gap-3 min-h-[220px]">
                <Loader2 size={32} className="animate-spin text-indigo-600" />
                <span className="text-sm font-medium text-gray-500">Loading Instructor details...</span>
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

    if (!instructor) {
        return (
            <div className="p-8 text-center text-gray-500 text-sm">
                No instructor data found.
            </div>
        );
    }

    const fullName = [instructor.first_name, instructor.last_name].filter(Boolean).join(' ') || 'N/A';

    return (
        <div className="flex flex-col gap-6">
            {/* Top Notice Card */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                <span className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <User size={18} />
                </span>
                <div>
                    <p className="text-sm font-semibold text-indigo-800">Instructor Profile</p>
                    <p className="text-xs text-indigo-500 mt-0.5">
                        Viewing complete instructor details, contact information, and address.
                    </p>
                </div>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-1">
                {/* Full Name */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <User size={14} /> Full Name
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-900 font-semibold text-sm">
                        {fullName}
                    </div>
                </div>

                {/* Email Address */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Mail size={14} /> Email Address
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-indigo-700 font-medium text-sm truncate">
                        {instructor.email || 'N/A'}
                    </div>
                </div>

                {/* Date of Birth */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Calendar size={14} /> Date of Birth
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-semibold text-sm">
                        {instructor.dob ? moment(instructor.dob).format('MMM DD, YYYY') : 'N/A'}
                    </div>
                </div>

                {/* Status */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        Status
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2">
                        {instructor.is_active || instructor.status ? (
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
                
                {/* Address (Full Width) */}
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <MapPin size={14} /> Address
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 text-sm">
                        {instructor.address || 'N/A'}
                    </div>
                </div>

                {/* City */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Building size={14} /> City
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-semibold text-sm">
                        {instructor.city || 'N/A'}
                    </div>
                </div>

                {/* State */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Map size={14} /> State
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-semibold text-sm">
                        {instructor.state || 'N/A'}
                    </div>
                </div>

                {/* Country */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Globe size={14} /> Country
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-semibold text-sm">
                        {instructor.country || 'N/A'}
                    </div>
                </div>

                {/* Pincode */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <MapPin size={14} /> Pincode
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-semibold text-sm">
                        {instructor.pincode || 'N/A'}
                    </div>
                </div>

                {/* Created On */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Calendar size={14} /> Registered On
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm">
                        {instructor.created_at ? moment(instructor.created_at).format('MMM DD, YYYY hh:mm A') : 'N/A'}
                    </div>
                </div>
            </div>

            {/* Public Profile Details */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100 mt-2">
                <span className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <Briefcase size={18} />
                </span>
                <div>
                    <p className="text-sm font-semibold text-indigo-800">Public Profile & Branding</p>
                    <p className="text-xs text-indigo-500 mt-0.5">
                        Professional titles, experience, LinkedIn link, and uploaded logos.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-1">
                {/* Profile Picture */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <ImageIcon size={14} /> Profile Picture
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center h-32">
                        {instructor.public_profile?.image ? (
                            <img src={instructor.public_profile.image} alt="Profile" className="max-h-full max-w-full rounded-lg object-contain" />
                        ) : (
                            <span className="text-xs text-gray-400 font-medium">No Image Available</span>
                        )}
                    </div>
                </div>

                {/* Company Image 1 */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <ImageIcon size={14} /> Company Logo 1
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center h-32">
                        {instructor.public_profile?.company_image_1 ? (
                            <img src={instructor.public_profile.company_image_1} alt="Company Logo 1" className="max-h-full max-w-full rounded-lg object-contain" />
                        ) : (
                            <span className="text-xs text-gray-400 font-medium">No Logo Available</span>
                        )}
                    </div>
                </div>

                {/* Company Image 2 */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <ImageIcon size={14} /> Company Logo 2
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center h-32">
                        {instructor.public_profile?.company_image_2 ? (
                            <img src={instructor.public_profile.company_image_2} alt="Company Logo 2" className="max-h-full max-w-full rounded-lg object-contain" />
                        ) : (
                            <span className="text-xs text-gray-400 font-medium">No Logo Available</span>
                        )}
                    </div>
                </div>

                {/* LinkedIn URL */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Linkedin size={14} /> LinkedIn Profile
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-blue-600 font-semibold text-sm truncate">
                        {instructor.public_profile?.linkedin_url ? (
                            <a href={instructor.public_profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                {instructor.public_profile.linkedin_url}
                            </a>
                        ) : (
                            <span className="text-gray-400">N/A</span>
                        )}
                    </div>
                </div>

                {/* Title 1 / Name */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Type size={14} /> Title 1 (Name)
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-semibold text-sm">
                        {instructor.public_profile?.text_1 || 'N/A'}
                    </div>
                </div>

                {/* Title 2 / Qualification */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Book size={14} /> Title 2 (Qualification)
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-semibold text-sm">
                        {instructor.public_profile?.text_2 || 'N/A'}
                    </div>
                </div>

                {/* Title 3 / Company Name */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Building size={14} /> Title 3 (Company)
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-semibold text-sm">
                        {instructor.public_profile?.text_3 || 'N/A'}
                    </div>
                </div>

                {/* Experience */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Briefcase size={14} /> Experience
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-semibold text-sm">
                        {instructor.public_profile?.experience || 'N/A'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewInstructor;

