import React from 'react';
import moment from 'moment';
import { Info, Image, Type, CheckCircle, XCircle, Calendar, Hash, FolderTree } from 'lucide-react';

interface SubCategoryViewProps {
    categoryData: any;
}

const SubCategoryView: React.FC<SubCategoryViewProps> = ({ categoryData }) => {
    if (!categoryData) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center text-red-500 min-h-[300px]">
                <Info size={48} className="mb-4 opacity-20" />
                <p className="font-bold text-lg">Subcategory data not found</p>
            </div>
        );
    }

    const {
        id,
        name,
        description,
        parent,
        status,
        created_at,
        bg_code,
        text_code,
        icon
    } = categoryData;

    return (
        <div className="flex flex-col gap-6 p-2">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 bg-gray-50 border border-gray-100 rounded-xl shadow-sm">
                {icon ? (
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm flex-shrink-0 flex items-center justify-center p-2">
                        <img src={icon} alt={name} className="w-full h-full object-contain" />
                    </div>
                ) : (
                    <div 
                        className="w-24 h-24 rounded-2xl flex-shrink-0 flex items-center justify-center text-3xl font-bold shadow-sm"
                        style={{
                            backgroundColor: bg_code ? bg_code + '20' : '#eef2ff',
                            color: bg_code || '#4f46e5',
                            border: `1px solid ${bg_code ? bg_code + '40' : '#e0e7ff'}`
                        }}
                    >
                        {name ? name.charAt(0).toUpperCase() : '?'}
                    </div>
                )}
                
                <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-gray-900">{name}</h2>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${status ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                            {status ? <CheckCircle size={12} /> : <XCircle size={12} />}
                            {status ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    {parent && parent.name && (
                        <p className="text-sm font-medium text-indigo-600 mb-2 flex items-center gap-2">
                            <FolderTree size={14} /> Subcategory of {parent.name}
                        </p>
                    )}
                    <p className="text-gray-600 text-sm leading-relaxed max-w-2xl">
                        {description || 'No description provided for this subcategory.'}
                    </p>
                </div>
            </div>

            {/* Parent Category Details (if available) */}
            {parent && parent.id && (
                <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100 shadow-sm flex flex-col gap-4">
                    <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider border-b border-indigo-200 pb-2 flex items-center gap-2">
                        <FolderTree size={16} className="text-indigo-500" />
                        Parent Category Details
                    </h3>
                    <div className="flex flex-col md:flex-row gap-4 items-start">
                        {parent.icon && (
                            <img src={parent.icon} alt={parent.name} className="w-16 h-16 rounded-xl border border-indigo-200 bg-white object-contain p-1" />
                        )}
                        <div className="flex flex-col gap-2 flex-1">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-bold text-gray-900">{parent.name} (ID: {parent.id})</span>
                                <div className="flex items-center gap-2 text-xs font-semibold">
                                    <span className="px-2 py-1 rounded border shadow-sm flex items-center gap-1" style={{ backgroundColor: parent.bg_code || '#fff', color: parent.text_code || '#000', borderColor: 'rgba(0,0,0,0.1)' }}>
                                        Theme
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2">
                                {parent.description || 'No description provided.'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ID & Creation */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-2">
                        <Info size={16} className="text-gray-400" />
                        General Info
                    </h3>
                    <div className="grid grid-cols-2 gap-y-4">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 font-medium flex items-center gap-1 mb-1">
                                <Hash size={12} /> ID
                            </span>
                            <span className="font-semibold text-gray-900">{id}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 font-medium flex items-center gap-1 mb-1">
                                <Calendar size={12} /> Created At
                            </span>
                            <span className="font-semibold text-gray-900">
                                {created_at ? moment(created_at).format('MMM DD, YYYY hh:mm A') : '-'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Theme & Colors */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-2">
                        <Image size={16} className="text-gray-400" />
                        Theme Settings
                    </h3>
                    <div className="grid grid-cols-2 gap-y-4">
                        <div className="flex flex-col gap-2">
                            <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                                Background Color
                            </span>
                            <div className="flex items-center gap-2">
                                <div 
                                    className="w-6 h-6 rounded-md border border-gray-300 shadow-inner" 
                                    style={{ backgroundColor: bg_code || '#ffffff' }}
                                />
                                <span className="font-semibold text-sm uppercase text-gray-700">{bg_code || '#FFFFFF'}</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                                <Type size={12} /> Text Color
                            </span>
                            <div className="flex items-center gap-2">
                                <div 
                                    className="w-6 h-6 rounded-md border border-gray-300 shadow-inner" 
                                    style={{ backgroundColor: text_code || '#000000' }}
                                />
                                <span className="font-semibold text-sm uppercase text-gray-700">{text_code || '#000000'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Live Preview Box */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">
                    Card Preview
                </h3>
                <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <div 
                        className="w-48 h-48 rounded-xl shadow-md flex flex-col items-center justify-center gap-4 transition-transform hover:scale-105"
                        style={{ backgroundColor: bg_code || '#ffffff' }}
                    >
                        {icon && <img src={icon} alt="Preview Icon" className="w-16 h-16 object-contain" />}
                        <span className="font-bold text-lg text-center px-4" style={{ color: text_code || '#000000' }}>
                            {name}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubCategoryView;
