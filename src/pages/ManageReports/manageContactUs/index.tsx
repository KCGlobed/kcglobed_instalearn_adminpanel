import React, { useState, useEffect, useRef } from 'react';
import { Filter, Calendar } from 'lucide-react';
import useDebounce from '../../../hooks/useDebounce';
import { useAppDispatch, useAppSelector } from '../../../hooks/useRedux';
import { contactFilterConfig } from '../../../utils/filterConfiguration';
import { getContact } from '../../../store/slices/ContactUsSlice';
import moment from 'moment';
import SortDropdown from '../../../components/common/SortDropdown';
import SearchInput from '../../../components/common/SearchInput';
import DynamicFilter from '../../../components/common/DynamicFilter';
import InlineDateFilter from '../../../components/common/InlineDateFilter';
import DynamicServerTable from '../../../components/Table/Table';
import ExportFile from '../../../components/Forms/ExportFile';
import { downloadContactExcelApi, downloadContactPdfApi } from '../../../services/apiServices';

interface ColumnDef {
    key: string;
    title: string;
    render?: (value: any, row: any) => React.ReactNode;
    width?: string;
    align?: 'left' | 'center' | 'right';
    sortable?: boolean;
}

const ManageReportContact: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [ordering, setOrdering] = useState<string>('');
    const [showFilter, setShowFilter] = useState(false);
    const [showSort, setShowSort] = useState(false);
    const [showDate, setShowDate] = useState(false);

    // Filter states
    const [filters, setFilters] = useState({
        first_name: '',
        email: '',
        status: 'all' as 'all' | 'active' | 'deactive',
    });
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const debouncedFilters = useDebounce(filters, 500);

    const dispatch = useAppDispatch();
    const { data, loading, pagination } = useAppSelector((state) => state.Contact);
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
        dispatch(getContact({
            page: currentPage,
            search: debouncedSearchTerm,
            first_name: debouncedFilters.first_name,
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
            email: '',
            status: 'all',
        });
    };

    const handleSort = (key: string, direction: 'asc' | 'desc') => {
        const orderPrefix = direction === 'desc' ? '-' : '';
        const apiSortKey = key === 'name' ? 'first_name' : key;
        setOrdering(`${orderPrefix}${apiSortKey}`);
    };

    const handleDirectionSort = (direction: 'asc' | 'desc') => {
        const currentKey = ordering.replace(/^-/, '') || 'first_name';
        handleSort(currentKey, direction);
        setShowSort(false);
    };

    const columns: ColumnDef[] = [
        {
            key: 'name',
            title: 'Name',
            render: (_: any, row: any) => (
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm bg-indigo-50 text-indigo-600 border border-indigo-100 overflow-hidden"
                    >
                        {(row as any).image ? (
                            <img src={(row as any).image} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <span>{row.first_name ? row.first_name.charAt(0).toUpperCase() : 'S'}</span>
                        )}
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
            width: '250px',
        },
        {
            key: 'email',
            title: 'Email',
            render: (value: string) => (
                <span className="text-gray-600 text-sm">{value}</span>
            ),
            sortable: true,
            width: '200px',
        },
        {
            key: 'phone',
            title: 'Phone',
            render: (value: string) => (
                <span className="text-gray-600 text-sm">{value || 'N/A'}</span>
            ),
            width: '150px',
        },
        {
            key: 'message',
            title: 'Message',
            render: (value: string) => (
                <div className="text-gray-600 text-xs w-full max-w-xs line-clamp-2" title={value}>
                    {value || 'N/A'}
                </div>
            ),
            sortable: false,
            width: '300px',
        },
        {
            key: 'created_at',
            title: 'Submitted On',
            render: (value: string) => (
                <div className="flex flex-col">
                    <span className="text-gray-800 text-sm font-semibold">{value ? moment(value).format('MMM DD, YYYY') : '-'}</span>
                    <span className="text-gray-400 text-[10px] uppercase font-bold">{value ? moment(value).format('hh:mm A') : ''}</span>
                </div>
            ),
            sortable: true,
            width: '150px',
        }
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
                        placeholder="Search contacts..."
                        className="mx-4"
                    />
                    <div className="flex items-center gap-4">
                        <ExportFile
                            pdfApi={() => downloadContactPdfApi({
                                search: debouncedSearchTerm,
                                first_name: debouncedFilters.first_name,
                                email: debouncedFilters.email,
                                status: debouncedFilters.status,
                                start_date: startDate,
                                end_date: endDate
                            })}
                            excelApi={() => downloadContactExcelApi({
                                search: debouncedSearchTerm,
                                first_name: debouncedFilters.first_name,
                                email: debouncedFilters.email,
                                status: debouncedFilters.status,
                                start_date: startDate,
                                end_date: endDate
                            })}
                            fileNamePrefix="contact"
                        />

                    </div>
                </div>

                <DynamicFilter
                    show={showFilter}
                    config={contactFilterConfig}
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
                    data={data || []}
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

export default ManageReportContact;