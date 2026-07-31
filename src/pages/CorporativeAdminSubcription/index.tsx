import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useRedux';
import { getCoAdminSubscriptions } from '../../store/slices/CoAdminSubscriptionSlice';
import moment from 'moment';
import { Filter, Calendar } from 'lucide-react';
import SortDropdown from '../../components/common/SortDropdown';
import SearchInput from '../../components/common/SearchInput';
import DynamicFilter from '../../components/common/DynamicFilter';
import InlineDateFilter from '../../components/common/InlineDateFilter';
import DynamicServerTable from '../../components/Table/Table';
import useDebounce from '../../hooks/useDebounce';
import ExportFile from '../../components/Forms/ExportFile';
import { downloadCoAdminSubscriptionPdfApi, downloadCoAdminSubscriptionExcelApi } from '../../services/apiServices';
import { coAdminSubscriptionFilterConfig } from '../../utils/filterConfiguration';

interface ColumnDef {
    key: string;
    title: string;
    render?: (value: any, row: any) => React.ReactNode;
    width?: string;
    align?: 'left' | 'center' | 'right';
    sortable?: boolean;
}

const ManageCorporateAdminSubcription: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [ordering, setOrdering] = useState<string>('');
    const [showFilter, setShowFilter] = useState(false);
    const [showSort, setShowSort] = useState(false);
    const [showDate, setShowDate] = useState(false);

    // Filter states
    const [filters, setFilters] = useState({
        first_name: '',
        last_name: '',
        email: '',
        status: 'all',
    });
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const debouncedFilters = useDebounce(filters, 500);

    const dispatch = useAppDispatch();
    const { data, loading, pagination } = useAppSelector((state) => state.CoAdminSubscription);
    const pageSize = 10;

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
        dispatch(getCoAdminSubscriptions({
            page: currentPage,
            search: debouncedSearchTerm,
            first_name: debouncedFilters.first_name,
            last_name: debouncedFilters.last_name,
            email: debouncedFilters.email,
            ordering,
            status: debouncedFilters.status,
            startDate: startDate,
            endDate: endDate
        }));
    }, [dispatch, currentPage, debouncedSearchTerm, debouncedFilters, startDate, endDate, ordering]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, debouncedFilters, startDate, endDate]);

    const handleFilterChange = (title: string, value: any) => {
        setFilters(prev => ({ ...prev, [title]: value }));
    };

    const clearFilters = () => {
        setFilters({
            first_name: '',
            last_name: '',
            email: '',
            status: 'all',
        });
    };

    const handleSort = (key: string, direction: 'asc' | 'desc') => {
        const orderPrefix = direction === 'desc' ? '-' : '';
        setOrdering(`${orderPrefix}${key}`);
    };

    const handleDirectionSort = (direction: 'asc' | 'desc') => {
        const currentKey = ordering.replace(/^-/, '') || 'first_name';
        handleSort(currentKey, direction);
        setShowSort(false);
    };

    const getSubscriptionType = (type: any) => {
        const types: { [key: string]: string } = {
            '1': 'Monthly',
            '2': 'Half Yearly',
            '3': 'Yearly'
        };
        return types[String(type)] || '-';
    };

    const getSubscriptionStatus = (status: any) => {
        const statuses: { [key: string]: string } = {
            '1': 'Initiate',
            '2': 'Active',
            '3': 'Expired',
            '4': 'Paused',
            '5': 'Cancelled'
        };
        return statuses[String(status)] || '-';
    };

    const columns: ColumnDef[] = [
        {
            key: 'first_name',
            title: 'Admin',
            render: (_: any, row: any) => (
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm bg-indigo-50 text-indigo-600 border border-indigo-100 overflow-hidden shrink-0"
                    >
                        <span>{row.first_name ? row.first_name.charAt(0).toUpperCase() : 'A'}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">
                            {row.first_name} {row.last_name}
                        </span>
                        <span className="text-gray-400 text-[10px]">ID: {row.id}</span>
                    </div>
                </div>
            ),
            sortable: true,
            width: '220px',
        },
        {
            key: 'email',
            title: 'Email',
            sortable: true,
            width: '200px',
        },
        {
            key: 'plan_name',
            title: 'Plan Name',
            render: (_: any, row: any) => (
                <span className="text-sm font-semibold text-gray-800">
                    {row.plan_info?.plan_name || '-'}
                </span>
            ),
            width: '130px',
        },
        {
            key: 'subscription_type',
            title: 'Sub. Type',
            render: (_: any, row: any) => (
                <span className="text-sm text-gray-600 font-medium">
                    {getSubscriptionType(row.subscription_type)}
                </span>
            ),
            width: '120px',
        },
        {
            key: 'subscription_status',
            title: 'Status',
            render: (_: any, row: any) => {
                const statusStr = getSubscriptionStatus(row.subscription_status);
                return (
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        statusStr === 'Active' ? 'bg-green-50 text-green-700 border border-green-200' :
                        statusStr === 'Expired' || statusStr === 'Cancelled' ? 'bg-red-50 text-red-700 border border-red-200' :
                        statusStr === '-' ? 'text-gray-400' :
                        'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                        {statusStr}
                    </span>
                );
            },
            width: '100px',
        },
        {
            key: 'total_amount',
            title: 'Amount',
            render: (_: any, row: any) => (
                <span className="font-bold text-gray-800">
                    ₹{Number(row.total_amount || 0).toLocaleString('en-IN')}
                </span>
            ),
            width: '100px',
        },
        {
            key: 'dates',
            title: 'Period',
            render: (_: any, row: any) => (
                <div className="flex flex-col gap-0.5">
                    <span className="text-gray-800 text-xs font-semibold">
                        {row.start_date ? moment(row.start_date).format('MMM DD, YY') : '-'}
                    </span>
                    <span className="text-gray-400 text-[10px] font-medium">
                        to {row.next_due ? moment(row.next_due).format('MMM DD, YY') : '-'}
                    </span>
                </div>
            ),
            width: '130px',
        },
         {
            key: 'end_date',
            title: 'End Date',
            render: (_: any, row: any) => (
                <span className="font-bold text-gray-800">
                    {row.end_date ? moment(row.end_date).format('MMM DD, YY') : '-'}
                </span>
            ),
            width: '120px',
        },
        {
            key: 'created_at',
            title: 'Joined',
            render: (value: string) => (
                <div className="flex flex-col">
                    <span className="text-gray-800 text-xs font-semibold">{value ? moment(value).format('MMM DD, YYYY') : '-'}</span>
                </div>
            ),
            sortable: true,
            width: '120px',
        },
    ];

    return (
        <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
            <div className="flex flex-col bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 relative">
                <div className="flex flex-wrap items-center justify-between px-5 py-4 gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => { setShowFilter(!showFilter); setShowDate(false); }}
                            className={`group flex items-center gap-2 px-3.5 py-2 border rounded-xl text-sm font-semibold transition-all active:scale-95 ${showFilter ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <Filter size={16} className={showFilter ? 'text-indigo-500' : 'text-gray-400 group-hover:text-indigo-500'} />
                            Filter
                        </button>

                        <SortDropdown
                            showSort={showSort}
                            setShowSort={setShowSort}
                            ordering={ordering}
                            onDirectionSort={handleDirectionSort}
                            sortRef={sortRef}
                        />

                        <button
                            onClick={() => { setShowDate(!showDate); setShowFilter(false); }}
                            className={`group flex items-center gap-2 px-3.5 py-2 border rounded-xl text-sm font-semibold transition-all active:scale-95 ${showDate || startDate ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <Calendar size={16} className={showDate || startDate ? 'text-indigo-500' : 'text-gray-400 group-hover:text-indigo-500'} />
                            {startDate ? `${startDate} - ${endDate}` : 'Date Range'}
                        </button>
                    </div>

                    <SearchInput
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Search subscriptions..."
                        className="mx-4"
                    />

                    <div className="flex items-center gap-4">
                        <ExportFile
                            pdfApi={() => downloadCoAdminSubscriptionPdfApi({
                                search: debouncedSearchTerm,
                                first_name: debouncedFilters.first_name,
                                last_name: debouncedFilters.last_name,
                                email: debouncedFilters.email,
                                status: debouncedFilters.status,
                                start_date: startDate,
                                end_date: endDate
                            })}
                            excelApi={() => downloadCoAdminSubscriptionExcelApi({
                                search: debouncedSearchTerm,
                                first_name: debouncedFilters.first_name,
                                last_name: debouncedFilters.last_name,
                                email: debouncedFilters.email,
                                status: debouncedFilters.status,
                                start_date: startDate,
                                end_date: endDate
                            })}
                            fileNamePrefix="coadmin-subscriptions"
                        />
                    </div>
                </div>

                <DynamicFilter
                    show={showFilter}
                    config={coAdminSubscriptionFilterConfig}
                    values={filters}
                    onChange={handleFilterChange}
                    onClear={clearFilters}
                    onClose={() => setShowFilter(false)}
                />

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

export default ManageCorporateAdminSubcription;