import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { FiPlus, FiTrash2, FiChevronLeft, FiAlertCircle } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import LexicalEditor from "../../components/TextEditor";
import { createMcq, updateMcqApi, fetchMcqDetailApi, fetchChapterListApi } from "../../services/apiServices";

// ─── Constants & Types ────────────────────────────────────────────────────────

type McqFormValues = {
    id_number: string;
    level: number;
    pass_percentage: number;
    chapter_id: number;
    question: string;
    solution_description: string;
    options: { value: string }[];
    right_option: number;
};

type Chapter = {
    id: number;
    title: string;
    // adding other potential fields
    name?: string;
};

// ─── Validation Helpers ───────────────────────────────────────────────────────

const isContentEmpty = (html: string) => {
    if (!html) return true;
    const stripped = html.replace(/<[^>]*>?/gm, '').trim();
    return stripped.length === 0;
};

const validationSchema = Yup.object().shape({
    id_number: Yup.string()
        .min(2, "ID must be at least 2 characters")
        .required("Unique ID is required"),
    level: Yup.number()
        .typeError("Select a difficulty level")
        .required("Level is required")
        .min(1, "Select level 1, 2, or 3"),
    pass_percentage: Yup.number()
        .typeError("Enter a number between 1-100")
        .required("Percentage is required")
        .min(1, "Minimum 1%")
        .max(100, "Maximum 100%"),
    chapter_id: Yup.number()
        .typeError("Please select a chapter")
        .required("Chapter is required")
        .min(1, "Please select a valid chapter"),
    question: Yup.string()
        .required("Question content is required")
        .test("is-empty", "Question text cannot be empty", (val) => !isContentEmpty(val || "")),
    solution_description: Yup.string()
        .required("Solution explanation is required")
        .test("is-empty", "Explanation cannot be empty", (val) => !isContentEmpty(val || "")),
    options: Yup.array()
        .of(
            Yup.object().shape({
                value: Yup.string()
                    .required("Option content is required")
                    .test("is-empty", "Option text cannot be empty", (val) => !isContentEmpty(val || "")),
            })
        )
        .min(4, "Please provide at least 4 options"),
    right_option: Yup.number()
        .typeError("Mark the correct answer")
        .required("Mark one option as correct")
        .min(1, "Select the correct answer choice"),
});

const buildDefaultValues = (data?: any): McqFormValues => ({
    id_number: data?.id_number ?? "",
    level: data?.level ?? (0 as any),
    pass_percentage: data?.pass_percentage ?? (50 as any),
    chapter_id: data?.chapter_id ?? (0 as any),
    question: data?.question ?? "",
    solution_description: data?.solution_description ?? "",
    options: data?.options?.length > 0
        ? data.options.map((opt: string) => ({ value: opt }))
        : [{ value: "" }, { value: "" }, { value: "" }, { value: "" }],
    right_option: data?.right_option ?? (0 as any),
});

// ─── Component ────────────────────────────────────────────────────────────────

const McqForm = () => {
    const navigate = useNavigate();
    const { id: routeId } = useParams<{ id?: string }>();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [chapters, setChapters] = useState<Chapter[]>([]);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        watch,
        reset,
    } = useForm<McqFormValues>({
        defaultValues: buildDefaultValues(),
        resolver: yupResolver(validationSchema) as any,
    });

    const { fields, append, remove } = useFieldArray({ control, name: "options" });
    const watchRightOption = watch("right_option");

    // Fetch Chapter List
    useEffect(() => {
        const loadChapters = async () => {
            try {
                const response = await fetchChapterListApi();
                // Safe extraction for various formats (data, results, or raw array)
                const data = response?.data || response?.results || response || [];
                if (Array.isArray(data)) {
                    setChapters(data);
                } else if (data && typeof data === 'object' && Array.isArray((data as any).results)) {
                    setChapters((data as any).results);
                }
            } catch (err) {
                console.error("Error fetching chapters", err);
            }
        };
        loadChapters();
    }, []);



    // Fetch data for Edit mode
    useEffect(() => {
        if (routeId) {
            (async () => {
                try {
                    setFetching(true);
                    const res = await fetchMcqDetailApi(routeId);
                    const data = res?.data || res;
                    if (data) {
                        // Find the index of the right option ID in the options array
                        const rightOptionId = data.right_option?.id;
                        const options = data.options || [];
                        const rightOptionIndex = options.findIndex((opt: any) => opt.id === rightOptionId);

                        reset({
                            id_number: data.id_number || "",
                            level: data.level ?? 1,
                            pass_percentage: data.pass_percentage ?? 50,
                            chapter_id: data.chapter?.id || data.chapter_id || 0,
                            question: data.question_detail?.question || data.question || "",
                            solution_description: data.question_detail?.solution_description || data.solution_description || "",
                            options: options.map((opt: any) => ({
                                value: typeof opt === 'string' ? opt : opt.option
                            })),
                            // Set right_option to index + 1 (to match 1,2,3,4 standard)
                            right_option: rightOptionIndex !== -1 ? rightOptionIndex + 1 : 0,
                        });
                    }
                } catch (err) {
                    toast.error("Failed to load MCQ data");
                } finally {
                    setFetching(false);
                }
            })();
        }
    }, [routeId, reset]);

    const onInvalid = (errs: any) => {
        console.warn("Validation Failed:", errs);
        toast.error("Please correct the errors before submitting");
    };

    const onSubmit = async (data: McqFormValues) => {
        const payload = {
            ...data,
            level: Number(data.level),
            pass_percentage: Number(data.pass_percentage),
            chapter_id: Number(data.chapter_id),
            options: data.options.map((opt) => opt.value),
            right_option: Number(data.right_option),
        };

        try {
            setLoading(true);
            if (routeId) {
                await updateMcqApi(routeId, payload);
                toast.success("MCQ Updated");
            } else {
                await createMcq(payload);
                toast.success("MCQ Created");
            }
            navigate("/dashboard/mcq");
        } catch (err) {
            toast.error("Submission failed. Check your data.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] bg-white">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500 font-bold tracking-tight">Syncing Data...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 bg-gray-50/10 min-h-screen">
            {/* Page Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-8">
                <div>
                    <button
                        onClick={() => navigate("/dashboard/mcq")}
                        className="group flex items-center text-sm font-semibold text-gray-400 hover:text-indigo-600 transition-colors mb-2"
                    >
                        <FiChevronLeft className="mr-1 group-hover:-translate-x-1 transition-transform" /> Back to MCQ Library
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                        {routeId ? "Modify Existing MCQ" : "Design New MCQ"}
                    </h1>
                    <p className="mt-1 text-sm text-gray-400 font-medium">
                        Configure metadata, content, and feedback rules for your assessment choice.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard/mcq")}
                        className="px-5 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit(onSubmit, onInvalid)}
                        disabled={loading}
                        className="inline-flex items-center px-8 py-2 border border-transparent text-sm font-bold rounded-lg shadow-md shadow-indigo-50 text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all disabled:opacity-50"
                    >
                        {loading ? "Saving Changes..." : routeId ? "Update MCQ" : "Publish MCQ"}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-12 pb-20">
                <div className="bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] rounded-[2rem] border border-gray-100 overflow-hidden">

                    {/* ── Metadata Selection ── */}
                    <div className="p-8 sm:p-10 bg-gray-50/40 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-3">
                            <span className="w-2 h-2 bg-indigo-600 rounded-full"></span> 1. Core Metadata
                        </h2>
                        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-4 whitespace-nowrap">
                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">MCQ Identifier</label>
                                <input
                                    type="text"
                                    {...register("id_number")}
                                    className={`block w-full px-4 py-2 bg-white border rounded-xl focus:ring-4 focus:ring-indigo-50 text-sm font-medium transition-all outline-none ${errors.id_number ? 'border-red-500 ring-4 ring-red-50' : 'border-gray-200 focus:border-indigo-400'
                                        }`}
                                    placeholder="e.g. Design-01"
                                />
                                {errors.id_number && <p className="mt-1.5 text-xs text-red-500 font-bold flex items-center gap-1.5"><FiAlertCircle className="shrink-0" /> {errors.id_number.message}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Difficulty Level</label>
                                <select
                                    {...register("level", { valueAsNumber: true })}
                                    className={`block w-full px-4 py-2 bg-white border rounded-xl focus:ring-4 focus:ring-indigo-50 text-sm font-medium transition-all appearance-none cursor-pointer outline-none ${errors.level ? 'border-red-500 ring-4 ring-red-50' : 'border-gray-200 focus:border-indigo-400'
                                        }`}
                                >
                                    <option value={0}>Choose Level</option>
                                    <option value={1}>1: Beginner</option>
                                    <option value={2}>2: Intermediate</option>
                                    <option value={3}>3: Advanced</option>
                                </select>
                                {errors.level && <p className="mt-1.5 text-xs text-red-500 font-bold flex items-center gap-1.5"><FiAlertCircle className="shrink-0" /> {errors.level.message}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Pass %</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        {...register("pass_percentage", { valueAsNumber: true })}
                                        className={`block w-full px-4 py-2 bg-white border rounded-xl focus:ring-4 focus:ring-indigo-50 text-sm font-medium transition-all outline-none ${errors.pass_percentage ? 'border-red-500 ring-4 ring-red-50' : 'border-gray-200 focus:border-indigo-400'
                                            }`}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 font-bold">%</span>
                                </div>
                                {errors.pass_percentage && <p className="mt-1.5 text-xs text-red-500 font-bold flex items-center gap-1.5"><FiAlertCircle className="shrink-0" /> {errors.pass_percentage.message}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Chapter Link</label>
                                <select
                                    {...register("chapter_id", { valueAsNumber: true })}
                                    className={`block w-full px-4 py-2 bg-white border rounded-xl focus:ring-4 focus:ring-indigo-50 text-sm font-medium transition-all appearance-none cursor-pointer outline-none ${errors.chapter_id ? 'border-red-500 ring-4 ring-red-50' : 'border-gray-200 focus:border-indigo-400'
                                        }`}
                                >
                                    <option value={0}>Select Chapter</option>
                                    {chapters.map((chapter) => (
                                        <option key={chapter.id} value={chapter.id}>
                                            {chapter.title || chapter.name || `Chapter ${chapter.id}`}
                                        </option>
                                    ))}
                                </select>
                                {errors.chapter_id && <p className="mt-1.5 text-xs text-red-500 font-bold flex items-center gap-1.5"><FiAlertCircle className="shrink-0" /> {errors.chapter_id.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* ── Content Composition ── */}
                    <div className="p-8 sm:p-10 space-y-10">

                        {/* Question Editor */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-3">
                                <span className="w-2 h-2 bg-indigo-600 rounded-full"></span> 2. Question Content
                            </h2>
                            <div className={`rounded-xl border overflow-hidden transition-all bg-gray-50/10 ${errors.question ? 'border-red-500 ring-4 ring-red-50' : 'border-gray-200 focus-within:border-indigo-400'
                                }`}>
                                <Controller
                                    name="question"
                                    control={control}
                                    render={({ field }) => (
                                        <LexicalEditor
                                            type="question"
                                            value={field.value || ""}
                                            onChange={field.onChange}
                                            placeholder="Draft your question here..."
                                        />
                                    )}
                                />
                            </div>
                            {errors.question && <p className="text-xs text-red-500 font-bold flex items-center gap-1.5 ml-2 tracking-tight"><FiAlertCircle /> {errors.question.message}</p>}
                        </div>

                        {/* Dynamic Options Editor */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-3">
                                    <span className="w-2 h-2 bg-indigo-600 rounded-full"></span> 3. Answer Choices
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => append({ value: "" })}
                                    className="group inline-flex items-center px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider text-white bg-gray-800 hover:bg-indigo-600 transition-all active:scale-95"
                                >
                                    <FiPlus className="mr-1.5" /> Add Choice
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {fields.map((field, index) => (
                                    <div key={field.id} className={`group relative p-6 rounded-2xl border bg-white transition-all shadow-sm flex flex-col gap-5 ${errors.options?.[index] ? 'border-red-500 ring-4 ring-red-50 shadow-none' : 'border-gray-100 hover:border-indigo-200'
                                        }`}>
                                        <div className="flex flex-col sm:flex-row gap-6 items-start">
                                            <div className="flex sm:flex-col items-center gap-4 w-full sm:w-auto">
                                                {/* Option Number / Badge */}
                                                <div className={`flex items-center justify-center w-10 h-10 rounded-xl font-bold text-base transition-all ${errors.options?.[index] ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-indigo-600 group-hover:text-white'
                                                    }`}>
                                                    {index + 1}
                                                </div>

                                                {/* Correct Answer Toggle */}
                                                <label className="flex items-center justify-center w-10 h-10 rounded-xl cursor-pointer hover:bg-gray-50 transition-all relative">
                                                    <input
                                                        type="radio"
                                                        {...register("right_option")}
                                                        value={index + 1}
                                                        checked={Number(watchRightOption) === index + 1}
                                                        className="hidden"
                                                    />
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${Number(watchRightOption) === index + 1
                                                        ? "border-emerald-500 bg-emerald-500 shadow-sm"
                                                        : errors.right_option ? "border-red-500" : "border-gray-200"
                                                        }`}>
                                                        {Number(watchRightOption) === index + 1 && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                                                    </div>
                                                    <span className="absolute -bottom-3 text-[9px] font-bold text-gray-400 tracking-tighter uppercase whitespace-nowrap">
                                                        {Number(watchRightOption) === index + 1 ? 'Correct' : 'Mark'}
                                                    </span>
                                                </label>

                                                {/* Delete Action */}
                                                {fields.length > 4 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => remove(index)}
                                                        className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                                        title="Delete this option"
                                                    >
                                                        <FiTrash2 size={18} />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Choice Editor */}
                                            <div className="flex-1 w-full min-h-[140px] rounded-xl overflow-hidden border border-gray-100 bg-gray-50/5 transition-all">
                                                <Controller
                                                    name={`options.${index}.value`}
                                                    control={control}
                                                    render={({ field: lexicalField }) => (
                                                        <LexicalEditor
                                                            type={`opt-${index}`}
                                                            value={lexicalField.value || ""}
                                                            onChange={lexicalField.onChange}
                                                            placeholder={`Detail choice ${index + 1}...`}
                                                        />
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        {/* Individual Option Error */}
                                        {errors.options?.[index]?.value && (
                                            <p className="px-3 py-1.5 bg-red-50 text-[10px] font-bold text-red-500 uppercase rounded-lg flex items-center gap-1.5 animate-pulse tracking-wide italic">
                                                <FiAlertCircle size={12} /> {errors.options[index]?.value?.message}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {errors.right_option && <p className="text-xs text-red-500 font-bold text-center mt-4 flex items-center justify-center gap-1.5 bg-red-50 py-3 rounded-xl tracking-tight leading-none"><FiAlertCircle /> {errors.right_option.message}</p>}
                            {errors.options && !Array.isArray(errors.options) && (
                                <p className="text-sm text-red-600 font-black text-center bg-red-50 p-4 rounded-2xl"><FiAlertCircle /> {(errors.options as any).message}</p>
                            )}
                        </div>

                        {/* Solution / Explanation Editor */}
                        <div className="pt-8 border-t border-indigo-50 space-y-4">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-3">
                                <span className="w-2 h-2 bg-indigo-600 rounded-full"></span> 4. Feedback Logic
                            </h2>
                            <div className={`rounded-xl border overflow-hidden shadow-sm transition-all bg-gray-50/10 ${errors.solution_description ? 'border-red-500 ring-4 ring-red-50' : 'border-gray-200 focus-within:border-indigo-400'
                                }`}>
                                <Controller
                                    name="solution_description"
                                    control={control}
                                    render={({ field }) => (
                                        <LexicalEditor
                                            type="solution"
                                            value={field.value || ""}
                                            onChange={field.onChange}
                                            placeholder="Provide a logical explanation for the correct answer..."
                                        />
                                    )}
                                />
                            </div>
                            {errors.solution_description && <p className="text-xs text-red-500 font-bold flex items-center gap-1.5 ml-2 tracking-tight"><FiAlertCircle /> {errors.solution_description.message}</p>}
                        </div>

                    </div>
                </div>

                {/* Global Save Action */}
                <div className="flex justify-end items-center gap-4 py-8">
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard/mcq")}
                        className="px-6 py-2.5 text-sm font-bold text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all active:scale-95"
                    >
                        Cancel Draft
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-10 py-2.5 border border-transparent text-sm font-bold rounded-lg shadow-md hover:shadow-lg shadow-indigo-100 text-white bg-indigo-600 hover:bg-indigo-700 transition-all disabled:opacity-50 active:scale-95"
                    >
                        {loading ? "Syncing..." : routeId ? "Update MCQ" : "Publish MCQ"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default McqForm;
