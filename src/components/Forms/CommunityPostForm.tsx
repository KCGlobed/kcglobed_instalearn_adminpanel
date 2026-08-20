import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useModal } from '../../context/ModalContext';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addCommunityPost, editCommunityPost, getCommunityPosts } from '../../store/slices/communityPostSlice';
import { fetchCommunityCategoryList } from '../../services/apiServices';
import toast from 'react-hot-toast';
import { Globe2, Loader2, AlertCircle } from 'lucide-react';
import LexicalEditor from '../TextEditor';

const stripHtml = (html?: string) => (html || '').replace(/<[^>]*>?/gm, '').trim();

const schema = yup.object().shape({
    title: yup.string().required("Title is mandatory")
        .min(2, "Title must be at least 2 characters")
        .test("not-empty", "Title cannot be empty or only spaces", value => value.trim().length > 0),
    description: yup
        .string()
        .test("required", "Description is mandatory", (value) => stripHtml(value).length > 0)
        .test("min", "Description must be at least 10 characters", (value) => {
            const text = stripHtml(value);
            return text.length === 0 || text.length >= 10;
        })
        .required("Description is mandatory"),
    category: yup.number().typeError("Category is required").required("Category is mandatory").positive("Please select a valid category"),
});

type FormData = yup.InferType<typeof schema>;

type Props = {
    postData?: {
        id: number;
        title: string;
        description: string;
        category: { id: number };
    };
};

const CommunityPostForm = ({ postData }: Props) => {
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [fetchingCategories, setFetchingCategories] = useState(false);
    const dispatch = useAppDispatch();
    const { hideModal } = useModal();

    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            title: "",
            description: "",
            category: 0,
        },
    });

    useEffect(() => {
        const loadCategories = async () => {
            try {
                setFetchingCategories(true);
                const res = await fetchCommunityCategoryList();
                if (res.data) {
                    setCategories(res.data);
                }
            } catch (err) {
                console.error("Failed to load categories", err);
                toast.error("Failed to load categories for dropdown");
            } finally {
                setFetchingCategories(false);
            }
        };
        loadCategories();
    }, []);

    useEffect(() => {
        if (postData) {
            setValue("title", postData.title || "");
            setValue("description", postData.description || "");
            setValue("category", postData.category?.id || 0);
        }
    }, [postData, setValue]);

    const onSubmit = async (data: FormData) => {
        try {
            setSaving(true);
            const payload = {
                title: data.title.trim(),
                description: data.description.trim(),
                category: data.category
            };

            if (postData?.id) {
                await dispatch(editCommunityPost({ id: postData.id, postData: payload })).unwrap();
                toast.success("Community Post updated successfully");
            } else {
                await dispatch(addCommunityPost(payload)).unwrap();
                toast.success("Community Post added successfully");
            }
            dispatch(getCommunityPosts({}));

            hideModal();
        } catch (err: any) {
            console.error('Community Post submission failed:', err);
            toast.error(err || "Failed to save post");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="relative">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                {/* Header info */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                    <span className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                        <Globe2 size={18} />
                    </span>
                    <div>
                        <p className="text-sm font-semibold text-indigo-800">{postData ? 'Edit Community Post' : 'Add Community Post'}</p>
                        <p className="text-xs text-indigo-500 mt-0.5">{postData ? 'Update details of the post.' : 'Create a new community post.'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5">
                    {/* Title */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="title"
                            control={control}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    type="text"
                                    placeholder="e.g. Tips and Tricks"
                                    disabled={saving}
                                    className={`w-full px-4 py-3 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all ${
                                        errors.title
                                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30'
                                            : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-300'
                                        }`}
                                />
                            )}
                        />
                        {errors.title && (
                            <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                                <AlertCircle size={13} /> {errors.title.message}
                            </p>
                        )}
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="category"
                            control={control}
                            render={({ field }) => (
                                <select
                                    {...field}
                                    disabled={saving || fetchingCategories}
                                    className={`w-full px-4 py-3 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all ${
                                        errors.category
                                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30'
                                            : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-300'
                                        }`}
                                >
                                    <option value={0} disabled>
                                        {fetchingCategories ? "Loading categories..." : "Select a category"}
                                    </option>
                                    {categories.map((cat: any) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.title}
                                        </option>
                                    ))}
                                </select>
                            )}
                        />
                        {errors.category && (
                            <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                                <AlertCircle size={13} /> {errors.category.message}
                            </p>
                        )}
                    </div>

                    {/* Description (Lexical Editor) */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field: { value, onChange } }) => (
                                <div className={`rounded-xl overflow-hidden border transition-all ${
                                    errors.description
                                        ? 'border-red-400 focus-within:ring-4 focus-within:ring-red-500/20 bg-red-50/30'
                                        : 'border-gray-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/20 hover:border-gray-300'
                                    }`}>
                                    <LexicalEditor
                                        type="description"
                                        value={value || ""}
                                        onChange={onChange}
                                        placeholder="Enter post description..."
                                    />
                                </div>
                            )}
                        />
                        {errors.description && (
                            <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                                <AlertCircle size={13} /> {errors.description.message}
                            </p>
                        )}
                    </div>

                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={hideModal}
                        disabled={saving}
                        className="px-5 py-2 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm flex items-center gap-2"
                    >
                        {saving && <Loader2 size={14} className="animate-spin" />}
                        {saving ? 'Saving...' : (postData ? 'Update Post' : 'Add Post')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CommunityPostForm;
