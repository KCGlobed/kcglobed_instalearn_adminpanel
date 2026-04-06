import React, { useState, useEffect, useRef } from 'react';
import { Filter, ArrowUpDown, Download, Plus, Search, FileText, Calendar, Check } from 'lucide-react';
import { DatePicker } from 'antd';
import DynamicServerTable from '../../../components/Table/Table';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useRedux';
import { getCategory } from '../../../store/slices/categorySlice';
import useDebounce from '../../../hooks/useDebounce';
import moment from 'moment';

const { RangePicker } = DatePicker;

// Interface matching the Table component's column requirement
interface ColumnDef {
    key: string;
    title: string;
    render?: (value: any, row: any) => React.ReactNode;
    width?: string;
    align?: 'left' | 'center' | 'right';
    sortable?: boolean;
}

const ManageCategories: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [ordering, setOrdering] = useState<string>('');
    const [showFilter, setShowFilter] = useState(false);
    const [showSort, setShowSort] = useState(false);
    const [showDate, setShowDate] = useState(false);

    // Filter states
    const [filterName, setFilterName] = useState('');
    const [filterDesc, setFilterDesc] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'deactive'>('all');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const debouncedFilterName = useDebounce(filterName, 500);
    const debouncedFilterDesc = useDebounce(filterDesc, 500);

    const dispatch = useAppDispatch();
    const { data, loading, pagination } = useAppSelector((state) => state.category);
    const pageSize = 5;

    // Refs for clicking outside to close
    const sortRef = useRef<HTMLDivElement>(null);
    const dateRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sortRef.current && !sortRef.current.contains(event.target as Node)) setShowSort(false);
            if (dateRef.current && !dateRef.current.contains(event.target as Node)) setShowDate(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch data whenever page, search, filters, dates or ordering changes
    useEffect(() => {
        const combinedSearch = [debouncedSearchTerm, debouncedFilterName, debouncedFilterDesc]
            .filter(Boolean)
            .join(' ');

        dispatch(getCategory({
            page: currentPage,
            search: combinedSearch,
            ordering,
            status: filterStatus,
            startDate,
            endDate
        }));
    }, [dispatch, currentPage, debouncedSearchTerm, debouncedFilterName, debouncedFilterDesc, filterStatus, startDate, endDate, ordering]);

    // Reset to first page when search or filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, debouncedFilterName, debouncedFilterDesc, filterStatus, startDate, endDate]);

    const handleSort = (key: string, direction: 'asc' | 'desc') => {
        const orderPrefix = direction === 'desc' ? '-' : '';
        setOrdering(`${orderPrefix}${key}`);
    };

    const handleDirectionSort = (direction: 'asc' | 'desc') => {
        const currentKey = ordering.replace(/^-/, '') || 'name';
        handleSort(currentKey, direction);
        setShowSort(false);
    };

    // ── Export Logic ─────────────────────────────────────────────────────────

    const handleExportCSV = () => {
        const headers = ['ID', 'Name', 'Description', 'Status'];
        const csvRows = data.map(item => [
            item.id,
            `"${item.name}"`,
            `"${item.description}"`,
            item.status ? 'Active' : 'Inactive'
        ].join(','));

        const csvString = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `categories_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPDF = () => {
        window.print();
    };

    // Column definitions
    const columns: ColumnDef[] = [
        {
            key: 'name',
            title: 'Category Name',
            sortable: true,
            width: '200px',
        },
        {
            key: 'description',
            title: 'Description',
            sortable: true,
            width: '350px',
        },
        {
            key: 'status',
            title: 'Status',
            render: (value: boolean) => (
                <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {value ? 'Active' : 'Inactive'}
                </span>
            ),
            width: '100px',
            align: 'center',
            sortable: true,
        },
        {
            key: 'id',
            title: 'Actions',
            render: () => (
                <div className="flex items-center gap-3">
                    <button className="text-indigo-600 hover:text-indigo-900 text-xs font-bold uppercase tracking-wider transition-colors">Edit</button>
                    <button className="text-red-600 hover:text-red-900 text-xs font-bold uppercase tracking-wider transition-colors">Delete</button>
                </div>
            ),
            width: '120px',
            align: 'right',
        },
    ];

    return (
        <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
            {/* Premium Top Action Bar */}
            <div className="flex flex-col bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 relative">
                <div className="flex flex-wrap items-center justify-between px-5 py-4 gap-4">
                    <div className="flex items-center gap-4">
                        {/* Filter Toggle Button */}
                        <button
                            onClick={() => { setShowFilter(!showFilter); setShowDate(false); }}
                            className={`group flex items-center gap-2 px-3.5 py-2 border rounded-xl text-sm font-semibold transition-all active:scale-95 ${showFilter ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <Filter size={16} className={showFilter ? 'text-indigo-500' : 'text-gray-400 group-hover:text-indigo-500'} />
                            Filter
                        </button>

                        {/* Sort Button & Dropdown */}
                        <div className="relative" ref={sortRef}>
                            <button
                                onClick={() => setShowSort(!showSort)}
                                className={`group flex items-center gap-2 px-3.5 py-2 border rounded-xl text-sm font-semibold transition-all active:scale-95 ${showSort ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <ArrowUpDown size={16} className={showSort ? 'text-indigo-500' : 'text-gray-400 group-hover:text-indigo-500'} />
                                Sort
                            </button>

                            {showSort && (
                                <div className="absolute top-full left-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[9999] overflow-hidden animate-in slide-in-from-top-2 duration-200">
                                    <div className="p-2 space-y-1">
                                        <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">
                                            Sort Direction
                                        </div>
                                        <button
                                            onClick={() => handleDirectionSort('asc')}
                                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${!ordering.startsWith('-') && ordering
                                                ? 'bg-indigo-50 text-indigo-600'
                                                : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1.5 rounded-lg ${!ordering.startsWith('-') && ordering ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                                                    <ArrowUpDown size={14} className="rotate-180" />
                                                </div>
                                                <span>Ascending (ASC)</span>
                                            </div>
                                            {(!ordering.startsWith('-') && ordering) && <Check size={16} className="text-indigo-600" />}
                                        </button>
                                        <button
                                            onClick={() => handleDirectionSort('desc')}
                                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${ordering.startsWith('-')
                                                ? 'bg-indigo-50 text-indigo-600'
                                                : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1.5 rounded-lg ${ordering.startsWith('-') ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                                                    <ArrowUpDown size={14} />
                                                </div>
                                                <span>Descending (DESC)</span>
                                            </div>
                                            {ordering.startsWith('-') && <Check size={16} className="text-indigo-600" />}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Date Filter Button */}
                        <button
                            onClick={() => { setShowDate(!showDate); setShowFilter(false); }}
                            className={`group flex items-center gap-2 px-3.5 py-2 border rounded-xl text-sm font-semibold transition-all active:scale-95 ${showDate || startDate ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <Calendar size={16} className={showDate || startDate ? 'text-indigo-500' : 'text-gray-400 group-hover:text-indigo-500'} />
                            {startDate ? `${startDate} - ${endDate}` : 'Date Range'}
                        </button>
                    </div>

                    {/* Search Field */}
                    <div className="flex-1 max-w-md mx-4">
                        <div className="relative flex items-center">
                            <Search size={18} className="absolute left-3 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search categories..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
                        >
                            <Download size={16} className="text-gray-400" />
                            Export CSV
                        </button>

                        <button
                            onClick={handleExportPDF}
                            className="flex items-center gap-2 px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
                        >
                            <FileText size={16} className="text-gray-400" />
                            Export PDF
                        </button>

                        <button className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95 shadow-indigo-200 shadow-lg">
                            <Plus size={18} strokeWidth={3} />
                            Add Category
                        </button>
                    </div>
                </div>

                {/* Inline General Filter Section */}
                {showFilter && (
                    <div className="border-t border-gray-100 bg-gray-50/50 p-6 animate-in slide-in-from-top-4 duration-300 rounded-b-2xl">
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 items-end">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Category Name</label>
                                <input
                                    type="text"
                                    value={filterName}
                                    onChange={(e) => setFilterName(e.target.value)}
                                    placeholder="Filter by name..."
                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                />
                            </div>

                            <div className="md:col-span-1 lg:col-span-2">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Description</label>
                                <input
                                    type="text"
                                    value={filterDesc}
                                    onChange={(e) => setFilterDesc(e.target.value)}
                                    placeholder="Filter by description..."
                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Status</label>
                                <div className="grid grid-cols-3 gap-2 bg-white p-1 rounded-xl border border-gray-200">
                                    {['all', 'active', 'deactive'].map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setFilterStatus(s as any)}
                                            className={`px-2 py-1.5 rounded-lg text-[11px] font-bold capitalize transition-all ${filterStatus === s
                                                ? 'bg-indigo-600 text-white shadow-sm'
                                                : 'text-gray-500 hover:bg-gray-50'
                                                }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => { setFilterName(''); setFilterDesc(''); setFilterStatus('all'); }}
                                className="px-5 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 transition-all active:scale-95"
                            >
                                Clear All Filters
                            </button>
                            <button
                                onClick={() => setShowFilter(false)}
                                className="px-5 py-2 bg-gray-900 rounded-xl text-xs font-bold text-white hover:bg-black transition-all active:scale-95"
                            >
                                Close Section
                            </button>
                        </div>
                    </div>
                )}

                {/* Inline Date Filter Section */}
                {showDate && (
                    <div className="border-t border-gray-100 bg-gray-50/50 p-6 animate-in slide-in-from-top-4 duration-300 rounded-b-2xl">
                        <div className="max-w-2xl">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Select Date Range (Start Date – End Date)</label>
                            <div className="flex flex-wrap items-center gap-4">
                                <RangePicker
                                    className="flex-1 min-w-[300px] premium-range-picker"
                                    style={{ borderRadius: '12px', padding: '10px 16px', border: '1px solid #e5e7eb' }}
                                    value={startDate && endDate ? [moment(startDate) as any, moment(endDate) as any] : null}
                                    getPopupContainer={(trigger) => trigger.parentElement || document.body}
                                    onChange={(dates, dateStrings) => {
                                        if (dates) {
                                            setStartDate(dateStrings[0]);
                                            setEndDate(dateStrings[1]);
                                        } else {
                                            setStartDate('');
                                            setEndDate('');
                                        }
                                    }}
                                />
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => { setStartDate(''); setEndDate(''); }}
                                        className="px-6 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 transition-all active:scale-95 bg-white"
                                    >
                                        Reset
                                    </button>
                                    <button
                                        onClick={() => setShowDate(false)}
                                        className="px-6 py-2.5 bg-gray-900 rounded-xl text-xs font-bold text-white hover:bg-black transition-all active:scale-95 shadow-lg"
                                    >
                                        Apply Range
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Table Content */}
            <div className="bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] overflow-hidden border border-gray-100">
                <DynamicServerTable
                    data={data}
                    columns={columns as any}
                    currentPage={currentPage}
                    pageSize={pagination?.page_size || pageSize}
                    totalCount={pagination?.total_results || 0}
                    loading={loading}
                    onPageChange={(page) => setCurrentPage(page)}
                    onSort={handleSort}
                    className="rounded-none border-none shadow-none"
                />
            </div>
        </div>
    );
};

export default ManageCategories;