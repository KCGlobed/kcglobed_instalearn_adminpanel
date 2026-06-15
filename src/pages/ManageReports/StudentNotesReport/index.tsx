import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useRedux';
import { getStudentNotes } from '../../../store/slices/studentNotesSlice';
import GlassButton from '../../../components/Button/Button';
import { FiEye } from 'react-icons/fi';
import { Filter, } from 'lucide-react';
import SortDropdown from '../../../components/common/SortDropdown';
import SearchInput from '../../../components/common/SearchInput';
import DynamicFilter from '../../../components/common/DynamicFilter';
import InlineDateFilter from '../../../components/common/InlineDateFilter';
import DynamicServerTable from '../../../components/Table/Table';
import { useModal } from '../../../context/ModalContext';
import useDebounce from '../../../hooks/useDebounce';
import ExportFile from '../../../components/Forms/ExportFile';
import { downloadStudentNotesPdfApi, downloadStudentNotesExcelApi } from '../../../services/apiServices';
import { studentNotesFilterConfig } from '../../../utils/filterConfiguration';
import StudentNotesView from '../../../components/View/StudentNotesView';

interface ColumnDef {
    key: string;
    title: string;
    render?: (value: any, row: any) => React.ReactNode;
    width?: string;
    align?: 'left' | 'center' | 'right';
    sortable?: boolean;
}

const ManageStudentNotesReport: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [ordering, setOrdering] = useState<string>('');
    const [showFilter, setShowFilter] = useState(false);
    const [showSort, setShowSort] = useState(false);
    const [showDate, setShowDate] = useState(false);
    const { showModal } = useModal();

    // Filter states
    const [filters, setFilters] = useState({
        first_name: '',
        last_name: '',
        email: '',
        course__name: '',
    });
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const debouncedFilters = useDebounce(filters, 500);

    const dispatch = useAppDispatch();
    const { data, loading, pagination } = useAppSelector((state) => state.studentNotes);
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
        dispatch(getStudentNotes({
            page: currentPage,
            search: debouncedSearchTerm,
            first_name: debouncedFilters.first_name,
            last_name: debouncedFilters.last_name,
            email: debouncedFilters.email,
            ordering,
            course: debouncedFilters.course__name,
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
            course__name: '',
        });
    };

    const handleSort = (key: string | number | symbol, direction: 'asc' | 'desc') => {
        const orderPrefix = direction === 'desc' ? '-' : '';
        setOrdering(`${orderPrefix}${String(key)}`);
    };

    const handleDirectionSort = (direction: 'asc' | 'desc') => {
        const currentKey = ordering.replace(/^-/, '') || 'user__first_name';
        handleSort(currentKey, direction);
        setShowSort(false);
    };

    const columns: ColumnDef[] = [
        {
            key: 'user__first_name',
            title: 'Student',
            render: (_: any, row: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm bg-indigo-50 text-indigo-600 border border-indigo-100 overflow-hidden flex-shrink-0">
                        <span>{row.user__first_name ? row.user__first_name.charAt(0).toUpperCase() : 'S'}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">
                            {row.user__first_name} {row.user__last_name}
                        </span>
                        <span className="text-gray-400 text-[10px]">ID: {row.user}</span>
                    </div>
                </div>
            ),
            sortable: true,
            width: '220px',
        },
        {
            key: 'user__email',
            title: 'Email',
            render: (_: any, row: any) => (
                <span className="text-gray-800 text-sm">{row.user__email || '-'}</span>
            ),
            sortable: true,
            width: '200px',
        },
        {
            key: 'user__phone1',
            title: 'Phone Number',
            render: (_: any, row: any) => (
                <span className="text-gray-800 text-sm">{row.user__phone1 || '-'}</span>
            ),
            width: '150px',
        },
        {
            key: 'user__category',
            title: 'Category',
            render: (_: any, row: any) => (
                <span className="text-gray-800 text-sm">{row.user__category || '-'}</span>
            ),
            width: '120px',
        },
        {
            key: 'course__name',
            title: 'Course Name',
            render: (_: any, row: any) => (
                <span className="text-gray-800 text-sm font-semibold">{row.course__name || '-'}</span>
            ),
            sortable: true,
            width: '220px',
        },
        {
            key: 'notes_count',
            title: 'Notes Count',
            render: (_: any, row: any) => (
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200">
                    {row.notes_count || 0}
                </span>
            ),
           
            width: '120px',
        },
        {
            key: 'actions',
            title: 'Actions',
            render: (_, row: any) => {
                const studentCourses = data
                    .filter((item: any) => item.user === row.user)
                    .map((item: any) => ({
                        id: item.course,
                        name: item.course__name,
                        notes_count: item.notes_count,
                    }));
                const uniqueCourses = studentCourses.filter((course, index, self) =>
                    self.findIndex(c => c.id === course.id) === index
                );

                return (
                    <div className="flex items-center justify-end gap-3 pr-2">
                        <GlassButton
                            icon={<FiEye />}
                            color="blue"
                            title="View Notes"
                            onClick={() =>
                                showModal({
                                    title: 'View Student Notes',
                                    content: <StudentNotesView userId={row.user} courses={uniqueCourses} initialCourseId={row.course} />,
                                    type: 'custom',
                                    size: 'xl',
                                })
                            }
                        />
                    </div>
                );
            },
            width: '80px',
            align: 'right',
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

                       
                    </div>

                    <SearchInput
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Search student notes..."
                        className="mx-4"
                    />

                    <div className="flex items-center gap-4">
                        <ExportFile
                            pdfApi={() => downloadStudentNotesPdfApi({
                                search: debouncedSearchTerm,
                                first_name: debouncedFilters.first_name,
                                last_name: debouncedFilters.last_name,
                                email: debouncedFilters.email,
                                course: debouncedFilters.course__name,
                                start_date: startDate,
                                end_date: endDate
                            })}
                            excelApi={() => downloadStudentNotesExcelApi({
                                search: debouncedSearchTerm,
                                first_name: debouncedFilters.first_name,
                                last_name: debouncedFilters.last_name,
                                email: debouncedFilters.email,
                                course: debouncedFilters.course__name,
                                start_date: startDate,
                                end_date: endDate
                            })}
                            fileNamePrefix="student-notes"
                        />
                    </div>
                </div>

                <DynamicFilter
                    show={showFilter}
                    config={studentNotesFilterConfig}
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

export default ManageStudentNotesReport;
