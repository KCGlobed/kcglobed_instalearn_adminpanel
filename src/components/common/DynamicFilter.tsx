import React from 'react';

export type FilterField = {
    type: 'text' | 'select' | 'status';
    label: string;
    name: string;
    placeholder?: string;
    options?: { label: string; value: any }[];
    gridCols?: string;
};

interface DynamicFilterProps {
    show: boolean;
    config: FilterField[];
    values: Record<string, any>;
    onChange: (name: string, value: any) => void;
    onClear: () => void;
    onClose: () => void;
}

const DynamicFilter: React.FC<DynamicFilterProps> = ({
    show,
    config,
    values,
    onChange,
    onClear,
    onClose,
}) => {
    if (!show) return null;

    return (
        <div className="border-t border-gray-100 bg-gray-50/50 p-6 animate-in slide-in-from-top-4 duration-300 rounded-b-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 items-end">
                {config.map((field) => (
                    <div key={field.name} className={field.gridCols || ''}>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1 text-gray-500">
                            {field.label}
                        </label>
                        {field.type === 'text' && (
                            <input
                                type="text"
                                value={values[field.name] || ''}
                                onChange={(e) => onChange(field.name, e.target.value)}
                                placeholder={field.placeholder || `Filter by ${field.label.toLowerCase()}...`}
                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium placeholder:text-gray-400 text-gray-700"
                            />
                        )}
                        {field.type === 'status' && (
                            <div className="grid grid-cols-3 gap-2 bg-white p-1 rounded-xl border border-gray-200 overflow-hidden">
                                {field.options?.map((option) => (
                                    <button
                                        key={option.value.toString()}
                                        onClick={() => onChange(field.name, option.value)}
                                        className={`px-2 py-1.5 rounded-lg text-[11px] font-bold capitalize transition-all ${
                                            values[field.name] === option.value
                                                ? 'bg-indigo-600 text-white shadow-sm'
                                                : 'text-gray-500 hover:bg-gray-50'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        )}
                        {field.type === 'select' && (
                            <select
                                value={values[field.name] || ''}
                                onChange={(e) => onChange(field.name, e.target.value)}
                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium appearance-none text-gray-700"
                            >
                                <option value="">Select {field.label}</option>
                                {field.options?.map((option) => (
                                    <option key={option.value.toString()} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                    onClick={onClear}
                    className="px-5 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 transition-all active:scale-95 bg-white"
                >
                    Clear All Filters
                </button>
                <button
                    onClick={onClose}
                    className="px-5 py-2 bg-gray-900 rounded-xl text-xs font-bold text-white hover:bg-black transition-all active:scale-95 shadow-sm"
                >
                    Close Section
                </button>
            </div>
        </div>
    );
};

export default DynamicFilter;
