import React, { useEffect, useState } from 'react';
import moment from 'moment';
import {
    Calendar,
    BookOpen,
    Mail,
    Phone,
    User,
    Activity,
    Award,
    Shield,
    Users,
    Key,
    CreditCard,
    Clock,
    CheckCircle2,
    XCircle,
} from 'lucide-react';
import { fetchCorporateAdminDetailApi } from '../../services/apiServices';
import { useModal } from '../../context/ModalContext';
import CorporateAdminForm from '../Forms/CorporateAdminForm';
import TabsModal from '../../components/Modal/TabsModal';
import CorporateStudentVideoReport from './CorporateStudentVideoReport';
import CorporateStudentNotes from './CorporateStudentNotes';
import CorporateStudentQuizReport from './CorporateStudentQuizReport';
import CorporateStudentLoginActivityView from './CorporateStudentLoginActivityView';
import { PlayCircle, FileText, HelpCircle, Eye } from 'lucide-react';

const CARD = 'bg-white rounded-[22px] border border-gray-100 shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition-all duration-300';
const CARD_HOVER = 'hover:shadow-[0_12px_32px_rgba(15,23,42,0.08)] hover:-translate-y-1 hover:border-gray-200';

const SkeletonLoader = () => (
    <div className="max-w-[1400px] mx-auto p-4 sm:p-5 lg:p-6 space-y-6 animate-pulse bg-gray-50 min-h-screen">
        <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_10px_rgba(15,23,42,0.04)] border border-gray-100 flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="flex gap-6 w-full items-center">
                <div className="w-24 h-24 bg-gray-200 rounded-[20px] shrink-0" />
                <div className="flex-1 space-y-3 pt-2">
                    <div className="h-6 w-1/3 bg-gray-200 rounded-md" />
                    <div className="h-4 w-48 bg-gray-200 rounded-md" />
                </div>
            </div>
            <div className="w-32 h-10 bg-gray-200 rounded-xl shrink-0" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white p-5 rounded-[22px] border border-gray-100 shadow-[0_2px_10px_rgba(15,23,42,0.04)] h-28" />
            ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-[22px] border border-gray-100 shadow-[0_2px_10px_rgba(15,23,42,0.04)] h-[500px]" />
            <div className="bg-white p-6 rounded-[22px] border border-gray-100 shadow-[0_2px_10px_rgba(15,23,42,0.04)] h-[500px]" />
        </div>
    </div>
);



const getSubscriptionType = (type: any) => {
    const types: { [key: string]: string } = { '1': 'Monthly', '2': 'Half Yearly', '3': 'Yearly' };
    return types[String(type)] || 'Unknown';
};

const getSubscriptionStatus = (status: any) => {
    const statuses: { [key: string]: string } = {
        '1': 'Initiate', '2': 'Active', '3': 'Expired', '4': 'Paused', '5': 'Cancelled',
    };
    return statuses[String(status)] || 'Unknown';
};

const getStatusColor = (status: number) => {
    const colors: { [key: number]: string } = {
        1: 'bg-blue-100 text-blue-700',
        2: 'bg-emerald-100 text-emerald-700',
        3: 'bg-red-100 text-red-700',
        4: 'bg-amber-100 text-amber-700',
        5: 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
};

// ── Component ─────────────────────────────────────────────────────────────────
interface CorporateAdminViewProps {
    adminId: number;
}

const CorporateAdminView: React.FC<CorporateAdminViewProps> = ({ adminId }) => {
    const [adminData, setAdminData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { showModal } = useModal();

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const response = await fetchCorporateAdminDetailApi(adminId);
                if (response?.data) setAdminData(response.data);
            } catch (error) {
                console.error('Failed to load corporate admin details', error);
            } finally {
                setLoading(false);
            }
        };
        if (adminId) loadData();
    }, [adminId]);

    if (loading) return <SkeletonLoader />;

    if (!adminData) {
        return (
            <div className="flex flex-col items-center justify-center p-20 min-h-[400px] text-center">
                <User className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">No Admin Data Found</h3>
                <p className="text-sm text-gray-500 mt-1">We couldn't retrieve the details for this corporate admin.</p>
            </div>
        );
    }

    const isActive = adminData.is_active;
    const sub = adminData.active_suscription;

    return (
        <div className="bg-gray-50 font-sans max-h-[85vh] overflow-y-auto custom-scrollbar">
            <div className="max-w-[1400px] mx-auto p-4 sm:p-5 lg:p-6 space-y-6">

                {/* ── SECTION 1: Hero / Profile Card ── */}
                <div className="relative rounded-[24px] p-6 md:p-8 border border-gray-100 shadow-[0_4px_24px_rgba(15,23,42,0.05)] overflow-hidden bg-gradient-to-br from-white via-white to-indigo-50/40">
                    {/* decorative blobs */}
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-indigo-200/40 to-purple-200/30 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -left-12 w-56 h-56 bg-gradient-to-tr from-sky-100/50 to-transparent rounded-full blur-3xl pointer-events-none" />

                    <div className="relative flex flex-col md:flex-row gap-6 items-center md:items-start">
                        {/* Avatar */}
                        <div className="w-24 h-24 rounded-[20px] shadow-[0_8px_30px_rgba(79,70,229,0.18)] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                            <span className="font-black text-4xl text-white">
                                {adminData.first_name ? adminData.first_name.charAt(0).toUpperCase() : 'A'}
                            </span>
                        </div>

                        {/* Name + meta */}
                        <div className="flex-1 text-center md:text-left space-y-3 pt-1">
                            <div>
                                <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                                        {adminData.first_name} {adminData.last_name}
                                    </h1>
                                    <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                        {isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <p className="text-xs font-medium text-gray-500 mt-2 flex items-center justify-center md:justify-start gap-6 flex-wrap">
                                    <span className="flex items-center gap-1.5">
                                        <Mail size={14} className="text-indigo-400" /> {adminData.email || '-'}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Calendar size={14} className="text-purple-400" />
                                        Joined {adminData.created_at ? moment(adminData.created_at).format('MMM DD, YYYY') : '-'}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Edit button */}
                        <button 
                            onClick={() => {
                                showModal({
                                    title: 'Edit Corporate Admin',
                                    content: <CorporateAdminForm adminData={adminData} />,
                                    type: 'custom',
                                    size: 'xl',
                                });
                            }}
                            className="shrink-0 px-5 py-2.5 bg-gray-900 text-white text-xs font-bold rounded-[12px] hover:bg-indigo-600 transition-colors"
                        >
                            Edit Profile
                        </button>
                    </div>
                </div>

                {/* ── SECTION 2: Statistics Cards ── */}
                {adminData.counters && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {[
                            { icon: Key,      value: adminData.counters.no_of_licences  || 0, label: 'Total Licences',   from: 'from-blue-50',    to: 'to-indigo-50',   text: 'text-blue-600'    },
                            { icon: Award,    value: adminData.counters.license_used     || 0, label: 'Used Licences',    from: 'from-amber-50',   to: 'to-yellow-50',   text: 'text-amber-600'   },
                            { icon: Shield,   value: adminData.counters.remaning_licence || 0, label: 'Remaining',        from: 'from-emerald-50', to: 'to-teal-50',     text: 'text-emerald-600' },
                            { icon: Users,    value: adminData.counters.registered_users || 0, label: 'Registered Users', from: 'from-purple-50',  to: 'to-fuchsia-50',  text: 'text-purple-600'  },
                            { icon: BookOpen, value: adminData.counters.assigned_courses || 0, label: 'Assigned Courses', from: 'from-pink-50',    to: 'to-rose-50',     text: 'text-pink-600'    },
                        ].map((stat, i) => (
                            <div key={i} className={`${CARD} ${CARD_HOVER} p-4 group`}>
                                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.from} ${stat.to} flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                                    <stat.icon size={18} className={stat.text} />
                                </div>
                                <p className="text-xl font-black text-gray-900 mb-0.5 truncate">{stat.value}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── SECTION 3: Two-Column Layout ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left: Students */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className={`${CARD} p-6 md:p-8`}>
                            {/* Section header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
                                        <Users size={16} />
                                    </div>
                                    <h3 className="text-base font-bold text-gray-900">Connected Students</h3>
                                </div>
                                <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-md border border-indigo-100">
                                    {adminData.student_lists?.length || 0} Total
                                </span>
                            </div>

                            {adminData.student_lists && adminData.student_lists.length > 0 ? (
                                <div className="space-y-3">
                                    {adminData.student_lists.map((student: any, i: number) => (
                                        <div
                                            key={student.id}
                                            className="flex flex-col gap-3 p-4 rounded-[16px] bg-white border border-gray-100 shadow-[0_2px_10px_rgba(15,23,42,0.02)] hover:border-indigo-100 hover:shadow-[0_4px_12px_rgba(79,70,229,0.06)] transition-all group cursor-default"
                                        >
                                            <div className="flex items-center gap-4">
                                                {/* Index */}
                                                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xs font-black text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors shrink-0">
                                                    {String(i + 1).padStart(2, '0')}
                                                </div>
                                                {/* Name + email */}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                                                        {student.first_name} {student.last_name}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 mt-0.5 truncate">{student.email}</p>
                                                </div>
                                                {/* Progress + status */}
                                                <div className="hidden sm:flex items-center gap-4 shrink-0">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-28 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                                                                style={{ width: `${student.courses_progress || 0}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-black text-gray-700 w-8 text-right">
                                                            {student.courses_progress || 0}%
                                                        </span>
                                                    </div>
                                                    <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full ${student.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                        {student.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                    <button
                                                        onClick={() => {
                                                            showModal({
                                                                title: `${student.first_name} ${student.last_name} - Reports`,
                                                                content: (
                                                                    <TabsModal
                                                                        defaultActiveKey="video"
                                                                        tabs={[
                                                                            {
                                                                                key: 'video',
                                                                                label: 'Video Reports',
                                                                                icon: <PlayCircle size={15} />,
                                                                                component: <CorporateStudentVideoReport studentId={student.id} courses={student.courses || []} />
                                                                            },
                                                                            {
                                                                                key: 'notes',
                                                                                label: 'Notes',
                                                                                icon: <FileText size={15} />,
                                                                                component: <CorporateStudentNotes studentId={student.id} courses={student.courses || []} />
                                                                            },
                                                                            {
                                                                                key: 'quizzes',
                                                                                label: 'Attempted Quizzes',
                                                                                icon: <HelpCircle size={15} />,
                                                                                component: <CorporateStudentQuizReport studentId={student.id} courses={student.courses || []} />
                                                                            },
                                                                            {
                                                                                key: 'login-activity',
                                                                                label: 'Login Activity',
                                                                                icon: <Activity size={15} />,
                                                                                component: <CorporateStudentLoginActivityView studentId={student.id} />
                                                                            }
                                                                        ]}
                                                                    />
                                                                ),
                                                                type: 'custom',
                                                                size: 'xxl'
                                                            });
                                                        }}
                                                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors"
                                                        title="View Reports"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Course chips */}
                                            {student.courses && student.courses.length > 0 && (
                                                <div className="flex flex-wrap gap-2 pl-14">
                                                    {student.courses.map((course: any) => (
                                                        <span
                                                            key={course.id}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-[11px] font-semibold text-gray-600"
                                                        >
                                                            <BookOpen size={11} className="text-gray-400" />
                                                            {course.course_detail?.name || 'Unknown Course'}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50/50 rounded-[16px] border border-gray-100">
                                    <Users className="w-10 h-10 text-gray-300 mb-3" />
                                    <p className="text-sm font-bold text-gray-600">No Students Connected</p>
                                    <p className="text-xs text-gray-400 mt-1">This admin hasn't added any students yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Info sidebar */}
                    <div className="space-y-6">

                        {/* Admin Information */}
                        <div className={`${CARD} p-6`}>
                            <h3 className="text-sm font-bold text-gray-900 mb-5">Admin Information</h3>
                            <div className="flex flex-col">
                                {[
                                    { icon: Mail, label: 'Email Address', value: adminData.email || '-' },
                                    { icon: Phone, label: 'Phone Number', value: adminData.phone1 || <span className="text-gray-400 italic">Not provided</span> },
                                    { icon: Calendar, label: 'Joined On', value: adminData.created_at ? moment(adminData.created_at).format('MMM DD, YYYY') : '-' },
                                    { 
                                        icon: isActive ? CheckCircle2 : XCircle, 
                                        label: 'Account Status', 
                                        value: <span className={`inline-block px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                            {isActive ? 'Active' : 'Inactive'}
                                        </span> 
                                    }
                                ].map((item, i, arr) => (
                                    <div key={i} className={`flex items-start gap-3 py-3 ${i !== arr.length - 1 ? 'border-b border-gray-100' : ''} group/row`}>
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0 transition-all duration-300 group-hover/row:bg-indigo-50 group-hover/row:text-indigo-600 group-hover/row:-translate-y-0.5">
                                            <item.icon size={14} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                                            <div className="text-xs font-semibold text-gray-900 leading-relaxed break-words">{item.value}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Subscription */}
                        {sub && (
                            <div className={`${CARD} p-6`}>
                                <h3 className="text-sm font-bold text-gray-900 mb-5 flex items-center gap-2">
                                    <Activity size={16} className="text-indigo-500" /> Subscription
                                </h3>
                                <div className="flex flex-col">
                                    {[
                                        { icon: CreditCard, label: 'Plan Name', value: <span className="text-indigo-600">{sub.plan_info?.plan_name || '-'}</span> },
                                        { icon: Clock, label: 'Plan Type', value: getSubscriptionType(sub.subscription_type) },
                                        { 
                                            icon: Activity, 
                                            label: 'Status', 
                                            value: <span className={`inline-block px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full ${getStatusColor(sub.subscription_status)}`}>
                                                {getSubscriptionStatus(sub.subscription_status)}
                                            </span> 
                                        },
                                        { icon: Calendar, label: 'Start Date', value: sub.start_date ? moment(sub.start_date).format('MMM DD, YYYY') : '-' },
                                        { icon: Calendar, label: 'Next Due Date', value: <span className="text-indigo-600">{sub.next_due ? moment(sub.next_due).format('MMM DD, YYYY') : '-'}</span> }
                                    ].map((item, i, arr) => (
                                        <div key={i} className={`flex items-start gap-3 py-3 ${i !== arr.length - 1 ? 'border-b border-gray-100' : ''} group/row`}>
                                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0 transition-all duration-300 group-hover/row:bg-indigo-50 group-hover/row:text-indigo-600 group-hover/row:-translate-y-0.5">
                                                <item.icon size={14} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                                                <div className="text-xs font-semibold text-gray-900 leading-relaxed break-words">{item.value}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CorporateAdminView;