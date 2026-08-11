import React from 'react';
import moment from 'moment';
import { Calendar, FileText, Globe, Key, Tag } from 'lucide-react';
import type { LegalPage } from '../../utils/types';

interface LegalPageViewProps {
  page: LegalPage;
}



const LegalPageView: React.FC<LegalPageViewProps> = ({ page }) => {
  if (!page) {
    return <div className="p-6 text-center text-gray-500">No page data found.</div>;
  }

  return (
    <div className="flex flex-col w-full max-h-[85vh] overflow-y-auto bg-gray-50/30 custom-scrollbar relative animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Banner */}
      <div className="relative w-full h-28 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 shrink-0 overflow-hidden rounded-t-2xl md:rounded-2xl md:mt-2 md:mx-2 md:w-auto">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute inset-0 p-5 flex flex-col justify-end">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl text-white shadow-sm border border-white/20">
              <FileText size={22} className="text-white" />
            </div>
            <div>
              <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest block">CMS Legal Page</span>
              <span className="text-white font-bold text-lg">{page.title}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-5 px-5 py-6 -mt-3 relative z-10">
        {/* Title, Badge & Meta Info */}
        <div className="flex flex-col gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-lg font-black text-gray-900 leading-tight">{page.title}</h1>
              {page.slug && (
                <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md w-fit border border-indigo-100">
                  slug: /{page.slug}
                </span>
              )}
            </div>
            <span
              className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border ${
                page.status
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              {page.status ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Tag size={14} className="text-purple-500" />
              <span className="font-semibold text-gray-800">
                Type: {page.page_type?.toString() || 'General'}
              </span>
            </div>
            {page.created_at && (
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <Calendar size={14} className="text-indigo-500" />
                <span>Created: {moment(page.created_at).format('MMM DD, YYYY hh:mm A')}</span>
              </div>
            )}
            {page.updated_at && (
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <Calendar size={14} className="text-orange-400" />
                <span>Updated: {moment(page.updated_at).format('MMM DD, YYYY hh:mm A')}</span>
              </div>
            )}
          </div>
        </div>

        {/* SEO & Metadata */}
        {(page.meta_title || page.meta_description || page.meta_keys || page.meta_keywords) && (
          <div className="flex flex-col gap-2">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2">
              SEO & Metadata
            </h2>
            <div className="flex flex-col gap-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              {page.meta_title && (
                <div className="flex items-center gap-3 border-b border-gray-50 pb-3">
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <Globe size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Meta Title</span>
                    <span className="font-semibold text-gray-800 text-sm">{page.meta_title}</span>
                  </div>
                </div>
              )}

              {page.meta_description && (
                <div className="flex flex-col gap-1 border-b border-gray-50 pb-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Meta Description</span>
                  <p className="text-xs text-gray-600">{page.meta_description}</p>
                </div>
              )}

              {(page.meta_keys || page.meta_keywords) && (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <Key size={12} className="text-purple-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Meta Keys</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(page.meta_keys || page.meta_keywords || '')
                      .split(',')
                      .map((k: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-[11px] font-medium border border-indigo-100"
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

        {/* Page Content / Description Preview */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2">
            Page Content
          </h2>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div
              className="prose prose-sm max-w-none text-gray-800 overflow-x-auto leading-relaxed"
              dangerouslySetInnerHTML={{ __html: page.description || '<p>No content provided.</p>' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalPageView;
