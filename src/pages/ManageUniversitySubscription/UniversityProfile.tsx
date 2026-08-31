import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    CreditCard,
    Clock,
    Building2,
    GraduationCap,
    MapPin,
    Briefcase,
    ChevronLeft
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
import { PlayCircle, FileText, CheckCircle, Bell, LogIn, UploadCloud, UserPlus } from 'lucide-react';

const CARD = 'bg-white rounded-[22px] border border-gray-100 shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition-all duration-300';

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

const StudentAvatar: React.FC<{ student: any }> = ({ student }) => {
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

const UniversityProfile = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { showModal, hideModal } = useModal();

    const handleViewReports = (student: any) => {
        showModal({
            title: `Reports: ${student.first_name} ${student.last_name}`,
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
                        }
                    ]}
                />
            )
        });
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await viewUniversityApi(Number(id));
            const universityData = response?.data?.data || response?.data || response;
            if (universityData) {
                setData(universityData);
            }
        } catch (error) {
            console.error('Failed to load university details', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) loadData();
    }, [id]);

    if (loading) return <SkeletonLoader />;

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center p-20 min-h-[400px] text-center">
                <User className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">No University Data Found</h3>
                <p className="text-sm text-gray-500 mt-1">We couldn't retrieve the details for this university.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-6 flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors text-sm font-semibold"
                >
                    <ChevronLeft size={16} /> Go Back
                </button>
            </div>
        );
    }

    const isActive = data.status;
    const sub = data.active_subscription && data.active_subscription.length > 0 ? data.active_subscription[0] : null;
    const initials = `${data.first_name?.charAt(0) || ''}${data.last_name?.charAt(0) || ''}`.toUpperCase() || 'U';

    const getApprovalStatusBadge = (status: number) => {
        switch (status) {
            case 1:
                return <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full bg-yellow-100 text-yellow-700">New</span>;
            case 2:
                return <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full bg-emerald-100 text-emerald-700">Approved</span>;
            case 3:
                return <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full bg-red-100 text-red-700">Rejected</span>;
            default:
                return null;
        }
    };

    return (
        <div className="bg-gray-50 font-sans min-h-screen">
            <div className="max-w-[1400px] mx-auto p-4 sm:p-5 lg:p-6 space-y-6">
                
                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors"
                >
                    <ChevronLeft size={16} /> Back to University Requests
                </button>

                {/* ── SECTION 1: Hero / Profile Card ── */}
                <div className="relative rounded-[24px] p-6 md:p-8 border border-gray-100 shadow-[0_4px_24px_rgba(15,23,42,0.05)] overflow-hidden bg-gradient-to-br from-white via-white to-indigo-50/40">
                    {/* decorative blobs */}
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-indigo-200/40 to-purple-200/30 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -left-12 w-56 h-56 bg-gradient-to-tr from-sky-100/50 to-transparent rounded-full blur-3xl pointer-events-none" />

                    <div className="relative flex flex-col md:flex-row gap-6 items-center md:items-start">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[20px] shadow-sm bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0 overflow-hidden">
                                <span className="font-black text-3xl sm:text-4xl text-indigo-600 uppercase">
                                    {initials}
                                </span>
                            </div>
                            <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        </div>

                        {/* Name + meta */}
                        <div className="flex-1 text-center md:text-left space-y-3 pt-1">
                            <div>
                                <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                                        {data.first_name} {data.last_name}
                                    </h1>
                                    <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                        {isActive ? 'Active' : 'Inactive'}
                                    </span>
                                    {getApprovalStatusBadge(data.approved_status)}
                                </div>
                                <p className="text-xs font-medium text-gray-500 mt-2 flex items-center justify-center md:justify-start gap-6 flex-wrap">
                                    <span className="flex items-center gap-1.5">
                                        <Mail size={14} className="text-indigo-400" /> {data.work_email || '-'}
                                    </span>
                                    {data.phone_number && (
                                        <span className="flex items-center gap-1.5">
                                            <Phone size={14} className="text-purple-400" /> {data.phone_number}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1.5">
                                        <Building2 size={14} className="text-blue-400" /> {data.institution_name}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 shrink-0">
                            <button 
                                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95 shadow-indigo-200 shadow-lg"
                                onClick={() => showModal({
                                    title: "Add New Student",
                                    content: <AddUniversityStudent universityId={Number(id)} onSuccess={() => loadData()} />,
                                    type: 'custom',
                                    size: 'xxl'
                                })}
                            >
                                <UserPlus size={18} strokeWidth={3} />
                                Add Student
                            </button>
                            <button 
                                onClick={() => showModal({
                                    content: <ImportUniversityStudents 
                                        universityId={Number(id)} 
                                        onSuccess={() => loadData()} 
                                        onClose={() => hideModal()} 
                                    />
                                })}
                                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-[12px] hover:bg-indigo-800 transition-colors shadow-sm"
                            >
                                <UploadCloud size={16} />
                                Import Students
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── SECTION 2: Subscription (Horizontal) ── */}
                {sub && (
                    <div className={`${CARD} p-6`}>
                        <h3 className="text-sm font-bold text-gray-900 mb-5 flex items-center gap-2 border-b border-gray-100 pb-3">
                            <Activity size={16} className="text-indigo-500" /> Active Subscription
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {[
                                { icon: CreditCard, label: 'Plan Name', value: <span className="text-indigo-600">{sub.plan_info?.plan_name || '-'}</span> },
                                { icon: Shield, label: 'Licences', value: sub.no_of_licence || 0 },
                                { icon: Award, label: 'Amount', value: `$${sub.amount || 0}` },
                                { icon: Clock, label: 'Plan Type', value: getSubscriptionType(sub.subscription_type) },
                                { 
                                    icon: Activity, 
                                    label: 'Status', 
                                    value: <span className={`inline-block px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full ${getStatusColor(sub.subscription_status)}`}>
                                        {getSubscriptionStatus(sub.subscription_status)}
                                    </span> 
                                },
                                { icon: Calendar, label: 'Duration', value: `${sub.start_date ? moment(sub.start_date).format('MMM DD, YYYY') : '-'} to ${sub.end_date ? moment(sub.end_date).format('MMM DD, YYYY') : '-'}` }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col gap-2 p-3 bg-gray-50/50 rounded-xl border border-gray-100 hover:bg-indigo-50/30 hover:border-indigo-100 transition-colors group/col">
                                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover/col:text-indigo-600 transition-colors">
                                        <item.icon size={14} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                                        <div className="text-xs font-semibold text-gray-900 truncate">{item.value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
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
                                    <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-md border border-indigo-100">
                                        {data.student_lists?.length || 0} Total
                                    </span>
                                </div>
                            </div>

                            {data.student_lists && data.student_lists.length > 0 ? (
                                <div className="space-y-3">
                                    {data.student_lists.map((student: any, i: number) => (
                                        <div
                                            key={student.id}
                                            className="flex flex-col gap-3 p-4 rounded-[16px] bg-white border border-gray-100 shadow-[0_2px_10px_rgba(15,23,42,0.02)] hover:border-indigo-100 hover:shadow-[0_4px_12px_rgba(79,70,229,0.06)] transition-all group cursor-default"
                                        >
                                            <div className="flex items-center gap-3.5">
                                                {/* Index */}
                                                <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-[11px] font-black text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors shrink-0">
                                                    {String(i + 1).padStart(2, '0')}
                                                </div>
                                                {/* Student Profile Avatar */}
                                                <StudentAvatar student={student} />
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
                                                </div>
                                                {/* Action Button */}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleViewReports(student); }}
                                                    className="hidden md:block ml-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-md text-[11px] font-bold uppercase tracking-wide hover:bg-indigo-100 transition-colors shrink-0"
                                                >
                                                    View Reports
                                                </button>
                                            </div>

                                            {/* Course chips */}
                                            {student.courses && student.courses.length > 0 && (
                                                <div className="flex flex-wrap gap-2 pl-0 sm:pl-[84px]">
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
                                    <p className="text-xs text-gray-400 mt-1">This university hasn't added any students yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Info sidebar */}
                    <div className="space-y-6">

                        {/* Institution Information */}
                        <div className={`${CARD} p-6`}>
                            <h3 className="text-sm font-bold text-gray-900 mb-5">Institution Details</h3>
                            <div className="flex flex-col">
                                {[
                                    { icon: Building2, label: 'Institution Name', value: data.institution_name || '-' },
                                    { icon: GraduationCap, label: 'Institution Type', value: data.institution_type || '-' },
                                    { icon: Briefcase, label: 'Job Role', value: data.job_role || '-' },
                                    { icon: Activity, label: 'Department', value: data.department || '-' },
                                    { icon: MapPin, label: 'Country', value: data.country || '-' },
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

                    </div>
                </div>
            </div>
        </div>
    );
};

export default UniversityProfile;
