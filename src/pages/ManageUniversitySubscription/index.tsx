import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useRedux';
import { getUniversities, updateUniversityStatus, approveRejectUniversity } from '../../store/slices/universitySlice';
import moment from 'moment';
import GlassButton from '../../components/Button/Button';
import { FiEye, FiSettings} from 'react-icons/fi';
import { Filter, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import AssignUniversitySubscriptionForm from '../../components/Forms/AssignUniversitySubscriptionForm';
import TabsModal from '../../components/Modal/TabsModal';
import SortDropdown from '../../components/common/SortDropdown';
import SearchInput from '../../components/common/SearchInput';
import DynamicFilter from '../../components/common/DynamicFilter';
import { universityFilterConfig } from '../../utils/filterConfiguration';
import InlineDateFilter from '../../components/common/InlineDateFilter';
import DynamicServerTable from '../../components/Table/Table';
import { useModal } from '../../context/ModalContext';
import useDebounce from '../../hooks/useDebounce';
import UniversityView from '../../components/View/UniversityView';
import ExportFile from '../../components/Forms/ExportFile';
import { downloadUniversityExcelApi, downloadUniversityPdfApi } from '../../services/apiServices';

interface ColumnDef {
    key: string;
    title: string;
    render?: (value: any, row: any) => React.ReactNode;
    width?: string;
    align?: 'left' | 'center' | 'right';
    sortable?: boolean;
}

const ManageUniversitySubscription: React.FC = () => {
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
        work_email: '',
        phone_number: '',
        status: 'all' as 'all' | 'active' | 'deactive',
    });
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const debouncedFilters = useDebounce(filters, 500);

    const dispatch = useAppDispatch();
    const { data, loading, pagination } = useAppSelector((state: any) => state.university || { data: [], loading: false, pagination: null });
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
        dispatch(getUniversities({
            page: currentPage,
            search: debouncedSearchTerm,
            first_name: debouncedFilters.first_name,
            last_name: debouncedFilters.last_name,
            work_email: debouncedFilters.work_email,
            phone_number: debouncedFilters.phone_number,
            ordering,
            status: debouncedFilters.status,
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
            work_email: '',
            phone_number: '',
            status: 'all',
        });
    };

    const handleSort = (key: string | number, direction: 'asc' | 'desc') => {
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
            title: 'Contact Person',
            render: (_: any, row: any) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">
                        {row.first_name} {row.last_name}
                    </span>
                    <span className="text-gray-400 text-[10px]">{row.work_email}</span>
                </div>
            ),
            sortable: true,
            width: '200px',
        },
        {
            key: 'institution_name',
            title: 'Institution',
            render: (_: any, row: any) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">
                        {row.institution_name}
                    </span>
                    <span className="text-gray-400 text-[10px]">{row.institution_type}</span>
                </div>
            ),
            sortable: true,
            width: '250px',
        },

        {
            key: 'approved_status',
            title: 'Approval Status',
            render: (_: any, row: any) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={async () => {
                            const nextStatus = row.approved_status === 2 ? 3 : 2;
                            try {
                                await dispatch(approveRejectUniversity({ id: row.id, approved_status: nextStatus })).unwrap();
                                toast.success(`University request ${nextStatus === 2 ? 'Approved' : 'Rejected'} successfully`);
                            } catch (err: any) {
                                toast.error(err || "Failed to update approval status");
                            }
                        }}
                        type="button"
                        role="switch"
                        aria-checked={row.approved_status === 2}
                        className={`relative cursor-pointer inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 focus:outline-none ${row.approved_status === 2 ? 'bg-emerald-500' : 'bg-gray-300'
                            }`}
                    >
                        <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-300 ${row.approved_status === 2 ? 'translate-x-5' : 'translate-x-1'
                                }`}
                        />
                    </button>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${row.approved_status === 2
                        ? 'text-emerald-700 bg-emerald-50'
                        : row.approved_status === 3
                            ? 'text-red-700 bg-red-50'
                            : 'text-amber-700 bg-amber-50'
                        }`}>
                        {row.approved_status === 2 ? 'Approved' : row.approved_status === 3 ? 'Rejected' : 'New'}
                    </span>
                </div>
            ),
            width: '180px',
            sortable: true,
        },
        {
            key: 'status',
            title: 'System Status',
            render: (value: boolean, row: any) => (
                <button
                    onClick={() => {
                        dispatch(updateUniversityStatus({ id: row.id, status: !value }))
                            .unwrap()
                            .then(() => toast.success(`University ${!value ? 'activated' : 'deactivated'} successfully`))
                            .catch((err: any) => toast.error(err || "Failed to update status"));
                    }}
                    className={`px-3 cursor-pointer py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 hover:shadow-sm ${value ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200' : 'bg-red-100 text-red-700 border border-red-200 hover:bg-red-200'}`}
                >
                    {value ? 'Active' : 'Inactive'}
                </button>
            ),
            width: '120px',
            align: 'center',
            sortable: true,
        },
        {
            key: 'created_at',
            title: 'Requested Date',
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
            key: 'actions',
            title: 'Actions',
            render: (_, row) => (
                <div className="flex items-center justify-end gap-2 pr-2">
                    <GlassButton
                        icon={<FiEye />}
                        color="blue"
                        title="View Details"
                        onClick={() =>
                            showModal({
                                title: 'University Details',
                                content: <UniversityView universityId={row.id} />,
                                type: 'custom',
                                size: 'xxl',
                            })
                        }
                    />
                    <GlassButton
                        icon={<FiSettings />}
                        color="gray"
                        title="Manage Subscriptions"
                        onClick={() =>
                            showModal({
                                title: 'Manage Subscription',
                                content: (
                                    <TabsModal
                                        defaultActiveKey="subscription"
                                        tabs={[
                                            {
                                                key: 'subscription',
                                                label: 'Assign Subscription',
                                                component: <AssignUniversitySubscriptionForm universityId={row.id} currentPlanId={row.active_subscription?.[0]?.plan_info?.id} />
                                            }
                                        ]}
                                    />
                                ),
                                type: 'custom',
                                size: 'xxl',
                            })
                        }
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
                        placeholder="Search universities..."
                        className="mx-4"
                    />

                    <div className="flex items-center gap-4">
                        <ExportFile
                            pdfApi={() => downloadUniversityPdfApi({
                                search: debouncedSearchTerm,
                                first_name: debouncedFilters.first_name,
                                last_name: debouncedFilters.last_name,
                                work_email: debouncedFilters.work_email,
                                phone_number: debouncedFilters.phone_number,
                                ordering: ordering,
                                status: debouncedFilters.status,
                                start_date: startDate,
                                end_date: endDate
                            })}
                            excelApi={() => downloadUniversityExcelApi({
                                search: debouncedSearchTerm,
                                first_name: debouncedFilters.first_name,
                                last_name: debouncedFilters.last_name,
                                work_email: debouncedFilters.work_email,
                                phone_number: debouncedFilters.phone_number,
                                ordering: ordering,
                                status: debouncedFilters.status,
                                start_date: startDate,
                                end_date: endDate
                            })}
                            fileNamePrefix="university_requests"
                        />
                    </div>
                </div>

                <DynamicFilter
                    show={showFilter}
                    config={universityFilterConfig}
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

export default ManageUniversitySubscription;