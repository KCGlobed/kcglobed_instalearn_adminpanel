import React, { useState, useEffect, useRef } from 'react';
import { Filter, Calendar, Plus } from 'lucide-react';
import DynamicServerTable from '../../components/Table/Table';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useRedux';
import { getCourseAnnouncement, removeCourse, statusCourse, updateCourseAnnouncementStatus } from '../../store/slices/courseAnnouncementSlice';
import useDebounce from '../../hooks/useDebounce';
import moment from 'moment';
import { useModal } from '../../context/ModalContext';
import GlassButton from '../../components/Button/Button';
import { FiEye, FiEdit, FiTrash } from 'react-icons/fi';
import toast from 'react-hot-toast';
import DeleteConfirmationModal from '../../components/Modal/DeleteModal';
import { deleteCourseAnnouncementApi } from '../../services/apiServices';
import InlineDateFilter from '../../components/common/InlineDateFilter';
import SortDropdown from '../../components/common/SortDropdown';
import DynamicFilter from '../../components/common/DynamicFilter';
import SearchInput from '../../components/common/SearchInput';
import { courseAnnouncementFilterConfig } from '../../utils/filterConfiguration';
import CourseAnnouncementView from '../../components/View/CourseAnnouncementView';
import CourseAnnouncementForm from '../../components/Forms/CourseAnnouncementForm';

interface ColumnDef {
    key: string;
    title: string;
    render?: (value: any, row: any) => React.ReactNode;
    width?: string;
    align?: 'left' | 'center' | 'right';
    sortable?: boolean;
}

const ManageCourseAnnoucement: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [ordering, setOrdering] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilter, setShowFilter] = useState(false);
    const [showSort, setShowSort] = useState(false);
    const [showDate, setShowDate] = useState(false);
    const { showModal, hideModal } = useModal();

    // Filter states
    const [filters, setFilters] = useState({
        title: '',
        course: '',
        status: 'all' as 'all' | 'active' | 'deactive',
    });

    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const debouncedFilters = useDebounce(filters, 500);

    const dispatch = useAppDispatch();
    const { data, loading, pagination } = useAppSelector((state) => state.courseAnnouncement);
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

    // Fetch data whenever page, filters, dates or ordering changes
    useEffect(() => {
        dispatch(getCourseAnnouncement({
            page: currentPage,
            search: debouncedSearchTerm,
            title: debouncedFilters.title,
            course: debouncedFilters.course,
            ordering,
            status: debouncedFilters.status,
            startDate,
            endDate,
        }));
    }, [dispatch, currentPage, debouncedFilters, ordering, startDate, endDate, debouncedSearchTerm]);

    // Reset to first page when filters, startDate or endDate change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedFilters, startDate, endDate, debouncedSearchTerm]);

    const handleFilterChange = (name: string, value: any) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({
            title: '',
            course: '',
            status: 'all',
        });
    };

    const handleSort = (key: string, direction: 'asc' | 'desc') => {
        const orderPrefix = direction === 'desc' ? '-' : '';
        setOrdering(`${orderPrefix}${key}`);
    };

    const handleDirectionSort = (direction: 'asc' | 'desc') => {
        const currentKey = ordering.replace(/^-/, '') || 'title';
        handleSort(currentKey, direction);
        setShowSort(false);
    };

    const columns: ColumnDef[] = [
        {
            key: 'title',
            title: 'Announcement Title',
            render: (value: string) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm bg-indigo-50 text-indigo-600 border border-indigo-100">
                        {value ? value.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div className="flex flex-col max-w-[200px]">
                        <span className="font-semibold text-gray-800 text-sm truncate block max-w-[240px]" title={value}>
                            {value || '-'}
                        </span>
                    </div>
                </div>
            ),
            sortable: true,
            width: '240px',
        },


        {
            key: 'course',
            title: 'Course',
            render: (_: any, row: any) => (
                <div className="flex items-center gap-3">
                    <div className="flex flex-col max-w-[200px]">
                        <span className="font-semibold text-gray-900 text-sm truncate" title={row.course?.name || '-'}>
                            {row.course?.name || '-'}
                        </span>
                    </div>
                </div>
            ),
            sortable: true,
            width: '220px',
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
            width: '140px',
        },
        {
            key: 'status',
            title: 'Status',
            render: (value: boolean, row: any) => (
                <button
                    onClick={() => {
                        dispatch(updateCourseAnnouncementStatus({ id: row.id, status: !value }))
                            .unwrap()
                            .then(() => {
                                dispatch(statusCourse(row.id));
                                toast.success(`Announcement ${!value ? 'activated' : 'deactivated'} successfully`);
                            })
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
                        icon={<FiEye />}
                        color="blue"
                        title="View Details"
                        onClick={() =>
                            showModal({
                                title: 'Course Announcement Details',
                                content: (
                                    <CourseAnnouncementView id={row.id} hideModal={hideModal} />
                                ),
                                type: 'custom',
                                size: 'xl',
                            })
                        }
                    />
                    <GlassButton
                        icon={<FiEdit />}
                        color="green"
                        title="Edit Announcement"
                        onClick={() =>
                            showModal({
                                title: 'Edit Course Announcement',
                                content: <CourseAnnouncementForm announcementId={row.id} />,
                                type: 'custom',
                                size: 'lg'
                            })
                        }
                    />
                    <GlassButton
                        icon={<FiTrash className="text-base" />}
                        color="red"
                        title="Delete Announcement"
                        onClick={() => {
                            showModal({
                                title: 'Delete Announcement',
                                content: <DeleteConfirmationModal
                                    id={row.id}
                                    name={row.title}
                                    onDelete={async (id) => {
                                        try {
                                            await deleteCourseAnnouncementApi(id);
                                            dispatch(removeCourse(id));
                                            toast.success("Announcement deleted successfully");
                                        } catch (error: any) {
                                            toast.error(error?.message || "Failed to delete announcement");
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
            width: '160px',
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
                        placeholder="Search announcements..."
                        className="mx-4"
                    />

                    <button
                        onClick={() => {
                            showModal({
                                title: 'Add Course Announcement',
                                content: <CourseAnnouncementForm />,
                                type: 'custom',
                                size: 'lg'
                            });
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all active:scale-95 shadow-sm"
                    >
                        <Plus size={16} />
                        Add Announcement
                    </button>
                </div>

                {/* Inline General Filter Section */}
                <DynamicFilter
                    show={showFilter}
                    config={courseAnnouncementFilterConfig}
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

export default ManageCourseAnnoucement;