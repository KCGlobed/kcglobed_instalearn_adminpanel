import React, { useState, useEffect, useRef } from 'react';
import { Filter, Calendar, Plus } from 'lucide-react';
import DynamicServerTable from '../../components/Table/Table';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useRedux';
import { getSubscription, removeSubscription, statusSubscription } from '../../store/slices/subscriptionSlice';
import { deleteSubscriptionApi, updateSubscriptionStatusApi } from '../../services/apiServices';
import toast from 'react-hot-toast';
import useDebounce from '../../hooks/useDebounce';
import moment from 'moment';
import InlineDateFilter from '../../components/common/InlineDateFilter';
import SortDropdown from '../../components/common/SortDropdown';
import SearchInput from '../../components/common/SearchInput';
import DynamicFilter from '../../components/common/DynamicFilter';
import { subscriptionFilterConfig } from '../../utils/filterConfiguration';
import type { Subscription } from '../../utils/types';
import { useModal } from '../../context/ModalContext';
import SubscriptionForm from '../../components/Forms/SubscriptionForm';
import GlassButton from '../../components/Button/Button';
import { FiEdit, FiTrash } from 'react-icons/fi';
import DeleteConfirmationModal from '../../components/Modal/DeleteModal';

// Interface matching the Table component's column requirement
interface ColumnDef {
    key: string;
    title: string;
    render?: (value: any, row: any) => React.ReactNode;
    width?: string;
    align?: 'left' | 'center' | 'right';
    sortable?: boolean;
}

const ManageSubscription: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [ordering, setOrdering] = useState<string>('');
    const [showFilter, setShowFilter] = useState(false);
    const [showSort, setShowSort] = useState(false);
    const [showDate, setShowDate] = useState(false);
    const { showModal } = useModal();

    // Filter states
    const [filters, setFilters] = useState({
        plan_name: '',
        status: 'all' as 'all' | 'active' | 'deactive',
    });
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const debouncedFilters = useDebounce(filters, 500);

    const dispatch = useAppDispatch();
    const { data, loading, pagination } = useAppSelector((state) => state.subscription);
    const pageSize = 10;

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
        dispatch(getSubscription({
            page: currentPage,
            search: debouncedSearchTerm,
            plan_name: debouncedFilters.plan_name,
            ordering,
            status: debouncedFilters.status !== 'all' ? debouncedFilters.status : undefined,
            startDate,
            endDate
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
            plan_name: '',
            status: 'all',
        });
    };

    const handleSort = (key: string, direction: 'asc' | 'desc') => {
        const orderPrefix = direction === 'desc' ? '-' : '';
        setOrdering(`${orderPrefix}${key}`);
    };

    const handleDirectionSort = (direction: 'asc' | 'desc') => {
        const currentKey = ordering.replace(/^-/, '') || 'plan_name';
        handleSort(currentKey, direction);
        setShowSort(false);
    };

    const handleToggleStatus = async (row: Subscription) => {
        try {
            const newStatus = !row.status;
            await updateSubscriptionStatusApi(row.id, { status: newStatus });
            dispatch(statusSubscription(row.id));
            toast.success(`Subscription ${newStatus ? 'activated' : 'deactivated'} successfully`);
        } catch (error: any) {
            toast.error(error || "Failed to update status");
        }
    };

    const handleDelete = async (row: Subscription) => {
        try {
            await deleteSubscriptionApi(row.id);
            dispatch(removeSubscription(row.id));
            toast.success("Subscription plan deleted successfully");
        } catch (error: any) {
            toast.error(error?.message || "Failed to delete subscription");
        }
    };

    // Column definitions
    const columns: ColumnDef[] = [
        {
            key: 'plan_name',
            title: 'Plan Name',
            render: (value: string, row: Subscription) => (
                <div className="flex flex-col gap-1 py-1">
                    <span className="font-bold text-gray-900 text-sm whitespace-nowrap">{value}</span>
                    {row.banner_text && (
                        <span className="text-[10px] text-white bg-indigo-500 rounded-md px-1.5 py-0.5 w-max font-semibold tracking-wide">
                            {row.banner_text}
                        </span>
                    )}
                </div>
            ),
            sortable: true,
            width: '180px',
        },
        {
            key: 'plan_description',
            title: 'Description',
            render: (value: string) => (
                <div className="text-gray-600 text-xs w-full max-w-[200px] line-clamp-2" title={value}>
                    {value || 'N/A'}
                </div>
            ),
            width: '220px',
        },
        {
            key: 'amount',
            title: 'Pricing',
            render: (_: any, row: Subscription) => (
                <div className="flex flex-col">
                    <div className="flex items-end gap-1.5">
                        <span className="text-gray-900 font-bold text-sm">
                            {row.currency === 'INR' ? '₹' : row.currency === 'USD' ? '$' : row.currency} {row.amount}
                        </span>
                        {row.original_price && row.original_price > row.amount && (
                            <span className="text-gray-400 text-xs line-through mb-0.5">
                                {row.original_price}
                            </span>
                        )}
                    </div>
                    {row.monthly_amount > 0 && (
                        <span className="text-indigo-600 font-medium text-[11px]">
                            {row.currency === 'INR' ? '₹' : row.currency === 'USD' ? '$' : row.currency} {row.monthly_amount} / month
                        </span>
                    )}
                </div>
            ),
            width: '160px',
        },
        {
            key: 'no_of_licence',
            title: 'Licenses',
            render: (value: number) => (
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold border border-blue-100">
                    {value}
                </span>
            ),
            width: '110px',
            align: 'center',
        },
        {
            key: 'created_at',
            title: 'Created On',
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
            key: 'status',
            title: 'Status',
            render: (value: boolean, row: Subscription) => (
                <button
                    onClick={() => handleToggleStatus(row)}
                    className={`px-3 cursor-pointer py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 hover:shadow-sm ${value ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200' : 'bg-red-100 text-red-700 border border-red-200 hover:bg-red-200'}`}
                >
                    {value ? 'Active' : 'Inactive'}
                </button>
            ),
            width: '100px',
            align: 'center',
            sortable: true,
        },
        {
            key: 'actions',
            title: 'Actions',
            render: (_, row: Subscription) => (
                <div className="flex items-center justify-end gap-3 pr-2">
                    <GlassButton
                        icon={<FiEdit />}
                        color="green"
                        title="Edit Plan"
                        onClick={() => {
                            showModal({
                                title: 'Edit Subscription Plan',
                                content: <SubscriptionForm subscriptionData={row} />,
                                type: 'custom',
                                size: 'xxl',
                            });
                        }}
                    />
                    <GlassButton
                        icon={<FiTrash className="text-base" />}
                        color="red"
                        title="Delete Plan"
                        onClick={() => {
                            showModal({
                                title: 'Delete Subscription Plan',
                                content: <DeleteConfirmationModal
                                    id={row.id}
                                    name={row.plan_name}
                                    onDelete={async () => {
                                        await handleDelete(row);
                                    }}
                                />,
                                type: 'custom',
                                size: 'md',
                            });
                        }}
                    />
                </div>
            ),
            width: '160px',
            align: 'right',
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
                        placeholder="Search plans..."
                        className="mx-4 flex-1 max-w-sm"
                    />

                    <button
                        className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95 shadow-indigo-200 shadow-lg"
                        onClick={() =>
                            showModal({
                                title: "Create Subscription Plan",
                                content: <SubscriptionForm />,
                                type: 'custom',
                                size: 'xxl',
                            })
                        }
                    >
                        <Plus size={18} strokeWidth={3} />
                        Add Plan
                    </button>
                </div>

                {/* Inline General Filter Section */}
                <DynamicFilter
                    show={showFilter}
                    config={subscriptionFilterConfig}
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

export default ManageSubscription;