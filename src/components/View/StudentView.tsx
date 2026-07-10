import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useRedux';
import { getStudentDetail } from '../../store/slices/studentSlice';
import {
    Mail, Phone, MapPin, Calendar, BookOpen,
    CreditCard, Hash, ArrowLeft, Smartphone, Globe, CheckCircle2, AlertCircle,
    Activity, Monitor, Award, Inbox, BookCheck, Bell, ChevronRight, Clock, XCircle, PauseCircle
} from 'lucide-react';
import moment from 'moment';

const CARD = 'bg-white rounded-[22px] border border-gray-100 shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition-all duration-300';
const CARD_HOVER = 'hover:shadow-[0_12px_32px_rgba(15,23,42,0.08)] hover:-translate-y-1 hover:border-gray-200';

const SkeletonLoader = () => (
    <div className="max-w-[1400px] mx-auto p-4 sm:p-5 lg:p-6 space-y-6 animate-pulse bg-gray-50 min-h-screen">
        <div className="h-5 w-20 bg-gray-200 rounded-md mb-6"></div>
        {/* Hero Card Skeleton */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_10px_rgba(15,23,42,0.04)] border border-gray-100 flex flex-col md:flex-row gap-6">
            <div className="w-20 h-20 bg-gray-200 rounded-full shrink-0"></div>
            <div className="flex-1 space-y-3">
                <div className="h-6 w-1/3 bg-gray-200 rounded-md"></div>
                <div className="h-3 w-1/4 bg-gray-200 rounded-md"></div>
                <div className="flex gap-2">
                    <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
                    <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
                </div>
            </div>
        </div>
        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white p-5 rounded-[22px] border border-gray-100 shadow-[0_2px_10px_rgba(15,23,42,0.04)] h-24"></div>
            ))}
        </div>
        {/* Two Column Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-[22px] border border-gray-100 shadow-[0_2px_10px_rgba(15,23,42,0.04)] h-56"></div>
                <div className="bg-white p-6 rounded-[22px] border border-gray-100 shadow-[0_2px_10px_rgba(15,23,42,0.04)] h-56"></div>
            </div>
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-[22px] border border-gray-100 shadow-[0_2px_10px_rgba(15,23,42,0.04)] h-64"></div>
                <div className="bg-white p-6 rounded-[22px] border border-gray-100 shadow-[0_2px_10px_rgba(15,23,42,0.04)] h-56"></div>
            </div>
        </div>
    </div>
);

const EmptyState = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-3">
            <Icon size={24} className="text-gray-400" />
        </div>
        <h4 className="text-sm font-bold text-gray-900 mb-1">{title}</h4>
        <p className="text-xs text-gray-500 max-w-sm">{description}</p>
    </div>
);


const InfoRow = ({ icon: Icon, label, value, isLast = false }: { icon: any, label: string, value: React.ReactNode, isLast?: boolean }) => (
    <div className={`flex items-start gap-3 py-3 ${!isLast ? 'border-b border-gray-100' : ''} group/row`}>
        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0 transition-all duration-300 group-hover/row:bg-indigo-50 group-hover/row:text-indigo-600 group-hover/row:-translate-y-0.5">
            <Icon size={14} />
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
            <div className="text-xs font-semibold text-gray-900 leading-relaxed break-words">{value}</div>
        </div>
    </div>
);

const StudentProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { selectedStudent, selectedStudentLoading, selectedStudentError } = useAppSelector((state) => state.students);

    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        if (id) {
            dispatch(getStudentDetail(id));
            setImgError(false);
        }
    }, [dispatch, id]);

    if (selectedStudentLoading) return <SkeletonLoader />;

    if (selectedStudentError || !selectedStudent) {
        return (
            <div className="flex flex-col items-center justify-center p-14 min-h-[420px] text-center bg-white rounded-[24px] border border-gray-100 mx-4 shadow-[0_2px_10px_rgba(15,23,42,0.04)] mt-6">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-5 border border-gray-100">
                    <AlertCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Profile Not Found</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto mb-6">
                    {selectedStudentError || "We couldn't retrieve the student information. The profile might have been removed."}
                </p>
                <button
                    onClick={() => navigate('/dashboard/students')}
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-full text-xs font-semibold hover:bg-indigo-700 transition-all shadow-[0_8px_24px_rgba(79,70,229,0.25)] hover:shadow-[0_12px_32px_rgba(79,70,229,0.35)] hover:-translate-y-1"
                >
                    Back to Students
                </button>
            </div>
        );
    }

    const { courses, user_devices } = selectedStudent;
    const active_orders = selectedStudent.active_orders && Object.keys(selectedStudent.active_orders).length > 0 ? selectedStudent.active_orders : null;
    const announcements = (selectedStudent as any).announcements || [];

    const totalCourses = courses?.length || 0;
    const completedCourses = courses?.filter((c: any) => c.progress === 100)?.length || 0;
    const activeSubscription = active_orders ? true : false;
    const totalDevices = user_devices?.length || 0;
    const totalOrders = active_orders ? 1 : 0; // Assuming we only have active_orders object from API currently
    const certificates = completedCourses; // Dummy logic if certificates aren't in API yet

    return (
        <div className="bg-gray-50 min-h-screen pb-10 font-sans">
            <div className="max-w-[1400px] mx-auto p-4 sm:p-5 lg:p-6 space-y-6">
                <button
                    onClick={() => navigate('/dashboard/students')}
                    className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-all w-fit group"
                >
                    <ArrowLeft size={14} className="transition-transform duration-300 group-hover:-translate-x-1" /> Back to Students
                </button>

                <div className="relative rounded-[24px] p-6 md:p-8 border border-gray-100 shadow-[0_4px_24px_rgba(15,23,42,0.05)] overflow-hidden bg-gradient-to-br from-white via-white to-indigo-50/40">
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-indigo-200/40 to-purple-200/30 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -left-12 w-56 h-56 bg-gradient-to-tr from-sky-100/50 to-transparent rounded-full blur-3xl pointer-events-none" />

                    <div className="relative flex flex-col md:flex-row gap-6 items-center md:items-center">
                        <div className="relative shrink-0">
                            <div className="w-20 h-20 rounded-full border-4 border-white shadow-[0_8px_30px_rgba(79,70,229,0.18)] overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600">
                                {selectedStudent.image && !imgError ? (
                                    <img
                                        src={selectedStudent.image}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                        onError={() => setImgError(true)}
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white font-black text-3xl uppercase">
                                        {selectedStudent.first_name?.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <span className={`absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full border-[3px] border-white ${(selectedStudent.is_active ?? selectedStudent.status) !== false ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-3">
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                                    {selectedStudent.first_name} {selectedStudent.last_name}
                                </h1>
                                <p className="text-xs font-medium text-gray-500 mt-1 flex items-center justify-center md:justify-start gap-3 flex-wrap">
                                    <span className="flex items-center gap-1.5"><Mail size={12} /> {selectedStudent.email}</span>
                                    <span className="flex items-center gap-1.5"><MapPin size={12} /> {selectedStudent.city || 'Unknown'}, {selectedStudent.country || 'Unknown'}</span>
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                                <span className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600 bg-white/80 backdrop-blur border border-gray-200 px-3 py-1 rounded-full shadow-[0_1px_4px_rgba(15,23,42,0.04)]">
                                    <Hash size={11} className="text-gray-400" /> ID {selectedStudent.id}
                                </span>
                                {(selectedStudent.is_active ?? selectedStudent.status) !== false ? (
                                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                                        <CheckCircle2 size={11} /> Active
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                                        <AlertCircle size={11} /> Inactive
                                    </span>
                                )}
                                {activeSubscription && (
                                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
                                        <Award size={11} /> Premium
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                        { icon: BookOpen, value: totalCourses, label: 'Enrolled Courses', from: 'from-blue-50', to: 'to-indigo-50', text: 'text-blue-600' },
                        { icon: BookCheck, value: completedCourses, label: 'Completed', from: 'from-emerald-50', to: 'to-teal-50', text: 'text-emerald-600' },
                        { icon: CreditCard, value: activeSubscription ? 'Yes' : 'No', label: 'Subscription', from: 'from-purple-50', to: 'to-fuchsia-50', text: 'text-purple-600' },
                        { icon: Monitor, value: totalDevices, label: 'Devices', from: 'from-orange-50', to: 'to-amber-50', text: 'text-orange-600' },
                        { icon: Activity, value: totalOrders, label: 'Orders', from: 'from-sky-50', to: 'to-cyan-50', text: 'text-sky-600' },
                        { icon: Award, value: certificates, label: 'Certificates', from: 'from-yellow-50', to: 'to-amber-50', text: 'text-yellow-600' },
                    ].map((stat, i) => (
                        <div key={i} className={`${CARD} ${CARD_HOVER} p-4 group`}>
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.from} ${stat.to} flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                                <stat.icon size={18} className={stat.text} />
                            </div>
                            <p className="text-xl font-black text-gray-900 mb-0.5">{stat.value}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className={`${CARD} p-6`}>
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-base font-black text-gray-900">Enrolled Courses</h2>
                            </div>

                            {courses && courses.length > 0 ? (
                                <div className="space-y-3">
                                    {courses.map((course: any) => {
                                        return (
                                            <div
                                                key={course.id}
                                                className="flex items-center gap-4 p-3.5 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-white hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)] hover:border-indigo-100 hover:-translate-y-0.5 transition-all duration-300 group"
                                            >
                                                <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-indigo-100 flex items-center justify-center relative transition-transform duration-300 group-hover:scale-105">
                                                    <span className="text-indigo-600 font-black text-lg uppercase">
                                                        {course.course_detail?.name?.charAt(0) || '?'}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest mb-0.5">{course.course_detail?.category?.name || 'General'}</p>
                                                    <h3 className="text-sm font-bold text-gray-900 truncate">{course.course_detail?.name}</h3>
                                                </div>
                                                <div className="shrink-0 text-gray-300 group-hover:text-indigo-500 transition-all duration-300 group-hover:translate-x-1">
                                                    <ChevronRight size={18} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <EmptyState icon={BookOpen} title="No Enrolled Courses" description="This student hasn't enrolled in any courses yet." />
                            )}
                        </div>

                        <div className={`${CARD} p-6`}>
                            <h2 className="text-base font-black text-gray-900 mb-5">Active Subscription</h2>

                            {active_orders ? (
                                <div className="bg-gray-50/60 rounded-2xl border border-gray-100 overflow-hidden hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)] hover:border-indigo-100 transition-all duration-300">
                                    <div className="p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-110 hover:rotate-3">
                                                <CreditCard size={22} />
                                            </div>
                                            <div>
                                                <h4 className="text-base font-black text-gray-900">Premium Plan</h4>
                                                <p className="text-xs font-semibold text-gray-500 mt-0.5">Order #ORD-{active_orders.id}</p>
                                            </div>
                                        </div>
                                        <div className="text-center md:text-right">
                                            <p className="text-xl font-black text-gray-900">₹{active_orders.total_amount}</p>
                                            {(() => {
                                                const status = active_orders.subscription_status;
                                                let colorClass = 'text-gray-700 bg-gray-100';
                                                let Icon = AlertCircle;
                                                let text = 'Unknown';
                                                switch (status) {
                                                    case 1: colorClass = 'text-blue-700 bg-blue-100'; Icon = Clock; text = 'Initiate'; break;
                                                    case 2: colorClass = 'text-emerald-700 bg-emerald-100'; Icon = CheckCircle2; text = 'Active'; break;
                                                    case 3: colorClass = 'text-red-700 bg-red-100'; Icon = XCircle; text = 'Expired'; break;
                                                    case 4: colorClass = 'text-amber-700 bg-amber-100'; Icon = PauseCircle; text = 'Paused'; break;
                                                    case 5: colorClass = 'text-red-700 bg-red-100'; Icon = XCircle; text = 'Cancelled'; break;
                                                }
                                                return (
                                                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full mt-1.5 ${colorClass}`}>
                                                        <Icon size={10} /> {text}
                                                    </span>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                    <div className="bg-white p-5 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-5">
                                        <div>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Start Date</p>
                                            <p className="text-xs font-bold text-gray-900">{moment(active_orders.start_date).format('MMM DD, YYYY')}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">End Date</p>
                                            <p className="text-xs font-bold text-gray-900">{moment(active_orders.end_date).format('MMM DD, YYYY')}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Next Due</p>
                                            <p className="text-xs font-bold text-gray-900">{active_orders.next_due ? moment(active_orders.next_due).format('MMM DD, YYYY') : '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Subscription Status</p>
                                            <p className="text-xs font-bold text-gray-900 capitalize">
                                                {{ 1: 'Initiate', 2: 'Active', 3: 'Expired', 4: 'Paused', 5: 'Cancelled' }[active_orders.subscription_status as number] || 'Unknown'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <EmptyState icon={Inbox} title="No Active Subscriptions" description="There are no active orders or subscriptions for this student." />
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* SECTION 4: Student Information */}
                        <div className={`${CARD} p-6`}>
                            <h2 className="text-base font-black text-gray-900 mb-1">Information</h2>
                            <div>
                                <InfoRow icon={Mail} label="Email Address" value={selectedStudent.email} />
                                <InfoRow icon={Phone} label="Phone Number" value={selectedStudent.phone1 || (selectedStudent as any).phone || 'Not provided'} />
                                <InfoRow
                                    icon={Calendar}
                                    label="Created On"
                                    value={(selectedStudent as any).created_at || (selectedStudent as any).date_joined ? moment((selectedStudent as any).created_at || (selectedStudent as any).date_joined).format('MMMM DD, YYYY') : 'Unknown'}
                                />
                                <InfoRow
                                    icon={Globe}
                                    label="Location"
                                    isLast
                                    value={
                                        <>
                                            {selectedStudent.address || 'No address'}<br />
                                            {selectedStudent.city ? `${selectedStudent.city}, ` : ''}{selectedStudent.state}<br />
                                            {selectedStudent.country} {selectedStudent.pincode && `- ${selectedStudent.pincode}`}
                                        </>
                                    }
                                />
                            </div>
                        </div>

                        {/* SECTION 6: Devices */}
                        <div className={`${CARD} p-6`}>
                            <h2 className="text-base font-black text-gray-900 mb-5">Recent Devices</h2>

                            {user_devices && user_devices.length > 0 ? (
                                <div className="space-y-3">
                                    {user_devices.map((device: any, index: number) => (
                                        <div key={device.id} className="flex gap-3.5 p-3.5 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-white hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)] hover:border-indigo-100 hover:-translate-y-0.5 transition-all duration-300 group">
                                            <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-indigo-600 group-hover:scale-110 transition-all duration-300 shrink-0">
                                                {device.device_type === 'desktop' ? <Monitor size={16} /> : <Smartphone size={16} />}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <p className="text-xs font-bold text-gray-900 uppercase">{device.device_type}</p>
                                                    {index === 0 && (
                                                        <span className="text-[8px] font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full uppercase tracking-widest">Active</span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] font-mono text-gray-500 truncate mb-0.5">{device.device_id}</p>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                                    {moment(device.created_at).format('MMM DD, YYYY · hh:mm A')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState icon={Monitor} title="No Devices" description="No devices have been registered for this account." />
                            )}
                        </div>

                        {/* SECTION 7: Announcements */}
                        <div className={`${CARD} p-6`}>
                            <h2 className="text-base font-black text-gray-900 mb-5">Announcements</h2>

                            {announcements && announcements.length > 0 ? (
                                <div className="relative border-l-2 border-gray-100 ml-3 space-y-6 pb-2">
                                    {announcements.map((ann: any, idx: number) => (
                                        <div key={idx} className="relative pl-5 group">
                                            <div className="absolute w-3 h-3 bg-white border-2 border-indigo-600 rounded-full -left-[7px] top-1 transition-transform duration-300 group-hover:scale-125"></div>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{moment(ann.date).fromNow()}</p>
                                            <h4 className="text-xs font-bold text-gray-900 mb-0.5">{ann.title}</h4>
                                            <p className="text-[11px] font-medium text-gray-500 line-clamp-2">{ann.description}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState icon={Bell} title="No Announcements" description="No recent announcements to show." />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;