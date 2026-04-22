import {
    Award,
    DollarSign,
    Clock,
    Tag,
    BookOpen,
    Info,
    CheckCircle2,
    Loader2,
    FileQuestion,
    Layout,
    Play,
    Users,
    GraduationCap,
    Briefcase,
    Video,
    X,
    ArrowRight
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
    const { id } = useParams();
    const [course, setCourse] = useState<CourseDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeVideo, setActiveVideo] = useState<string | null>(null);

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

                        {/* Native Scroll Slider for Previews */}
                        {course.sample_videos && course.sample_videos.length > 0 && (
                            <div>
                                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-4 flex items-center gap-2">
                                    <div className="w-6 h-[1px] bg-indigo-200"></div>
                                    Course Previews
                                </h2>
                                <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                    {course.sample_videos.map((video, i) => (
                                        <div
                                            key={i}
                                            className="snap-start shrink-0 w-[280px] sm:w-[320px] group relative rounded-2xl overflow-hidden bg-slate-900 aspect-video shadow-lg border border-slate-200 cursor-pointer"
                                            onClick={() => setActiveVideo(video.videos)}
                                        >
                                            <img
                                                src={video.thumbnail}
                                                className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-all duration-500 group-hover:scale-110"
                                                alt={video.name}
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white transform scale-90 group-hover:scale-100 transition-all duration-300 shadow-xl">
                                                    <Play size={20} className="fill-white ml-1" />
                                                </div>
                                            </div>
                                            <div className="absolute top-3 left-3 flex gap-2">
                                                <span className="px-2 py-0.5 bg-black/50 backdrop-blur-md rounded text-[9px] font-bold text-white uppercase tracking-widest border border-white/10">
                                                    {video.name}
                                                </span>
                                            </div>
                                            <div className="absolute bottom-3 right-3 px-1.5 py-0.5 bg-indigo-600 rounded text-[9px] font-black text-white shadow-md">
                                                {video.duration} SEC
                                            </div>
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

                        {/* Instructors */}
                        {course.instructors && course.instructors.length > 0 && (
                            <div>
                                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-6 flex items-center gap-2">
                                    <div className="w-6 h-[1px] bg-indigo-200"></div>
                                    Meet your Instructor
                                </h2>
                                <div className="space-y-6">
                                    {course.instructors.map((item, i) => (
                                        <div key={i} className="bg-slate-50 border border-slate-100 rounded-3xl p-8 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                                <Users size={120} className="text-indigo-600" />
                                            </div>

                                            <div className="flex flex-col md:flex-row gap-8 relative z-10">
                                                <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-xl flex-shrink-0">
                                                    <img
                                                        src={item.instructor_info.image}
                                                        alt={item.instructor_info.text_1}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex flex-wrap items-center gap-3 mb-4">
                                                        <h3 className="text-xl font-bold text-slate-900">{item.instructor_info.text_1}</h3>
                                                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100">
                                                            Expert
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                                        <div className="flex items-center gap-3 text-slate-600">
                                                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-indigo-500 shadow-sm">
                                                                <GraduationCap size={16} />
                                                            </div>
                                                            <div>
                                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Qualification</p>
                                                                <p className="text-xs font-semibold">{item.instructor_info.text_2}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-slate-600">
                                                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-indigo-500 shadow-sm">
                                                                <Briefcase size={16} />
                                                            </div>
                                                            <div>
                                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Current Company</p>
                                                                <p className="text-xs font-semibold">{item.instructor_info.text_3}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-slate-600">
                                                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-indigo-500 shadow-sm">
                                                                <Clock size={16} />
                                                            </div>
                                                            <div>
                                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Experience</p>
                                                                <p className="text-xs font-semibold">{item.instructor_info.experience}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {(item.instructor_info.company_image_1 || item.instructor_info.company_image_2) && (
                                                        <div className="flex items-center gap-4 mt-2 pt-4 border-t border-slate-100">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Associated With</p>
                                                            <div className="flex items-center gap-3">
                                                                {item.instructor_info.company_image_1 && (
                                                                    <div className="h-6 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
                                                                        <img src={item.instructor_info.company_image_1} alt="Company 1" className="h-full w-auto object-contain" />
                                                                    </div>
                                                                )}
                                                                {item.instructor_info.company_image_2 && (
                                                                    <div className="h-6 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
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

                        {/* Related Courses */}
                        {course.related_courses && course.related_courses.length > 0 && (
                            <div>
                                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-6 flex items-center gap-2">
                                    <div className="w-6 h-[1px] bg-indigo-200"></div>
                                    Related Courses
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {course.related_courses.map((related, i) => (
                                        <div key={i} className="flex gap-4 p-3 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all bg-white group cursor-pointer">
                                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
                                                {related.course_info.image ? (
                                                    <img src={related.course_info.image} alt={related.course_info.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                        <BookOpen size={24} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 py-1 flex flex-col justify-center overflow-hidden">
                                                <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">{related.course_info.name}</h4>
                                                <div className="mt-2 text-[10px] font-bold text-indigo-500 flex items-center gap-1 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-5px] group-hover:translate-x-0 duration-300">
                                                    View Course <ArrowRight size={10} />
                                                </div>
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
                                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full border border-green-200 shadow-sm">
                                            🔥 {course.discount}% OFF
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

                        {/* Sidebar Sample Video Preview */}
                        {course.sample_videos && course.sample_videos.length > 0 && (
                            <div className="group relative rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-white p-3">
                                <div className="aspect-video rounded-xl overflow-hidden relative mb-3">
                                    <img
                                        src={course.sample_videos[0].thumbnail}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        alt="Preview"
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-100 group-hover:bg-black/20 transition-all">
                                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white transform group-hover:scale-110 transition-transform">
                                            <Play size={20} className="fill-white ml-1" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded text-[9px] font-black text-white">
                                        {course.sample_videos[0].duration}s
                                    </div>
                                </div>
                                <div className="px-1">
                                    <h4 className="text-xs font-bold text-slate-900 mb-1">Watch Course Preview</h4>
                                    <p className="text-[10px] text-slate-500 font-medium">Get a glimpse of what's inside this comprehensive curriculum.</p>
                                    <button
                                        onClick={() => setActiveVideo(course.sample_videos![0].videos)}
                                        className="w-full mt-3 py-2 bg-slate-900 text-white rounded-lg text-[11px] font-bold hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        Watch Video <Video size={14} />
                                    </button>
                                </div>
                            </div>
                        )}

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

            {/* Video Modal */}
            {activeVideo && (
                <div
                    className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-8 bg-slate-900/90 backdrop-blur-md transition-all animate-in fade-in duration-300"
                    onClick={() => setActiveVideo(null)}
                >
                    <div
                        className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10"
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
