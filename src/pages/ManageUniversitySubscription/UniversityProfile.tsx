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
    CreditCard,
    Clock,
    Building2,
    GraduationCap,
    MapPin,
    Check,
    XCircle,
    DollarSign,
    UploadCloud,
    UserPlus,
    PlayCircle,
    FileText,
    CheckCircle,
    Bell,
    LogIn,
    Heart,
    Eye,
    Search
} from 'lucide-react';
import { viewUniversityApi } from '../../services/apiServices';
import TabsModal from '../../components/Modal/TabsModal';
import UniversityStudentVideoReport from '../../components/View/UniversityStudentVideoReport';
import UniversityStudentNotes from '../../components/View/UniversityStudentNotes';
import UniversityStudentQuizReport from '../../components/View/UniversityStudentQuizReport';
import UniversityStudentReminder from '../../components/View/UniversityStudentReminder';
import UniversityStudentLoginActivityView from '../../components/View/UniversityStudentLoginActivityView';
import ImportUniversityStudents from '../../components/Forms/ImportUniversityStudents';
import AddUniversityStudent from '../../components/Forms/AddUniversityStudent';
import { useModal } from '../../context/ModalContext';
import StudentWishlistView from '../../components/View/StudentWishlistView';

const CARD = 'bg-white rounded-2xl border border-gray-200 shadow-sm';

const SkeletonLoader = () => (
    <div className="max-w-[1400px] mx-auto p-4 sm:p-6 space-y-6 animate-pulse bg-[#F8FAFC] min-h-screen">
        <div className="h-5 w-28 bg-gray-200 rounded-md"></div>
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
        </div>
        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
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
    is_active?: boolean;
    courses_progress?: number;
    courses?: StudentCourse[];
}

interface SubscriptionItem {
    id?: number;
    amount?: number;
    no_of_licence?: number;
    subscription_status?: number;
    subscription_type?: number | string;
    start_date?: string;
    end_date?: string;
    plan_info?: {
        plan_name?: string;
    };
}

interface UniversityData {
    id: number;
    first_name?: string;
    last_name?: string;
    institution_name?: string;
    institution_type?: string;
    job_role?: string;
    department?: string;
    country?: string;
    work_email?: string;
    phone_number?: string;
    status?: boolean | number;
    approved_status?: number;
    created_at?: string;
    active_subscription?: SubscriptionItem[];
    student_lists?: StudentItem[];
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

    const studentImage = student.image || student.Image || student.profile_image || student.avatar;
    const studentInitials =
        `${student.first_name?.charAt(0) || ''}${student.last_name?.charAt(0) || ''}`.toUpperCase() ||
        (student.first_name ? student.first_name.charAt(0).toUpperCase() : 'S');

    const isValidImg = Boolean(
        studentImage &&
        typeof studentImage === 'string' &&
        studentImage.trim() !== '' &&
        studentImage !== 'null'
    );

    return (
        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-sm">
            {isValidImg && !imgError ? (
                <img
                    src={studentImage}
                    alt={`${student.first_name || 'Student'}`}
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

const UniversityProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<UniversityData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'students' | 'courses' | 'subscription'>('students');
    const [searchTerm, setSearchTerm] = useState('');
    const { showModal, hideModal } = useModal();

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
                            component: <UniversityStudentVideoReport studentId={student.id} courses={student.courses || []} />
                        },
                        {
                            key: 'notes',
                            label: 'Notes',
                            icon: <FileText size={15} />,
                            component: <UniversityStudentNotes studentId={student.id} courses={student.courses || []} />
                        },
                        {
                            key: 'quiz',
                            label: 'Attempted Quizzes',
                            icon: <CheckCircle size={15} />,
                            component: <UniversityStudentQuizReport studentId={student.id} courses={student.courses || []} />
                        },
                        {
                            key: 'reminders',
                            label: 'Reminders',
                            icon: <Bell size={15} />,
                            component: <UniversityStudentReminder studentId={student.id} courses={student.courses || []} />
                        },
                        {
                            key: 'login-activity',
                            label: 'Login Activity',
                            icon: <LogIn size={15} />,
                            component: <UniversityStudentLoginActivityView studentId={student.id} />
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

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await viewUniversityApi(Number(id));
            const universityData = response?.data?.data || response?.data || response;
            if (universityData) {
                setData(universityData as UniversityData);
            }
        } catch (error) {
            console.error('Failed to load university details', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id, loadData]);

    if (loading) return <SkeletonLoader />;

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center p-20 min-h-[400px] text-center bg-[#F8FAFC]">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                    <User size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">No University Data Found</h3>
                <p className="text-xs text-gray-500 mt-1 mb-6">We couldn't retrieve the details for this university request.</p>
                <button
                    onClick={() => navigate('/dashboard/university-request')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4318FF] text-white text-xs font-bold shadow-sm cursor-pointer"
                >
                    <ArrowLeft size={14} /> Back to University Requests
                </button>
            </div>
        );
    }

    const isActive = data.status !== false && data.status !== 0;
    const sub = data.active_subscription && data.active_subscription.length > 0 ? data.active_subscription[0] : null;
    const initials = `${data.first_name?.charAt(0) || ''}${data.last_name?.charAt(0) || ''}`.toUpperCase() || 'U';

    const getApprovalStatusBadge = (status?: number) => {
        switch (status) {
            case 1:
                return (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-0.5 rounded-full">
                        <Clock size={12} /> Pending Approval
                    </span>
                );
            case 2:
                return (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-full">
                        <Check size={12} className="stroke-[2.5]" /> Approved
                    </span>
                );
            case 3:
                return (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-3 py-0.5 rounded-full">
                        <XCircle size={12} /> Rejected
                    </span>
                );
            default:
                return null;
        }
    };

    // Filter connected students by search
    const filteredStudents = (data.student_lists || []).filter((s: StudentItem) => {
        const query = searchTerm.toLowerCase();
        const fullName = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase();
        const email = (s.email || '').toLowerCase();
        return fullName.includes(query) || email.includes(query);
    });

    // Unique courses across connected students
    const uniqueCoursesMap = new Map<number, { course: StudentCourse; studentCount: number }>();
    (data.student_lists || []).forEach((student: StudentItem) => {
        (student.courses || []).forEach((c: StudentCourse) => {
            const courseId = c.course_detail?.id || c.id;
            if (courseId) {
                if (uniqueCoursesMap.has(courseId)) {
                    uniqueCoursesMap.get(courseId)!.studentCount += 1;
                } else {
                    uniqueCoursesMap.set(courseId, { course: c.course_detail || c, studentCount: 1 });
                }
            }
        });
    });
    const uniqueCourses = Array.from(uniqueCoursesMap.values());

    return (
        <div className="bg-[#F8FAFC] min-h-screen pb-12 font-sans text-slate-800">
            <div className="max-w-[1400px] mx-auto p-4 sm:p-6 space-y-6">

                {/* Back to University Requests Navigation */}
                <button
                    onClick={() => navigate('/dashboard/university-request')}
                    className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors group cursor-pointer"
                >
                    <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
                    <span>Back to University Requests</span>
                </button>

                {/* University Hero Header Card */}
                <div className={`${CARD} p-6 sm:p-7`}>
                    <div className="flex flex-col md:flex-row gap-5 items-center md:items-center">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center font-bold text-xl sm:text-2xl shadow-sm bg-indigo-50 text-indigo-600 border border-indigo-100 overflow-hidden shrink-0">
                                <span className="font-black text-xl sm:text-2xl text-indigo-600 uppercase">
                                    {initials}
                                </span>
                            </div>
                            <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        </div>

                        {/* Middle Details */}
                        <div className="flex-1 text-center md:text-left space-y-2">
                            <div>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                                        {data.first_name} {data.last_name}
                                    </h1>
                                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                                        {data.institution_name}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500 font-medium mt-1.5 flex items-center justify-center md:justify-start gap-4 flex-wrap">
                                    {data.work_email && (
                                        <span className="flex items-center gap-1.5">
                                            <Mail size={13} className="text-gray-400" />
                                            {data.work_email}
                                        </span>
                                    )}
                                    {data.phone_number && (
                                        <span className="flex items-center gap-1.5">
                                            <Phone size={13} className="text-gray-400" />
                                            {data.phone_number}
                                        </span>
                                    )}
                                    {data.country && (
                                        <span className="flex items-center gap-1.5">
                                            <MapPin size={13} className="text-gray-400" />
                                            {data.country}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Badge row */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-0.5">
                                <span className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-3 py-0.5 rounded-full">
                                    # ID {data.id}
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
                                {getApprovalStatusBadge(data.approved_status)}
                                {data.institution_type && (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 px-2.5 py-0.5 rounded-full">
                                        <GraduationCap size={12} className="text-gray-400" />
                                        {data.institution_type}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2.5 shrink-0 pt-2 md:pt-0">
                            <button
                                onClick={() => showModal({
                                    title: "Add New Student",
                                    content: <AddUniversityStudent universityId={Number(id)} onSuccess={() => loadData()} />,
                                    type: 'custom',
                                    size: 'xxl'
                                })}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#4318FF] hover:bg-[#3713d3] text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-200 cursor-pointer"
                            >
                                <UserPlus size={14} /> Add Student
                            </button>
                            <button
                                onClick={() => showModal({
                                    content: <ImportUniversityStudents
                                        universityId={Number(id)}
                                        onSuccess={() => loadData()}
                                        onClose={() => hideModal()}
                                    />
                                })}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:border-indigo-200 hover:text-indigo-600 text-gray-700 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                            >
                                <UploadCloud size={14} /> Import
                            </button>
                        </div>
                    </div>
                </div>

                {/* 5 KPI Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {/* Card 1: Connected Students */}
                    <div className={`${CARD} p-5`}>
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center mb-3">
                            <Users size={16} />
                        </div>
                        <p className="text-2xl font-black text-gray-900 leading-none">{data.student_lists?.length || 0}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-2">Connected Students</p>
                    </div>

                    {/* Card 2: Licenses */}
                    <div className={`${CARD} p-5`}>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center mb-3">
                            <Shield size={16} />
                        </div>
                        <p className="text-2xl font-black text-gray-900 leading-none">
                            {data.student_lists?.length || 0} <span className="text-xs font-semibold text-gray-400">/ {sub?.no_of_licence || 0}</span>
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-2">Licenses Used</p>
                    </div>

                    {/* Card 3: Subscription Plan */}
                    <div className={`${CARD} p-5`}>
                        <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center mb-3">
                            <CreditCard size={16} />
                        </div>
                        <p className="text-xl font-black text-gray-900 leading-none truncate">{sub?.plan_info?.plan_name || 'Standard'}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-2">Active Plan</p>
                    </div>

                    {/* Card 4: Plan Amount */}
                    <div className={`${CARD} p-5`}>
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center mb-3">
                            <DollarSign size={16} />
                        </div>
                        <p className="text-2xl font-black text-gray-900 leading-none">${sub?.amount || 0}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-2">Plan Price</p>
                    </div>

                    {/* Card 5: Billing Cycle */}
                    <div className={`${CARD} p-5`}>
                        <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center mb-3">
                            <Clock size={16} />
                        </div>
                        <p className="text-xl font-black text-gray-900 leading-none truncate">{getSubscriptionType(sub?.subscription_type)}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-2">Billing Cycle</p>
                    </div>
                </div>

                {/* 2-Column Section: Institution Details on Left & Tabbed Content on Right */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Left Column (4 cols) */}
                    <div className="lg:col-span-4 xl:col-span-4 space-y-6">
                        {/* Institution Information Card */}
                        <div className={`${CARD} p-5 sm:p-6`}>
                            <div className="flex items-center gap-2 mb-5">
                                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                    <Building2 size={15} />
                                </div>
                                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Institution Details</h2>
                            </div>

                            <div className="space-y-4 text-xs">
                                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                    <span className="text-gray-500 font-medium">Institution Name</span>
                                    <span className="font-bold text-gray-900 text-right">{data.institution_name || '-'}</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                    <span className="text-gray-500 font-medium">Institution Type</span>
                                    <span className="font-semibold text-gray-800">{data.institution_type || '-'}</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                    <span className="text-gray-500 font-medium">Job Role</span>
                                    <span className="font-semibold text-gray-800">{data.job_role || '-'}</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                    <span className="text-gray-500 font-medium">Department</span>
                                    <span className="font-semibold text-gray-800">{data.department || '-'}</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                    <span className="text-gray-500 font-medium">Country</span>
                                    <span className="font-semibold text-gray-800">{data.country || '-'}</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                    <span className="text-gray-500 font-medium">Work Email</span>
                                    <span className="font-semibold text-indigo-600 text-right truncate max-w-[180px]">{data.work_email || '-'}</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                    <span className="text-gray-500 font-medium">Phone Number</span>
                                    <span className="font-semibold text-gray-800">{data.phone_number || '-'}</span>
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
                                        <span className="font-bold text-indigo-600">{sub.plan_info?.plan_name || 'Standard'}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                        <span className="text-gray-500 font-medium">Total Licenses</span>
                                        <span className="font-bold text-gray-900">{sub.no_of_licence || 0} seats</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                        <span className="text-gray-500 font-medium">Amount Paid</span>
                                        <span className="font-bold text-emerald-600">${sub.amount || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                        <span className="text-gray-500 font-medium">Billing Period</span>
                                        <span className="font-semibold text-gray-700">{getSubscriptionType(sub.subscription_type)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">Validity</span>
                                        <span className="font-semibold text-gray-700 text-right">
                                            {sub.start_date ? moment(sub.start_date).format('MMM DD, YYYY') : '-'}
                                            {' to '}
                                            {sub.end_date ? moment(sub.end_date).format('MMM DD, YYYY') : '-'}
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
                                    {data.student_lists && data.student_lists.length > 0 && (
                                        <span className="text-[10px] font-semibold bg-indigo-50 text-[#4318FF] border border-indigo-200 px-1.5 py-0.5 rounded-full">
                                            {data.student_lists.length}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('courses')}
                                    className={`flex items-center gap-2 pb-3.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${activeTab === 'courses'
                                        ? 'border-[#4318FF] text-[#4318FF]'
                                        : 'border-transparent text-gray-500 hover:text-gray-800'
                                        }`}
                                >
                                    <BookOpen size={15} />
                                    <span>Assigned Courses</span>
                                    {uniqueCourses.length > 0 && (
                                        <span className="text-[10px] font-semibold bg-rose-50 text-rose-600 border border-rose-200 px-1.5 py-0.5 rounded-full">
                                            {uniqueCourses.length}
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
                                                    {searchTerm ? 'No student matches your search.' : 'This university has not added any students yet.'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Tab 2: Assigned Courses */}
                                {activeTab === 'courses' && (
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Curriculum & Course Access</h3>
                                                <p className="text-xs text-gray-400 mt-0.5">Courses currently distributed across university students</p>
                                            </div>
                                            <span className="text-xs font-semibold px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                                {uniqueCourses.length} Courses
                                            </span>
                                        </div>

                                        {uniqueCourses.length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {uniqueCourses.map(({ course, studentCount }, i) => (
                                                    <div
                                                        key={i}
                                                        className="p-4 rounded-xl border border-gray-200 bg-white hover:border-[#4318FF] transition-all flex items-start gap-3.5"
                                                    >
                                                        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
                                                            <BookOpen size={20} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                                                                {course.name}
                                                            </h4>
                                                            <p className="text-xs text-gray-400 mt-0.5 truncate">
                                                                {course.category?.name || 'General Curriculum'}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#4318FF] bg-indigo-50 px-2.5 py-0.5 rounded-full">
                                                                    <Users size={11} /> {studentCount} {studentCount === 1 ? 'Student' : 'Students'} Enrolled
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50/50 rounded-xl border border-gray-100">
                                                <BookOpen size={32} className="text-gray-300 mb-2" />
                                                <p className="text-xs font-bold text-gray-700">No courses assigned</p>
                                                <p className="text-xs text-gray-400 mt-0.5">Students have not been enrolled in any courses yet.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Tab 3: Subscription Details */}
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
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Licenses Provisioned</p>
                                                    <p className="text-sm font-bold text-gray-900">{sub.no_of_licence || 0} Student Seats</p>
                                                </div>
                                                <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 space-y-1">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Amount</p>
                                                    <p className="text-sm font-bold text-emerald-600">${sub.amount || 0}</p>
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
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Expiry / Renewal</p>
                                                    <p className="text-sm font-semibold text-gray-800">{sub.end_date ? moment(sub.end_date).format('MMM DD, YYYY') : '-'}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50/50 rounded-xl border border-gray-100">
                                                <CreditCard size={32} className="text-gray-300 mb-2" />
                                                <p className="text-xs font-bold text-gray-700">No Active Subscription Found</p>
                                                <p className="text-xs text-gray-400 mt-0.5">This university request has no currently linked subscription agreement.</p>
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

export default UniversityProfile;
