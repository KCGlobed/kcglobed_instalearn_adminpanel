import React, { useState, useEffect, useRef } from 'react';
import { Filter, Plus, Calendar } from 'lucide-react';
import { useModal } from '../../../context/ModalContext';
import useDebounce from '../../../hooks/useDebounce';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useRedux';
import { getTrailStudents } from '../../../store/slices/trailStudent';
import moment from 'moment';
import SortDropdown from '../../../components/common/SortDropdown';
import SearchInput from '../../../components/common/SearchInput';
import ExportFile from '../../../components/Forms/ExportFile';
import { downloadTrailStudentExcelApi, downloadTrailStudentPdfApi } from '../../../services/apiServices';
import TrailStudentForm from '../../../components/Forms/TrailStudentForm';
import DynamicFilter from '../../../components/common/DynamicFilter';
import { trailStudentFilterConfig } from '../../../utils/filterConfiguration';
import InlineDateFilter from '../../../components/common/InlineDateFilter';
import DynamicServerTable from '../../../components/Table/Table';


interface ColumnDef {
    key: string;
    title: string;
    render?: (value: any, row: any) => React.ReactNode;
    width?: string;
    align?: 'left' | 'center' | 'right';
    sortable?: boolean;
}

const ManageTrailStudentReport: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [ordering, setOrdering] = useState<string>('');
    const [showFilter, setShowFilter] = useState(false);
    const [showSort, setShowSort] = useState(false);
    const [showDate, setShowDate] = useState(false);
    const { showModal } = useModal();

    const [filters, setFilters] = useState({
        first_name: '',
        last_name: '',
        email: '',
        subscription_status: 'all',
    });
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const debouncedFilters = useDebounce(filters, 500);

    const dispatch = useAppDispatch();
    const { data, loading, pagination } = useAppSelector((state) => state.trailStudent);
    const pageSize = 5;

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

    useEffect(() => {
        dispatch(getTrailStudents({
            page: currentPage,
            search: debouncedSearchTerm,
            first_name: debouncedFilters.first_name,
            last_name: debouncedFilters.last_name,
            email: debouncedFilters.email,
            subscription_status: debouncedFilters.subscription_status,
            ordering,
            start_date: startDate,
            end_date: endDate,
        }));
    }, [dispatch, currentPage, debouncedSearchTerm, debouncedFilters, startDate, endDate, ordering]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, debouncedFilters, startDate, endDate]);

    const handleFilterChange = (name: string, value: any) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({
            first_name: '',
            last_name: '',
            email: '',
            subscription_status: 'all',
        });
    };

    const handleSort = (key: string, direction: 'asc' | 'desc') => {
        const orderPrefix = direction === 'desc' ? '-' : '';
        setOrdering(`${orderPrefix}${key}`);
    };

    const handleDirectionSort = (direction: 'asc' | 'desc') => {
        const currentKey = ordering.replace(/^-/, '') || 'created_at';
        handleSort(currentKey, direction);
        setShowSort(false);
    };

    const columns: ColumnDef[] = [
        {
            key: 'first_name',
            title: 'Student',
            render: (_: any, row: any) => (
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm bg-blue-50 text-blue-600 border border-blue-100"
                    >
                        {row.first_name ? row.first_name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">{row.first_name} {row.last_name}</span>
                        <span className="text-[11px] text-gray-500 font-medium whitespace-nowrap">{row.email}</span>
                    </div>
                </div>
            ),
            sortable: true,
            width: '250px',
        },
        {
            key: 'phone',
            title: 'Phone',
            render: (value: string) => (
                <span className="text-gray-700 text-sm font-medium">{value || '-'}</span>
            ),
            width: '130px',
        },
        {
            key: 'ordered_courses',
            title: 'Courses',
            render: (value: any[]) => (
                <div className="flex flex-wrap gap-1">
                    {value && value.length > 0 ? value.map((course) => (
                        <span key={course.id} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold border border-blue-100">
                            {course.name?.length > 25 ? course.name.substring(0, 25) + '...' : course.name}
                        </span>
                    )) : (
                        <span className="text-gray-400 text-xs">No courses</span>
                    )}
                </div>
            ),
            width: '280px',
        },
        {
            key: 'total_amount',
            title: 'Amount',
            render: (value: number) => (
                <span className="font-semibold text-gray-800 text-sm">₹{value ?? 0}</span>
            ),
            
            width: '100px',
        },
        {
            key: 'subscription_status',
            title: 'Status',
            render: (value: number) => {
                const statusMap: Record<number, { label: string; color: string }> = {
                    1: { label: 'Initiate', color: 'bg-blue-100 text-blue-700 border-blue-200' },
                    2: { label: 'Active', color: 'bg-green-100 text-green-700 border-green-200' },
                    3: { label: 'Expired', color: 'bg-red-100 text-red-700 border-red-200' },
                    4: { label: 'Paused', color: 'bg-orange-100 text-orange-700 border-orange-200' },
                    5: { label: 'Cancelled', color: 'bg-gray-100 text-gray-700 border-gray-200' },
                };
                const status = statusMap[value] || { label: 'Unknown', color: 'bg-gray-100 text-gray-700 border-gray-200' };
                return (
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${status.color}`}>
                        {status.label}
                    </span>
                );
            },
            width: '110px',
            align: 'center',
        },
        {
            key: 'start_date',
            title: 'Start / End',
            render: (_: any, row: any) => (
                <div className="flex flex-col">
                    <span className="text-gray-800 text-xs font-semibold">{row.start_date ? moment(row.start_date).format('MMM DD, YYYY') : '-'}</span>
                    <span className="text-gray-400 text-[10px] font-bold">to {row.end_date ? moment(row.end_date).format('MMM DD, YYYY') : '-'}</span>
                </div>
            ),
            width: '140px',
        },
        {
            key: 'created_at',
            title: 'Created',
            render: (value: string) => (
                <div className="flex flex-col">
                    <span className="text-gray-800 text-sm font-semibold">{value ? moment(value).format('MMM DD, YYYY') : '-'}</span>
                    <span className="text-gray-400 text-[10px] uppercase font-bold">{value ? moment(value).format('hh:mm A') : ''}</span>
                </div>
            ),
            sortable: true,
            width: '140px',
        },
    ];

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            {/* Top Action Bar */}
            <div className="flex flex-col bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 relative">
                <div className="flex flex-wrap items-center justify-between px-5 py-4 gap-4">
                    <div className="flex items-center gap-4">
                        {/* Filter Toggle Button */}
                        <button
                            onClick={() => { setShowFilter(!showFilter); setShowDate(false); }}
                            className={`group flex items-center gap-2 px-3.5 py-2 border rounded-xl text-sm font-semibold transition-all active:scale-95 ${showFilter ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <Filter size={16} className={showFilter ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'} />
                            Filter
                        </button>

                        {/* Sort Button & Dropdown */}
                        <SortDropdown
                            showSort={showSort}
                            setShowSort={setShowSort}
                            ordering={ordering}
                            onDirectionSort={handleDirectionSort}
                            sortRef={sortRef}
                        />

                        {/* Date Filter Button */}
                        <button
                            onClick={() => { setShowDate(!showDate); setShowFilter(false); }}
                            className={`group flex items-center gap-2 px-3.5 py-2 border rounded-xl text-sm font-semibold transition-all active:scale-95 ${showDate || startDate ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <Calendar size={16} className={showDate || startDate ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'} />
                            {startDate ? `${startDate} - ${endDate}` : 'Date Range'}
                        </button>
                    </div>

                    {/* Search Field */}
                    <SearchInput
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Search trail students..."
                        className="mx-4"
                    />

                    <div className="flex items-center gap-4">
                        <ExportFile
                            pdfApi={() => downloadTrailStudentPdfApi({
                                search: debouncedSearchTerm,
                                first_name: debouncedFilters.first_name,
                                last_name: debouncedFilters.last_name,
                                email: debouncedFilters.email,
                                subscription_status: debouncedFilters.subscription_status,
                                start_date: startDate,
                                end_date: endDate
                            })}
                            excelApi={() => downloadTrailStudentExcelApi({
                                search: debouncedSearchTerm,
                                first_name: debouncedFilters.first_name,
                                last_name: debouncedFilters.last_name,
                                email: debouncedFilters.email,
                                subscription_status: debouncedFilters.subscription_status,
                                start_date: startDate,
                                end_date: endDate
                            })}
                            fileNamePrefix="trail-students"
                        />
                        <button className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 hover:shadow-lg transition-all active:scale-95 shadow-blue-200 shadow-lg"
                            onClick={() =>
                                showModal({
                                    title: "Register Trail Student",
                                    content: <TrailStudentForm />,
                                    type: 'custom',
                                    size: 'lg',
                                })
                            }
                        >
                            <Plus size={18} strokeWidth={3} />
                            Add Trail Student
                        </button>
                    </div>
                </div>

                {/* Inline General Filter Section */}
                <DynamicFilter
                    show={showFilter}
                    config={trailStudentFilterConfig}
                    values={filters}
                    onChange={handleFilterChange}
                    onClear={clearFilters}
                    onClose={() => setShowFilter(false)}
                />

                {/* Inline Date Filter Section */}
                <InlineDateFilter
                    showDate={showDate}
                    startDate={startDate}
                    endDate={endDate}
                    onDateChange={(start, end) => {
                        setStartDate(start);
                        setEndDate(end);
                    }}
                    onClose={() => setShowDate(false)}
                />
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

export default ManageTrailStudentReport;
