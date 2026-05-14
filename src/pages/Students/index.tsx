import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Calendar, Plus, BookOpen, Download } from 'lucide-react';
import { useModal } from '../../context/ModalContext';
import useDebounce from '../../hooks/useDebounce';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useRedux';
import { getStudents, updateStudentStatus } from '../../store/slices/studentSlice';
import moment from 'moment';
import toast from 'react-hot-toast';
import GlassButton from '../../components/Button/Button';
import { FiDownload, FiEdit, FiEye, FiSettings } from 'react-icons/fi';
import SortDropdown from '../../components/common/SortDropdown';
import SearchInput from '../../components/common/SearchInput';
import DynamicFilter from '../../components/common/DynamicFilter';
import { studentFilterConfig } from '../../utils/filterConfiguration';
import InlineDateFilter from '../../components/common/InlineDateFilter';
import DynamicServerTable from '../../components/Table/Table';
import StudentForm from '../../components/Forms/StudentForm';
import ExportFile from '../../components/Forms/ExportFile';
import { downloadStudentExcelApi, downloadStudentPdfApi } from '../../services/apiServices';
import TabsModal from '../../components/Modal/TabsModal';
import StudentPasswordForm from '../../components/Forms/StudentPasswordForm';
import StudentReportView from '../../components/View/StudentReportView';



interface ColumnDef {
    key: string;
    title: string;
    render?: (value: any, row: any) => React.ReactNode;
    width?: string;
    align?: 'left' | 'center' | 'right';
    sortable?: boolean;
}

const ManageStudents: React.FC = () => {
    const navigate = useNavigate();
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
        is_active: 'all' as 'all' | 'active' | 'deactive',
    });
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const debouncedFilters = useDebounce(filters, 500);

    const dispatch = useAppDispatch();
    const { data, loading, pagination } = useAppSelector((state) => state.students);
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
        dispatch(getStudents({
            page: currentPage,
            search: debouncedSearchTerm,
            first_name: debouncedFilters.first_name,
            last_name: debouncedFilters.last_name,
            ordering,
            is_active: debouncedFilters.is_active,
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
            is_active: 'all',
        });
        setStartDate('');
        setEndDate('');
    };

    const handleSort = (key: string, direction: 'asc' | 'desc') => {
        const orderPrefix = direction === 'desc' ? '-' : '';
        setOrdering(`${orderPrefix}${key}`);
    };

    const handleDirectionSort = (direction: 'asc' | 'desc') => {
        const currentKey = ordering.replace(/^-/, '') || 'first_name';
        handleSort(currentKey, direction);
        setShowSort(false);
    };

    const columns: ColumnDef[] = [
        {
            key: 'first_name',
            title: 'Student',
            render: (_: any, row: any) => (
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm bg-indigo-50 text-indigo-600 border border-indigo-100 overflow-hidden"
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
            title: 'Contact Info',
            render: (_: any, row: any) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-gray-600">
                        <span className="text-xs">{row.email}</span>
                    </div>
                    {(row.phone1 || row.phone) && (
                        <div className="flex items-center gap-1.5 text-gray-600">
                            <span className="text-xs">{row.phone1 || row.phone}</span>
                        </div>
                    )}
                </div>
            ),
            width: '250px',
        },
        {
            key: 'date_joined',
            title: 'Created On',
            render: (value: string) => (
                <div className="flex flex-col">
                    <span className="text-gray-800 text-sm font-semibold">{value ? moment(value).format('MMM DD, YYYY') : '-'}</span>
                    <span className="text-gray-400 text-[10px] uppercase font-bold">{value ? moment(value).format('hh:mm A') : ''}</span>
                </div>
            ),
            sortable: true,
            width: '180px',
        },
        {
            key: 'status',
            title: 'Status',
            render: (_, row: any) => {
                const isActive = typeof row.status !== 'undefined' ? row.status : row.is_active;
                return (
                    <button
                        onClick={() => {
                            dispatch(updateStudentStatus({ id: row.id, status: !isActive }));
                            toast.success(`Student status updated`);
                        }}
                        className={`px-3 cursor-pointer py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 hover:shadow-sm ${isActive ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200' : 'bg-red-100 text-red-700 border border-red-200 hover:bg-red-200'}`}
                    >
                        {isActive ? 'Active' : 'Inactive'}
                    </button>
                );
            },
            sortable: true,
            width: '120px',
            align: 'center',
        },
        {
            key: 'id',
            title: 'Actions',
            render: (_, row) => (
                <div className="flex items-center justify-end gap-3 pr-2">
                    <GlassButton
                        icon={<FiEye />}
                        color="blue"
                        title="View"
                        onClick={() =>
                            navigate(`/dashboard/students/view/${row.id}`)
                        }
                    />
                    <GlassButton
                        title="Edit Profile"
                        icon={<FiEdit />}
                        color="blue"
                        onClick={() =>
                            showModal({
                                title: 'Edit Student Profile',
                                content: <StudentForm studentData={row} />,
                                type: 'custom',
                                size: 'xl',
                            })
                        }
                    />
                    <GlassButton
                        icon={<FiDownload className="text-base" />}
                        color="green"
                        title="Download"
                        onClick={() => {
                            showModal({
                                title: "Reports",
                                content: (
                                    <TabsModal
                                        defaultActiveKey="chapter"
                                        tabs={[
                                            {
                                                key: 'chapter',
                                                label: 'Download Reports',
                                                icon: <Download size={15} />,
                                                component: (
                                                    <StudentReportView
                                                        studentId={row.id}
                                                    />
                                                ),
                                            },
                                        ]}
                                    />
                                ),
                                type: 'custom',
                                size: 'xl',
                            });
                        }}
                    />
                    <GlassButton
                        icon={<FiSettings />}
                        color="gray"
                        title="Assign"
                        onClick={() => {
                            showModal({
                                title: 'Manage Password',
                                content: (
                                    <TabsModal
                                        defaultActiveKey="chapter"
                                        tabs={[
                                            {
                                                key: 'chapter',
                                                label: 'Change Password',
                                                icon: <BookOpen size={15} />,
                                                component: <StudentPasswordForm studentId={row.id} />,
                                            },



                                        ]}
                                    />
                                ),
                                type: 'custom',
                                size: 'xl',
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
                        placeholder="Search students..."
                        className="mx-4"
                    />
                    <div className="flex items-center gap-4">
                        <ExportFile
                            pdfApi={() => downloadStudentPdfApi({
                                search: debouncedSearchTerm,
                                first_name: debouncedFilters.first_name,
                                last_name: debouncedFilters.last_name,
                                is_active: debouncedFilters.is_active,
                                start_date: startDate,
                                end_date: endDate
                            })}
                            excelApi={() => downloadStudentExcelApi({
                                search: debouncedSearchTerm,
                                first_name: debouncedFilters.first_name,
                                last_name: debouncedFilters.last_name,
                                is_active: debouncedFilters.is_active,
                                start_date: startDate,
                                end_date: endDate
                            })}
                            fileNamePrefix="student"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => showModal({
                                title: 'Create New Student',
                                content: <StudentForm />,
                                type: 'custom',
                                size: 'xl'
                            })}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                        >
                            <Plus size={18} />
                            Add Student
                        </button>
                    </div>
                </div>

                <DynamicFilter
                    show={showFilter}
                    config={studentFilterConfig}
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

export default ManageStudents;
