import {
    Award,
    DollarSign,
    Clock,
    Tag,
    BookOpen,
    Info,
    CheckCircle2,
    AlertCircle,
    Layout,
    Play,
    Users,
    GraduationCap,
    Briefcase,
    Video,
    X,
    ArrowLeft,
    Calendar,
    Activity,
    Layers,
    ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCourseDetailApi } from "../../services/apiServices";
import moment from "moment";

const CARD = 'bg-white rounded-[22px] border border-gray-100 shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition-all duration-300';
const CARD_HOVER = 'hover:shadow-[0_12px_32px_rgba(15,23,42,0.08)] hover:-translate-y-1 hover:border-gray-200';

const SkeletonLoader = () => (
    <div className="max-w-[1400px] mx-auto p-4 sm:p-5 lg:p-6 space-y-6 animate-pulse bg-gray-50 min-h-screen">
        <div className="h-5 w-24 bg-gray-200 rounded-md mb-6"></div>
        <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_10px_rgba(15,23,42,0.04)] border border-gray-100 flex flex-col md:flex-row gap-6">
            <div className="w-20 h-20 bg-gray-200 rounded-[20px] shrink-0"></div>
            <div className="flex-1 space-y-3">
                <div className="h-6 w-1/3 bg-gray-200 rounded-md"></div>
                <div className="flex gap-2">
                    <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
                    <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
                </div>
            </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white p-5 rounded-[22px] border border-gray-100 shadow-[0_2px_10px_rgba(15,23,42,0.04)] h-24"></div>
            ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-[22px] border border-gray-100 shadow-[0_2px_10px_rgba(15,23,42,0.04)] h-56"></div>
                <div className="bg-white p-6 rounded-[22px] border border-gray-100 shadow-[0_2px_10px_rgba(15,23,42,0.04)] h-56"></div>
            </div>
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-[22px] border border-gray-100 shadow-[0_2px_10px_rgba(15,23,42,0.04)] h-64"></div>
            </div>
        </div>
    </div>
);



interface CourseDetail {
    id: number;
    name: string;
    description: string;
    short_description: string;
    requirements: string;
    price: number;
    discount: number;
    duration: string;
    objectives_summary: string[];
    feature_json: string[];
    image: string;
    banner_image: string | null;
    categories: Array<{
        id: number;
        category_info: {
            id: number;
            name: string;
            description: string;
        }
    }>;
    tags: Array<{
        id: number;
        tags: {
            id: number;
            name: string;
        }
    }>;
    chapters_info: Array<{
        id: number;
        chapter_info: {
            id: number;
            name: string;
            description: string;
            status: boolean;
            created_at: string;
        }
    }>;
    assessment_test_testlets: number;
    assessment_test_each_testlet_questions: number;
    status?: boolean;
    created_at?: string;
    sample_videos?: Array<{
        id: number;
        name: string;
        thumbnail: string;
        videos: string;
        duration: string;
    }>;
    instructors?: Array<{
        id: number;
        instructor_info: {
            id: number;
            text_1: string; // name
            text_2: string; // qualification
            text_3: string; // company
            image: string;  // avatar
            experience: string;
            company_image_1: string | null;
            company_image_2: string | null;
        }
    }>;
    related_courses?: Array<{
        id: number;
        course_info: {
            id: number;
            name: string;
            image: string | null;
        }
    }>;
}

const CourseView = ({ courseId }: { courseId?: number | string }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [course, setCourse] = useState<CourseDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeVideo, setActiveVideo] = useState<string | null>(null);
    const [imgError, setImgError] = useState(false);

    const handleFetchCourse = async (cid: number | string) => {
        setLoading(true);
        try {
            const res = await fetchCourseDetailApi(cid);
            const responseData = res.data || res;
            setCourse(responseData);
        } catch (error) {
            console.error("Failed to fetch course data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const effectiveId = courseId || id;
        if (effectiveId) {
            handleFetchCourse(effectiveId);
        }
    }, [courseId, id]);

    if (loading) {
        return <SkeletonLoader />;
    }

    if (!course) {
        return (
            <div className="flex flex-col items-center justify-center p-20 min-h-[400px] text-center">
                <Info className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">No Course Data Found</h3>
                <p className="text-sm text-gray-500 mt-1">We couldn't retrieve the details for this course.</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-10 font-sans">
            <div className="max-w-[1400px] mx-auto p-4 sm:p-5 lg:p-6 space-y-6">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/dashboard/courses')}
                    className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-all w-fit group"
                >
                    <ArrowLeft size={14} className="transition-transform duration-300 group-hover:-translate-x-1" /> Back to Courses
                </button>

                {/* SECTION 1: Hero / Profile Card */}
                <div className="relative rounded-[24px] p-6 md:p-8 border border-gray-100 shadow-[0_4px_24px_rgba(15,23,42,0.05)] overflow-hidden bg-gradient-to-br from-white via-white to-indigo-50/40">
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-indigo-200/40 to-purple-200/30 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -left-12 w-56 h-56 bg-gradient-to-tr from-sky-100/50 to-transparent rounded-full blur-3xl pointer-events-none" />

                    <div className="relative flex flex-col md:flex-row gap-6 items-center md:items-start">
                        <div className="relative shrink-0">
                            <div className="w-24 h-24 rounded-[20px] shadow-[0_8px_30px_rgba(79,70,229,0.18)] overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                {course.image && !imgError ? (
                                    <img
                                        src={course.image}
                                        alt={course.name}
                                        className="w-full h-full object-cover"
                                        onError={() => setImgError(true)}
                                    />
                                ) : (
                                    <BookOpen className="text-white w-10 h-10 opacity-80" />
                                )}
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-3 pt-1">
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                                    {course.name}
                                </h1>
                                <p className="text-xs font-medium text-gray-500 mt-6 flex items-center justify-center md:justify-start gap-6 flex-wrap ">
                                    <span className="flex items-center gap-1.5"><Clock size={14} className="text-indigo-400" /> {course.duration || 'N/A'}</span>
                                    {course.categories && course.categories.length > 0 && (
                                        <span className="flex items-center gap-1.5"><Layout size={14} className="text-purple-400" /> {course.categories[0].category_info.name}</span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION 2: Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
                    {[
                        { icon: DollarSign, value: `Rs ${course.price}`, label: 'Price', from: 'from-blue-50', to: 'to-indigo-50', text: 'text-blue-600' },
                        { icon: Activity, value: course.discount > 0 ? `${course.discount}% OFF` : 'None', label: 'Discount', from: 'from-emerald-50', to: 'to-teal-50', text: 'text-emerald-600' },
                        { icon: Layers, value: course.chapters_info?.length || 0, label: 'Chapters', from: 'from-purple-50', to: 'to-fuchsia-50', text: 'text-purple-600' },
                        { icon: Clock, value: course.duration || '-', label: 'Duration', from: 'from-yellow-50', to: 'to-amber-50', text: 'text-yellow-600' },
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Left Column */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Summary */}
                        <div className={`${CARD} p-6 md:p-8`}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <Info size={16} />
                                </div>
                                <h3 className="text-base font-bold text-gray-900">Summary</h3>
                            </div>
                            <div
                                className="text-gray-600 text-[13px] leading-relaxed prose prose-sm max-w-none prose-p:my-2 bg-gray-50 p-6 rounded-[16px] border border-gray-100"
                                dangerouslySetInnerHTML={{ __html: course.short_description || 'No summary available.' }}
                            />
                        </div>

                        {/* Full Details */}
                        <div className={`${CARD} p-6 md:p-8`}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                    <BookOpen size={16} />
                                </div>
                                <h3 className="text-base font-bold text-gray-900">Full Details</h3>
                            </div>
                            <div
                                className="text-gray-600 text-[13px] leading-relaxed prose prose-sm max-w-none prose-p:my-2"
                                dangerouslySetInnerHTML={{ __html: course.description || 'No description available.' }}
                            />
                        </div>

                        {/* Requirements */}
                        {course.requirements && (
                            <div className={`${CARD} p-6 md:p-8`}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                                        <AlertCircle size={16} />
                                    </div>
                                    <h3 className="text-base font-bold text-gray-900">Prerequisites</h3>
                                </div>
                                <div
                                    className="text-gray-600 text-[13px] leading-relaxed prose prose-sm max-w-none prose-p:my-2 bg-amber-50/50 p-6 rounded-[16px] border border-amber-100/50 italic"
                                    dangerouslySetInnerHTML={{ __html: course.requirements }}
                                />
                            </div>
                        )}

                        {/* Objectives */}
                        {course.objectives_summary && course.objectives_summary.length > 0 && (
                            <div className={`${CARD} p-6 md:p-8`}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <CheckCircle2 size={16} />
                                    </div>
                                    <h3 className="text-base font-bold text-gray-900">What you will learn</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {course.objectives_summary.map((obj, i) => (
                                        <div key={i} className="flex items-start gap-3 p-4 rounded-[16px] bg-gray-50/50 border border-gray-100">
                                            <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-[13px] text-gray-700 font-medium leading-relaxed">{obj}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Curriculum */}
                        {course.chapters_info && course.chapters_info.length > 0 && (
                            <div className={`${CARD} p-6 md:p-8`}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                                        <Layers size={16} />
                                    </div>
                                    <h3 className="text-base font-bold text-gray-900">Curriculum</h3>
                                </div>
                                <div className="space-y-3">
                                    {course.chapters_info.map((item, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 rounded-[16px] bg-white border border-gray-100 shadow-[0_2px_10px_rgba(15,23,42,0.02)] hover:border-indigo-100 hover:shadow-[0_4px_12px_rgba(79,70,229,0.06)] transition-all group cursor-default">
                                            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xs font-black text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                                                {String(i + 1).padStart(2, '0')}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{item.chapter_info.name}</h4>
                                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.chapter_info.description}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <BookOpen size={16} className="text-gray-300 group-hover:text-indigo-300 transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Instructors */}
                        {course.instructors && course.instructors.length > 0 && (
                            <div className={`${CARD} p-6 md:p-8`}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
                                        <Users size={16} />
                                    </div>
                                    <h3 className="text-base font-bold text-gray-900">Instructors</h3>
                                </div>
                                <div className="space-y-6">
                                    {course.instructors.map((item, i) => (
                                        <div key={i} className="bg-gray-50/50 border border-gray-100 rounded-[20px] p-6 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                                <Users size={120} className="text-indigo-600" />
                                            </div>

                                            <div className="flex flex-col md:flex-row gap-6 relative z-10">
                                                <div className="w-20 h-20 rounded-[18px] overflow-hidden border-4 border-white shadow-md flex-shrink-0">
                                                    <img
                                                        src={item.instructor_info.image}
                                                        alt={item.instructor_info.text_1}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex flex-wrap items-center gap-3 mb-4">
                                                        <h3 className="text-lg font-bold text-gray-900">{item.instructor_info.text_1}</h3>
                                                        <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-md border border-indigo-100">
                                                            Expert
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                                        <div className="flex items-center gap-3 text-gray-600">
                                                            <div className="w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-indigo-500 shadow-sm shrink-0">
                                                                <GraduationCap size={14} />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Qualification</p>
                                                                <p className="text-xs font-semibold truncate">{item.instructor_info.text_2}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-gray-600">
                                                            <div className="w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-indigo-500 shadow-sm shrink-0">
                                                                <Briefcase size={14} />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Company</p>
                                                                <p className="text-xs font-semibold truncate">{item.instructor_info.text_3}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-gray-600">
                                                            <div className="w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-indigo-500 shadow-sm shrink-0">
                                                                <Clock size={14} />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Experience</p>
                                                                <p className="text-xs font-semibold truncate">{item.instructor_info.experience}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {(item.instructor_info.company_image_1 || item.instructor_info.company_image_2) && (
                                                        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Associated With</p>
                                                            <div className="flex items-center gap-3">
                                                                {item.instructor_info.company_image_1 && (
                                                                    <div className="h-5 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
                                                                        <img src={item.instructor_info.company_image_1} alt="Company 1" className="h-full w-auto object-contain" />
                                                                    </div>
                                                                )}
                                                                {item.instructor_info.company_image_2 && (
                                                                    <div className="h-5 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
                                                                        <img src={item.instructor_info.company_image_2} alt="Company 2" className="h-full w-auto object-contain" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}


                    </div>

                    {/* Right Column: Information */}
                    <div className="space-y-6">
                        <div className={`${CARD} p-6`}>
                            <h3 className="text-sm font-bold text-gray-900 mb-5">Course Information</h3>
                            <div className="flex flex-col">
                                <div className="flex items-start gap-3 py-3 border-b border-gray-100 group/row">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0 transition-all duration-300 group-hover/row:bg-indigo-50 group-hover/row:text-indigo-600 group-hover/row:-translate-y-0.5">
                                        <Calendar size={14} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Created On</p>
                                        <div className="text-xs font-semibold text-gray-900 leading-relaxed break-words">{course.created_at ? moment(course.created_at).format('MMM DD, YYYY') : '-'}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 py-3 group/row">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0 transition-all duration-300 group-hover/row:bg-indigo-50 group-hover/row:text-indigo-600 group-hover/row:-translate-y-0.5">
                                        <Layout size={14} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Categories</p>
                                        <div className="text-xs font-semibold text-gray-900 leading-relaxed break-words">
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {course.categories && course.categories.length > 0 ? (
                                                    course.categories.map((cat, i) => (
                                                        <span key={i} className="inline-block bg-gray-50 border border-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                                            {cat.category_info.name}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-400">No categories</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Related Courses */}
                        {course.related_courses && course.related_courses.length > 0 && (
                            <div className={`${CARD} p-6`}>
                                <h3 className="text-sm font-bold text-gray-900 mb-5 flex items-center gap-2">
                                    <BookOpen size={16} className="text-teal-500" /> Related Courses
                                </h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {course.related_courses.map((related, i) => (
                                        <div key={i} className="flex gap-3 p-3 rounded-[12px] border border-gray-100 hover:border-teal-200 hover:shadow-[0_2px_8px_rgba(20,184,166,0.06)] transition-all bg-white group cursor-pointer">
                                            <div className="w-12 h-12 rounded-[10px] overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                                                {related.course_info.image ? (
                                                    <img src={related.course_info.image} alt={related.course_info.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <BookOpen size={16} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 flex flex-col justify-center min-w-0">
                                                <h4 className="text-xs font-bold text-gray-900 truncate group-hover:text-teal-600 transition-colors">{related.course_info.name}</h4>
                                                <div className="mt-1 text-[9px] font-bold text-teal-500 flex items-center gap-1 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform -translate-x-1 group-hover:translate-x-0 duration-300">
                                                    View <ChevronRight size={10} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Sidebar Sample Video Preview */}
                        {course.sample_videos && course.sample_videos.length > 0 && (
                            <div className={`${CARD} p-4`}>
                                <div className="aspect-video rounded-[14px] overflow-hidden relative mb-4 bg-gray-900 group cursor-pointer" onClick={() => setActiveVideo(course.sample_videos![0].videos)}>
                                    <img
                                        src={course.sample_videos[0].thumbnail}
                                        className="w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-110"
                                        alt="Preview"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white transform group-hover:scale-110 transition-transform">
                                            <Play size={20} className="fill-white ml-1" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded-md text-[9px] font-black text-white">
                                        {course.sample_videos[0].duration}s
                                    </div>
                                </div>
                                <div className="px-2 pb-1">
                                    <h4 className="text-xs font-bold text-gray-900 mb-1">Watch Preview</h4>
                                    <p className="text-[10px] text-gray-500 font-medium mb-3">Get a glimpse of this comprehensive curriculum.</p>
                                    <button
                                        onClick={() => setActiveVideo(course.sample_videos![0].videos)}
                                        className="w-full py-2 bg-gray-900 text-white rounded-[12px] text-[11px] font-bold hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        Watch Video <Video size={14} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {course.feature_json && course.feature_json.length > 0 && (
                            <div className={`${CARD} p-6`}>
                                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Award size={16} className="text-amber-500" /> Highlights
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {course.feature_json.map((feat, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-lg text-[11px] font-bold text-amber-700">
                                            {feat}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {course.tags && course.tags.length > 0 && (
                            <div className={`${CARD} p-6`}>
                                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Tag size={16} className="text-indigo-500" /> Tags
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {course.tags.map((t: any, i: number) => (
                                        <span key={i} className="px-3 py-1.5 bg-gray-50 text-gray-600 text-[11px] font-bold rounded-lg border border-gray-200">
                                            {t.tags?.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Video Modal */}
            {activeVideo && (
                <div
                    className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-8 bg-slate-900/90 backdrop-blur-md transition-all animate-in fade-in duration-300"
                    onClick={() => setActiveVideo(null)}
                >
                    <div
                        className="relative w-full max-w-5xl aspect-video bg-black rounded-[24px] overflow-hidden shadow-2xl border border-white/10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setActiveVideo(null)}
                            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-500/80 transition-all border border-white/10"
                        >
                            <X size={20} />
                        </button>
                        <video
                            src={activeVideo}
                            autoPlay
                            controls
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseView;