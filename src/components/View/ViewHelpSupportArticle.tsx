import React, { useEffect, useState } from 'react';
import moment from 'moment';
import {
    Loader2,
    AlertCircle,
    FileText,
    CheckCircle,
    XCircle,
    Calendar,
    Tag,
    Folder,
    FolderOpen,
    Link as LinkIcon,
} from 'lucide-react';
import type { supportArticle } from '../../utils/types';
import { useAppDispatch } from '../../hooks/useRedux';
import { viewSupportArticle } from '../../store/slices/supportArticleSlice';

export interface ViewHelpSupportArticleProps {
    id?: number | string;
    articleData?: Partial<supportArticle>;
}

const ViewHelpSupportArticle: React.FC<ViewHelpSupportArticleProps> = ({ id, articleData }) => {
    const dispatch = useAppDispatch();
    const [article, setArticle] = useState<any>(articleData || null);
    const [loading, setLoading] = useState<boolean>(!articleData && !!id);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            setLoading(true);
            setError(null);
            dispatch(viewSupportArticle(id))
                .unwrap()
                .then((res: any) => {
                    setArticle(res);
                })
                .catch((err: any) => {
                    setError(err || 'Failed to fetch article details');
                })
                .finally(() => {
                    setLoading(false);
                });
        } else if (articleData) {
            setArticle(articleData);
        }
    }, [id, articleData, dispatch]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 gap-3 min-h-[220px]">
                <Loader2 size={32} className="animate-spin text-indigo-600" />
                <span className="text-sm font-medium text-gray-500">Loading Article details...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-rose-50 rounded-xl border border-rose-100 text-center gap-2">
                <AlertCircle size={24} className="text-rose-600" />
                <span className="text-sm font-semibold text-rose-700">{error}</span>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="p-8 text-center text-gray-500 text-sm">
                No article data found.
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
                    <p className="text-sm font-semibold text-indigo-800">Help & Support Article</p>
                    <p className="text-xs text-indigo-500 mt-0.5">
                        Viewing complete article details, categorization, and content.
                    </p>
                </div>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-1">
                {/* Title */}
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Tag size={14} /> Article Title
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-900 font-semibold text-sm">
                        {article.title || 'N/A'}
                    </div>
                </div>
                
                {/* Main Topic */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Folder size={14} /> Main Topic
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-semibold text-sm flex items-center justify-between">
                        <span>{article.main_topic?.title || 'N/A'}</span>
                        {article.main_topic?.id && (
                            <span className="text-[10px] font-mono bg-indigo-100/70 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                                #{article.main_topic.id}
                            </span>
                        )}
                    </div>
                </div>
                
                {/* Sub Topic */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <FolderOpen size={14} /> Sub Topic
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-semibold text-sm flex items-center justify-between">
                        <span>{article.sub_topic?.title || 'N/A'}</span>
                        {article.sub_topic?.id && (
                            <span className="text-[10px] font-mono bg-indigo-100/70 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                                #{article.sub_topic.id}
                            </span>
                        )}
                    </div>
                </div>

                {/* Slug */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <LinkIcon size={14} /> Slug / URL Path
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-indigo-700 font-mono text-sm">
                        {article.slug || 'N/A'}
                    </div>
                </div>

                {/* Status */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        Status
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2">
                        {article.status ? (
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

                {/* Created On */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Calendar size={14} /> Created On
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm">
                        {article.created_at ? moment(article.created_at).format('MMM DD, YYYY hh:mm A') : 'N/A'}
                    </div>
                </div>
                
                {/* Article ID */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Tag size={14} /> Article ID
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 font-mono text-sm">
                        #{article.id || 'N/A'}
                    </div>
                </div>

                {/* Content (Full Width) */}
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <FileText size={14} /> Article Content
                    </label>
                    <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 text-sm leading-relaxed max-w-none break-words">
                        {article.description ? (
                            <div
                                className="prose prose-sm max-w-none text-gray-800"
                                dangerouslySetInnerHTML={{ __html: article.description }}
                            />
                        ) : (
                            <span className="text-gray-400 italic">No content provided.</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewHelpSupportArticle;
