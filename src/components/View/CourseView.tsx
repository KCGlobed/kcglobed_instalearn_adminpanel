import {
    Calendar,
    Award,
    DollarSign,
    Clock,
    Tag,
    BookOpen,
    Info,
    CheckCircle2,
    Loader2,
    Layers,
    FileQuestion,
    Layout
} from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchCourseDetailApi } from "../../services/apiServices";

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
}

const CourseView = ({ courseId }: { courseId?: number | string }) => {
    const { id } = useParams();
    const [course, setCourse] = useState<CourseDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const handleFetchCourse = async (cid: number | string) => {
        setLoading(true);
        try {
            const res = await fetchCourseDetailApi(cid);
            // Based on user provided JSON, the actual data is in res.data
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
        return (
            <div className="flex flex-col items-center justify-center p-20 min-h-[400px]">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
                <p className="text-sm text-gray-500 font-medium">Fetching course details...</p>
            </div>
        );
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
        <div className="bg-white min-h-screen flex flex-col font-sans text-slate-900">
            {/* Banner Section */}
            <div className="relative h-48 w-full bg-slate-100 flex-shrink-0">
                {course.banner_image ? (
                    <img
                        src={course.banner_image}
                        alt={course.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-indigo-500 to-purple-600 opacity-20" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end">
                    <div className="p-8 w-full flex items-end gap-6">
                        <div className="w-24 h-24 rounded-2xl border-4 border-white bg-white overflow-hidden shadow-2xl flex-shrink-0">
                            {course.image ? (
                                <img src={course.image} alt="Thumbnail" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-600 font-bold text-3xl">
                                    {course.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="mb-1 flex-1">
                            <h1 className="text-3xl font-bold text-white tracking-tight leading-tight drop-shadow-md">{course.name}</h1>
                            <div className="flex items-center gap-4 mt-2">
                                <span className="text-white/90 text-xs font-semibold flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                                    <Clock size={14} className="text-indigo-300" /> {course.duration}
                                </span>
                                {course.categories?.[0] && (
                                    <span className="text-white/90 text-xs font-semibold flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                                        <Layout size={14} className="text-purple-300" /> {course.categories[0].category_info.name}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Info */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* Short Description */}
                        <div>
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-4 flex items-center gap-2">
                                <div className="w-6 h-[1px] bg-indigo-200"></div>
                                Summary
                            </h2>
                            <div
                                className="text-slate-600 text-[13px] leading-relaxed prose prose-sm max-w-none prose-p:my-2 bg-slate-50 p-6 rounded-2xl border border-slate-100"
                                dangerouslySetInnerHTML={{ __html: course.short_description }}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-4 flex items-center gap-2">
                                <div className="w-6 h-[1px] bg-indigo-200"></div>
                                Full Course Details
                            </h2>
                            <div
                                className="text-slate-600 text-[13px] leading-relaxed prose prose-sm max-w-none prose-p:my-2"
                                dangerouslySetInnerHTML={{ __html: course.description }}
                            />
                        </div>

                        {/* Requirements */}
                        {course.requirements && (
                            <div>
                                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-4 flex items-center gap-2">
                                    <div className="w-6 h-[1px] bg-indigo-200"></div>
                                    Prerequisites
                                </h2>
                                <div
                                    className="text-slate-600 text-[13px] leading-relaxed prose prose-sm max-w-none prose-p:my-2 bg-amber-50/50 p-6 rounded-2xl border border-amber-100/50 italic"
                                    dangerouslySetInnerHTML={{ __html: course.requirements }}
                                />
                            </div>
                        )}

                        {/* Objectives */}
                        {course.objectives_summary && course.objectives_summary.length > 0 && (
                            <div>
                                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-4 flex items-center gap-2">
                                    <div className="w-6 h-[1px] bg-indigo-200"></div>
                                    What you will learn
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {course.objectives_summary.map((obj, i) => (
                                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-indigo-50/30 border border-indigo-100/50">
                                            <CheckCircle2 size={16} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-xs text-slate-700 font-medium">{obj}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Chapters */}
                        {course.chapters_info && course.chapters_info.length > 0 && (
                            <div>
                                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-4 flex items-center gap-2">
                                    <div className="w-6 h-[1px] bg-indigo-200"></div>
                                    Curriculum
                                </h2>
                                <div className="space-y-3">
                                    {course.chapters_info.map((item, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors">
                                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400">
                                                {String(i + 1).padStart(2, '0')}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-semibold text-slate-800">{item.chapter_info.name}</h4>
                                                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{item.chapter_info.description}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <BookOpen size={14} className="text-slate-300" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Sidebar Stats */}
                    <div className="space-y-8">
                        {/* Pricing Card */}
                        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4">
                                <DollarSign size={40} className="text-indigo-500/5 rotate-12" />
                            </div>

                            <div className="mb-6">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Investment</span>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <span className="text-3xl font-black text-slate-900">Rs {course.price}</span>
                                    {course.discount > 0 && (
                                        <span className="text-sm text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-lg border border-green-100">
                                            Save Rs {course.discount}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-2 border-t border-slate-100">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase">Assessment</span>
                                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                                        <FileQuestion size={14} className="text-indigo-400" /> {course.assessment_test_testlets} Testlets
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-t border-slate-100">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase">Per Testlet</span>
                                    <span className="text-xs font-bold text-slate-700">{course.assessment_test_each_testlet_questions} Questions</span>
                                </div>
                            </div>
                        </div>

                        {/* Metadata */}
                        <div className="space-y-6 px-2">
                            <div>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Award size={13} className="text-amber-500" /> Highlights
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {course.feature_json?.map((feat, i) => (
                                        <span key={i} className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-600">
                                            {feat}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Tag size={13} className="text-indigo-500" /> Tags
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {course.tags?.map((t: any, i: number) => (
                                        <span key={i} className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full border border-indigo-100">
                                            {t.tags?.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseView;
