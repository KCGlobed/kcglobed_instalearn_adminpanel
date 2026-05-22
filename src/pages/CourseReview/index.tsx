import React, { useState, useEffect, useRef } from 'react';
import { Filter, Calendar, Star, MessageSquare } from 'lucide-react';
import DynamicServerTable from '../../components/Table/Table';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useRedux';
import { getCourseReview, removeCourseReview, statusCourseReview, toggleApproveReview } from '../../store/slices/courseReview';
import useDebounce from '../../hooks/useDebounce';
import moment from 'moment';
import { useModal } from '../../context/ModalContext';
import toast from 'react-hot-toast';
import GlassButton from '../../components/Button/Button';
import { FiEye, FiTrash } from 'react-icons/fi';
import DeleteConfirmationModal from '../../components/Modal/DeleteModal';
import InlineDateFilter from '../../components/common/InlineDateFilter';
import SortDropdown from '../../components/common/SortDropdown';
import DynamicFilter from '../../components/common/DynamicFilter';
import { courseReviewFilterConfig } from '../../utils/filterConfiguration';

interface ColumnDef {
    key: string;
    title: string;
    render?: (value: any, row: any) => React.ReactNode;
    width?: string;
    align?: 'left' | 'center' | 'right';
    sortable?: boolean;
}

const ReviewDetailModal: React.FC<{ reviewId: number; onClose: () => void; renderStars: (rating: number) => React.ReactNode }> = ({ reviewId, onClose, renderStars }) => {
    const dispatch = useAppDispatch();
    const review = useAppSelector((state) =>
        state.ReviewCourse.data.find((item) => item.id === reviewId)
    );

    if (!review) return null;

    return (
        <div className="flex flex-col gap-6 p-5">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100">
                    <MessageSquare size={24} />
                </div>
                <div className="flex flex-col gap-1">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Course Name</h4>
                    <p className="text-base font-bold text-slate-900">{review.course?.name || '-'}</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reviewer</span>
                    <span className="text-sm font-semibold text-slate-800 truncate" title={review.user ? `${review.user.first_name} ${review.user.last_name}` : '-'}>
                        {review.user ? `${review.user.first_name} ${review.user.last_name}` : '-'}
                    </span>
                    <span className="text-xs text-slate-500 truncate" title={review.user?.email || ''}>{review.user?.email || ''}</span>
                </div>
                <div className="flex flex-col gap-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rating & Date</span>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold text-slate-900">{review.rating || 0} / 5</span>
                        {renderStars(review.rating || 0)}
                    </div>
                    <span className="text-xs text-slate-500 mt-1">
                        {review.created_at ? moment(review.created_at).format('MMM DD, YYYY') : '-'}
                    </span>
                </div>
                <div className="flex flex-col gap-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Approval Status</span>
                    <div className="flex items-center gap-2 mt-2">
                        <button
                            onClick={async () => {
                                const nextApproved = review.approved === 1 ? 2 : 1;
                                try {
                                    await dispatch(toggleApproveReview({ id: review.id, approved: nextApproved })).unwrap();
                                    toast.success(`Review ${nextApproved === 1 ? 'approved' : 'rejected'} successfully`);
                                } catch (err: any) {
                                    onClose();
                                    toast.error(err || "Failed to update review approval");
                                }
                            }}
                            type="button"
                            role="switch"
                            aria-checked={review.approved === 1}
                            className={`relative cursor-pointer inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${review.approved === 1 ? 'bg-emerald-500' : 'bg-gray-300'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${review.approved === 1 ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                        <span className={`text-xs font-semibold ${review.approved === 1
                                ? 'text-emerald-600'
                                : review.approved === 2
                                    ? 'text-red-500'
                                    : 'text-amber-500'
                            }`}>
                            {review.approved === 1 ? 'Approved' : review.approved === 2 ? 'Rejected' : 'New'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-2 bg-indigo-50/30 p-5 rounded-2xl border border-indigo-100/50">
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Review Comment</span>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{review.review || '-'}</p>
            </div>
        </div>
    );
};

const CourseReview: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [ordering, setOrdering] = useState<string>('');
    const [showFilter, setShowFilter] = useState(false);
    const [showSort, setShowSort] = useState(false);
    const [showDate, setShowDate] = useState(false);
    const { showModal, hideModal } = useModal();

    // Filter states
    const [filters, setFilters] = useState({
        first_name: '',
        last_name: '',
        name: '',
        status: 'all' as 'all' | 'active' | 'deactive',
        approved: 'all',
    });

    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const debouncedFilters = useDebounce(filters, 500);

    const dispatch = useAppDispatch();
    const { data, loading, pagination } = useAppSelector((state) => state.ReviewCourse);
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
        dispatch(getCourseReview({
            page: currentPage,
            first_name: debouncedFilters.first_name,
            last_name: debouncedFilters.last_name,
            name: debouncedFilters.name,
            chapter: '',
            ordering,
            status: debouncedFilters.status,
            startDate,
            endDate,
            approved: debouncedFilters.approved === 'all' ? '' : debouncedFilters.approved,
        }));
    }, [dispatch, currentPage, debouncedFilters, ordering, startDate, endDate]);

    // Reset to first page when filters, startDate or endDate change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedFilters, startDate, endDate]);

    const handleFilterChange = (name: string, value: any) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({
            first_name: '',
            last_name: '',
            name: '',
            status: 'all',
            approved: 'all',
        });
    };

    const handleSort = (key: string, direction: 'asc' | 'desc') => {
        const orderPrefix = direction === 'desc' ? '-' : '';
        setOrdering(`${orderPrefix}${key}`);
    };

    const handleDirectionSort = (direction: 'asc' | 'desc') => {
        const currentKey = ordering.replace(/^-/, '') || 'course';
        handleSort(currentKey, direction);
        setShowSort(false);
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, index) => {
                    const starVal = index + 1;
                    return (
                        <Star
                            key={index}
                            size={14}
                            className={
                                starVal <= rating
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-gray-200'
                            }
                        />
                    );
                })}
            </div>
        );
    };

    const columns: ColumnDef[] = [
        {
            key: 'course__name',
            title: 'Course',
            render: (_: any, row: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm bg-indigo-50 text-indigo-600 border border-indigo-100">
                        {row.course?.name ? row.course.name.charAt(0).toUpperCase() : 'C'}
                    </div>
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
            key: 'rating',
            title: 'Rating',
            render: (value: number) => (
                <div className="flex flex-col gap-1">
                    <span className="font-bold text-gray-900 text-sm">{value || 0} / 5</span>
                    {renderStars(value || 0)}
                </div>
            ),
            sortable: false,
            width: '120px',
        },
        {
            key: 'review',
            title: 'Review',
            render: (value: string, row: any) => (
                <div className="flex flex-col gap-2 max-w-[300px]">
                    <span className="text-gray-600 text-xs line-clamp-2" title={value}>
                        {value || '-'}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                        
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${row.approved === 1
                                ? 'text-white bg-green-500'
                                : row.approved === 2
                                    ? 'text-white bg-red-500'
                                    : 'text-white bg-amber-500'
                            }`}>
                            
                            {row.approved === 1 ? 'Approved' : row.approved === 2 ? 'Rejected' : 'New'}
                            
                        </span>
                    </div>
                </div>
            ),
            width: '300px',
        },
        {
            key: 'created_at',
            title: 'Reviewed On',
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
            key: 'status',
            title: 'Status',
            render: (value: boolean, row: any) => (
                <button
                    onClick={() => {
                        dispatch(statusCourseReview(row.id));
                        toast.success(`Review ${!value ? 'activated' : 'deactivated'} successfully`);
                    }}
                    className={`px-3 cursor-pointer py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 hover:shadow-sm ${value
                        ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200'
                        : 'bg-red-100 text-red-700 border border-red-200 hover:bg-red-200'
                        }`}
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
                                title: 'Course Review Details',
                                content: (
                                    <ReviewDetailModal
                                        reviewId={row.id}
                                        onClose={hideModal}
                                        renderStars={renderStars}
                                    />
                                ),
                                type: 'custom',
                                size: 'lg',
                            })
                        }
                    />
                    <GlassButton
                        icon={<FiTrash className="text-base" />}
                        color="red"
                        title="Delete"
                        onClick={() => {
                            showModal({
                                title: 'Delete Review',
                                content: (
                                    <DeleteConfirmationModal
                                        id={row.id}
                                        name={`this review for "${row.course?.name || 'Course'}"`}
                                        onDelete={async () => {
                                            dispatch(removeCourseReview(row.id));
                                            toast.success('Review removed successfully');
                                        }}
                                    />
                                ),
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

                </div>

                {/* Inline General Filter Section */}
                <DynamicFilter
                    show={showFilter}
                    config={courseReviewFilterConfig}
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

export default CourseReview;