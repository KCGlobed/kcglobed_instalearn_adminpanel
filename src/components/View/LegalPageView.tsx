import React from 'react';
import moment from 'moment';
import {
    Calendar,
    FileText,
    Globe,
    Key,
    Tag,
    Scale,
    Link2,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import type { LegalPage } from '../../utils/types';

interface LegalPageViewProps {
    page: LegalPage;
}

const LegalPageView: React.FC<LegalPageViewProps> = ({ page }) => {
    if (!page) {
        return (
            <div className="p-8 text-center text-gray-500 text-sm">
                No legal page data found.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Top Notice Card */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                <span className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <Scale size={18} />
                </span>
                <div>
                    <p className="text-sm font-semibold text-indigo-800">Legal Page Details</p>
                    <p className="text-xs text-indigo-500 mt-0.5">
                        Viewing detailed content, configuration, and metadata for this policy page.
                    </p>
                </div>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-1">
                {/* Page Title */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <FileText size={14} /> Page Title
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-semibold text-sm">
                        {page.title || 'N/A'}
                    </div>
                </div>

                {/* Page Type */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Tag size={14} /> Page Type
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-semibold text-sm">
                        {page.page_type?.toString() || 'General'}
                    </div>
                </div>

                {/* Status */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        Status
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2">
                        {page.status ? (
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

                {/* Slug */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Link2 size={14} /> URL Slug
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-indigo-700 font-mono text-sm">
                        {page.slug ? `/${page.slug}` : 'N/A'}
                    </div>
                </div>

                {/* Created On */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Calendar size={14} /> Created On
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm">
                        {page.created_at ? moment(page.created_at).format('MMM DD, YYYY hh:mm A') : 'N/A'}
                    </div>
                </div>

                {/* Last Updated */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Calendar size={14} /> Last Updated
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm">
                        {page.updated_at ? moment(page.updated_at).format('MMM DD, YYYY hh:mm A') : 'N/A'}
                    </div>
                </div>

                {/* SEO & Metadata (Full Width) */}
                {(page.meta_title || page.meta_description || page.meta_keys || page.meta_keywords) && (
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                            <Globe size={14} /> SEO &amp; Metadata
                        </label>
                        <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-3 text-xs">
                            {page.meta_title && (
                                <div>
                                    <span className="font-bold text-gray-500 uppercase text-[10px]">Meta Title</span>
                                    <p className="text-gray-800 font-semibold mt-0.5">{page.meta_title}</p>
                                </div>
                            )}

                            {page.meta_description && (
                                <div className="border-t border-gray-200/60 pt-2">
                                    <span className="font-bold text-gray-500 uppercase text-[10px]">Meta Description</span>
                                    <p className="text-gray-700 mt-0.5 leading-relaxed">{page.meta_description}</p>
                                </div>
                            )}

                            {(page.meta_keys || page.meta_keywords) && (
                                <div className="border-t border-gray-200/60 pt-2">
                                    <span className="font-bold text-gray-500 uppercase text-[10px] flex items-center gap-1">
                                        <Key size={11} className="text-indigo-500" /> Meta Keys
                                    </span>
                                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                                        {(page.meta_keys || page.meta_keywords || '')
                                            .split(',')
                                            .map((k: string, idx: number) => (
                                                <span
                                                    key={idx}
                                                    className="px-2.5 py-0.5 bg-white text-indigo-700 rounded-md border border-indigo-100 text-[11px] font-medium"
                                                >
                                                    {k.trim()}
                                                </span>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Page Content / Description (Full Width) */}
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <FileText size={14} /> Page Content
                    </label>
                    <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm max-w-none break-words overflow-x-auto leading-relaxed">
                        {page.description ? (
                            <div
                                className="prose prose-sm max-w-none text-gray-800"
                                dangerouslySetInnerHTML={{ __html: page.description }}
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

export default LegalPageView;
