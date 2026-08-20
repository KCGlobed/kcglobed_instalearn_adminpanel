import { useEffect, useState } from 'react';
import { getCommunityPostDetailApi } from '../../services/apiServices';
import { Globe2, Loader2, Calendar, FileText, CheckCircle, XCircle, Grid, MessageSquare, Heart, Eye, Link2 } from 'lucide-react';
import moment from 'moment';
import toast from 'react-hot-toast';

interface Props {
    postId: number | string;
}

const CommunityPostViewModal = ({ postId }: Props) => {
    const [loading, setLoading] = useState(true);
    const [postData, setPostData] = useState<any>(null);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                setLoading(true);
                const res = await getCommunityPostDetailApi(postId);
                if (res.data) {
                    setPostData(res.data);
                } else {
                    setPostData(res);
                }
            } catch (err: any) {
                console.error("Failed to fetch post details", err);
                toast.error(err?.message || "Failed to fetch post details");
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [postId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-10 h-64 gap-3">
                <Loader2 size={32} className="animate-spin text-indigo-600" />
                <p className="text-sm font-medium text-gray-500">Loading post details...</p>
            </div>
        );
    }

    if (!postData) {
        return (
            <div className="p-8 text-center text-gray-500">
                Failed to load post data.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header info */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                <span className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <Globe2 size={18} />
                </span>
                <div>
                    <p className="text-sm font-semibold text-indigo-800">Community Post Details</p>
                    <p className="text-xs text-indigo-500 mt-0.5">Viewing detailed information for this post.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-1">
                {/* Title and Slug */}
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <FileText size={14} /> Title
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-1">
                        <span className="text-gray-800 font-semibold text-base">{postData.title || "N/A"}</span>
                        {postData.slug && (
                            <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                                <Link2 size={12} /> /{postData.slug}
                            </span>
                        )}
                    </div>
                </div>

                {/* Category */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Grid size={14} /> Category
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm font-medium flex items-center gap-3">
                        {postData.category?.image && (
                            <img src={postData.category.image} alt={postData.category?.title} className="w-8 h-8 rounded-lg object-cover bg-white p-0.5 border" />
                        )}
                        <span>{postData.category?.title || postData.category?.name || "Uncategorized"}</span>
                    </div>
                </div>

                {/* Status */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        Status
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2">
                        {postData.status ? (
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

                {/* Engagement Stats */}
                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                            <Eye size={14} /> Views
                        </label>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm font-semibold">
                            {postData.total_views || 0}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                            <Heart size={14} /> Likes
                        </label>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm font-semibold">
                            {postData.total_likes || 0}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                            <MessageSquare size={14} /> Comments
                        </label>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm font-semibold">
                            {postData.total_comments || 0}
                        </div>
                    </div>
                </div>

                {/* Dates */}
                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                            <Calendar size={14} /> Created At
                        </label>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm">
                            {postData.created_at ? moment(postData.created_at).format('MMM DD, YYYY hh:mm A') : '-'}
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <FileText size={14} /> Description
                    </label>
                    <div
                        className="p-5 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm max-w-none break-words overflow-x-auto"
                        dangerouslySetInnerHTML={{ __html: postData.description || "No description provided." }}
                    />
                </div>
            </div>
        </div>
    );
};

export default CommunityPostViewModal;
