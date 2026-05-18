import {
    BookOpen,
    CalendarDays,
    FileText,
} from "lucide-react";
import moment from "moment";

const TrailCourseView = ({
    trailCourseData,
}: any) => {
    const chapters =
        trailCourseData?.chapter_info || [];

    return (
        <div className="flex flex-col gap-5 p-1 max-h-[78vh] overflow-y-auto">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-500 p-5 shadow-lg">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />

                <div className="relative flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                        <BookOpen
                            size={22}
                            className="text-white"
                        />
                    </div>

                    <div className="flex-1">
                        <p className="text-[10px] uppercase tracking-[3px] text-indigo-100 font-semibold mb-2">
                            Trail Course
                        </p>

                        <h2 className="text-lg font-bold text-white leading-snug">
                            {
                                trailCourseData
                                    ?.course_detail
                                    ?.name
                            }
                        </h2>

                        <div className="flex items-center gap-2 mt-3">
                            <div className="px-2.5 py-1 rounded-full bg-white/15 border border-white/10 text-[11px] font-semibold text-white flex items-center gap-1.5">
                                <FileText size={12} />
                                {chapters.length} Chapters
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chapter List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Top Bar */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/70">
                    <div>
                        <h3 className="text-sm font-bold text-gray-800">
                            Chapter List
                        </h3>

                        <p className="text-xs text-gray-400 mt-0.5">
                            All chapters available in this
                            course
                        </p>
                    </div>

                    <div className="px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[11px] font-bold text-indigo-600">
                        {chapters.length} Total
                    </div>
                </div>

                {/* Chapters */}
                {chapters.length > 0 ? (
                    <div className="flex flex-col divide-y divide-gray-100">
                        {chapters.map(
                            (
                                chapter: any,
                                index: number
                            ) => (
                                <div
                                    key={chapter.id}
                                    className="group px-5 py-4 hover:bg-indigo-50/40 transition-all"
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Number */}
                                        <div className="min-w-[36px] h-[36px] rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center text-xs font-bold">
                                            {index + 1}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-semibold text-gray-800 leading-snug">
                                                        {chapter?.chapter_detail?.chapter_detail?.name ||
                                                         chapter?.chapter_detail?.name ||
                                                         `Chapter ${index + 1}`}
                                                    </h4>

                                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                                        {chapter?.chapter_detail?.chapter_detail?.description ||
                                                         chapter?.chapter_detail?.description ||
                                                         "No description available"}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Footer */}
                                            <div className="flex items-center gap-2 mt-3 text-[11px] text-gray-400">
                                                <CalendarDays
                                                    size={
                                                        12
                                                    }
                                                />

                                                <span>
                                                    Created on{" "}
                                                    {moment(
                                                        chapter?.chapter_detail?.chapter_detail?.created_at ||
                                                        chapter?.chapter_detail?.created_at
                                                    ).format("DD MMM YYYY")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-14 text-center">
                        <BookOpen
                            size={42}
                            className="text-gray-300 mb-3"
                        />

                        <h3 className="text-sm font-bold text-gray-500">
                            No Chapters Found
                        </h3>

                        <p className="text-xs text-gray-400 mt-1">
                            This course does not contain any
                            chapters yet.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrailCourseView;