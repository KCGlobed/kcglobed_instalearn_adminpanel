import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useRedux';
import { getCorporateAdmins, updateCorporateAdminStatus } from '../../store/slices/corporateAdminSlice';
import moment from 'moment';
import GlassButton from '../../components/Button/Button';
import { FiEye, FiEdit, FiSettings } from 'react-icons/fi';
import { Filter, Calendar, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import CorporateAdminForm from '../../components/Forms/CorporateAdminForm';
import AssignSubscriptionForm from '../../components/Forms/AssignSubscriptionForm';
import CorporateAdminPasswordForm from '../../components/Forms/CorporateAdminPasswordForm';
import TabsModal from '../../components/Modal/TabsModal';
import SortDropdown from '../../components/common/SortDropdown';
import SearchInput from '../../components/common/SearchInput';
import DynamicFilter from '../../components/common/DynamicFilter';
import InlineDateFilter from '../../components/common/InlineDateFilter';
import DynamicServerTable from '../../components/Table/Table';
import { useModal } from '../../context/ModalContext';
import useDebounce from '../../hooks/useDebounce';
import CorporateAdminView from '../../components/View/CorporateAdminView';
import ExportFile from '../../components/Forms/ExportFile';
import { downloadCorporateAdminPdfApi, downloadCorporateAdminExcelApi } from '../../services/apiServices';
import { corporateAdminFilterConfig } from '../../utils/filterConfiguration';

interface ColumnDef {
    key: string;
    title: string;
    render?: (value: any, row: any) => React.ReactNode;
    width?: string;
    align?: 'left' | 'center' | 'right';
    sortable?: boolean;
}

const ManageCorporateAdmin: React.FC = () => {
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
        status: 'all',
    });
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const debouncedFilters = useDebounce(filters, 500);

    const dispatch = useAppDispatch();
    const { data, loading, pagination } = useAppSelector((state) => state.corporateAdmin);
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
        dispatch(getCorporateAdmins({
            page: currentPage,
            search: debouncedSearchTerm,
            first_name: debouncedFilters.first_name,
            last_name: debouncedFilters.last_name,
            email: debouncedFilters.email,
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
            email: '',
            status: 'all',
        });
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

    const getSubscriptionType = (type: any) => {
        const types: { [key: string]: string } = {
            '1': 'Monthly',
            '2': 'Half Yearly',
            '3': 'Yearly'
        };
        return types[String(type)] || '-';
    };



    const columns: ColumnDef[] = [
        {
            key: 'first_name',
            title: 'Admin',
            render: (_: any, row: any) => {
                const adminImg = row.image || row.Image || row.profile_image || row.avatar || row.photo || row.user_detail?.image;
                return (
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm bg-blue-50 text-blue-600 border border-blue-100 overflow-hidden shrink-0"
                        >
                            {adminImg ? (
                                <img src={adminImg} alt={row.first_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                                <span>{row.first_name ? row.first_name.charAt(0).toUpperCase() : 'A'}</span>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">
                                {row.first_name} {row.last_name}
                            </span>
                            <span className="text-gray-400 text-[10px]">ID: {row.id}</span>
                        </div>
                    </div>
                );
            },
            sortable: true,
            width: '250px',
        },
        {
            key: 'email',
            title: 'Email',
            sortable: true,
            width: '200px',
        },
        {
            key: 'is_active',
            title: 'Status',
            render: (value: boolean, row: any) => (
                <button
                    onClick={() => {
                        dispatch(updateCorporateAdminStatus({ id: row.id, status: !value }))
                            .unwrap()
                            .then(() => toast.success(`Corporate Admin ${!value ? 'activated' : 'deactivated'} successfully`))
                            .catch((err) => toast.error(err || "Failed to update status"));
                    }}
                    className={`px-3 cursor-pointer py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 hover:shadow-sm ${value ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200' : 'bg-red-100 text-red-700 border border-red-200 hover:bg-red-200'}`}
                >
                    {value ? 'Active' : 'Inactive'}
                </button>
            ),
            width: '120px',
            align: 'center',
            sortable:true,
        },
        {
            key: 'created_at',
            title: 'Joined Date',
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
            key: 'plan_name',
            title: 'Plan Name',
            render: (_: any, row: any) => (
                <span className="text-sm font-semibold text-gray-800">
                    {row.active_suscription?.plan_info?.plan_name || '-'}
                </span>
            ),
            width: '150px',
        },
        {
            key: 'subscription_type',
            title: 'Sub. Type',
            render: (_: any, row: any) => (
                <span className="text-sm text-gray-600">
                    {row.active_suscription ? getSubscriptionType(row.active_suscription.subscription_type) : '-'}
                </span>
            ),
            width: '120px',
        },
        {
            key: 'actions',
            title: 'Actions',
            render: (_, row) => (
                <div className="flex items-center justify-end gap-3 pr-2">
                    <GlassButton
                        icon={<FiEye />}
                        color="blue"
                        title="View Details"
                        onClick={() =>
                            showModal({
                                title: 'Corporate Admin Details',
                                content: <CorporateAdminView adminId={row.id} />,
                                type: 'custom',
                                size: 'xxl',
                            })
                        }
                    />
                    <GlassButton
                        icon={<FiEdit />}
                        color="green"
                        title="Edit"
                        onClick={() =>
                            showModal({
                                title: 'Edit Corporate Admin',
                                content: <CorporateAdminForm adminData={row} />,
                                type: 'custom',
                                size: 'xl',
                            })
                        }
                    />
                    <GlassButton
                        icon={<FiSettings />}
                        color="gray"
                        title="Manage Settings"
                        onClick={() =>
                            showModal({
                                title: 'Manage Settings',
                                content: (
                                    <TabsModal
                                        defaultActiveKey="subscription"
                                        tabs={[
                                            {
                                                key: 'subscription',
                                                label: 'Subscription',
                                                component: <AssignSubscriptionForm adminId={row.id} currentPlanId={row.active_suscription?.plan_info?.id} />
                                            },
                                            {
                                                key: 'password',
                                                label: 'Password',
                                                component: <CorporateAdminPasswordForm adminId={row.id} />
                                            }
                                        ]}
                                    />
                                ),
                                type: 'custom',
                                size: 'lg',
                            })
                        }
                    />
                </div>
            ),
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
                        placeholder="Search corporate admins..."
                        className="mx-4"
                    />

                    <div className="flex items-center gap-4">
                        <ExportFile pdfApi={() => downloadCorporateAdminPdfApi({
                            search: debouncedSearchTerm,
                            first_name: debouncedFilters.first_name,
                            last_name: debouncedFilters.last_name,
                            email: debouncedFilters.email,
                            status: debouncedFilters.status,
                            start_date: startDate,
                            end_date: endDate
                        })}
                            excelApi={() => downloadCorporateAdminExcelApi({
                                search: debouncedSearchTerm,
                                first_name: debouncedFilters.first_name,
                                last_name: debouncedFilters.last_name,
                                email: debouncedFilters.email,
                                status: debouncedFilters.status,
                                start_date: startDate,
                                end_date: endDate
                            })}
                            fileNamePrefix="corporate-admins"
                        />
                        <button className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95 shadow-indigo-200 shadow-lg"
                            onClick={() =>
                                showModal({
                                    title: "Add Corporate Admin",
                                    content: <CorporateAdminForm />,
                                    type: 'custom',
                                    size: 'xl',
                                })
                            }
                        >
                            <Plus size={18} strokeWidth={3} />
                            Add Corporate Admin
                        </button>
                    </div>
                </div>

                <DynamicFilter
                    show={showFilter}
                    config={corporateAdminFilterConfig}
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

export default ManageCorporateAdmin;