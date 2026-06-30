import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addBlog, editBlog } from '../../store/slices/blogSlice';
import { fetchBlogCategoryApi, fetchBlogPostDetailApi } from '../../services/apiServices';
import toast from 'react-hot-toast';
import { CropperModal } from "../ImageCropper/components/CropperModal";
import type { CropResult } from "../ImageCropper/utils/cropCanvas";
import { ArrowLeft, FileText, Image as ImageIcon, Globe, Save } from 'lucide-react';
import type { BlogCategory } from '../../utils/types';

type BlogFormValues = {
  title: string;
  description: string;
  image: File | null;
  category_id: string;
  canonical_url: string;
  schema_markup: string;
  reading_time: string;
  tags: string;
  meta_title: string;
  meta_description: string;
  meta_keys: string;
  img_alt_tag: string;
  live_date: string;
  created_by: string;
};

const BlogForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<BlogCategory[]>([]);

  // Cropper states
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [originalImageFormat, setOriginalImageFormat] = useState<'image/png' | 'image/jpeg'>('image/png');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<BlogFormValues>({
    defaultValues: {
      title: '',
      description: '',
      image: null,
      category_id: '',
      canonical_url: '',
      schema_markup: '',
      reading_time: '',
      tags: '',
      meta_title: '',
      meta_description: '',
      meta_keys: '',
      img_alt_tag: '',
      live_date: new Date().toISOString().split('T')[0],
      created_by: 'KCGlobEd',
    },
  });

  // Fetch categories & blog details (if edit mode)
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        // Fetch categories list
        const catRes = await fetchBlogCategoryApi(1, "", "", "", "", "active");
        if (catRes?.data) {
          setCategories(catRes.data);
        }

        // Fetch blog details if ID is present
        if (id) {
          const blogRes = await fetchBlogPostDetailApi(id);
          const blog = blogRes?.data || blogRes;
          if (blog) {
            reset({
              title: blog.title || '',
              description: blog.description || '',
              category_id: blog.category_id?.toString() || blog.category?.toString() || '',
              canonical_url: blog.canonical_url || '',
              schema_markup: blog.schema_markup || '',
              reading_time: blog.reading_time || '',
              tags: Array.isArray(blog.tags)
                ? blog.tags.join(", ")
                : (blog.tags || ""),
              meta_title: blog.meta_title || '',
              meta_description: blog.meta_description || '',
              meta_keys: blog.meta_keys || '',
              img_alt_tag: blog.img_alt_tag || '',
              live_date: blog.live_date || new Date().toISOString().split('T')[0],
              created_by: blog.created_by || 'KCGlobEd',
              image: null,
            });
            if (blog.image) {
              setPreviewUrl(blog.image);
            }
          }
        }
      } catch (err: any) {
        console.error('Failed to initialize blog form data:', err);
        toast.error('Failed to load blog data');
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, [id, reset]);

  // Programmatically register the image field for validation
  useEffect(() => {
    register("image", {
      validate: (value) => {
        if (id) return true; // Image not required when editing
        if (value) return true;
        return "Image is required";
      }
    });
  }, [register, id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isJpeg = file.type === 'image/jpeg' || file.type === 'image/jpg';
      setOriginalImageFormat(isJpeg ? 'image/jpeg' : 'image/png');

      const r = new FileReader();
      r.onloadend = () => {
        setRawImageSrc(r.result as string);
        setIsCropperOpen(true);
      };
      r.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const handleCropComplete = (result: CropResult) => {
    setValue("image", result.file, { shouldValidate: true });
    setPreviewUrl(result.dataUrl);
  };

  const onSubmit = async (data: BlogFormValues) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title.trim());
      formData.append('description', data.description.trim());
      formData.append('category_id', data.category_id);
      formData.append('canonical_url', (data.canonical_url || '').trim());
      formData.append('schema_markup', (data.schema_markup || '').trim());
      formData.append('reading_time', (data.reading_time || '').trim());
      formData.append('tags', (data.tags || '').trim());
      formData.append('meta_title', (data.meta_title || '').trim());
      formData.append('meta_description', (data.meta_description || '').trim());
      formData.append('meta_keys', (data.meta_keys || '').trim());
      formData.append('img_alt_tag', (data.img_alt_tag || '').trim());
      formData.append('live_date', data.live_date);
      formData.append('created_by', (data.created_by || '').trim());

      if (data.image instanceof File) {
        formData.append('image', data.image);
      }

      if (id) {
        await dispatch(editBlog({ id, blogData: formData })).unwrap();
        toast.success("Blog updated successfully");
      } else {
        await dispatch(addBlog(formData)).unwrap();
        toast.success("Blog created successfully");
      }
      navigate('/dashboard/blog');
    } catch (err: any) {
      console.error("Blog submission failed:", err);

      const errorMsg = err?.response?.data?.message;
      let displayMsg = "Failed to save blog post";
      if (typeof errorMsg === 'string') {
        displayMsg = errorMsg;
      } else if (errorMsg && typeof errorMsg === 'object') {
        // If it's an object of validation errors (e.g., Laravel), get the first error
        const firstKey = Object.keys(errorMsg)[0];
        if (firstKey && Array.isArray(errorMsg[firstKey])) {
          displayMsg = errorMsg[firstKey][0];
        } else {
          displayMsg = JSON.stringify(errorMsg);
        }
      } else if (err?.message) {
        displayMsg = err.message;
      }

      toast.error(displayMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard/blog')}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{id ? 'Edit Blog Post' : 'Add Blog Post'}</h1>
            <p className="text-sm text-gray-500">Create, optimize, and publish your latest articles.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Article Content Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                <FileText className="text-indigo-600" size={20} />
                <h2 className="text-lg font-bold text-gray-800">Article Details</h2>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('title', {
                    required: 'Title is required',
                    minLength: { value: 3, message: 'Title must be at least 3 characters' },
                    validate: value => value.trim().length > 0 || 'Title cannot be empty or only spaces'
                  })}
                  className="w-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 px-4 py-2.5 rounded-xl text-gray-800 placeholder-gray-400"
                  placeholder="Enter blog post title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register('description', {
                    required: 'Description is required',
                    minLength: { value: 10, message: 'Description must be at least 10 characters' },
                    validate: value => value.trim().length > 0 || 'Description cannot be empty'
                  })}
                  rows={8}
                  className="w-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 px-4 py-3 rounded-xl text-gray-800 placeholder-gray-400 font-sans"
                  placeholder="Write your blog post content here..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>
            </div>

            {/* Media Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                <ImageIcon className="text-indigo-600" size={20} />
                <h2 className="text-lg font-bold text-gray-800">Featured Image</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Upload Image <span className="text-red-500">{id ? '' : '*'}</span>
                  </label>
                  <div className="relative border-2 border-dashed border-gray-200 hover:border-indigo-500 transition rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-gray-50 h-32">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <ImageIcon className="text-gray-400 mb-2" size={24} />
                    <span className="text-xs font-medium text-indigo-600">Browse Image</span>
                  </div>
                  {errors.image && (
                    <p className="mt-2 text-sm text-red-600">{errors.image.message as string}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Preview</label>
                  {previewUrl ? (
                    <div className="h-32 rounded-xl border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center">
                      <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-32 rounded-xl border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400 text-xs font-medium">
                      No image selected
                    </div>
                  )}
                </div>
              </div>

              {/* Alt Tag */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Image Alt Tag
                </label>
                <input
                  type="text"
                  {...register('img_alt_tag')}
                  className="w-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 px-4 py-2.5 rounded-xl text-gray-800 placeholder-gray-400"
                  placeholder="Alt tag for screen readers & SEO"
                />
              </div>
            </div>

            {/* SEO & Metadata Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                <Globe className="text-indigo-600" size={20} />
                <h2 className="text-lg font-bold text-gray-800">SEO & Metadata</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    {...register('meta_title')}
                    className="w-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 px-4 py-2.5 rounded-xl text-gray-800 placeholder-gray-400"
                    placeholder="Enter meta title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Meta Keys
                  </label>
                  <input
                    type="text"
                    {...register('meta_keys')}
                    className="w-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 px-4 py-2.5 rounded-xl text-gray-800 placeholder-gray-400"
                    placeholder="Keywords (comma-separated)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Meta Description
                </label>
                <textarea
                  {...register('meta_description')}
                  rows={3}
                  className="w-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 px-4 py-2.5 rounded-xl text-gray-800 placeholder-gray-400"
                  placeholder="Write a brief meta description for search engines..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Canonical URL
                </label>
                <input
                  type="url"
                  {...register('canonical_url')}
                  className="w-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 px-4 py-2.5 rounded-xl text-gray-800 placeholder-gray-400"
                  placeholder="https://example.com/blog/my-post"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Schema Markup
                </label>
                <textarea
                  {...register('schema_markup')}
                  rows={4}
                  className="w-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 px-4 py-2.5 rounded-xl text-gray-800 placeholder-gray-400 font-mono text-xs"
                  placeholder='{"@context": "https://schema.org", "@type": "BlogPosting", ...}'
                />
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8 col-span-1">
            {/* Publish Actions Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
              <h3 className="text-md font-bold text-gray-800 pb-3 border-b border-gray-100">Publish Info</h3>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('category_id', { required: 'Please select a category' })}
                  className="w-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 px-4 py-2.5 rounded-xl text-gray-800 bg-white cursor-pointer"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.title}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.category_id.message}</p>
                )}
              </div>

              {/* Live Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Live Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register('live_date', { required: 'Live date is required' })}
                  className="w-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 px-4 py-2.5 rounded-xl text-gray-800"
                />
                {errors.live_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.live_date.message}</p>
                )}
              </div>

              {/* Created By */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Author <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('created_by', { required: 'Author name is required' })}
                  className="w-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 px-4 py-2.5 rounded-xl text-gray-800"
                  placeholder="Author name"
                />
                {errors.created_by && (
                  <p className="mt-1 text-sm text-red-600">{errors.created_by.message}</p>
                )}
              </div>

              {/* Reading Time */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Reading Time
                </label>
                <input
                  type="text"
                  {...register('reading_time')}
                  className="w-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 px-4 py-2.5 rounded-xl text-gray-800"
                  placeholder="e.g., 5 mins"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  {...register('tags')}
                  className="w-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 px-4 py-2.5 rounded-xl text-gray-800"
                  placeholder="e.g. tech, coding"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-100 transition active:scale-95 duration-200 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Save size={18} />
                    {id ? 'Update Blog Post' : 'Publish Blog Post'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      <CropperModal
        imageSrc={rawImageSrc}
        isOpen={isCropperOpen}
        onClose={() => setIsCropperOpen(false)}
        onCropComplete={handleCropComplete}
        initialFormat={originalImageFormat}
      />
    </div>
  );
};

export default BlogForm;