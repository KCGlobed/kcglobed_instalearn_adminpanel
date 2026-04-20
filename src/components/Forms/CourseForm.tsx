import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { FiPlus, FiTrash2, FiChevronLeft, FiImage, FiUpload, FiAlertCircle, FiEye } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Select from "react-select";
import LexicalEditor from "../TextEditor";
import {
    courseDetailApi,
    createCourseApi,
    fetchSubCategoryOptionsApi,
    fetchTagOptionsApi,
    updateCourseApi
} from "../../services/apiServices";

// ─── Constants & Types ────────────────────────────────────────────────────────

type CourseFormValues = {
    name: string;
    short_description: string;
    description: string;
    duration: string;
    requirements: string;
    price: number | string;
    discount: number | string;
    level: number;
    image: string | File | null;
    tags: any[];
    category_id: any[];
    feature_json: { value: string }[];
    objectives_summary: { value: string }[];
};

const LEVEL_OPTIONS = [
    { value: 1, label: 'All' },
    { value: 2, label: 'Beginner' },
    { value: 3, label: 'Intermediate' },
    { value: 4, label: 'Expert' },
];

const customSelectStyles = (hasError: boolean) => ({
    control: (base: any, state: any) => ({
        ...base,
        borderRadius: '12px',
        minHeight: '48px',
        backgroundColor: '#f8fafc',
        border: hasError ? '1px solid #ef4444' : (state.isFocused ? '1px solid #6366f1' : '1px solid #e2e8f0'),
        boxShadow: state.isFocused ? '0 0 0 4px rgba(99, 102, 241, 0.1)' : 'none',
        '&:hover': {
            border: hasError ? '1px solid #ef4444' : '1px solid #6366f1',
        }
    }),
    multiValue: (base: any) => ({
        ...base,
        backgroundColor: '#f1f5f9',
        borderRadius: '6px',
        color: '#475569',
    }),
    placeholder: (base: any) => ({
        ...base,
        color: '#94a3b8',
        fontSize: '14px'
    })
});

// ─── Validation Schema ───────────────────────────────────────────────────────

const validationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    short_description: Yup.string().required("Short description is required"),
    description: Yup.string().required("Description is required"),
    duration: Yup.string().required("Duration is required"),
    requirements: Yup.string().required("Requirements are required"),
    price: Yup.number().typeError("Price must be a number").required("Price is required").min(0),
    discount: Yup.number().typeError("Discount must be a number").required("Discount is required").min(0).max(100),
    level: Yup.number().required("Level is required").min(1),
    tags: Yup.array().min(1, "Select at least one tag"),
    category_id: Yup.array().min(1, "Select at least one category"),
    feature_json: Yup.array().of(Yup.object().shape({ value: Yup.string().required("Required") })).min(1),
    objectives_summary: Yup.array().of(Yup.object().shape({ value: Yup.string().required("Required") })).min(1),
    image: Yup.mixed().required("Thumbnail is required"),
});

// ─── Component ────────────────────────────────────────────────────────────────

const CourseForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [tagOptions, setTagOptions] = useState<any[]>([]);
    const [categoryOptions, setCategoryOptions] = useState<any[]>([]);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const { id } = useParams();

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        setValue,
        watch,
    } = useForm<CourseFormValues>({
        defaultValues: {
            name: "",
            short_description: "",
            description: "",
            duration: "",
            requirements: "",
            price: "",
            discount: 0,
            level: 1,
            tags: [],
            category_id: [],
            feature_json: [{ value: "" }],
            objectives_summary: [{ value: "" }],
            image: null
        },
        resolver: yupResolver(validationSchema) as any,
    });

    const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({ control, name: "feature_json" });
    const { fields: objectiveFields, append: appendObjective, remove: removeObjective } = useFieldArray({ control, name: "objectives_summary" });

    useEffect(() => {
        const load = async () => {
            try {
                const [tags, cats] = await Promise.all([fetchTagOptionsApi(), fetchSubCategoryOptionsApi()]);
                setTagOptions((tags?.data || tags?.results || tags || []).map((t: any) => ({ value: t.id, label: t.name || t.title })));
                setCategoryOptions((cats?.data || cats?.results || cats || []).map((c: any) => ({ value: c.id, label: c.name || c.title })));
            } catch (err) { toast.error("Failed to load options"); }
        };
        load();
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setValue("image", file, { shouldValidate: true });
            const r = new FileReader();
            r.onloadend = () => setImagePreview(r.result as string);
            r.readAsDataURL(file);
        }
    };

    const watchedValues = watch();

    const onSubmit = async (data: CourseFormValues) => {
        console.log(data.category_id);
        let category: any[] = data.category_id.map((item: any) => item.value);
        let tag: any[] = data.tags.map((item: any) => item.value);
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("short_description", data.short_description);
            formData.append("description", data.description);
            formData.append("duration", data.duration);
            formData.append("requirements", data.requirements);
            formData.append("price", String(data.price));
            formData.append("discount", String(data.discount));
            formData.append("level", String(data.level));

            // Transform lists into JSON strings to maintain structure in FormData
            formData.append("feature_json", JSON.stringify(data.feature_json.map(f => f.value)));
            formData.append("objectives_summary", JSON.stringify(data.objectives_summary.map(o => o.value)));
            formData.append("tags", tag.join(","));
            formData.append("category_id", category.join(","));

            if (data.image instanceof File) {
                formData.append("image", data.image);
            }

            if (id) {
                await updateCourseApi(id, formData);
                toast.success("Course Updated Successfully");
            } else {
                await createCourseApi(formData);
                toast.success("Course Created Successfully");
            }
            navigate("/dashboard/courses");
        } catch (err) {
            console.error("Submission error", err);
            toast.error("Submission failed");
        } finally {
            setLoading(false);
        }
    };

    const ErrorField = ({ name }: { name: string }) => {
        const err = (errors as any)[name];
        if (!err) return null;
        return <p className="mt-1 text-xs font-semibold text-red-500 flex items-center gap-1"><FiAlertCircle /> {err.message}</p>;
    };

    const fetchCourseDetail = async (id: string | number) => {
        try {
            setLoading(true);
            const res = await courseDetailApi(id);
            setValue("name", res.data.name);
            setValue("short_description", res.data.short_description);
            setValue("description", res.data.description);
            setValue("duration", res.data.duration);
            setValue("requirements", res.data.requirements);
            setValue("price", res.data.price);
            setValue("discount", res.data.discount);
            setValue("level", res.data.level);
            setValue("tags", res.data.tags.map((item: any) => ({ value: item.tags.id, label: item.tags.name })));
            setValue("category_id", res.data.categories.map((item: any) => ({ value: item.category_info?.id, label: item.category_info?.name })));
            setValue("feature_json", res.data.feature_json.map((item: any) => ({ value: item })));
            setValue("objectives_summary", res.data.objectives_summary.map((item: any) => ({ value: item })));
            if (res.data.image) {
                setImagePreview(res.data.image);
                setValue("image", res.data.image);
            }
        } catch (err) {
            console.error("Failed to fetch course detail", err);
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        if (id) {
            fetchCourseDetail(id);
        }
    }, [id]);


    return (
        <div className="w-full py-10 px-10 bg-white border border-slate-100 rounded-2xl shadow-sm my-6">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between border-b pb-6">
                <div>
                    <button onClick={() => navigate("/dashboard/course")} className="flex items-center text-xs font-bold text-slate-400 hover:text-indigo-600 transition-all mb-2 uppercase">
                        <FiChevronLeft className="mr-1" /> Back to Dashboard
                    </button>
                    <h1 className="text-xl font-bold text-slate-900 uppercase">{id ? "Edit Course" : "Add New Course"}</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setIsPreviewOpen(true)}
                        className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                        <FiEye /> Preview
                    </button>
                    <button onClick={handleSubmit(onSubmit)} disabled={loading} className="px-10 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50">
                        {loading ? "Saving..." : "Save Course"}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">

                {/* ─── Row 1: Identity & Metadata ─── */}
                <div className="grid grid-cols-12 gap-10">
                    <div className="col-span-12 lg:col-span-8 space-y-8">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Name</label>
                            <input
                                type="text"
                                {...register("name")}
                                className={`w-full h-12 px-4 bg-slate-50 border rounded-xl outline-none transition-all ${errors.name ? 'border-red-500 focus:ring-4 focus:ring-red-50' : 'border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50'}`}
                                placeholder="Enter course name"
                            />
                            <ErrorField name="name" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Duration</label>
                                <input
                                    type="text"
                                    {...register("duration")}
                                    className={`w-full h-12 px-4 bg-slate-50 border rounded-xl outline-none transition-all ${errors.duration ? 'border-red-500' : 'border-slate-200 focus:border-indigo-400'}`}
                                    placeholder="e.g. 2 Months"
                                />
                                <ErrorField name="duration" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Level</label>
                                <Controller
                                    name="level"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            styles={customSelectStyles(!!errors.level)}
                                            options={LEVEL_OPTIONS}
                                            value={LEVEL_OPTIONS.find(o => o.value === field.value)}
                                            onChange={(val: any) => field.onChange(val.value)}
                                            placeholder="Select level"
                                        />
                                    )}
                                />
                                <ErrorField name="level" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Price (INR)</label>
                                <input
                                    type="number"
                                    {...register("price")}
                                    className={`w-full h-12 px-4 bg-slate-50 border rounded-xl outline-none transition-all ${errors.price ? 'border-red-500' : 'border-slate-200 focus:border-indigo-400'}`}
                                    placeholder="0"
                                />
                                <ErrorField name="price" />
                            </div>
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-4">
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Thumbnail</label>
                        <div className={`relative w-full aspect-video lg:h-40 lg:aspect-auto rounded-xl border-2 border-dashed flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer overflow-hidden ${errors.image ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-indigo-400'}`}>
                            {imagePreview ? (
                                <img src={imagePreview} className="w-full h-full " alt="Preview" />
                            ) : (
                                <div className="text-center">
                                    <FiImage className="mx-auto text-slate-300 mb-1" size={24} />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Upload</span>
                                </div>
                            )}
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleImageChange} />
                        </div>
                        <ErrorField name="image" />
                    </div>
                </div>

                {/* ─── Row 2: Taxonomy & Fees ─── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Category</label>
                        <Controller
                            name="category_id"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    isMulti
                                    styles={customSelectStyles(!!errors.category_id)}
                                    options={categoryOptions}
                                    {...field}
                                    placeholder="Select category"
                                />
                            )}
                        />
                        <ErrorField name="category_id" />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Tags</label>
                        <Controller
                            name="tags"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    isMulti
                                    styles={customSelectStyles(!!errors.tags)}
                                    options={tagOptions}
                                    {...field}
                                    placeholder="Add tags"
                                />
                            )}
                        />
                        <ErrorField name="tags" />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Discount (%)</label>
                        <input
                            type="number"
                            {...register("discount")}
                            className={`w-full h-12 px-4 bg-slate-50 border rounded-xl outline-none transition-all ${errors.discount ? 'border-red-500' : 'border-slate-200 focus:border-indigo-400'}`}
                            placeholder="0"
                        />
                        <ErrorField name="discount" />
                    </div>
                </div>

                {/* ─── Row 3: Descriptions ─── */}
                <div className="">
                    <div className="space-y-4 mb-4">
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Short Description</label>
                        <div className={`border rounded-xl overflow-hidden bg-white transition-all ${errors.short_description ? 'border-red-500' : 'border-slate-200 focus-within:border-indigo-400'}`}>
                            <Controller
                                name="short_description"
                                control={control}
                                render={({ field }) => (
                                    <LexicalEditor
                                        type="short_desc"
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Brief course summary..."
                                    />
                                )}
                            />
                        </div>
                        <ErrorField name="short_description" />
                    </div>

                    <div className="space-y-4 mb-4">
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Requirements</label>
                        <div className={`border rounded-xl overflow-hidden bg-white transition-all ${errors.requirements ? 'border-red-500' : 'border-slate-200 focus-within:border-indigo-400'}`}>
                            <Controller
                                name="requirements"
                                control={control}
                                render={({ field }) => (
                                    <LexicalEditor
                                        type="req"
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Course prerequisites..."
                                    />
                                )}
                            />
                        </div>
                        <ErrorField name="requirements" />
                    </div>

                    <div className="col-span-1 lg:col-span-2 space-y-4 mb-4">
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Description</label>
                        <div className={`border rounded-xl overflow-hidden bg-white transition-all ${errors.description ? 'border-red-500' : 'border-slate-200 focus-within:border-indigo-400'}`}>
                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                    <LexicalEditor
                                        type="full_desc"
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Full detailed description..."
                                    />
                                )}
                            />
                        </div>
                        <ErrorField name="description" />
                    </div>
                </div>

                {/* ─── Row 4: Lists ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-600 uppercase">Feature JSON</label>
                            <button type="button" onClick={() => appendFeature({ value: "" })} className="px-3 py-1 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-600 hover:text-white transition-all">+ Add</button>
                        </div>
                        <div className="space-y-4">
                            {featureFields.map((field, index) => (
                                <div key={field.id} className="relative group flex items-start gap-3">
                                    <textarea
                                        {...register(`feature_json.${index}.value`)}
                                        rows={2}
                                        placeholder="Feature entry"
                                        className={`flex-1 px-4 py-3 text-sm bg-slate-50 border rounded-xl outline-none transition-all resize-none ${errors.feature_json?.[index] ? 'border-red-400' : 'border-slate-200 focus:border-indigo-400'}`}
                                    />
                                    {featureFields.length > 1 && (
                                        <button type="button" onClick={() => removeFeature(index)} className="mt-3 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><FiTrash2 size={16} /></button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-600 uppercase">Objectives Summary</label>
                            <button type="button" onClick={() => appendObjective({ value: "" })} className="px-3 py-1 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-600 hover:text-white transition-all">+ Add</button>
                        </div>
                        <div className="space-y-4">
                            {objectiveFields.map((field, index) => (
                                <div key={field.id} className="relative group flex items-start gap-3">
                                    <textarea
                                        {...register(`objectives_summary.${index}.value`)}
                                        rows={2}
                                        placeholder="Objective entry"
                                        className={`flex-1 px-4 py-3 text-sm bg-slate-50 border rounded-xl outline-none transition-all resize-none ${errors.objectives_summary?.[index] ? 'border-red-400' : 'border-slate-200 focus:border-indigo-400'}`}
                                    />
                                    {objectiveFields.length > 1 && (
                                        <button type="button" onClick={() => removeObjective(index)} className="mt-3 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><FiTrash2 size={16} /></button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Submit Container */}
                <div className="pt-10 flex justify-end gap-4 border-t">
                    <button type="button" onClick={() => navigate("/dashboard/course")} className="px-6 py-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-all">Cancel</button>
                    <button type="submit" disabled={loading} className="px-10 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50">
                        {loading ? "Saving..." : "Save Course"}
                    </button>
                </div>

                {/* Course Preview Modal */}
                {isPreviewOpen && (
                    <CoursePreviewModal
                        data={watchedValues}
                        imagePreview={imagePreview}
                        onClose={() => setIsPreviewOpen(false)}
                    />
                )}
            </form>
        </div>
    );
};

// ─── Preview Modal Component ──────────────────────────────────────────────────

const CoursePreviewModal = ({ data, imagePreview, onClose }: { data: any, imagePreview: string | null, onClose: () => void }) => {
    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 lg:p-10">
            <div className="bg-white w-full max-w-5xl max-h-full overflow-hidden rounded-3xl shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300 border border-white/20">
                {/* Modal Header */}
                <div className="px-8 py-5 border-b flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                            <FiEye size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 leading-none">Course Preview</h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Live Representation</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-all text-slate-400 hover:text-slate-900">
                        <FiPlus className="rotate-45" size={24} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-12">
                    {/* Hero Section Preview */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-12 space-y-6">
                            <div className="flex flex-wrap gap-2">
                                {data.category_id?.map((cat: any) => (
                                    <span key={cat.value} className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-extrabold rounded-full uppercase tracking-tight">{cat.label}</span>
                                ))}
                                <span className="px-4 py-1.5 bg-orange-50 text-orange-600 text-[10px] font-extrabold rounded-full uppercase tracking-tight">
                                    {LEVEL_OPTIONS.find((l: any) => l.value === data.level)?.label || 'All Levels'}
                                </span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight">{data.name || 'Untitled Course'}</h1>
                            <div className="flex flex-wrap items-center gap-8 text-slate-500 text-sm font-bold uppercase tracking-wide">
                                <span className="flex items-center gap-2.5"><FiUpload className="text-indigo-500" size={18} /> {data.duration || 'Not specified'}</span>
                                <span className="flex items-center gap-2.5 font-black text-slate-900">INR {data.price || '0.00'}</span>
                                {Number(data.discount) > 0 && (
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg">-{data.discount}% OFF</span>
                                )}
                            </div>
                        </div>

                        {/* Image & Key Info */}
                        <div className="lg:col-span-8">
                            <div className="aspect-video w-full rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xl relative group">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Course" className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                        <FiImage size={64} className="mb-4 animate-pulse" />
                                        <span className="font-black uppercase tracking-widest text-xs">Awaiting Thumbnail</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                            </div>
                        </div>

                        <div className="lg:col-span-4 space-y-6">
                            <div className="p-8 bg-slate-900 text-white rounded-3xl shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <FiAlertCircle size={80} />
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-6">Course Highlights</h3>
                                <ul className="space-y-4">
                                    {data.feature_json?.filter((f: any) => f.value).map((feature: any, i: number) => (
                                        <li key={i} className="flex items-start gap-3 text-sm font-medium text-slate-300 group">
                                            <div className="mt-1.5 flex-shrink-0 w-2 h-2 rounded-full bg-indigo-500 group-hover:scale-125 transition-transform"></div>
                                            {feature.value}
                                        </li>
                                    ))}
                                    {(!data.feature_json || data.feature_json.filter((f: any) => f.value).length === 0) && (
                                        <li className="text-slate-500 italic text-xs">No highlights added yet</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Content Sections */}
                    <div className="space-y-16">
                        <section className="bg-slate-50 p-8 lg:p-10 rounded-[40px] border border-slate-100">
                            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <span className="w-8 h-1 bg-indigo-600 rounded-full"></span>
                                Short Description
                            </h3>
                            <div className="prose prose-indigo max-w-none text-slate-600 font-medium leading-relaxed lexical-preview"
                                dangerouslySetInnerHTML={{ __html: data.short_description }} />
                        </section>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <section>
                                <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3 uppercase tracking-tight text-sm">
                                    <FiPlus className="text-indigo-600" />
                                    Learning Objectives
                                </h3>
                                <div className="space-y-4">
                                    {data.objectives_summary?.filter((o: any) => o.value).map((obj: any, i: number) => (
                                        <div key={i} className="flex items-start gap-4 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                            <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <FiPlus className="text-green-600" size={14} />
                                            </div>
                                            <span className="text-sm font-semibold text-slate-700">{obj.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3 uppercase tracking-tight text-sm">
                                    <FiAlertCircle className="text-indigo-600" />
                                    Requirements
                                </h3>
                                <div className="prose prose-indigo max-w-none text-slate-600 font-medium leading-relaxed bg-slate-50 p-6 rounded-2xl border-l-4 border-indigo-500"
                                    dangerouslySetInnerHTML={{ __html: data.requirements }} />
                            </section>
                        </div>

                        <section>
                            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-4">
                                Full Course Description
                            </h3>
                            <div className="prose prose-lg prose-indigo max-w-none text-slate-600 font-medium leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: data.description }} />
                        </section>
                    </div>

                    {/* Tags */}
                    <div className="pt-10 border-t flex flex-wrap items-center gap-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Industry Tags:</h4>
                        <div className="flex flex-wrap gap-2">
                            {data.tags?.map((tag: any) => (
                                <span key={tag.value} className="px-4 py-1.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-xl border border-slate-200">{tag.label}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="px-12 py-6 bg-slate-50 border-t flex justify-end items-center gap-6">
                    <p className="text-xs font-bold text-slate-400 uppercase">This is a layout preview and may differ slightly on frontend.</p>
                    <button onClick={onClose} className="px-10 py-3.5 bg-slate-900 text-white rounded-2xl text-sm font-black shadow-xl hover:bg-slate-800 transition-all transform hover:-translate-y-0.5">
                        Got it, Back to Edit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CourseForm;