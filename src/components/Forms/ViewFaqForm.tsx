import React, { useEffect, useState } from 'react';
import moment from 'moment';
import {
    HelpCircle,
    Calendar,
    CheckCircle,
    XCircle,
    FileText,
    Folder,
    Tag,
    Layers,
    Loader2,
    AlertCircle,
} from 'lucide-react';
import { viewFaqApi } from '../../services/apiServices';
import type { Faq } from '../../utils/types';

export interface ViewFaqFormProps {
    id?: number | string;
    faqId?: number | string;
    faqData?: Partial<Faq> & {
        faq_topic?: {
            id?: number;
            title?: string;
            description?: string;
            status?: boolean;
            created_at?: string;
        };
    };
}

const ViewFaqForm: React.FC<ViewFaqFormProps> = ({ id, faqId, faqData }) => {
    const activeId = id ?? faqId;
    const [faq, setFaq] = useState<any>(faqData || null);
    const [loading, setLoading] = useState<boolean>(!faqData && !!activeId);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (activeId) {
            setLoading(true);
            setError(null);
            viewFaqApi(activeId)
                .then((res: any) => {
                    const responseData = res?.data ? res.data : res;
                    setFaq(responseData);
                })
                .catch((err: any) => {
                    setError(err?.message || 'Failed to fetch FAQ details');
                })
                .finally(() => {
                    setLoading(false);
                });
        } else if (faqData) {
            setFaq(faqData);
        }
    }, [activeId, faqData]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 gap-3 min-h-[220px]">
                <Loader2 size={32} className="animate-spin text-indigo-600" />
                <span className="text-sm font-medium text-gray-500">Loading FAQ details...</span>
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

    if (!faq) {
        return (
            <div className="p-8 text-center text-gray-500 text-sm">
                No FAQ data found.
            </div>
        );
    }

    const topic = faq.faq_topic;

    return (
        <div className="flex flex-col gap-6">
            {/* Top Notice Card */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                <span className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <HelpCircle size={18} />
                </span>
                <div>
                    <p className="text-sm font-semibold text-indigo-800">FAQ Details</p>
                    <p className="text-xs text-indigo-500 mt-0.5">
                        Viewing complete question details, topic categorization, and answer description.
                    </p>
                </div>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-1">
                {/* FAQ Title / Question */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <HelpCircle size={14} /> FAQ Title / Question
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-900 font-semibold text-sm">
                        {faq.title || 'N/A'}
                    </div>
                </div>

                {/* FAQ Topic */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Folder size={14} /> Parent FAQ Topic
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-semibold text-sm flex items-center justify-between">
                        <span>{topic?.title || 'General'}</span>
                        {topic?.id && (
                            <span className="text-[10px] font-mono bg-indigo-100/70 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                                Topic #{topic.id}
                            </span>
                        )}
                    </div>
                </div>

                {/* Status */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        Status
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2">
                        {faq.status ? (
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

                {/* FAQ Identifier */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Tag size={14} /> FAQ Identifier
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-indigo-700 font-mono text-sm font-semibold">
                        #{faq.id || 'N/A'}
                    </div>
                </div>

                {/* Created On */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Calendar size={14} /> Created On
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm">
                        {faq.created_at ? moment(faq.created_at).format('MMM DD, YYYY hh:mm A') : 'N/A'}
                    </div>
                </div>

                {/* Topic Information Card (Full Width - if topic details exist) */}
                {topic && (topic.description || topic.created_at) && (
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                            <Layers size={14} /> Topic Information
                        </label>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-gray-800 text-sm">{topic.title}</span>
                                {topic.status !== undefined && (
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${topic.status ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                                        {topic.status ? 'Active Topic' : 'Inactive Topic'}
                                    </span>
                                )}
                            </div>
                            {topic.description && (
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    {topic.description}
                                </p>
                            )}
                            {topic.created_at && (
                                <span className="text-[11px] text-gray-400 font-medium">
                                    Topic Created: {moment(topic.created_at).format('MMM DD, YYYY')}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* FAQ Answer / Description (Full Width) */}
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <FileText size={14} /> FAQ Description / Answer
                    </label>
                    <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 text-sm leading-relaxed max-w-none break-words">
                        {faq.description ? (
                            <div
                                className="prose prose-sm max-w-none text-gray-800"
                                dangerouslySetInnerHTML={{ __html: faq.description }}
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

export default ViewFaqForm;
