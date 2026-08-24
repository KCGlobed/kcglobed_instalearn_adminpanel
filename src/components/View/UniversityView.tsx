import React, { useEffect, useState } from 'react';
import { viewUniversityApi } from '../../services/apiServices';
import { Loader2, Mail, Phone, Building2, MapPin, Briefcase, GraduationCap, UploadCloud, X } from 'lucide-react';
import moment from 'moment';
import ImportUniversityStudents from '../Forms/ImportUniversityStudents';

interface Props {
    universityId: number;
}

const UniversityView: React.FC<Props> = ({ universityId }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showImportModal, setShowImportModal] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await viewUniversityApi(universityId);
                setData(response?.data || response);
            } catch (error) {
                console.error("Failed to fetch university details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [universityId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex items-center justify-center min-h-[300px] text-gray-500">
                Failed to load university details.
            </div>
        );
    }

    const getStatusBadge = (status: number) => {
        switch (status) {
            case 1:
                return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold uppercase tracking-wide">New</span>;
            case 2:
                return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide">Approved</span>;
            case 3:
                return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wide">Rejected</span>;
            default:
                return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold uppercase tracking-wide">Unknown</span>;
        }
    };

    return (
        <div className="flex flex-col gap-6 p-1 relative">
            {/* Header section */}
            <div className="flex items-start gap-5 p-5 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
                    {data.first_name ? data.first_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <h2 className="text-xl font-bold text-indigo-950">
                            {data.first_name} {data.last_name}
                        </h2>
                        <div className="flex items-center gap-3">
                            {getStatusBadge(data.approved_status)}
                            <button
                                type="button"
                                onClick={() => setShowImportModal(true)}
                                className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm shadow-indigo-200"
                            >
                                <UploadCloud size={15} />
                                Import Students
                            </button>
                        </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3">
                        <div className="flex items-center gap-1.5 text-sm text-indigo-700 font-medium bg-white px-3 py-1 rounded-full shadow-sm border border-indigo-50">
                            <Mail size={14} />
                            {data.work_email}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-indigo-700 font-medium bg-white px-3 py-1 rounded-full shadow-sm border border-indigo-50">
                            <Phone size={14} />
                            {data.phone_number || 'N/A'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Import Students Modal Dialog */}
            {showImportModal && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setShowImportModal(false)}
                >
                    <div 
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-1/2 p-6 relative border border-gray-100 animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                    <UploadCloud size={18} />
                                </div>
                                <h3 className="text-base font-bold text-gray-900">Import Students</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowImportModal(false)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <ImportUniversityStudents
                            universityId={data.id || universityId}
                            institutionName={data.institution_name}
                            onClose={() => setShowImportModal(false)}
                        />
                    </div>
                </div>
            )}

            {/* Content grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">Institution Details</h3>
                    
                    <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Institution Name</span>
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                            <Building2 size={16} className="text-indigo-500" />
                            {data.institution_name}
                        </div>
                    </div>

                    <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Institution Type</span>
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                            <GraduationCap size={16} className="text-indigo-500" />
                            {data.institution_type}
                        </div>
                    </div>

                    <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Country</span>
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                            <MapPin size={16} className="text-indigo-500" />
                            {data.country || 'N/A'}
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">Role & Department</h3>
                    
                    <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Job Role</span>
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                            <Briefcase size={16} className="text-indigo-500" />
                            {data.job_role}
                        </div>
                    </div>

                    <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Department</span>
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                            <Building2 size={16} className="text-indigo-500" />
                            {data.department}
                        </div>
                    </div>

                    <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">System Status</span>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`w-2 h-2 rounded-full ${data.status ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <span className="text-sm font-semibold text-gray-800">{data.status ? 'Active' : 'Inactive'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Admin User & Subscription Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {data.admin_user && (
                    <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">Admin User Profile</h3>
                        
                        <div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Name</span>
                            <div className="text-sm font-semibold text-gray-800">
                                {data.admin_user.first_name} {data.admin_user.last_name}
                            </div>
                        </div>

                        <div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Email</span>
                            <div className="text-sm font-semibold text-gray-800 break-all">
                                {data.admin_user.email}
                            </div>
                        </div>
                        
                        <div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Status</span>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`w-2 h-2 rounded-full ${data.admin_user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                <span className="text-sm font-semibold text-gray-800">{data.admin_user.is_active ? 'Active' : 'Inactive'}</span>
                            </div>
                        </div>
                    </div>
                )}

                {data.active_subscription && data.active_subscription.length > 0 && (
                    <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">Active Subscription</h3>
                        
                        <div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Plan Name</span>
                            <div className="text-sm font-semibold text-gray-800">
                                {data.active_subscription[0].plan_info?.plan_name || 'N/A'}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Licences</span>
                                <div className="text-sm font-semibold text-gray-800">
                                    {data.active_subscription[0].no_of_licence}
                                </div>
                            </div>
                            <div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Amount</span>
                                <div className="text-sm font-semibold text-gray-800">
                                    ${data.active_subscription[0].amount}
                                </div>
                            </div>
                        </div>

                        <div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Duration</span>
                            <div className="text-xs font-medium text-gray-700 bg-gray-50 px-2 py-1.5 rounded-lg inline-block border border-gray-100">
                                {data.active_subscription[0].start_date} to {data.active_subscription[0].end_date}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Timestamps */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 mt-2">
                <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Created At</span>
                    <span className="text-sm font-semibold text-gray-700">
                        {data.created_at ? moment(data.created_at).format('MMM DD, YYYY hh:mm A') : '-'}
                    </span>
                </div>
                <div className="text-right">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Last Updated</span>
                    <span className="text-sm font-semibold text-gray-700">
                        {data.updated_at ? moment(data.updated_at).format('MMM DD, YYYY hh:mm A') : '-'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default UniversityView;
