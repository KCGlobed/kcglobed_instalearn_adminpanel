import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import {
    ArrowLeft,
    BookOpen,
    Mail,
    Phone,
    User,
    Shield,
    Users,
    Key,
    Award,
    CreditCard,
    Calendar,
    MapPin,
    Check,
    XCircle,
    PlayCircle,
    FileText,
    HelpCircle,
    Bell,
    Eye,
    Heart,
    Search,
    Edit3,
    Activity
} from 'lucide-react';
import { fetchCorporateAdminDetailApi } from '../../services/apiServices';
import { useModal } from '../../context/ModalContext';
import CorporateAdminForm from '../../components/Forms/CorporateAdminForm';
import TabsModal from '../../components/Modal/TabsModal';
import CorporateStudentVideoReport from '../../components/View/CorporateStudentVideoReport';
import CorporateStudentNotes from '../../components/View/CorporateStudentNotes';
import CorporateStudentQuizReport from '../../components/View/CorporateStudentQuizReport';
import CorporateStudentReminder from '../../components/View/CorporateStudentReminder';
import CorporateStudentLoginActivityView from '../../components/View/CorporateStudentLoginActivityView';
import StudentWishlistView from '../../components/View/StudentWishlistView';

const CARD = 'bg-white rounded-2xl border border-gray-200 shadow-sm';

const SkeletonLoader = () => (
    <div className="max-w-[1400px] mx-auto p-4 sm:p-6 space-y-6 animate-pulse bg-[#F8FAFC] min-h-screen">
        <div className="h-5 w-36 bg-gray-200 rounded-md"></div>
        {/* Hero Card Skeleton */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 flex flex-col md:flex-row gap-5 items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-2xl shrink-0"></div>
            <div className="flex-1 space-y-2.5 text-center md:text-left">
                <div className="h-6 w-1/3 bg-gray-200 rounded-md"></div>
                <div className="h-3 w-1/4 bg-gray-200 rounded-md"></div>
                <div className="flex gap-2 justify-center md:justify-start">
                    <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
                    <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
                </div>
            </div>
            <div className="w-28 h-9 bg-gray-200 rounded-xl shrink-0"></div>
        </div>
        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 h-24"></div>
            ))}
        </div>
        {/* Two Column Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-gray-200 h-96"></div>
            <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-200 h-96"></div>
        </div>
    </div>
);

interface StudentCourse {
    id: number;
    course_detail?: {
        id: number;
        name: string;
        category?: { name: string };
    };
    name?: string;
    category?: { name: string };
    progress?: number;
}

interface StudentItem {
    id: number;
    first_name?: string;
    last_name?: string;
    email?: string;
    image?: string;
    Image?: string;
    profile_image?: string;
    avatar?: string;
    photo?: string;
    is_active?: boolean;
    courses_progress?: number;
    courses?: StudentCourse[];
    user_detail?: {
        image?: string;
        Image?: string;
        profile_image?: string;
    };
    user?: {
        image?: string;
        profile_image?: string;
    };
}

interface CorporateSubscription {
    id?: number;
    amount?: number;
    total_amount?: number;
    start_date?: string;
    end_date?: string;
    next_due?: string;
    subscription_type?: number | string;
    subscription_status?: number;
    no_of_licence?: number;
    plan_info?: {
        id?: number;
        plan_name?: string;
    };
}

interface CorporateCounters {
    no_of_licences?: number;
    license_used?: number;
    remaning_licence?: number;
    registered_users?: number;
    assigned_courses?: number;
}

interface CorporateAdminDetail {
    id: number;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    phone1?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    image?: string;
    Image?: string;
    profile_image?: string;
    avatar?: string;
    photo?: string;
    profile_pic?: string;
    is_active?: boolean;
    created_at?: string;
    counters?: CorporateCounters;
    active_suscription?: CorporateSubscription;
    student_lists?: StudentItem[];
    user_detail?: {
        image?: string;
    };
    user?: {
        image?: string;
    };
}

const getSubscriptionType = (type: unknown) => {
    const types: Record<string, string> = { '1': 'Monthly', '2': 'Half Yearly', '3': 'Yearly' };
    return types[String(type)] || 'Monthly';
};

const getSubscriptionStatus = (status: unknown) => {
    const statuses: Record<string, string> = {
        '1': 'Initiate', '2': 'Active', '3': 'Expired', '4': 'Paused', '5': 'Cancelled',
    };
    return statuses[String(status)] || 'Active';
};

const getStatusColor = (status?: number) => {
    if (!status) return 'bg-gray-50 text-gray-700 border-gray-200';
    const colors: Record<number, string> = {
        1: 'bg-blue-50 text-blue-700 border-blue-200',
        2: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        3: 'bg-red-50 text-red-700 border-red-200',
        4: 'bg-amber-50 text-amber-700 border-amber-200',
        5: 'bg-gray-50 text-gray-700 border-gray-200',
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
};

const StudentAvatar: React.FC<{ student: StudentItem }> = ({ student }) => {
    const [imgError, setImgError] = useState(false);

    const studentImage =
        student.image ||
        student.Image ||
        student.profile_image ||
        student.avatar ||
        student.photo ||
        student.user_detail?.image ||
        student.user_detail?.Image ||
        student.user_detail?.profile_image ||
        student.user?.image ||
        student.user?.profile_image;

    const studentInitials =
        `${student.first_name?.charAt(0) || ''}${student.last_name?.charAt(0) || ''}`.toUpperCase() ||
        (student.first_name ? student.first_name.charAt(0).toUpperCase() : 'S');

    const isValidImg = Boolean(
        studentImage &&
        typeof studentImage === 'string' &&
        studentImage.trim() !== '' &&
        studentImage !== 'null' &&
        studentImage !== 'undefined'
    );

    return (
        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-sm">
            {isValidImg && !imgError ? (
                <img
                    src={studentImage}
                    alt={`${student.first_name || 'Student'} ${student.last_name || ''}`}
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                    referrerPolicy="no-referrer"
                />
            ) : (
                <span>{studentInitials}</span>
            )}
        </div>
    );
};

const CorporateAdminProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [adminData, setAdminData] = useState<CorporateAdminDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [imgError, setImgError] = useState(false);
    const [activeTab, setActiveTab] = useState<'students' | 'subscription'>('students');
    const [searchTerm, setSearchTerm] = useState('');
    const { showModal } = useModal();

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetchCorporateAdminDetailApi(Number(id));
            const data = response?.data?.data || response?.data || response;
            if (data) {
                setAdminData(data as CorporateAdminDetail);
                setImgError(false);
            }
        } catch (error) {
            console.error('Failed to load corporate admin details', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id, loadData]);

    const handleViewReports = (student: StudentItem) => {
        showModal({
            title: `Reports: ${student.first_name || ''} ${student.last_name || ''}`,
            size: 'xxl',
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
                            key: 'reminders',
                            label: 'Reminders',
                            icon: <Bell size={15} />,
                            component: <CorporateStudentReminder studentId={student.id} courses={student.courses || []} />
                        },
                        {
                            key: 'login-activity',
                            label: 'Login Activity',
                            icon: <Activity size={15} />,
                            component: <CorporateStudentLoginActivityView studentId={student.id} />
                        },
                        {
                            key: 'wishlist',
                            label: 'Wishlist',
                            icon: <Heart size={15} />,
                            component: <StudentWishlistView studentId={student.id} />
                        }
                    ]}
                />
            )
        });
    };

    if (loading) return <SkeletonLoader />;

    if (!adminData) {
        return (
            <div className="flex flex-col items-center justify-center p-20 min-h-[400px] text-center bg-[#F8FAFC]">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                    <User size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">No Admin Data Found</h3>
                <p className="text-xs text-gray-500 mt-1 mb-6">We couldn't retrieve the details for this corporate admin.</p>
                <button
                    onClick={() => navigate('/dashboard/corporate-admin')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4318FF] text-white text-xs font-bold shadow-sm cursor-pointer"
                >
                    <ArrowLeft size={14} /> Back to Corporate Admins
                </button>
            </div>
        );
    }

    const isActive = adminData.is_active !== false;
    const sub = adminData.active_suscription;
    const adminImage =
        adminData.image ||
        adminData.Image ||
        adminData.profile_image ||
        adminData.avatar ||
        adminData.photo ||
        adminData.profile_pic ||
        adminData.user_detail?.image ||
        adminData.user?.image;

    const adminInitials =
        `${adminData.first_name?.charAt(0) || ''}${adminData.last_name?.charAt(0) || ''}`.toUpperCase() ||
        (adminData.first_name ? adminData.first_name.charAt(0).toUpperCase() : 'A');

    const locationText = [adminData.city, adminData.state, adminData.country].filter(Boolean).join(', ');

    // Filter connected students by search
    const filteredStudents = (adminData.student_lists || []).filter((s: StudentItem) => {
        const query = searchTerm.toLowerCase();
        const fullName = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase();
        const email = (s.email || '').toLowerCase();
        return fullName.includes(query) || email.includes(query);
    });

    return (
        <div className="bg-[#F8FAFC] min-h-screen pb-12 font-sans text-slate-800">
            <div className="max-w-[1400px] mx-auto p-4 sm:p-6 space-y-6">

                {/* Back to Corporate Admins Navigation */}
                <button
                    onClick={() => navigate('/dashboard/corporate-admin')}
                    className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors group cursor-pointer"
                >
                    <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
                    <span>Back to Corporate Admins</span>
                </button>

                {/* Corporate Admin Hero Header Card */}
                <div className={`${CARD} p-6 sm:p-7`}>
                    <div className="flex flex-col md:flex-row gap-5 items-center md:items-center">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center font-bold text-xl sm:text-2xl shadow-sm bg-indigo-50 text-indigo-600 border border-indigo-100 overflow-hidden shrink-0">
                                {adminImage && !imgError ? (
                                    <img
                                        src={adminImage}
                                        alt={`${adminData.first_name || 'Admin'}`}
                                        className="w-full h-full object-cover"
                                        onError={() => setImgError(true)}
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    <span className="font-black text-xl sm:text-2xl text-indigo-600 uppercase">
                                        {adminInitials}
                                    </span>
                                )}
                            </div>
                            <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        </div>

                        {/* Middle Details */}
                        <div className="flex-1 text-center md:text-left space-y-2">
                            <div>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                                        {adminData.first_name} {adminData.last_name}
                                    </h1>
                                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                                        Corporate Partner
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500 font-medium mt-1.5 flex items-center justify-center md:justify-start gap-4 flex-wrap">
                                    {adminData.email && (
                                        <span className="flex items-center gap-1.5">
                                            <Mail size={13} className="text-gray-400" />
                                            {adminData.email}
                                        </span>
                                    )}
                                    {(adminData.phone || adminData.phone1) && (
                                        <span className="flex items-center gap-1.5">
                                            <Phone size={13} className="text-gray-400" />
                                            {adminData.phone || adminData.phone1}
                                        </span>
                                    )}
                                    {locationText && (
                                        <span className="flex items-center gap-1.5">
                                            <MapPin size={13} className="text-gray-400" />
                                            {locationText}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Badge row */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-0.5">
                                <span className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-3 py-0.5 rounded-full">
                                    # ID {adminData.id}
                                </span>
                                {isActive ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-full">
                                        <Check size={12} className="stroke-[2.5]" /> Active
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-0.5 rounded-full">
                                        <XCircle size={12} /> Inactive
                                    </span>
                                )}
                                {adminData.created_at && (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 px-3 py-0.5 rounded-full">
                                        <Calendar size={12} className="text-gray-400" />
                                        Joined {moment(adminData.created_at).format('MMM DD, YYYY')}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2.5 shrink-0 pt-2 md:pt-0">
                            <button
                                onClick={() => {
                                    showModal({
                                        title: 'Edit Corporate Admin',
                                        content: <CorporateAdminForm adminData={adminData} onSuccess={() => loadData()} />,
                                        type: 'custom',
                                        size: 'xl',
                                    });
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#4318FF] hover:bg-[#3713d3] text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-200 cursor-pointer shrink-0"
                            >
                                <Edit3 size={14} /> Edit Profile
                            </button>
                        </div>
                    </div>
                </div>

                {/* 4 KPI Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Total Licences */}
                    <div className={`${CARD} p-5`}>
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center mb-3">
                            <Key size={16} />
                        </div>
                        <p className="text-2xl font-black text-gray-900 leading-none">{adminData.counters?.no_of_licences || sub?.no_of_licence || 0}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-2">Total Licences</p>
                    </div>

                    {/* Card 2: Used Licences */}
                    <div className={`${CARD} p-5`}>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center mb-3">
                            <Award size={16} />
                        </div>
                        <p className="text-2xl font-black text-gray-900 leading-none">
                            {adminData.counters?.license_used || 0}
                            <span className="text-xs font-semibold text-gray-400"> / {adminData.counters?.no_of_licences || sub?.no_of_licence || 0}</span>
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-2">Used Licences</p>
                    </div>

                    {/* Card 3: Remaining Licences */}
                    <div className={`${CARD} p-5`}>
                        <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center mb-3">
                            <Shield size={16} />
                        </div>
                        <p className="text-2xl font-black text-gray-900 leading-none">{adminData.counters?.remaning_licence ?? 0}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-2">Remaining Seats</p>
                    </div>

                    {/* Card 4: Registered Students */}
                    <div className={`${CARD} p-5`}>
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center mb-3">
                            <Users size={16} />
                        </div>
                        <p className="text-2xl font-black text-gray-900 leading-none">{adminData.counters?.registered_users ?? (adminData.student_lists?.length || 0)}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-2">Registered Students</p>
                    </div>
                </div>

                {/* 2-Column Section: Admin Details on Left & Tabbed Content on Right */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Left Column (4 cols) */}
                    <div className="lg:col-span-4 xl:col-span-4 space-y-6">
                        {/* Admin Information Card */}
                        <div className={`${CARD} p-5 sm:p-6`}>
                            <div className="flex items-center gap-2 mb-5">
                                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                    <User size={15} />
                                </div>
                                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Admin Details</h2>
                            </div>

                            <div className="space-y-4 text-xs">
                                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                    <span className="text-gray-500 font-medium">Full Name</span>
                                    <span className="font-bold text-gray-900 text-right">{adminData.first_name} {adminData.last_name}</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                    <span className="text-gray-500 font-medium">Email Address</span>
                                    <span className="font-semibold text-indigo-600 text-right truncate max-w-[180px]">{adminData.email || '-'}</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                    <span className="text-gray-500 font-medium">Phone Number</span>
                                    <span className="font-semibold text-gray-800">{adminData.phone || adminData.phone1 || '-'}</span>
                                </div>
                                {adminData.address && (
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                        <span className="text-gray-500 font-medium">Address</span>
                                        <span className="font-semibold text-gray-800 text-right truncate max-w-[180px]">{adminData.address}</span>
                                    </div>
                                )}
                                {adminData.city && (
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                        <span className="text-gray-500 font-medium">City / State</span>
                                        <span className="font-semibold text-gray-800">{[adminData.city, adminData.state].filter(Boolean).join(', ') || '-'}</span>
                                    </div>
                                )}
                                {adminData.country && (
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                        <span className="text-gray-500 font-medium">Country</span>
                                        <span className="font-semibold text-gray-800">{adminData.country}</span>
                                    </div>
                                )}
                                {adminData.pincode && (
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                        <span className="text-gray-500 font-medium">Postal Code</span>
                                        <span className="font-semibold text-gray-800">{adminData.pincode}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                    <span className="text-gray-500 font-medium">Date Joined</span>
                                    <span className="font-semibold text-gray-800">
                                        {adminData.created_at ? moment(adminData.created_at).format('MMM DD, YYYY') : '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 font-medium">Account Status</span>
                                    <span className={`font-semibold px-2.5 py-0.5 rounded-full border ${isActive ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-red-700 bg-red-50 border-red-200'}`}>
                                        {isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Active Subscription Summary Card */}
                        {sub && (
                            <div className={`${CARD} p-5 sm:p-6`}>
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                            <Shield size={15} />
                                        </div>
                                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Subscription Info</h2>
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${getStatusColor(sub.subscription_status)}`}>
                                        {getSubscriptionStatus(sub.subscription_status)}
                                    </span>
                                </div>

                                <div className="space-y-3.5 text-xs">
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                        <span className="text-gray-500 font-medium">Plan</span>
                                        <span className="font-bold text-indigo-600">{sub.plan_info?.plan_name || 'Standard Plan'}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                        <span className="text-gray-500 font-medium">Total Licences</span>
                                        <span className="font-bold text-gray-900">{adminData.counters?.no_of_licences || sub.no_of_licence || 0} seats</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                        <span className="text-gray-500 font-medium">Billing Period</span>
                                        <span className="font-semibold text-gray-700">{getSubscriptionType(sub.subscription_type)}</span>
                                    </div>
                                    {(sub.total_amount || sub.amount) && (
                                        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                            <span className="text-gray-500 font-medium">Amount</span>
                                            <span className="font-bold text-emerald-600">${sub.total_amount || sub.amount}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                        <span className="text-gray-500 font-medium">Start Date</span>
                                        <span className="font-semibold text-gray-700">
                                            {sub.start_date ? moment(sub.start_date).format('MMM DD, YYYY') : '-'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">Next Due Date</span>
                                        <span className="font-semibold text-indigo-600">
                                            {sub.next_due ? moment(sub.next_due).format('MMM DD, YYYY') : (sub.end_date ? moment(sub.end_date).format('MMM DD, YYYY') : '-')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Tabbed Sections (8 cols) */}
                    <div className="lg:col-span-8 xl:col-span-8">
                        <div className={`${CARD} flex flex-col h-full overflow-hidden`}>
                            {/* Navigation Tabs Header */}
                            <div className="flex items-center gap-6 border-b border-gray-200 px-6 pt-4 bg-white shrink-0 overflow-x-auto no-scrollbar">
                                <button
                                    onClick={() => setActiveTab('students')}
                                    className={`flex items-center gap-2 pb-3.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${activeTab === 'students'
                                        ? 'border-[#4318FF] text-[#4318FF]'
                                        : 'border-transparent text-gray-500 hover:text-gray-800'
                                        }`}
                                >
                                    <Users size={15} />
                                    <span>Connected Students</span>
                                    {adminData.student_lists && adminData.student_lists.length > 0 && (
                                        <span className="text-[10px] font-semibold bg-indigo-50 text-[#4318FF] border border-indigo-200 px-1.5 py-0.5 rounded-full">
                                            {adminData.student_lists.length}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('subscription')}
                                    className={`flex items-center gap-2 pb-3.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${activeTab === 'subscription'
                                        ? 'border-[#4318FF] text-[#4318FF]'
                                        : 'border-transparent text-gray-500 hover:text-gray-800'
                                        }`}
                                >
                                    <CreditCard size={15} />
                                    <span>Subscription Details</span>
                                </button>
                            </div>

                            {/* Tab Content Container */}
                            <div className="p-6 flex-1 bg-white">
                                {/* Tab 1: Connected Students */}
                                {activeTab === 'students' && (
                                    <div className="space-y-4">
                                        {/* Sub-header with Search */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Student Roster</h3>
                                                <p className="text-xs text-gray-400 mt-0.5">Track learning progress, course enrollments, and reports</p>
                                            </div>
                                            <div className="relative w-full sm:w-64">
                                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    placeholder="Search student by name/email..."
                                                    className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#4318FF] transition-colors"
                                                />
                                            </div>
                                        </div>

                                        {filteredStudents.length > 0 ? (
                                            <div className="space-y-3">
                                                {filteredStudents.map((student: StudentItem, i: number) => (
                                                    <div
                                                        key={student.id}
                                                        className="p-4 rounded-xl border border-gray-200 hover:border-[#4318FF] transition-all bg-white hover:bg-indigo-50/10 flex flex-col gap-3 group"
                                                    >
                                                        <div className="flex items-center gap-3.5">
                                                            {/* Index */}
                                                            <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-[11px] font-bold text-gray-500 shrink-0">
                                                                {String(i + 1).padStart(2, '0')}
                                                            </div>
                                                            {/* Avatar */}
                                                            <StudentAvatar student={student} />
                                                            {/* Name + email */}
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate group-hover:text-[#4318FF] transition-colors">
                                                                    {student.first_name} {student.last_name}
                                                                </h4>
                                                                <p className="text-xs text-gray-400 truncate mt-0.5">{student.email}</p>
                                                            </div>
                                                            {/* Progress bar */}
                                                            <div className="hidden sm:flex items-center gap-3 shrink-0">
                                                                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-[#4318FF] rounded-full transition-all duration-500"
                                                                        style={{ width: `${student.courses_progress || 0}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-xs font-bold text-gray-700 w-8 text-right">
                                                                    {student.courses_progress || 0}%
                                                                </span>
                                                            </div>
                                                            {/* Status */}
                                                            <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full shrink-0 ${student.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                                                                {student.is_active ? 'Active' : 'Inactive'}
                                                            </span>
                                                            {/* View Reports Button */}
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleViewReports(student); }}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-[#4318FF] rounded-lg text-xs font-bold transition-colors shrink-0 cursor-pointer"
                                                            >
                                                                <Eye size={13} /> View Reports
                                                            </button>
                                                        </div>

                                                        {/* Assigned courses pills */}
                                                        {student.courses && student.courses.length > 0 && (
                                                            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 pl-0 sm:pl-[50px]">
                                                                {student.courses.map((course: StudentCourse) => (
                                                                    <span
                                                                        key={course.id}
                                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[11px] font-medium text-gray-600"
                                                                    >
                                                                        <BookOpen size={11} className="text-indigo-500" />
                                                                        {course.course_detail?.name || course.name || 'Assigned Course'}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50/50 rounded-xl border border-gray-100">
                                                <Users size={32} className="text-gray-300 mb-2" />
                                                <p className="text-xs font-bold text-gray-700">No students found</p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {searchTerm ? 'No student matches your search.' : 'This corporate admin has not added any students yet.'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Tab 2: Subscription Details */}
                                {activeTab === 'subscription' && (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Subscription Agreement</h3>
                                                <p className="text-xs text-gray-400 mt-0.5">Complete contract details and license limits</p>
                                            </div>
                                            {sub && (
                                                <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${getStatusColor(sub.subscription_status)}`}>
                                                    {getSubscriptionStatus(sub.subscription_status)}
                                                </span>
                                            )}
                                        </div>

                                        {sub ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 space-y-1">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Plan Name</p>
                                                    <p className="text-sm font-bold text-indigo-600">{sub.plan_info?.plan_name || 'Standard Plan'}</p>
                                                </div>
                                                <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 space-y-1">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Licences</p>
                                                    <p className="text-sm font-bold text-gray-900">{adminData.counters?.no_of_licences || sub.no_of_licence || 0} Seats</p>
                                                </div>
                                                <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 space-y-1">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Used Licences</p>
                                                    <p className="text-sm font-bold text-amber-600">{adminData.counters?.license_used || 0} Seats</p>
                                                </div>
                                                <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 space-y-1">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Remaining Licences</p>
                                                    <p className="text-sm font-bold text-emerald-600">{adminData.counters?.remaning_licence || 0} Seats</p>
                                                </div>
                                                <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 space-y-1">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Billing Frequency</p>
                                                    <p className="text-sm font-bold text-gray-900">{getSubscriptionType(sub.subscription_type)}</p>
                                                </div>
                                                <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 space-y-1">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Activation Date</p>
                                                    <p className="text-sm font-semibold text-gray-800">{sub.start_date ? moment(sub.start_date).format('MMM DD, YYYY') : '-'}</p>
                                                </div>
                                                <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 space-y-1">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Next Due Date</p>
                                                    <p className="text-sm font-semibold text-gray-800">
                                                        {sub.next_due ? moment(sub.next_due).format('MMM DD, YYYY') : (sub.end_date ? moment(sub.end_date).format('MMM DD, YYYY') : '-')}
                                                    </p>
                                                </div>
                                                {(sub.total_amount || sub.amount) && (
                                                    <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 space-y-1">
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Amount</p>
                                                        <p className="text-sm font-bold text-emerald-600">${sub.total_amount || sub.amount}</p>
                                                    </div>
                                                )}
                                                <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 space-y-1">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</p>
                                                    <p className="text-sm font-bold text-emerald-600">{getSubscriptionStatus(sub.subscription_status)}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50/50 rounded-xl border border-gray-100">
                                                <CreditCard size={32} className="text-gray-300 mb-2" />
                                                <p className="text-xs font-bold text-gray-700">No Active Subscription Found</p>
                                                <p className="text-xs text-gray-400 mt-0.5">This corporate admin has no currently linked subscription agreement.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CorporateAdminProfile;
