import { useEffect, useState } from 'react';
import { viewJobApplicationApi } from '../../services/apiServices';
import { Globe2, Loader2, Calendar, FileText, Briefcase, Mail, Phone, MapPin, Award } from 'lucide-react';
import moment from 'moment';
import toast from 'react-hot-toast';
import type { jobApplication } from '../../utils/types';

interface Props {
    id: number | string;
}

const JobApplicationViewModal = ({ id }: Props) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<jobApplication | null>(null);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                setLoading(true);
                const res = await viewJobApplicationApi(id);
                if (res.data) {
                    setData(res.data);
                } else {
                    setData(res as any);
                }
            } catch (err: any) {
                console.error("Failed to fetch job application details", err);
                toast.error(err?.message || "Failed to fetch details");
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-10 h-64 gap-3">
                <Loader2 size={32} className="animate-spin text-indigo-600" />
                <p className="text-sm font-medium text-gray-500">Loading details...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-8 text-center text-gray-500">
                Failed to load data.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                <span className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <Briefcase size={18} />
                </span>
                <div>
                    <p className="text-sm font-semibold text-indigo-800">Job Application Details</p>
                    <p className="text-xs text-indigo-500 mt-0.5">Viewing detailed information for this application.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-1">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Full Name</label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm font-medium">
                        {data.full_name || "N/A"}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Role Applied For</label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm font-medium">
                        {data.role_applying_for || "N/A"}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Mail size={14} /> Email
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm font-medium overflow-hidden text-ellipsis">
                        {data.email || "N/A"}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Phone size={14} /> Mobile
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm font-medium">
                        {data.mobile || "N/A"}
                    </div>
                </div>
                
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <MapPin size={14} /> Location
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm font-medium">
                        {data.city && data.state ? `${data.city}, ${data.state}` : (data.city || data.state || 'N/A')}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Award size={14} /> Highest Qualification
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm font-medium truncate">
                        {data.highest_qualification || "N/A"}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Employment Status</label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm font-medium">
                        {data.current_employment_status || "N/A"}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Experience & Notice Period</label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm font-medium">
                        {data.total_years_of_experience ? `${data.total_years_of_experience} Years` : "N/A"} | Notice: {data.notice_period ? data.notice_period.replace('_', ' ') : "N/A"}
                    </div>
                </div>

                {data.linkedin_portfolio && (
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                            <Globe2 size={14} /> LinkedIn / Portfolio
                        </label>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-blue-600 text-sm font-medium truncate">
                            <a href={data.linkedin_portfolio} target="_blank" rel="noreferrer" className="hover:underline">
                                {data.linkedin_portfolio}
                            </a>
                        </div>
                    </div>
                )}
                
                {data.resume && (
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                            <FileText size={14} /> Resume
                        </label>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-blue-600 text-sm font-medium truncate">
                            <a href={data.resume} target="_blank" rel="noreferrer" className="hover:underline">
                                View Resume Document
                            </a>
                        </div>
                    </div>
                )}
                
                {data.summary && (
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                            <FileText size={14} /> Summary
                        </label>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm font-medium">
                            {data.summary}
                        </div>
                    </div>
                )}

                <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Calendar size={14} /> Applied On
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm">
                        {data.created_at ? moment(data.created_at).format('MMM DD, YYYY hh:mm A') : '-'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobApplicationViewModal;
