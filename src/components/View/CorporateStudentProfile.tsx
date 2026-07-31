import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { Mail, Phone, Calendar, Globe, AlertCircle, } from 'lucide-react';
import { fetchCorporateStudentDetailApi } from '../../services/apiServices';

const CARD = 'bg-white rounded-[22px] border border-gray-100 shadow-[0_2px_10px_rgba(15,23,42,0.04)]';

const InfoRow = ({ icon: Icon, label, value, isLast = false }: { icon: any, label: string, value: React.ReactNode, isLast?: boolean }) => (
    <div className={`flex items-start gap-3 py-3 ${!isLast ? 'border-b border-gray-100' : ''} group/row`}>
        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0 transition-all duration-300 group-hover/row:bg-indigo-50 group-hover/row:text-indigo-600">
            <Icon size={14} />
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
            <div className="text-xs font-semibold text-gray-900 leading-relaxed break-words">{value}</div>
        </div>
    </div>
);

const CorporateStudentProfile = ({ studentId }: { studentId: number }) => {
    const [studentData, setStudentData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const response = await fetchCorporateStudentDetailApi(studentId);
                if (response?.data) {
                    setStudentData(response.data);
                } else {
                    setError("No data found");
                }
            } catch (err: any) {
                setError(err.message || "Failed to load student details");
            } finally {
                setLoading(false);
            }
        };
        if (studentId) loadData();
    }, [studentId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-500 font-medium">Loading student details...</p>
            </div>
        );
    }

    if (error || !studentData) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center text-red-500 min-h-[300px]">
                <AlertCircle size={48} className="mb-4 opacity-20" />
                <p className="font-bold text-lg">{error || 'Student data not found'}</p>
            </div>
        );
    }

    const isActive = studentData.is_active;

    return (
        <div className="p-1 space-y-6 max-h-[65vh] overflow-y-auto custom-scrollbar pr-2">
            <div className={`${CARD} p-6 overflow-hidden relative bg-gradient-to-br from-white via-white to-indigo-50/40`}>
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                    <div className="w-20 h-20 rounded-full shadow-[0_8px_30px_rgba(79,70,229,0.18)] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                        {studentData.image ? (
                            <img
                                src={studentData.image}
                                alt="Avatar"
                                className="w-full h-full object-cover rounded-full"
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                            <span className="font-black text-3xl text-white">
                                {studentData.first_name ? studentData.first_name.charAt(0).toUpperCase() : 'S'}
                            </span>
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-2">
                        <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                            <h1 className="text-xl font-black text-gray-900 tracking-tight">
                                {studentData.first_name} {studentData.last_name}
                            </h1>
                            <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                {isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <p className="text-xs font-medium text-gray-500 flex items-center justify-center md:justify-start gap-4 flex-wrap">
                            <span className="flex items-center gap-1.5">
                                <Mail size={12} className="text-indigo-400" /> {studentData.email || '-'}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Phone size={12} className="text-indigo-400" /> {studentData.phone1 || '-'}
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            <div className={`${CARD} p-6`}>
                <h2 className="text-sm font-black text-gray-900 mb-4">Detailed Information</h2>
                <div>
                    <InfoRow icon={Calendar} label="Created On" value={studentData.created_at ? moment(studentData.created_at).format('MMMM DD, YYYY') : '-'} />
                    <InfoRow icon={Globe} label="Location" isLast value={
                        <>
                            {studentData.address || 'No address provided'}<br />
                            {studentData.city ? `${studentData.city}, ` : ''}{studentData.state}<br />
                            {studentData.country} {studentData.pincode && `- ${studentData.pincode}`}
                        </>
                    } />
                </div>
            </div>
        </div>
    );
};

export default CorporateStudentProfile;
