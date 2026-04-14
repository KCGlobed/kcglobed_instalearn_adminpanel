import { useEffect, useRef, useState } from "react";
import useDebounce from "../../../hooks/useDebounce";
import { useAppDispatch } from "../../../hooks/useAppDispatch";
import { useAppSelector } from "../../../hooks/useRedux";
import { getCource, deleteCourse } from "../../../store/slices/courceSlice";
import DeleteConfirmationModal from "../../../components/Modal/DeleteModal";
import GlassButton from "../../../components/Button/Button";
import { FiEdit, FiTrash } from "react-icons/fi";
import moment from "moment";
import DynamicServerTable from "../../../components/Table/Table";
import InlineDateFilter from "../../../components/common/InlineDateFilter";
import DynamicFilter from "../../../components/common/DynamicFilter";
import { filterConfig } from "../../../utils/filterConfiguration";
import { Calendar, Filter, Plus } from "lucide-react";
import SearchInput from "../../../components/common/SearchInput";
import ExportFile from "../../../components/Forms/ExportFile";
import SortDropdown from "../../../components/common/SortDropdown";
import { useModal } from "../../../context/ModalContext";

interface ColumnDef {
    key: string,
    title: string,
    render?: (value: any, row: any) => React.ReactNode
    width?: string;
    align?: 'left' | 'center' | 'right';
    sortable?: boolean;
}



const ManageCourses: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [ordering, setOrdering] = useState<string>('');
    const [showFilter, setShowFilter] = useState(false);
    const [showSort, setShowSort] = useState(false);
    const [showDate, setShowDate] = useState(false);
    const { showModal } = useModal();

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
    const { data, loading, pagination } = useAppSelector((state) => state.course);
    const pageSize = 5;

    const sortRef = useRef<HTMLDivElement>(null);
    const dateRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
                setShowSort(false);
            }
            if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
                setShowDate(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);

    })
    useEffect(() => {
        dispatch(getCource({
            page: currentPage,
            search: debouncedSearchTerm,
            name: debouncedFilters.name,
            description: debouncedFilters.description,
            ordering,
            status: debouncedFilters.status,
            startDate,
            endDate
        }))
    }, [dispatch, currentPage, debouncedSearchTerm, debouncedFilters.name, ordering, debouncedFilters.status, startDate, endDate])

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, debouncedFilters, startDate, endDate])

    const handleFilterChange = (name: string, value: any) => {
        setFilters((prev) => ({ ...prev, [name]: value }))
    }
    const clearFilters = () => {
        setFilters({
            name: '',
            description: '',
            status: 'all',
        })
    }

    const handleSort = (key: string, direction: 'asc' | 'desc') => {
        const orderPrefix = direction === 'desc' ? "-" : "";
        setOrdering(`${orderPrefix}${key}`);
    }
    const handleDirectionSort = (direction: 'asc' | 'desc') => {
        const currentKey = ordering.replace(/^-/, '') || 'name';
        handleSort(currentKey, direction);
        setShowSort(false);
    }

    const columns: ColumnDef[] = [
        {
            key: 'name',
            title: 'Course',
            render: (_: any, row: any) => (
                <div className="flex items-center gap-3">
                    {row.image ? (
                        <img src={row.image} alt={row.name} className="w-12 h-12 rounded-lg object-cover bg-gray-50 border border-gray-100 shadow-sm" />
                    ) : (
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm bg-indigo-50 text-indigo-600 border border-indigo-100">
                            {row.name ? row.name.charAt(0).toUpperCase() : '?'}
                        </div>
                    )}
                    <div className="flex flex-col max-w-[200px]">
                        <span className="font-semibold text-gray-900 text-sm truncate" title={row.name}>{row.name}</span>
                        {row.categories && row.categories.length > 0 && (
                            <span className="text-[11px] text-gray-500 font-medium truncate">
                                {row.categories.map((c: any) => c.category_info.name).join(', ')}
                            </span>
                        )}
                    </div>
                </div>
            ),
            sortable: true,
            width: '280px',
        },
        // {
        //     key: 'short_description',
        //     title: 'Short Description',
        //     render: (_: any, row: any) => (
        //         <div className="text-gray-600 text-[11px] w-full max-w-[200px] line-clamp-2" title={row.short_description}>
        //             {row.short_description || '-'}
        //         </div>
        //     ),
        //     sortable: true,
        //     width: '220px',
        // },
        {
            key: 'price',
            title: 'Pricing',
            render: (_: any, row: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-800">${row.price}</span>
                    {row.discount > 0 && <span className="text-[11px] text-green-600 font-medium">Discount: ${row.discount}</span>}
                </div>
            ),
            sortable: true,
            width: '120px',
        },
        {
            key: 'level',
            title: 'Level & Duration',
            render: (_: any, row: any) => (
                <div className="flex flex-col gap-1 items-start">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold w-max bg-blue-50 text-blue-600 border border-blue-100">
                        Level {row.level}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">{row.duration}</span>
                </div>
            ),
            sortable: true,
            width: '140px',
        },

        // {
        //     key: 'description',
        //     title: 'Description',
        //     render: (_: any, row: any) => (
        //         <div
        //             className="text-gray-600 text-[11px] w-full max-w-[200px] line-clamp-2 prose prose-sm prose-p:my-0 prose-ul:my-0 leading-tight"
        //             title="Description"
        //             dangerouslySetInnerHTML={{ __html: row.description || '-' }}
        //         />
        //     ),
        //     sortable: true,
        //     width: '220px',
        // },
        // {
        //     key: 'requirements',
        //     title: 'Requirements',
        //     render: (_: any, row: any) => (
        //         <div
        //             className="text-gray-600 text-[11px] w-full max-w-[200px] line-clamp-2 prose prose-sm prose-p:my-0 prose-ul:my-0 leading-tight"
        //             title="Requirements"
        //             dangerouslySetInnerHTML={{ __html: row.requirements || '-' }}
        //         />
        //     ),
        //     sortable: true,
        //     width: '220px',
        // },
        {
            key: 'tags',
            title: 'Tags',
            render: (_: any, row: any) => (
                <div className="flex flex-wrap gap-1 max-w-[220px]">
                    {row.tags?.map((t: any) => (
                        <span key={t.id} className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600 font-medium border border-gray-200 whitespace-nowrap">
                            {t.tags.name}
                        </span>
                    ))}
                    {(!row.tags || row.tags.length === 0) && <span className="text-gray-400 text-xs">-</span>}
                </div>
            ),
            width: '240px',
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
                                title: 'Edit Course',
                                content: <div className="p-8 text-center text-gray-500 font-medium">Edit form coming soon...</div>,
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
                                title: 'Delete Course',
                                content: <DeleteConfirmationModal
                                    id={row.id}
                                    name={row.name}
                                    onDelete={async (id) => {
                                        dispatch(deleteCourse(id));
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
                        placeholder="Search courses..."
                        className="mx-4"
                    />

                    <div className="flex items-center gap-4">
                        <ExportFile
                            // pdfApi={() => downloadCategoryPdfApi({
                            //     search: debouncedSearchTerm,
                            //     name: debouncedFilters.name,
                            //     description: debouncedFilters.description,
                            //     status: debouncedFilters.status,
                            //     start_date: startDate,
                            //     end_date: endDate
                            // })}
                            // excelApi={() => downloadCategoryExcelApi({
                            //     search: debouncedSearchTerm,
                            //     name: debouncedFilters.name,
                            //     description: debouncedFilters.description,
                            //     status: debouncedFilters.status,
                            //     start_date: startDate,
                            //     end_date: endDate
                            // })}
                            fileNamePrefix="courses"
                        />
                        <button className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95 shadow-indigo-200 shadow-lg"
                            onClick={() =>
                                showModal({
                                    title: "Add Course",
                                    content: <div className="p-8 text-center text-gray-500 font-medium">Add form coming soon...</div>,
                                    type: 'custom',
                                    size: 'lg',
                                })
                            }
                        >
                            <Plus size={18} strokeWidth={3} />
                            Add Course
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
            <div className="bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] overflow-x-auto border border-gray-100 custom-scrollbar">
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
    )
}

export default ManageCourses