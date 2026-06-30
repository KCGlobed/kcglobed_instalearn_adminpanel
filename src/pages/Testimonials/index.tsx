import React, { useState, useEffect, useRef } from 'react';
import { Filter, Plus, Calendar } from 'lucide-react';
import DynamicServerTable from '../../components/Table/Table';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useRedux';
import { getTestimonials, removeTestimonial, updateTestimonialStatus } from '../../store/slices/testimonialSlice';
import useDebounce from '../../hooks/useDebounce';
import moment from 'moment';
import { useModal } from '../../context/ModalContext';
import toast from 'react-hot-toast';
import InlineDateFilter from '../../components/common/InlineDateFilter';
import SortDropdown from '../../components/common/SortDropdown';
import SearchInput from '../../components/common/SearchInput';
import DynamicFilter from '../../components/common/DynamicFilter';
import { testimonialFilterConfig } from '../../utils/filterConfiguration';
import { useNavigate } from 'react-router-dom';
import TestimonialForm from '../../components/Forms/TestimonialForm';
import GlassButton from '../../components/Button/Button';
import { FiEdit, FiTrash } from 'react-icons/fi';
import DeleteConfirmationModal from '../../components/Modal/DeleteModal';
import { deleteTestimonialsApi } from '../../services/apiServices';

interface ColumnDef {
    key: string;
    title: string;
    render?: (value: any, row: any) => React.ReactNode;
    width?: string;
    align?: 'left' | 'center' | 'right';
    sortable?: boolean;
}

const getTestimonialType = (type: number) => {
    switch (type) {
        case 1: return 'Placement';
        case 2: return 'Institutions';
        case 3: return 'Corporate';
        case 4: return 'Student';
        default: return 'Unknown';
    }
};

const ManageTestimonials: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [ordering, setOrdering] = useState<string>('');
    const [showFilter, setShowFilter] = useState(false);
    const [showSort, setShowSort] = useState(false);
    const [showDate, setShowDate] = useState(false);
    const { showModal } = useModal();
    const navigate = useNavigate();

    // Filter states
    const [filters, setFilters] = useState({
        name: '',
        testimonials_type: 'all',
        status: 'all' as 'all' | 'active' | 'deactive',
    });
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const debouncedFilters = useDebounce(filters, 500);

    const dispatch = useAppDispatch();
    const { data, loading, pagination } = useAppSelector((state) => state.testimonial);
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
        dispatch(getTestimonials({
            page: currentPage,
            search: debouncedSearchTerm,
            name: debouncedFilters.name,
            testimonials_type: debouncedFilters.testimonials_type !== 'all' ? debouncedFilters.testimonials_type : undefined,
            ordering,
            status: debouncedFilters.status !== 'all' ? debouncedFilters.status : undefined,
            startDate,
            endDate
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
            name: '',
            testimonials_type: 'all',
            status: 'all',
        });
    };

    const handleSort = (key: string, direction: 'asc' | 'desc') => {
        const orderPrefix = direction === 'desc' ? '-' : '';
        setOrdering(`${orderPrefix}${key}`);
    };

    const handleDirectionSort = (direction: 'asc' | 'desc') => {
        const currentKey = ordering.replace(/^-/, '') || 'name';
        handleSort(currentKey, direction);
        setShowSort(false);
    };

    // Column definitions
    const columns: ColumnDef[] = [
        {
            key: 'name',
            title: 'Testimonial',
            render: (_: any, row: any) => (
                <div className="flex items-center gap-3">
                    {row.image ? (
                        <img src={row.image} alt={row.name} className="w-10 h-10 rounded-lg object-cover border border-gray-200 shadow-sm" />
                    ) : (
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm bg-indigo-50 border border-indigo-100 text-indigo-600">
                            {row.name ? row.name.charAt(0).toUpperCase() : '?'}
                        </div>
                    )}
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 text-sm">{row.name}</span>
                        <span className="text-[10px] text-gray-500 font-medium">{row.qualification} @ {row.college}</span>
                    </div>
                </div>
            ),
            sortable: true,
            width: '250px',
        },
        {
            key: 'testimonials_type',
            title: 'Type',
            render: (value: number) => (
                <span className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                    {getTestimonialType(value)}
                </span>
            ),
            sortable: true,
            width: '120px',
        },
        {
            key: 'content',
            title: 'Content',
            render: (value: string) => (
                <div className="text-gray-600 text-xs w-full max-w-xs line-clamp-2" title={value}>
                    {value || 'No content provided.'}
                </div>
            ),
            width: '320px',
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
            render: (value: boolean, row: any) => (
                <button
                    onClick={() => {
                        dispatch(updateTestimonialStatus({ id: row.id, status: !value }))
                            .unwrap()
                            .then(() => toast.success(`Testimonial ${!value ? 'activated' : 'deactivated'} successfully`))
                            .catch((err) => toast.error(err || "Failed to update status"));
                    }}
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
            key: 'id',
            title: 'Actions',
            render: (_, row) => (
                <div className="flex items-center justify-end gap-3 pr-2">
                    <GlassButton
                        icon={<FiEdit />}
                        color="green"
                        title="Edit"
                        onClick={() => {
                            showModal({
                                title: 'Edit Testimonial',
                                content: <TestimonialForm testimonialData={row} />,
                                type: 'custom',
                                size: 'xl',
                            });
                        }}
                    />
                    <GlassButton
                        icon={<FiTrash className="text-base" />}
                        color="red"
                        title="Delete"
                        onClick={() => {
                            showModal({
                                title: 'Delete Testimonial',
                                content: <DeleteConfirmationModal
                                    id={row.id}
                                    name={row.name}
                                    onDelete={async () => {
                                        await deleteTestimonialsApi(row.id);
                                        dispatch(removeTestimonial(row.id));
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
                        placeholder="Search testimonials..."
                        className="mx-4"
                    />

                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95 shadow-indigo-200 shadow-lg"
                            onClick={() => {
                                showModal({
                                    title: 'Add Testimonial',
                                    content: <TestimonialForm />,
                                    type: 'custom',
                                    size: 'xl',
                                });
                            }}
                        >
                            <Plus size={18} strokeWidth={3} />
                            Add Testimonial
                        </button>
                    </div>
                </div>

                {/* Inline General Filter Section */}
                <DynamicFilter
                    show={showFilter}
                    config={testimonialFilterConfig}
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

export default ManageTestimonials;