import React, { useState, useEffect, useRef } from 'react';
import { Filter, Calendar } from 'lucide-react';
import DynamicServerTable from '../../../components/Table/Table';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useRedux';
import { getBlogComments, updateBlogCommentStatus, deleteBlogComment } from '../../../store/slices/blogCommentSlice';
import useDebounce from '../../../hooks/useDebounce';
import moment from 'moment';
import { useModal } from '../../../context/ModalContext';
import toast from 'react-hot-toast';
import GlassButton from '../../../components/Button/Button';
import { FiTrash } from 'react-icons/fi';
import DeleteConfirmationModal from '../../../components/Modal/DeleteModal';
import InlineDateFilter from '../../../components/common/InlineDateFilter';
import SortDropdown from '../../../components/common/SortDropdown';
import DynamicFilter from '../../../components/common/DynamicFilter';
import SearchInput from '../../../components/common/SearchInput';
import { blogCommentFilterConfig } from '../../../utils/filterConfiguration';

interface ColumnDef {
    key: string;
    title: string;
    render?: (value: any, row: any) => React.ReactNode;
    width?: string;
    align?: 'left' | 'center' | 'right';
    sortable?: boolean;
}

const ManageBlogComments: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [ordering, setOrdering] = useState<string>('');
    const [showFilter, setShowFilter] = useState(false);
    const [showSort, setShowSort] = useState(false);
    const [showDate, setShowDate] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { showModal, hideModal } = useModal();

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
    const { data, loading, pagination } = useAppSelector((state) => state.blogComment);
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

    // Fetch data whenever page, filters, dates or ordering changes
    useEffect(() => {
        dispatch(getBlogComments({
            page: currentPage,
            search: debouncedSearchTerm,
            first_name: debouncedFilters.first_name,
            last_name: debouncedFilters.last_name,
            email: debouncedFilters.email,
            ordering,
            status: debouncedFilters.status,
            startDate,
            endDate,
        }));
    }, [dispatch, currentPage, debouncedSearchTerm, debouncedFilters, ordering, startDate, endDate]);

    // Reset to first page when filters, startDate or endDate change
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
            status: 'all',
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
            title: 'User',
            render: (_: any, row: any) => (
                

                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm bg-indigo-50 text-indigo-600 border border-indigo-100">
                        {row.first_name ? row.first_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="flex flex-col max-w-[200px]">
                        <span className="font-semibold text-gray-900 text-sm truncate"title={`${row.first_name || ''} ${row.last_name || ''}`}>
                            {row.first_name || ''} {row.last_name || ''}
                        </span>
                        {row.email && (
                            <span className="text-gray-400 text-[10px] truncate" title={row.email}>
                                {row.email}
                            </span>
                        )}
                    </div>  
                </div>
            ),
            sortable:true,
            width: '180px',
        },
        {
            key: 'blog_info',
            title: 'Blog',
            render: (_: any, row: any) => (
                <div className="flex flex-col max-w-[200px]">
                    <span className="font-semibold text-gray-900 text-sm truncate" title={`${row.blog_info?.title || ''}`}>
                        {row.blog_info?.title || ''} 
                    </span>
                </div>
            ),
            sortable: false,
            width: '280px',
        },
        {
            key: 'comment',
            title: 'Comment',
            render: (value: string) => (
                <div className="flex flex-col gap-2 max-w-[300px]">
                    <span className="text-gray-600 text-xs line-clamp-2" title={value}>
                        {value || '-'}
                    </span>
                </div>
            ),
            width: '250px',
        },
        {
            key: 'status',
            title: 'Approval Status',
            render: (_: any, row: any) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={async () => {
                            const nextStatus = row.status === 1 ? 2 : 1;
                            try {
                                await dispatch(updateBlogCommentStatus({ id: row.id, status: nextStatus })).unwrap();
                                toast.success(`Comment ${nextStatus === 1 ? 'Approved' : 'Rejected'} successfully`);
                            } catch (err: any) {
                                toast.error(err || "Failed to update comment status");
                            }
                        }}
                        type="button"
                        role="switch"
                        aria-checked={row.status === 1}
                        className={`relative cursor-pointer inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 focus:outline-none ${row.status === 1 ? 'bg-emerald-500' : 'bg-gray-300'
                            }`}
                    >
                        <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-300 ${row.status === 1 ? 'translate-x-5' : 'translate-x-1'
                                }`}
                        />
                    </button>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${row.status === 1
                        ? 'text-emerald-700 bg-emerald-50'
                        : row.status === 2
                            ? 'text-red-700 bg-red-50'
                            : 'text-amber-700 bg-amber-50'
                        }`}>
                        {row.status === 1 ? 'Approved' : row.status === 2 ? 'Rejected' : 'New'}
                    </span>
                </div>
            ),
            sortable:true,
            width: '180px',
        },
        {
            key: 'created_at',
            title: 'Created On',
            render: (value: string) => (
                <div className="flex flex-col">
                    <span className="text-gray-800 text-xs font-semibold">{value ? moment(value).format('MMM DD, YYYY') : '-'}</span>
                    <span className="text-gray-400 text-[10px] uppercase font-bold">{value ? moment(value).format('hh:mm A') : ''}</span>
                </div>
            ),
            sortable: true,
            width: '130px',
        },
        {
            key: 'id',
            title: 'Actions',
            render: (_, row) => (
                <div className="flex items-center justify-end gap-3 pr-2">
                    <GlassButton
                        icon={<FiTrash className="text-base" />}
                        color="red"
                        title="Delete Comment"
                        onClick={() => {
                            showModal({
                                title: 'Delete Blog Comment',
                                content: <DeleteConfirmationModal
                                    id={row.id}
                                    name={`Comment by ${row.first_name ? row.first_name + ' ' + row.last_name : 'Unknown User'}`}
                                    onDelete={async (id) => {
                                        try {
                                            await dispatch(deleteBlogComment(id)).unwrap();
                                            toast.success("Comment deleted successfully");
                                        } catch (error: any) {
                                            toast.error(typeof error === 'string' ? error : error?.message || "Failed to delete comment");
                                        }
                                    }}
                                />,
                                type: 'custom',
                                size: 'md',
                            });
                        }}
                    />
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
                            onClick={() => {
                                setShowFilter(!showFilter);
                                setShowDate(false);
                            }}
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
                            onClick={() => {
                                setShowDate(!showDate);
                                setShowFilter(false);
                            }}
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
                        placeholder="Search comments..."
                        className="mx-4"
                    />
                </div>

                {/* Inline General Filter Section */}
                <DynamicFilter
                    show={showFilter}
                    config={blogCommentFilterConfig}
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

export default ManageBlogComments;