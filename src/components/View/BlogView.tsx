import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { Calendar, User, FileText, Tag, Globe, Clock, Image as ImageIcon } from 'lucide-react';
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
                toast.error(err?.message || "Failed to load blog info");
            } finally {
                setLoading(false);
            }
        };
        getBlog();
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!blog) {
        return <div className="p-6 text-center text-gray-500">No blog data found.</div>;
    }

    return (
        <div className="flex flex-col w-full max-h-[85vh] overflow-y-auto bg-gray-50/30 custom-scrollbar relative animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Banner */}
            <div className="relative w-full h-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 shrink-0 overflow-hidden rounded-t-2xl md:rounded-2xl md:mt-2 md:mx-2 md:w-auto">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl text-white shadow-sm border border-white/20">
                            <FileText size={22} className="text-white" />
                        </div>
                        <span className="text-white/90 text-xs font-bold uppercase tracking-widest">Blog Post Details</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-6 px-6 py-8 -mt-6 relative z-10">
                {/* Title & Status */}
                <div className="flex flex-col gap-4 bg-white p-6 rounded-2xl shadow-xl shadow-indigo-100/20 border border-gray-200">
                    <div className="flex items-start justify-between gap-4">
                        <h1 className="text-xl font-black text-gray-900 leading-tight">
                            {blog.title}
                        </h1>
                        <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border ${blog.status ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                            {blog.status ? 'Active' : 'Inactive'}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-2">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <User size={14} className="text-indigo-500" />
                            <span className="font-semibold text-gray-800">{blog.created_by || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Tag size={14} className="text-purple-500" />
                            <span className="font-medium text-gray-800">{blog.category?.title || blog.category_title || '-'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Calendar size={14} className="text-orange-400" />
                            <span className="font-medium">Live Date: {blog.live_date ? moment(blog.live_date).format('MMM DD, YYYY') : '-'}</span>
                        </div>
                        {blog.reading_time && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                <Clock size={14} className="text-blue-400" />
                                <span className="font-medium">{blog.reading_time}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Featured Image & SEO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Featured Image */}
                    <div className="flex flex-col gap-2">
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2">Featured Image</h2>
                        <div className="flex flex-col bg-white p-4 rounded-2xl border border-gray-200 shadow-sm h-full">
                            {blog.image ? (
                                <img src={blog.image} alt={blog.img_alt_tag || 'Blog Image'} className="w-full h-40 object-cover rounded-xl border border-gray-100" />
                            ) : (
                                <div className="w-full h-40 bg-gray-50 flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 text-gray-400">
                                    <ImageIcon size={32} className="mb-2 opacity-50" />
                                    <span className="text-sm font-medium">No Image Uploaded</span>
                                </div>
                            )}
                            {blog.img_alt_tag && (
                                <div className="mt-3 text-xs text-gray-500 flex justify-center">
                                    <span className="font-semibold mr-1">Alt Tag:</span> {blog.img_alt_tag}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SEO Information */}
                    <div className="flex flex-col gap-2">
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2">SEO & Metadata</h2>
                        <div className="flex flex-col gap-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm h-full">
                            <div className="flex items-center gap-3 border-b border-gray-50 pb-3">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <Globe size={16} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Meta Title</span>
                                    <span className="font-semibold text-gray-800 text-sm">{blog.meta_title || '-'}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1 border-b border-gray-50 pb-3">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Meta Description</span>
                                <p className="text-xs text-gray-600 line-clamp-2">{blog.meta_description || '-'}</p>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Meta Keys</span>
                                <div className="flex flex-wrap gap-1">
                                    {blog.meta_keys ? blog.meta_keys.split(',').map((key: string, idx: number) => (
                                        <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]">{key.trim()}</span>
                                    )) : '-'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="flex flex-col gap-2">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2">Additional Info</h2>
                    <div className="flex flex-col bg-white p-5 rounded-2xl border border-gray-200 shadow-sm gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Canonical URL</span>
                            <a href={blog.canonical_url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-indigo-600 hover:underline break-all">
                                {blog.canonical_url || '-'}
                            </a>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Tags</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {Array.isArray(blog.tags) ? blog.tags.map((tag: any, idx: number) => (
                                    <span key={idx} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-100">{tag.title || tag}</span>
                                )) : blog.tags ? blog.tags.split(',').map((tag: string, idx: number) => (
                                    <span key={idx} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-100">{tag.trim()}</span>
                                )) : '-'}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Description Content</span>
                            <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-700 max-h-40 overflow-y-auto whitespace-pre-wrap">
                                {blog.description || '-'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogView;
