import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Filter } from 'lucide-react';
import DynamicServerTable from '../../components/Table/Table';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useRedux';
import { getJobApplication } from '../../store/slices/JobApplicationSlice';
import useDebounce from '../../hooks/useDebounce';
import moment from 'moment';

import { downloadJobApplicationExcelApi, downloadJobApplicationPdfApi } from '../../services/apiServices';
import ExportFile from '../../components/Forms/ExportFile';
import InlineDateFilter from '../../components/common/InlineDateFilter';
import SortDropdown from '../../components/common/SortDropdown';
import DynamicFilter from '../../components/common/DynamicFilter';
import { jobApplicationFilterConfig } from '../../utils/filterConfiguration';
import SearchInput from '../../components/common/SearchInput';
import { useModal } from '../../context/ModalContext';
import GlassButton from '../../components/Button/Button';
import { FiEye } from 'react-icons/fi';
import JobApplicationViewModal from '../../components/View/JobApplicationViewModal';

// Interface matching the Table component's column requirement
interface ColumnDef {
    key: string;
    title: string;
    render?: (value: any, row: any) => React.ReactNode;
    width?: string;
    align?: 'left' | 'center' | 'right';
    sortable?: boolean;
}

const ManageJobApplication: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [ordering, setOrdering] = useState<string>('');
    const [showSort, setShowSort] = useState(false);
    const [showDate, setShowDate] = useState(false);
    const [showFilter, setShowFilter] = useState(false);

    // Filter states
    const [filters, setFilters] = useState({
        full_name: '',
        email: '',
        mobile: ''
    });

    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const debouncedFilters = useDebounce(filters, 500);

    const dispatch = useAppDispatch();
    const { data, loading, pagination } = useAppSelector((state) => state.jobApplication);
    const pageSize = 10;
    const { showModal } = useModal();

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
        dispatch(getJobApplication({
            page: currentPage,
            search: debouncedSearchTerm,
            full_name: debouncedFilters.full_name,
            email: debouncedFilters.email,
            mobile: debouncedFilters.mobile,
            ordering,
            start_date: startDate,
            end_date: endDate
        }));
    }, [dispatch, currentPage, debouncedSearchTerm, debouncedFilters, startDate, endDate, ordering]);

    // Reset to first page when search or filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, debouncedFilters, startDate, endDate]);

    const handleFilterChange = (name: string, value: any) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({
            full_name: '',
            email: '',
            mobile: ''
        });
    };

    const handleSort = (key: string | number, direction: 'asc' | 'desc') => {
        const orderPrefix = direction === 'desc' ? '-' : '';
        setOrdering(`${orderPrefix}${key}`);
    };

    const handleDirectionSort = (direction: 'asc' | 'desc') => {
        const currentKey = ordering.replace(/^-/, '') || 'full_name';
        handleSort(currentKey, direction);
        setShowSort(false);
    };

    // Column definitions
    const columns: ColumnDef[] = [
        {
            key: 'full_name',
            title: 'Applicant Details',
            render: (_: any, row: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-sm border border-indigo-100">
                        {row.full_name ? row.full_name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">{row.full_name}</span>
                        <span className="text-[11px] text-gray-500 font-medium whitespace-nowrap">{row.email} | {row.mobile}</span>
                    </div>
                </div>
            ),
            sortable: true,
            width: '280px',
        },
        {
            key: 'role_applying_for',
            title: 'Role Applied',
            render: (value: string) => (
                <div className="text-gray-900 font-semibold text-sm">
                    {value || 'N/A'}
                </div>
            ),
            width: '150px',
        },
        {
            key: 'current_employment_status',
            title: 'Status',
            render: (value: string) => (
                <div className="text-gray-900 font-semibold text-sm">
                    {value || 'N/A'}
                </div>
            ),
            width: '150px',
        },
        {
            key: 'total_years_of_experience',
            title: 'Experience',
            render: (value: number) => (
                <div className="text-gray-700 font-medium text-sm">
                    {value} Years
                </div>
            ),
            width: '120px',
        },
        {
            key: 'highest_qualification',
            title: 'Qualification',
            render: (value: string) => (
                <div className="text-gray-600 font-medium text-sm line-clamp-1" title={value}>
                    {value || '-'}
                </div>
            ),
            sortable: true,
            width: '160px',
        },
        {
          key: 'notice_period',
          title: 'notice period',
          render: (value: string) => (
              <div className="text-gray-900 font-semibold text-sm">
                  {value || 'N/A'}
              </div>
          ),
          width: '150px',
      },
        {
            key: 'created_at',
            title: 'Applied On',
            render: (value: string) => (
                <div className="flex flex-col">
                    <span className="text-gray-800 text-sm font-semibold">{value ? moment(value).format('MMM DD, YYYY') : '-'}</span>
                    <span className="text-gray-400 text-[10px] uppercase font-bold">{value ? moment(value).format('hh:mm A') : ''}</span>
                </div>
            ),
            sortable: true,
            width: '140px',
        },
        {
            key: 'id',
            title: 'Actions',
            render: (_: any, row: any) => (
                <div className="flex items-center justify-end gap-3 pr-2">
                    <GlassButton
                        icon={<FiEye />}
                        color="blue"
                        title="View"
                        onClick={() =>
                            showModal({
                                title: 'View Job Application',
                                content: <JobApplicationViewModal id={row.id} />,
                                type: 'custom',
                                size: 'xxl',
                            })
                        }
                    />
                </div>
            ),
            width: '100px',
            align: 'center',
        },

    ];

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
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
                            className={`group flex items-center gap-2 px-3.5 py-2 border rounded-xl text-sm font-semibold transition-all active:scale-95 ${showDate || startDate ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <Calendar size={16} className={showDate || startDate ? 'text-indigo-500' : 'text-gray-400 group-hover:text-indigo-500'} />
                            {startDate ? `${startDate} - ${endDate}` : 'Date Range'}
                        </button>
                    </div>

                    {/* Search Field */}
                    <SearchInput
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Search applications..."
                        className="mx-4"
                    />

                    <div className="flex items-center gap-4">
                        <ExportFile
                            pdfApi={() => downloadJobApplicationPdfApi({
                                search: debouncedSearchTerm,
                                full_name: debouncedFilters.full_name,
                                email: debouncedFilters.email,
                                mobile: debouncedFilters.mobile,
                                start_date: startDate,
                                end_date: endDate
                            })}
                            excelApi={() => downloadJobApplicationExcelApi({
                                search: debouncedSearchTerm,
                                full_name: debouncedFilters.full_name,
                                email: debouncedFilters.email,
                                mobile: debouncedFilters.mobile,
                                start_date: startDate,
                                end_date: endDate
                            })}
                            fileNamePrefix="job-applications"
                        />
                    </div>
                </div>

                {/* Inline General Filter Section */}
                <DynamicFilter
                    show={showFilter}
                    config={jobApplicationFilterConfig}
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

export default ManageJobApplication;