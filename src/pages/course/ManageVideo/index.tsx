import React, { useState, useEffect, useRef } from 'react';
import { Filter, Plus, Calendar, CheckCircle2, XCircle, UploadCloud, Clock } from 'lucide-react';
import DynamicServerTable from '../../../components/Table/Table';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useRedux';
import { getVideoListing, removeVideo, updateVideoStatus } from '../../../store/slices/videoSlice';
import useDebounce from '../../../hooks/useDebounce';
import moment from 'moment';
import { useModal } from '../../../context/ModalContext';
import toast from 'react-hot-toast';
import GlassButton from '../../../components/Button/Button';
import { FiEdit, FiTrash } from 'react-icons/fi';
import DeleteConfirmationModal from '../../../components/Modal/DeleteModal';
import { deleteVideo, downloadSubCategoryExcelApi, downloadSubCategoryPdfApi } from '../../../services/apiServices';
import ExportFile from '../../../components/Forms/ExportFile';
import InlineDateFilter from '../../../components/common/InlineDateFilter';
import SortDropdown from '../../../components/common/SortDropdown';
import SearchInput from '../../../components/common/SearchInput';
import DynamicFilter from '../../../components/common/DynamicFilter';
import { filterConfig } from '../../../utils/filterConfiguration';
import VideoForm from '../../../components/Forms/VideoForm';

// Interface matching the Table component's column requirement
interface ColumnDef {
    key: string;
    title: string;
    render?: (value: any, row: any) => React.ReactNode;
    width?: string;
    align?: 'left' | 'center' | 'right';
    sortable?: boolean;
}

const ManageVideo: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [ordering, setOrdering] = useState<string>('');
    const [showFilter, setShowFilter] = useState(false);
    const [showSort, setShowSort] = useState(false);
    const [showDate, setShowDate] = useState(false);
    const { showModal } = useModal();

    // Filter states
    const [filters, setFilters] = useState({
        name: '',
        description: '',
        status: 'all' as 'all' | 'active' | 'deactive',
    });
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const debouncedFilters = useDebounce(filters, 500);

    const dispatch = useAppDispatch();
    const { data, loading, pagination } = useAppSelector((state) => state.video);
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
        dispatch(getVideoListing({
            page: currentPage,
            search: debouncedSearchTerm,
            name: debouncedFilters.name,
            description: debouncedFilters.description,
            ordering,
            status: debouncedFilters.status,
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
            description: '',
            status: 'all',
        });
    };



    const handleSort = (key: string, direction: 'asc' | 'desc') => {
        setOrdering(direction === 'desc' ? `-${key}` : key);
    };

    const handleDirectionSort = (direction: 'asc' | 'desc') => {
        const currentField = ordering.replace(/^-/, '') || 'name';
        handleSort(currentField, direction);
        setShowSort(false);
    };

    // Column definitions
    const columns: ColumnDef[] = [
        {
            key: 'name',
            title: 'Video Name',
            render: (_: any, row: any) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">{row.name}</span>
                    <span className="text-[11px] text-gray-500 font-medium">Duration: {row.video_duration} mins</span>
                </div>
            ),
            sortable: true,
            width: '250px',
        },
        {
            key: 'description',
            title: 'Description',
            render: (value: string) => (
                <div className="text-gray-600 text-xs w-full max-w-xs line-clamp-2" title={value}>
                    {value || 'No description provided.'}
                </div>
            ),
            sortable: true,
            width: '280px',
        },
        {
            key: 'is_uploaded',
            title: 'Upload Status',
            render: (value: boolean) => (
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-max border ${value ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                    {value ? <UploadCloud size={12} /> : <Clock size={12} />}
                    {value ? 'Uploaded' : 'Pending'}
                </div>
            ),
            width: '130px',
            align: 'center',
        },
        {
            key: 'is_completed',
            title: 'Completion',
            render: (value: boolean) => (
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-max border ${value ? 'bg-green-50 text-green-600 border-green-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                    {value ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    {value ? 'Completed' : 'Incomplete'}
                </div>
            ),
            width: '130px',
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
            render: (value: boolean, row: any) => (
                <button
                    onClick={() => {
                        dispatch(updateVideoStatus({ id: row.id, status: !value }))
                            .unwrap()
                            .then(() => toast.success(`Video ${!value ? 'activated' : 'deactivated'} successfully`))
                            .catch((err: any) => toast.error(err || "Failed to update status"));
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
                        onClick={() =>
                            showModal({
                                title: 'Edit Video',
                                content: <VideoForm videoData={row} />,
                                type: 'success',
                                size: 'xl',
                            })
                        }
                    />
                    <GlassButton
                        icon={<FiTrash className="text-base" />}
                        color="red"
                        title="Delete"
                        onClick={() => {
                            showModal({
                                title: 'Delete Video',
                                content: <DeleteConfirmationModal
                                    id={row.id}
                                    name={row.name}
                                    onDelete={async (id) => {
                                        try {
                                            await deleteVideo(id);
                                            dispatch(removeVideo(id));

                                        } catch (error: any) {
                                            toast.error(error?.message || "Failed to delete video");
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
                        placeholder="Search videos..."
                        className="mx-4"
                    />

                    <div className="flex items-center gap-4">
                        <ExportFile
                            pdfApi={() => downloadSubCategoryPdfApi({
                                search: debouncedSearchTerm,
                                name: debouncedFilters.name,
                                description: debouncedFilters.description,
                                status: debouncedFilters.status,
                                start_date: startDate,
                                end_date: endDate
                            })}
                            excelApi={() => downloadSubCategoryExcelApi({
                                search: debouncedSearchTerm,
                                name: debouncedFilters.name,
                                description: debouncedFilters.description,
                                status: debouncedFilters.status,
                                start_date: startDate,
                                end_date: endDate
                            })}
                            fileNamePrefix="categories"
                        />
                        <button className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95 shadow-indigo-200 shadow-lg"
                            onClick={() =>
                                showModal({
                                    title: "Add Video",
                                    content: <VideoForm />,
                                    type: 'custom',
                                    size: 'lg',
                                })
                            }
                        >
                            <Plus size={18} strokeWidth={3} />
                            Add Video
                        </button>
                    </div>
                </div>

                {/* Inline General Filter Section */}
                <DynamicFilter
                    show={showFilter}
                    config={filterConfig}
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

export default ManageVideo;