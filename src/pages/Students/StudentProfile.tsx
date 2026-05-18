import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useRedux';
import { getStudentDetail } from '../../store/slices/studentSlice';
import {
    Mail, Phone, MapPin, Calendar, BookOpen,
    CreditCard, Hash, ArrowLeft, Smartphone, Laptop, Globe, CheckCircle2, AlertCircle,
    Loader2, Activity
} from 'lucide-react';
import moment from 'moment';

const StudentProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { selectedStudent, selectedStudentLoading, selectedStudentError } = useAppSelector((state) => state.students);

    const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'orders' | 'devices'>('overview');
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        if (id) {
            dispatch(getStudentDetail(id));
            setImgError(false);
        }
    }, [dispatch, id]);

    if (selectedStudentLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 min-h-[400px]">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
                <p className="text-sm text-slate-500 font-medium">Loading Student Profile...</p>
            </div>
        );
    }
    console.log(selectedStudent);

    if (selectedStudentError || !selectedStudent) {
        return (
            <div className="flex flex-col items-center justify-center p-20 min-h-[400px] text-center">
                <AlertCircle className="w-12 h-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900">Profile Not Found</h3>
                <p className="text-sm text-slate-500 mt-1">{selectedStudentError || "We couldn't retrieve the student information. Please try again later."}</p>
                <button
                    onClick={() => navigate('/dashboard/students')}
                    className="mt-6 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                    <ArrowLeft size={16} /> Back
                </button>
            </div>
        );
    }

    const { courses, user_devices } = selectedStudent;

    const active_orders = selectedStudent.active_orders && Object.keys(selectedStudent.active_orders).length > 0 ? selectedStudent.active_orders : null;

    return (
        <div className="bg-white min-h-screen flex flex-col font-sans text-slate-900 -m-4 sm:-m-6 lg:-m-8">
            {/* Banner Section */}
            <div className="relative h-48 w-full bg-slate-100 flex-shrink-0">
                {selectedStudent.banner_image ? (
                    <img src={selectedStudent.banner_image} alt="Banner" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-indigo-500 to-purple-600 opacity-20" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end">
                    <div className="p-8 w-full flex flex-col sm:flex-row items-start sm:items-end gap-6 relative">
                        <button
                            onClick={() => navigate('/dashboard/students')}
                            className="absolute top-6 left-8 text-black/70 hover:text-black flex items-center gap-2 text-s font-semibold transition-colors z-10"
                        >
                            <ArrowLeft size={14} /> Back
                        </button>
                        <div className="w-24 h-24 rounded-2xl border-4 border-white bg-white overflow-hidden shadow-2xl flex-shrink-0 mt-8">
                            {selectedStudent.image && !imgError ? (
                                <img
                                    src={selectedStudent.image}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                    onError={() => setImgError(true)}
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-600 font-bold text-3xl uppercase">
                                    {selectedStudent.first_name?.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="mb-1 flex-1">
                            <h1 className="text-3xl font-bold text-white tracking-tight leading-tight drop-shadow-md">
                                {selectedStudent.first_name} {selectedStudent.last_name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-3 mt-2">
                                <span className="text-white/90 text-xs font-semibold flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                                    <Hash size={14} className="text-indigo-300" /> ID: {selectedStudent.id}
                                </span>
                                {selectedStudent.is_active && (
                                    <span className="text-white/90 text-xs font-semibold flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                                        <CheckCircle2 size={14} className="text-emerald-300" /> Active Student
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1">
                <div className="p-8 max-w-6xl mx-auto w-full">

                    <div className="space-y-8">
                        <div className="flex flex-wrap gap-6 border-b border-slate-100 pb-0">
                            {(['overview', 'courses', 'orders', 'devices'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`text-[11px] font-bold uppercase tracking-[0.1em] pb-3 border-b-2 transition-colors ${activeTab === tab
                                        ? 'text-indigo-600 border-indigo-600'
                                        : 'text-slate-400 border-transparent hover:text-slate-600'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="space-y-10 animate-in fade-in duration-300">
                                {/* Summary Cards Row */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl flex flex-col items-center justify-center text-center hover:border-indigo-200 transition-colors">
                                        <BookOpen size={24} className="text-indigo-500 mb-2" />
                                        <p className="text-3xl font-black text-slate-900 tracking-tight">{courses?.length || 0}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Enrolled Courses</p>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl flex flex-col items-center justify-center text-center hover:border-emerald-200 transition-colors">
                                        <CreditCard size={24} className="text-emerald-500 mb-2" />
                                        <p className="text-3xl font-black text-slate-900 tracking-tight">
                                            {active_orders ? `₹${active_orders.total_amount ?? 0}` : 'Free'}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                            {active_orders ? 'Active Subscription' : 'No Current Plan'}
                                        </p>
                                    </div>
                                </div>

                                {/* Personal & Location Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Activity size={13} className="text-indigo-500" /> Personal Details
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <Mail size={16} className="text-slate-400" />
                                                <div>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Email</p>
                                                    <p className="text-[13px] font-semibold text-slate-700">{selectedStudent.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Phone size={16} className="text-slate-400" />
                                                <div>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Phone</p>
                                                    <p className="text-[13px] font-semibold text-slate-700">{selectedStudent.phone1 || (selectedStudent as any).phone || 'Not provided'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Calendar size={16} className="text-slate-400" />
                                                <div>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Birth Date</p>
                                                    <p className="text-[13px] font-semibold text-slate-700">
                                                        {selectedStudent.dob ? moment(selectedStudent.dob).format('MMM DD, YYYY') : 'Not specified'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Globe size={13} className="text-indigo-500" /> Location
                                        </h3>
                                        <div className="flex items-start gap-3">
                                            <MapPin size={16} className="text-slate-400 mt-1" />
                                            <div>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Address</p>
                                                <p className="text-[13px] font-medium text-slate-700 leading-relaxed mt-1">
                                                    {selectedStudent.address || 'No address provided'}<br />
                                                    {selectedStudent.city}, {selectedStudent.state}<br />
                                                    {selectedStudent.country} {selectedStudent.pincode && `— ${selectedStudent.pincode}`}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Some Courses Preview */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 flex items-center gap-2">
                                            <div className="w-6 h-[1px] bg-indigo-200"></div>
                                            Recent Courses
                                        </h2>
                                        <button
                                            onClick={() => setActiveTab('courses')}
                                            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-widest"
                                        >
                                            View All
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {courses && courses.length > 0 ? (
                                            courses.slice(0, 2).map((course) => (
                                                <div key={course.id} className="flex gap-4 p-4 rounded-2xl border border-slate-100 bg-white group">
                                                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                                                        {course.course_detail.name.charAt(0)}
                                                    </div>
                                                    <div className="flex-1 py-1 flex flex-col justify-center overflow-hidden">
                                                        <h4 className="text-[13px] font-bold text-slate-800 line-clamp-1 leading-tight group-hover:text-indigo-600 transition-colors">
                                                            {course.course_detail.name}
                                                        </h4>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: #{course.course_detail.id}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-full py-6 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-[11px] font-medium text-slate-500">
                                                No courses enrolled
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Devices Preview */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 flex items-center gap-2">
                                            <div className="w-6 h-[1px] bg-indigo-200"></div>
                                            Primary Devices
                                        </h2>
                                        <button
                                            onClick={() => setActiveTab('devices')}
                                            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-widest"
                                        >
                                            View All
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {user_devices && user_devices.length > 0 ? (
                                            user_devices.slice(0, 2).map((device) => (
                                                <div key={device.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                                                            {device.device_type === 'desktop' ? <Laptop size={14} /> : <Smartphone size={14} />}
                                                        </div>
                                                        <p className="text-[12px] font-bold text-slate-800 uppercase">{device.device_type}</p>
                                                    </div>
                                                    <p className="text-[10px] font-bold text-slate-700">{moment(device.created_at).format('MMM DD, YYYY')}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-6 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-[11px] font-medium text-slate-500">
                                                No device found
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Courses Tab */}
                        {activeTab === 'courses' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div>
                                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-4 flex items-center gap-2">
                                        <div className="w-6 h-[1px] bg-indigo-200"></div>
                                        Curriculum
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {courses && courses.length > 0 ? (
                                            courses.map((course) => (
                                                <div key={course.id} className="flex gap-4 p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all bg-white group">
                                                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                                                        {course.course_detail.name.charAt(0)}
                                                    </div>
                                                    <div className="flex-1 py-1 flex flex-col justify-center overflow-hidden">
                                                        <h4 className="text-[13px] font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                                                            {course.course_detail.name}
                                                        </h4>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: #{course.course_detail.id}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-full py-12 text-center text-slate-500 text-sm border border-dashed border-slate-200 rounded-2xl">
                                                No courses enrolled.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Orders Tab */}
                        {activeTab === 'orders' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div>
                                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-4 flex items-center gap-2">
                                        <div className="w-6 h-[1px] bg-indigo-200"></div>
                                        Subscription Status
                                    </h2>
                                    {active_orders ? (
                                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 pb-6 border-b border-slate-200">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Current Plan</p>
                                                    <h4 className="text-xl font-bold text-slate-900">Premium Access</h4>
                                                </div>
                                                <div className="text-left md:text-right">
                                                    <p className="text-2xl font-black text-slate-900">₹{active_orders.total_amount}</p>
                                                    <p className="text-[11px] font-medium text-slate-500 mt-1">Next due: {moment(active_orders.next_due).format('MMM DD, YYYY')}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Order ID</p>
                                                    <p className="text-[13px] font-bold text-slate-700">#ORD-{active_orders.id}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                                    <p className="text-[13px] font-bold text-emerald-600 flex items-center gap-1.5">
                                                        <CheckCircle2 size={14} /> Active
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-12 text-center text-slate-500 text-sm border border-dashed border-slate-200 rounded-2xl">
                                            No active subscription found.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Devices Tab */}
                        {activeTab === 'devices' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div>
                                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-4 flex items-center gap-2">
                                        <div className="w-6 h-[1px] bg-indigo-200"></div>
                                        Authorized Devices
                                    </h2>
                                    <div className="space-y-3">
                                        {user_devices && user_devices.length > 0 ? (
                                            user_devices.map((device) => (
                                                <div key={device.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 group">
                                                    <div className="flex items-center gap-4 min-w-0">
                                                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                                                            {device.device_type === 'desktop' ? <Laptop size={18} /> : <Smartphone size={18} />}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-[13px] font-bold text-slate-800 uppercase tracking-tight">{device.device_type}</p>
                                                            </div>
                                                            <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5">{device.device_id}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[11px] font-bold text-slate-700">{moment(device.created_at).format('MMM DD, YYYY')}</p>
                                                        <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">{moment(device.created_at).format('hh:mm A')}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-12 text-center text-slate-500 text-sm border border-dashed border-slate-200 rounded-2xl">
                                                No devices authorized.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default StudentProfile;
