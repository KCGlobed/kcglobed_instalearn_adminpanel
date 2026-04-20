import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { FiPlus, FiTrash2, FiChevronLeft, FiImage, FiUpload, FiAlertCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Select from "react-select";
import LexicalEditor from "../../components/TextEditor";
import {
    createCourseApi,
    fetchSubCategoryOptionsApi,
    fetchTagOptionsApi
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

const CreateCourseForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [tagOptions, setTagOptions] = useState<any[]>([]);
    const [categoryOptions, setCategoryOptions] = useState<any[]>([]);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

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

            if (data.image) {
                formData.append("image", data.image);
            }

            await createCourseApi(formData);
            toast.success("Course Created Successfully");
            navigate("/dashboard/course");
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

    return (
        <div className="w-full py-10 px-10 bg-white border border-slate-100 rounded-2xl shadow-sm my-6">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between border-b pb-6">
                <div>
                    <button onClick={() => navigate("/dashboard/course")} className="flex items-center text-xs font-bold text-slate-400 hover:text-indigo-600 transition-all mb-2 uppercase">
                        <FiChevronLeft className="mr-1" /> Back to Dashboard
                    </button>
                    <h1 className="text-xl font-bold text-slate-900 uppercase">Add New Course</h1>
                </div>
                <button onClick={handleSubmit(onSubmit)} disabled={loading} className="px-10 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50">
                    {loading ? "Saving..." : "Save Course"}
                </button>
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
            </form>
        </div>
    );
};

export default CreateCourseForm;