import React, { useEffect, useState } from "react";
import { downloadStudentLoginActivityPdfApi, downloadStudentLoginActivityExcelApi, fetchStudentLoginActivityApi } from "../../services/apiServices";
import { Download, Activity, Monitor, Smartphone, Globe, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";

interface StudentLoginActivityViewProps {
    studentId: number;
}

const StudentLoginActivityView = ({ studentId }: StudentLoginActivityViewProps) => {
    const [loading, setLoading] = useState(false);
    const [loginActivity, setLoginActivity] = useState<any[]>([]);

    useEffect(() => {
        if (studentId) {
            fetchLoginActivity();
        }
    }, [studentId]);

    const fetchLoginActivity = async () => {
        try {
            setLoading(true);
            const res = await fetchStudentLoginActivityApi(studentId);
            if (res?.data) {
                setLoginActivity(Array.isArray(res.data) ? res.data : (res.data.results || []));
            } else if (Array.isArray(res)) {
                setLoginActivity(res);
            }
        } catch (error) {
            console.error("Failed to fetch login activity", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (type: 'pdf' | 'excel') => {
        if (!studentId) {
            toast.error("Invalid student ID");
            return;
        }

        try {
            const apiCall = type === 'pdf' ? downloadStudentLoginActivityPdfApi : downloadStudentLoginActivityExcelApi;
            const response: any = await apiCall(studentId);

            const extension = type === 'excel' ? 'csv' : 'pdf';
            const fileName = `student_login_activity_${studentId}_${new Date().toISOString().split('T')[0]}.${extension}`;

            if (response?.data?.report_url) {
                const fileUrl = response.data.report_url;
                const link = document.createElement('a');
                link.href = fileUrl;
                link.target = '_blank';
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success(`Login Activity ${type.toUpperCase()} report downloaded`);
                return;
            }

            if (response && typeof response.blob === 'function') {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                toast.success(`Login Activity ${type.toUpperCase()} report downloaded`);
                return;
            }

            if (response?.data && typeof response.data === 'string' && response.data.startsWith('http')) {
                const fileUrl = response.data;
                const link = document.createElement('a');
                link.href = fileUrl;
                link.target = '_blank';
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success(`Login Activity ${type.toUpperCase()} report downloaded`);
                return;
            }

            const errMsg = response?.message || response?.detail || "Invalid format returned from Server";
            throw new Error(errMsg);

        } catch (error: any) {
            console.error(`Failed to download login activity ${type} report`, error);
            toast.error(error?.message || `Failed to download login activity ${type} report`);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 p-1 max-h-[75vh] overflow-hidden">
            {/* Left Column: Actions */}
            <div className="w-full lg:w-1/3 flex flex-col gap-6 overflow-y-auto pr-2 pb-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 shadow-sm border border-indigo-100">
                            <Activity size={24} />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-bold text-gray-900 leading-tight">
                                Login Activity
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">
                                Download login activity reports
                            </p>
                        </div>
                    </div>

                    <div className="bg-indigo-600 rounded-xl p-5 text-white shadow-md shadow-indigo-100 mt-4">
                        <h3 className="font-bold mb-3 flex items-center gap-2">Download Reports</h3>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => handleDownload('pdf')}
                                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white text-indigo-600 rounded-lg font-bold text-sm transition-all hover:shadow-lg hover:-translate-y-0.5"
                            >
                                <Download size={16} /> Download PDF
                            </button>
                            <button
                                onClick={() => handleDownload('excel')}
                                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-indigo-500/50 text-white rounded-lg font-bold text-sm border border-indigo-400/30 transition-all hover:bg-indigo-500/80"
                            >
                                <Download size={16} /> Download Excel
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Activity Viewer */}
            <div className="w-full lg:w-2/3 bg-gray-50 rounded-2xl overflow-hidden shadow-sm relative border border-gray-200 min-h-[500px] flex flex-col">
                <div className="p-4 bg-white flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center gap-2 text-gray-800">
                        <Activity size={18} className="text-indigo-600" />
                        <span className="text-sm font-bold">Recent Login Sessions</span>
                    </div>
                </div>

                <div className="flex-1 relative overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
                            <p className="text-gray-500 font-medium">Loading activity data...</p>
                        </div>
                    ) : loginActivity.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            {loginActivity.map((session, index) => (
                                <div key={session.id || index} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                                        {session.device_type === 'desktop' ? (
                                            <Monitor size={18} className="text-indigo-600" />
                                        ) : session.device_type === 'mobile' ? (
                                            <Smartphone size={18} className="text-indigo-600" />
                                        ) : (
                                            <Globe size={18} className="text-indigo-600" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="text-sm font-bold text-gray-900 capitalize">
                                                {session.device_type || 'Unknown Device'}
                                            </h4>
                                            <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                                                <Calendar size={12} />
                                                {session.created_at || session.login_time ? moment(session.created_at || session.login_time).format('MMM DD, YYYY · hh:mm A') : 'Unknown Time'}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500 flex items-center gap-3">
                                            <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{session.ip_address || 'Unknown IP'}</span>
                                            <span className="truncate">{session.browser || session.user_agent || 'Unknown Browser'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                            <Activity size={48} className="mb-4 opacity-30" />
                            <p className="font-bold text-lg text-gray-500">No login activity found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentLoginActivityView;
