import React, { useEffect, useState } from 'react';
import moment from 'moment';
import {
    Calendar,
    User,
    FileText,
    Tag,
    Globe,
    Clock,
    Image as ImageIcon,
    Loader2,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import { fetchBlogPostDetailApi } from '../../services/apiServices';
import toast from 'react-hot-toast';

interface BlogViewProps {
    id: string | number;
}

const BlogView: React.FC<BlogViewProps> = ({ id }) => {
    const [blog, setBlog] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getBlog = async () => {
            try {
                const res = await fetchBlogPostDetailApi(id);
                setBlog(res?.data || res);
            } catch (err: any) {
                toast.error(err?.message || 'Failed to load blog info');
            } finally {
                setLoading(false);
            }
        };
        getBlog();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-10 h-64 gap-3">
                <Loader2 size={32} className="animate-spin text-indigo-600" />
                <p className="text-sm font-medium text-gray-500">Loading blog details...</p>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="p-8 text-center text-gray-500 text-sm">
                No blog data found.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Top Notice Card */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                <span className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <FileText size={18} />
                </span>
                <div>
                    <p className="text-sm font-semibold text-indigo-800">Blog Post Details</p>
                    <p className="text-xs text-indigo-500 mt-0.5">Viewing detailed information for this blog post.</p>
                </div>
            </div>

            {/* Grid Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-1">
                {/* Title */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <FileText size={14} /> Blog Title
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-semibold text-sm">
                        {blog.title || 'N/A'}
                    </div>
                </div>

                {/* Category */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Tag size={14} /> Category
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-semibold text-sm">
                        {blog.category_info?.title ||
                            blog.category_info?.name ||
                            blog.category?.title ||
                            blog.category?.name ||
                            blog.category_title ||
                            blog.category_name ||
                            'N/A'}
                    </div>
                </div>

                {/* Author / Created By */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <User size={14} /> Author / Created By
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-medium text-sm">
                        {blog.created_by || 'Unknown'}
                    </div>
                </div>

                {/* Status */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        Status
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2">
                        {blog.status ? (
                            <span className="flex items-center gap-1.5 text-green-700 font-semibold text-sm bg-green-100 px-3 py-1 rounded-full border border-green-200">
                                <CheckCircle size={14} /> Active
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 text-red-700 font-semibold text-sm bg-red-100 px-3 py-1 rounded-full border border-red-200">
                                <XCircle size={14} /> Inactive
                            </span>
                        )}
                    </div>
                </div>

                {/* Live Date */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Calendar size={14} /> Live Date
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm font-medium">
                        {blog.live_date ? moment(blog.live_date).format('MMM DD, YYYY') : 'N/A'}
                    </div>
                </div>

                {/* Reading Time */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Clock size={14} /> Reading Time
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm font-medium">
                        {blog.reading_time || 'N/A'}
                    </div>
                </div>

                {/* Created On */}
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Calendar size={14} /> Created On
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm">
                        {blog.created_at ? moment(blog.created_at).format('MMM DD, YYYY hh:mm A') : 'N/A'}
                    </div>
                </div>

                {/* Canonical URL */}
                {blog.canonical_url && (
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                            <Globe size={14} /> Canonical URL
                        </label>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-indigo-600 text-sm font-medium break-all">
                            <a href={blog.canonical_url} target="_blank" rel="noreferrer" className="hover:underline">
                                {blog.canonical_url}
                            </a>
                        </div>
                    </div>
                )}

                {/* Tags */}
                {blog.tags && (
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                            <Tag size={14} /> Tags
                        </label>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-wrap gap-2">
                            {Array.isArray(blog.tags)
                                ? blog.tags.map((tag: any, idx: number) => (
                                      <span
                                          key={idx}
                                          className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium border border-indigo-100"
                                      >
                                          {tag.title || tag}
                                      </span>
                                  ))
                                : typeof blog.tags === 'string'
                                ? blog.tags.split(',').map((tag: string, idx: number) => (
                                      <span
                                          key={idx}
                                          className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium border border-indigo-100"
                                      >
                                          {tag.trim()}
                                      </span>
                                  ))
                                : null}
                        </div>
                    </div>
                )}

                {/* Featured Image & SEO Metadata */}
                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Featured Image */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                            <ImageIcon size={14} /> Featured Image
                        </label>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center justify-center min-h-[160px]">
                            {blog.image ? (
                                <div className="flex flex-col items-center gap-2 w-full">
                                    <img
                                        src={blog.image}
                                        alt={blog.img_alt_tag || 'Featured Image'}
                                        className="w-full max-h-48 object-cover rounded-lg border border-gray-200"
                                    />
                                    {blog.img_alt_tag && (
                                        <span className="text-xs text-gray-500">
                                            Alt: <span className="font-medium text-gray-700">{blog.img_alt_tag}</span>
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center text-gray-400 py-6">
                                    <ImageIcon size={28} className="mx-auto mb-1 opacity-50" />
                                    <span className="text-xs">No image uploaded</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SEO Information */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                            <Globe size={14} /> SEO &amp; Metadata
                        </label>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-3 text-xs min-h-[160px]">
                            <div>
                                <span className="font-bold text-gray-500 uppercase text-[10px]">Meta Title</span>
                                <p className="text-gray-800 font-medium mt-0.5">{blog.meta_title || 'N/A'}</p>
                            </div>
                            <div className="border-t border-gray-200/60 pt-2">
                                <span className="font-bold text-gray-500 uppercase text-[10px]">Meta Description</span>
                                <p className="text-gray-700 mt-0.5 line-clamp-3">{blog.meta_description || 'N/A'}</p>
                            </div>
                            {blog.meta_keys && (
                                <div className="border-t border-gray-200/60 pt-2">
                                    <span className="font-bold text-gray-500 uppercase text-[10px]">Meta Keys</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {blog.meta_keys.split(',').map((key: string, idx: number) => (
                                            <span
                                                key={idx}
                                                className="px-2 py-0.5 bg-white text-gray-600 rounded border border-gray-200 text-[10px]"
                                            >
                                                {key.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Description / Content (Full Width) */}
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <FileText size={14} /> Description / Content
                    </label>
                    <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm max-w-none break-words overflow-x-auto leading-relaxed">
                        {blog.description ? (
                            <div
                                className="prose prose-sm max-w-none text-gray-700"
                                dangerouslySetInnerHTML={{ __html: blog.description }}
                            />
                        ) : (
                            <span className="text-gray-400 italic">No description provided.</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogView;
