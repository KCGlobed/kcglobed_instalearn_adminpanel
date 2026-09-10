import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCourseDetailApi } from "../../services/apiServices";
import {
    ArrowLeft,
    BookOpen,
    Clock,
    DollarSign,
    Check,
    XCircle,
    Layers,
    Users,
    FileText,
    Info,
    Sparkles,
    Tag,
    PlayCircle,
    ChevronRight,
    AlertCircle,
    CheckCircle2,
    GraduationCap,
    Briefcase,
    Video,
    X,
    Edit3
} from "lucide-react";

const CARD = "bg-white rounded-2xl border border-gray-200 shadow-sm";

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

interface CourseDetail {
    id: number;
    name: string;
    description: string;
    short_description: string;
    requirements: string;
    price: number;
    original_price?: number;
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
        };
    }>;
    tags: Array<{
        id: number;
        tags: {
            id: number;
            name: string;
        };
    }>;
    chapters_info: Array<{
        id: number;
        chapter_info: {
            id: number;
            name: string;
            description: string;
            status: boolean;
            created_at: string;
        };
    }>;
    assessment_test_testlets?: number;
    assessment_test_each_testlet_questions?: number;
    status?: boolean | number | string;
    is_active?: boolean | number | string;
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
            text_1: string;
            text_2: string;
            text_3: string;
            image: string;
            experience: string;
            company_image_1: string | null;
            company_image_2: string | null;
        };
    }>;
    related_courses?: Array<{
        id: number;
        course_info: {
            id: number;
            name: string;
            image: string | null;
            price?: number;
            discount?: number;
        };
    }>;
}

const isCourseActive = (courseData: CourseDetail | null): boolean => {
    if (!courseData) return false;
    const c = courseData as unknown as Record<string, unknown>;
    const val = c.status !== undefined
        ? c.status
        : (c.is_active !== undefined ? c.is_active : c.course_status);

    if (val === undefined || val === null) return true;
    if (typeof val === 'boolean') return val;
    if (typeof val === 'number') return val === 1;
    if (typeof val === 'string') {
        const s = val.toLowerCase().trim();
        return s === '1' || s === 'true' || s === 'active';
    }
    return Boolean(val);
};

const CourseView: React.FC<{ courseId?: number | string }> = ({ courseId }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [course, setCourse] = useState<CourseDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeVideo, setActiveVideo] = useState<string | null>(null);
    const [imgError, setImgError] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'instructors' | 'details' | 'related'>('overview');
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const isStatusActive = isCourseActive(course);

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
            setActiveTab('overview');
            setActiveVideo(null);
            setImgError(false);
            handleFetchCourse(effectiveId);
        }
    }, [courseId, id]);

    if (loading) {
        return <SkeletonLoader />;
    }

    if (!course) {
        return (
            <div className="flex flex-col items-center justify-center p-20 min-h-[400px] text-center bg-[#F8FAFC]">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                    <Info size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">No Course Data Found</h3>
                <p className="text-xs text-gray-500 mt-1 mb-6">We couldn't retrieve the details for this course.</p>
                <button
                    onClick={() => navigate('/dashboard/courses')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4318FF] text-white text-xs font-bold shadow-sm"
                >
                    <ArrowLeft size={14} /> Back to Courses
                </button>
            </div>
        );
    }

    return (
        <div className="bg-[#F8FAFC] min-h-screen pb-12 font-sans text-slate-800">
            <div className="max-w-[1400px] mx-auto p-4 sm:p-6 space-y-6">

                {/* Back to Courses Navigation */}
                <button
                    onClick={() => navigate('/dashboard/courses')}
                    className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors group cursor-pointer"
                >
                    <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
                    <span>Back to Courses</span>
                </button>

                {/* Course Profile Hero Header Card */}
                <div className={`${CARD} p-6 sm:p-7`}>
                    <div className="flex flex-col md:flex-row gap-5 items-center md:items-center">
                        {/* Course Image */}
                        <div className="relative shrink-0">
                            <div
                                onClick={() => course.image && !imgError && setPreviewImage(course.image)}
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center font-bold text-xl sm:text-2xl shadow-sm bg-indigo-50 text-indigo-600 border border-indigo-100 overflow-hidden shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                            >
                                {course.image && !imgError ? (
                                    <img
                                        src={course.image}
                                        alt={course.name}
                                        className="w-full h-full object-cover"
                                        onError={() => setImgError(true)}
                                    />
                                ) : (
                                    <BookOpen size={28} className="text-indigo-600" />
                                )}
                            </div>
                            <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${isStatusActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        </div>

                        {/* Middle Details */}
                        <div className="flex-1 text-center md:text-left space-y-2">
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                                    {course.name}
                                </h1>
                                <div className="text-xs text-gray-500 font-medium mt-1 flex items-center justify-center md:justify-start gap-4 flex-wrap">
                                    {course.categories && course.categories.length > 0 && (
                                        <span className="flex items-center gap-1.5 text-indigo-600 font-semibold">
                                            <BookOpen size={13} />
                                            {course.categories[0].category_info.name}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1.5">
                                        <Clock size={13} className="text-gray-400" />
                                        {course.duration || 'Self-paced'}
                                    </span>
                                </div>
                            </div>

                            {/* Badge row */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-0.5">
                                <span className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-3 py-0.5 rounded-full">
                                    # ID {course.id}
                                </span>
                                {isStatusActive ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-full">
                                        <Check size={12} className="stroke-[2.5]" /> Active
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-0.5 rounded-full">
                                        <XCircle size={12} /> Inactive
                                    </span>
                                )}
                                
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="shrink-0 pt-2 md:pt-0">
                            <button
                                onClick={() => navigate(`/dashboard/courses/edit/${course.id}`)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#4318FF] hover:bg-[#3713d3] text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-200 cursor-pointer"
                            >
                                <Edit3 size={14} /> Edit Course
                            </button>
                        </div>
                    </div>
                </div>

                {/* 5 KPI Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {/* Card 1: Pricing */}
                    <div className={`${CARD} p-5`}>
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center mb-3">
                            <DollarSign size={16} />
                        </div>
                        <p className="text-2xl font-black text-gray-900 leading-none">₹{course.price}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-2">
                            {course.discount ? `${course.discount}% Discount` : 'Course Price'}
                        </p>
                    </div>

                    {/* Card 2: Chapters */}
                    <div className={`${CARD} p-5`}>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center mb-3">
                            <Layers size={16} />
                        </div>
                        <p className="text-2xl font-black text-gray-900 leading-none">{course.chapters_info?.length || 0}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-2">Curriculum Chapters</p>
                    </div>

                    {/* Card 3: Duration */}
                    <div className={`${CARD} p-5`}>
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center mb-3">
                            <Clock size={16} />
                        </div>
                        <p className="text-2xl font-black text-gray-900 leading-none truncate">{course.duration || 'N/A'}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-2">Course Duration</p>
                    </div>

                    {/* Card 4: Instructors */}
                    <div className={`${CARD} p-5`}>
                        <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center mb-3">
                            <Users size={16} />
                        </div>
                        <p className="text-2xl font-black text-gray-900 leading-none">{course.instructors?.length || 0}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-2">Instructors</p>
                    </div>

                    {/* Card 5: Related Courses */}
                    <div className={`${CARD} p-5`}>
                        <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center mb-3">
                            <BookOpen size={16} />
                        </div>
                        <p className="text-2xl font-black text-gray-900 leading-none">{course.related_courses?.length || 0}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-2">Related Courses</p>
                    </div>
                </div>

                {/* 2-Column Section: Course Information on Left & Tabbed Details on Right */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Left Column (4 cols) */}
                    <div className="lg:col-span-4 xl:col-span-4 space-y-6">
                        {/* Course Information Card */}
                        <div className={`${CARD} p-5 sm:p-6`}>
                            <div className="flex items-center gap-2 mb-5">
                                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                    <BookOpen size={15} />
                                </div>
                                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Course Information</h2>
                            </div>

                            <div className="space-y-4 text-xs">
                                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                    <span className="text-gray-500 font-medium">Category</span>
                                    <span className="font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full uppercase">
                                        {course.categories?.[0]?.category_info.name || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                    <span className="text-gray-500 font-medium">Skill Level</span>
                                    <span className="font-semibold text-gray-800">Beginner - Advanced</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                    <span className="text-gray-500 font-medium">Language</span>
                                    <span className="font-semibold text-gray-800">English (EN-US)</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                    <span className="text-gray-500 font-medium">Status</span>
                                    <span className={`font-semibold px-2.5 py-0.5 rounded-full border ${isStatusActive ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-red-700 bg-red-50 border-red-200'}`}>
                                        {isStatusActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                    <span className="text-gray-500 font-medium">Total Chapters</span>
                                    <span className="font-bold text-gray-800">{course.chapters_info?.length || 0}</span>
                                </div>
                                {Boolean(course.instructors && course.instructors.length > 0) && (
                                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                        <span className="text-gray-500 font-medium">Assigned Instructors</span>
                                        <span className="font-bold text-gray-800">{course.instructors?.length}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 font-medium">Course ID</span>
                                    <span className="font-bold text-gray-700">#{course.id}</span>
                                </div>
                            </div>
                        </div>

                        {/* Key Course Highlights Card */}
                        {course.feature_json && course.feature_json.length > 0 && (
                            <div className={`${CARD} p-5 sm:p-6`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                                            <Sparkles size={15} />
                                        </div>
                                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Course Highlights</h2>
                                    </div>
                                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                        {course.feature_json.length}
                                    </span>
                                </div>
                                <div className="space-y-2.5">
                                    {course.feature_json.map((feat, i) => (
                                        <div
                                            key={i}
                                            className="flex items-start gap-2.5 p-3 rounded-xl bg-gradient-to-r from-amber-50/60 to-orange-50/30 border border-amber-100 text-xs font-semibold text-gray-800"
                                        >
                                            <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                                                <Check size={11} strokeWidth={3} />
                                            </div>
                                            <span>{feat}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Catalog Tags Card */}
                        {course.tags && course.tags.length > 0 && (
                            <div className={`${CARD} p-5 sm:p-6`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                            <Tag size={15} />
                                        </div>
                                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Catalog Tags</h2>
                                    </div>
                                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                                        {course.tags.length}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {course.tags.map((t, i) => (
                                        <span
                                            key={i}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 text-xs font-semibold border border-gray-200 hover:border-indigo-200 transition-all cursor-default"
                                        >
                                            <span className="text-indigo-400 font-bold">#</span>
                                            {t.tags?.name}
                                        </span>
                                    ))}
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
                                    onClick={() => setActiveTab('overview')}
                                    className={`flex items-center gap-2 pb-3.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${activeTab === 'overview'
                                        ? 'border-[#4318FF] text-[#4318FF]'
                                        : 'border-transparent text-gray-500 hover:text-gray-800'
                                        }`}
                                >
                                    <Info size={15} />
                                    <span>Overview</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('curriculum')}
                                    className={`flex items-center gap-2 pb-3.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${activeTab === 'curriculum'
                                        ? 'border-[#4318FF] text-[#4318FF]'
                                        : 'border-transparent text-gray-500 hover:text-gray-800'
                                        }`}
                                >
                                    <Layers size={15} />
                                    <span>Curriculum</span>
                                    {Boolean(course.chapters_info && course.chapters_info.length > 0) && (
                                        <span className="text-[10px] font-semibold bg-indigo-50 text-[#4318FF] border border-indigo-200 px-1.5 py-0.5 rounded-full">
                                            {course.chapters_info?.length}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('instructors')}
                                    className={`flex items-center gap-2 pb-3.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${activeTab === 'instructors'
                                        ? 'border-[#4318FF] text-[#4318FF]'
                                        : 'border-transparent text-gray-500 hover:text-gray-800'
                                        }`}
                                >
                                    <Users size={15} />
                                    <span>Instructors</span>
                                    {Boolean(course.instructors && course.instructors.length > 0) && (
                                        <span className="text-[10px] font-semibold bg-purple-50 text-purple-600 border border-purple-200 px-1.5 py-0.5 rounded-full">
                                            {course.instructors?.length}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('details')}
                                    className={`flex items-center gap-2 pb-3.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${activeTab === 'details'
                                        ? 'border-[#4318FF] text-[#4318FF]'
                                        : 'border-transparent text-gray-500 hover:text-gray-800'
                                        }`}
                                >
                                    <FileText size={15} />
                                    <span>Full Details & Outcomes</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('related')}
                                    className={`flex items-center gap-2 pb-3.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${activeTab === 'related'
                                        ? 'border-[#4318FF] text-[#4318FF]'
                                        : 'border-transparent text-gray-500 hover:text-gray-800'
                                        }`}
                                >
                                    <BookOpen size={15} />
                                    <span>Related Courses</span>
                                    {Boolean(course.related_courses && course.related_courses.length > 0) && (
                                        <span className="text-[10px] font-semibold bg-rose-50 text-rose-600 border border-rose-200 px-1.5 py-0.5 rounded-full">
                                            {course.related_courses?.length}
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* Tab Content Container */}
                            <div className="p-6 flex-1 bg-white">
                                {/* Overview Tab */}
                                {activeTab === 'overview' && (
                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                                                    <Info size={15} />
                                                </div>
                                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Course Summary</h3>
                                            </div>
                                            <div
                                                className="p-5 rounded-xl bg-gray-50/70 border border-gray-100 text-sm text-gray-700 leading-relaxed"
                                                dangerouslySetInnerHTML={{ __html: course.short_description || 'No summary available.' }}
                                            />
                                        </div>

                                        {course.feature_json && course.feature_json.length > 0 && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                                                        <Sparkles size={15} />
                                                    </div>
                                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">What's Included</h3>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {course.feature_json.map((feat, i) => (
                                                        <div
                                                            key={i}
                                                            className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-amber-50/70 via-orange-50/30 to-white border border-amber-200/70 text-xs font-semibold text-gray-800"
                                                        >
                                                            <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                                                                <Check size={12} strokeWidth={3} />
                                                            </div>
                                                            <span>{feat}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Curriculum Tab */}
                                {activeTab === 'curriculum' && (
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Curriculum Outline</h3>
                                                <p className="text-xs text-gray-400 mt-0.5">{course.chapters_info?.length || 0} modules configured for this course</p>
                                            </div>
                                            <span className="text-xs font-semibold px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                                {course.chapters_info?.length || 0} Chapters
                                            </span>
                                        </div>

                                        {course.chapters_info && course.chapters_info.length > 0 ? (
                                            <div className="space-y-3">
                                                {course.chapters_info.map((item, i) => (
                                                    <div key={i} className="p-4 rounded-xl border border-gray-200 hover:border-[#4318FF] transition-all bg-white hover:bg-indigo-50/10 flex items-start gap-4">
                                                        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4318FF] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                                            {i + 1}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                                <h4 className="text-sm font-bold text-gray-900">{item.chapter_info?.name}</h4>
                                                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${item.chapter_info?.status ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-gray-100 text-gray-500'}`}>
                                                                    {item.chapter_info?.status ? 'Active' : 'Inactive'}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-gray-500 leading-relaxed">{item.chapter_info?.description || 'No description for this chapter.'}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                                <Layers size={32} className="text-gray-300 mb-2" />
                                                <p className="text-xs font-bold text-gray-700">No chapters configured</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Instructors Tab */}
                                {activeTab === 'instructors' && (
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Assigned Instructors</h3>
                                                <p className="text-xs text-gray-400 mt-0.5">Qualified faculty & industry mentors</p>
                                            </div>
                                            <span className="text-xs font-semibold px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                                {course.instructors?.length || 0} Faculty
                                            </span>
                                        </div>

                                        {course.instructors && course.instructors.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {course.instructors.map((item, i) => (
                                                    <div key={i} className="p-4 rounded-xl border border-gray-200 bg-white hover:border-[#4318FF] transition-all flex gap-4 items-start">
                                                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-indigo-50 border border-indigo-100 shrink-0">
                                                            {item.instructor_info?.image ? (
                                                                <img
                                                                    src={item.instructor_info.image}
                                                                    alt={item.instructor_info.text_1}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center font-bold text-lg text-indigo-600 uppercase">
                                                                    {item.instructor_info?.text_1?.charAt(0) || 'I'}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0 space-y-1">
                                                            <h4 className="text-sm font-bold text-gray-900 truncate">{item.instructor_info?.text_1}</h4>
                                                            {item.instructor_info?.text_2 && (
                                                                <p className="text-xs text-gray-600 flex items-center gap-1.5 truncate">
                                                                    <GraduationCap size={13} className="text-gray-400 shrink-0" />
                                                                    {item.instructor_info.text_2}
                                                                </p>
                                                            )}
                                                            {item.instructor_info?.text_3 && (
                                                                <p className="text-xs text-gray-500 flex items-center gap-1.5 truncate">
                                                                    <Briefcase size={13} className="text-gray-400 shrink-0" />
                                                                    {item.instructor_info.text_3}
                                                                </p>
                                                            )}
                                                            {item.instructor_info?.experience && (
                                                                <p className="text-[11px] font-semibold text-indigo-600 flex items-center gap-1.5 pt-1">
                                                                    <Clock size={12} />
                                                                    {item.instructor_info.experience} Experience
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                                <Users size={32} className="text-gray-300 mb-2" />
                                                <p className="text-xs font-bold text-gray-700">No instructors assigned</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Full Details & Outcomes Tab */}
                                {activeTab === 'details' && (
                                    <div className="space-y-6">
                                        {/* Full Description */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                                                    <BookOpen size={15} />
                                                </div>
                                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Detailed Description</h3>
                                            </div>
                                            <div
                                                className="p-5 rounded-xl bg-gray-50/70 border border-gray-100 text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
                                                dangerouslySetInnerHTML={{ __html: course.description || 'No detailed description available.' }}
                                            />
                                        </div>

                                        {/* Video Preview Card */}
                                        {course.sample_videos && course.sample_videos.length > 0 && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center">
                                                        <Video size={15} />
                                                    </div>
                                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Sample Video Preview</h3>
                                                </div>
                                                <div
                                                    className="w-full max-w-xl aspect-video rounded-xl overflow-hidden relative bg-slate-900 group cursor-pointer shadow-sm border border-gray-200"
                                                    onClick={() => setActiveVideo(course.sample_videos![0].videos)}
                                                >
                                                    <img
                                                        src={course.sample_videos[0].thumbnail}
                                                        alt="Video thumbnail"
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80 group-hover:opacity-95"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/40 text-white group-hover:scale-110 transition-transform shadow-lg">
                                                            <PlayCircle size={32} className="text-white" />
                                                        </div>
                                                    </div>
                                                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-xs font-bold text-white">
                                                        {course.sample_videos[0].duration}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Requirements & What You Will Learn */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            {/* Requirements */}
                                            <div className="p-5 rounded-xl border border-gray-200 bg-white">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                                                        <AlertCircle size={14} />
                                                    </div>
                                                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Prerequisites & Requirements</h4>
                                                </div>
                                                <div
                                                    className="text-xs text-gray-600 leading-relaxed prose prose-sm max-w-none"
                                                    dangerouslySetInnerHTML={{ __html: course.requirements || 'No specific prerequisites mentioned for this course.' }}
                                                />
                                            </div>

                                            {/* Learning Outcomes */}
                                            <div className="p-5 rounded-xl border border-gray-200 bg-white">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center">
                                                        <CheckCircle2 size={14} />
                                                    </div>
                                                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">What You Will Learn</h4>
                                                </div>
                                                {course.objectives_summary && course.objectives_summary.length > 0 ? (
                                                    <ul className="space-y-2 text-xs text-gray-600">
                                                        {course.objectives_summary.map((obj, i) => (
                                                            <li key={i} className="flex items-start gap-2">
                                                                <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                                                                <span>{obj}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="text-xs text-gray-400 italic">No specific learning objectives listed.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Related Courses Tab */}
                                {activeTab === 'related' && (
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Related Courses</h3>
                                                <p className="text-xs text-gray-400 mt-0.5">Complementary subjects and recommended next steps</p>
                                            </div>
                                            <span className="text-xs font-semibold px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                                {course.related_courses?.length || 0} Courses
                                            </span>
                                        </div>

                                        {course.related_courses && course.related_courses.length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                                {course.related_courses.map((related, i) => (
                                                    <div
                                                        key={i}
                                                        onClick={() => {
                                                            setActiveTab('overview');
                                                            navigate(`/dashboard/course/view/${related.course_info.id}`);
                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                        }}
                                                        className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs hover:border-[#4318FF] hover:shadow-sm transition-all flex flex-col h-full group cursor-pointer"
                                                    >
                                                        <div className="h-36 w-full bg-gray-100 relative overflow-hidden">
                                                            {related.course_info.image ? (
                                                                <img
                                                                    src={related.course_info.image}
                                                                    alt={related.course_info.name}
                                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                    <BookOpen size={28} />
                                                                </div>
                                                            )}
                                                            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-xs text-[#4318FF]">
                                                                <Layers size={14} />
                                                            </div>
                                                        </div>
                                                        <div className="p-4 flex flex-col flex-1">
                                                            <h4 className="font-bold text-gray-900 text-xs line-clamp-2 mb-2 group-hover:text-[#4318FF] transition-colors" title={related.course_info.name}>
                                                                {related.course_info.name}
                                                            </h4>
                                                            <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                                                                <span className="text-[10px] text-gray-500 font-bold uppercase">ID: #{related.course_info.id}</span>
                                                                <div className="text-[10px] font-bold text-[#4318FF] flex items-center gap-1 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                                                                    View Course <ChevronRight size={10} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                                <BookOpen size={32} className="text-gray-300 mb-2" />
                                                <p className="text-xs font-bold text-gray-700">No related courses</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Video Modal */}
            {activeVideo && (
                <div
                    className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-sm transition-all"
                    onClick={() => setActiveVideo(null)}
                >
                    <div
                        className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setActiveVideo(null)}
                            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-slate-800 text-white flex items-center justify-center transition-colors border border-white/10"
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

            {/* Image Preview Modal */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-sm transition-all"
                    onClick={() => setPreviewImage(null)}
                >
                    <div
                        className="relative max-w-4xl max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setPreviewImage(null)}
                            className="absolute -top-3 -right-3 z-20 w-10 h-10 rounded-full bg-white shadow-lg text-slate-700 flex items-center justify-center transition-colors hover:bg-slate-100"
                        >
                            <X size={20} />
                        </button>
                        <img
                            src={previewImage}
                            alt="Course preview"
                            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseView;