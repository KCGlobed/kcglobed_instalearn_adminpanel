import { useEffect, useState } from 'react';
import { viewPartnerRequestApi } from '../../services/apiServices';
import { Loader2, Calendar, FileText, CheckCircle, MapPin, Mail, Phone, Users } from 'lucide-react';
import moment from 'moment';
import toast from 'react-hot-toast';
import type { partner } from '../../utils/types';

interface Props {
    id: number | string;
}

const PartnerViewModal = ({ id }: Props) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<partner | null>(null);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                setLoading(true);
                const res = await viewPartnerRequestApi(id);
                if (res.data) {
                    setData(res.data);
                } else {
                    setData(res as any);
                }
            } catch (err: any) {
                console.error("Failed to fetch partner request details", err);
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
                    <Users size={18} />
                </span>
                <div>
                    <p className="text-sm font-semibold text-indigo-800">Partner Request Details</p>
                    <p className="text-xs text-indigo-500 mt-0.5">Viewing detailed information for this partner request.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-1">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">First Name</label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm font-medium">
                        {data.first_name || "N/A"}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Last Name</label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm font-medium">
                        {data.last_name || "N/A"}
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
                        {data.city && data.state ? `${data.city}, ${data.state}, ${data.country}` : (data.city || data.state || data.country || 'N/A')}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <CheckCircle size={14} /> Partner Type
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm font-medium">
                        {data.partner_type || "N/A"}
                    </div>
                </div>
                
                {data.address && (
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                            <MapPin size={14} /> Full Address
                        </label>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm font-medium">
                            {data.address} {data.pincode ? `- ${data.pincode}` : ''}
                        </div>
                    </div>
                )}
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <FileText size={14} /> Documents
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm font-medium truncate">
                        {data.documents ? (
                            <a href={data.documents} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                View Attached Documents
                            </a>
                        ) : (
                            <span className="text-gray-700">N/A</span>
                        )}
                    </div>
                </div>
                
                {data.comment && (
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                            <FileText size={14} /> Comments
                        </label>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm font-medium">
                            {data.comment}
                        </div>
                    </div>
                )}

                <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Calendar size={14} /> Updated At
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm">
                        {data.updated_at ? moment(data.updated_at).format('MMM DD, YYYY hh:mm A') : '-'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartnerViewModal;
