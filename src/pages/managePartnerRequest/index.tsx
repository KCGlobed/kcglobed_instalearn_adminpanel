import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Filter } from 'lucide-react';
import DynamicServerTable from '../../components/Table/Table';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useRedux';
import { getPartner } from '../../store/slices/partnerSlice';
import useDebounce from '../../hooks/useDebounce';
import moment from 'moment';

import { downloadPartnerExcelApi, downloadPartnerPdfApi } from '../../services/apiServices';
import ExportFile from '../../components/Forms/ExportFile';
import InlineDateFilter from '../../components/common/InlineDateFilter';
import SortDropdown from '../../components/common/SortDropdown';
import DynamicFilter from '../../components/common/DynamicFilter';
import { partnerFilterConfig } from '../../utils/filterConfiguration';
import SearchInput from '../../components/common/SearchInput';
import { useModal } from '../../context/ModalContext';
import GlassButton from '../../components/Button/Button';
import { FiEye } from 'react-icons/fi';
import PartnerViewModal from '../../components/View/PartnerViewModal';

interface ColumnDef {
    key: string;
    title: string;
    render?: (value: any, row: any) => React.ReactNode;
    width?: string;
    align?: 'left' | 'center' | 'right';
    sortable?: boolean;
}

const ManagePartnersRequest: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [ordering, setOrdering] = useState<string>('');
    const [showSort, setShowSort] = useState(false);
    const [showDate, setShowDate] = useState(false);
    const [showFilter, setShowFilter] = useState(false);

    // Filter states
    const [filters, setFilters] = useState({
        first_name: '',
        last_name: '',
        email: '',
        mobile: '',
        partner_type: ''
    });

    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const debouncedFilters = useDebounce(filters, 500);

    const dispatch = useAppDispatch();
    const { data, loading, pagination } = useAppSelector((state) => state.partner);
    const pageSize = 10;
    const { showModal } = useModal();
    
    const sortRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sortRef.current && !sortRef.current.contains(event.target as Node)) setShowSort(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch data whenever page, search, filters, dates or ordering changes
    useEffect(() => {
        dispatch(getPartner({
            page: currentPage,
            search: debouncedSearchTerm,
            first_name: debouncedFilters.first_name,
            last_name: debouncedFilters.last_name,
            email: debouncedFilters.email,
            mobile: debouncedFilters.mobile,
            partner_type: debouncedFilters.partner_type === 'all' ? '' : debouncedFilters.partner_type,
            ordering,
            start_date: startDate,
            end_date: endDate
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
            first_name: '',
            last_name: '',
            email: '',
            mobile: '',
            partner_type: ''
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
            title: 'Partner Details',
            render: (_: any, row: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-sm border border-indigo-100">
                        {row.first_name ? row.first_name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">{row.first_name} {row.last_name}</span>
                        <span className="text-[11px] text-gray-500 font-medium whitespace-nowrap">{row.email} | {row.mobile}</span>
                    </div>
                </div>
            ),
            sortable: true,
            width: '280px',
        },
        {
            key: 'partner_type',
            title: 'Partner Type',
            render: (value: string) => (
                <div className="text-gray-900 font-semibold text-sm uppercase tracking-wider">
                    {value || 'N/A'}
                </div>
            ),
            width: '150px',
        },
        {
            key: 'city',
            title: 'Location',
            render: (_: any, row: any) => (
                <div className="flex flex-col">
                    <span className="text-gray-900 font-semibold text-sm">{row.city || 'N/A'}</span>
                    <span className="text-[11px] text-gray-500 font-medium whitespace-nowrap">{row.state}, {row.country}</span>
                </div>
            ),
            width: '200px',
        },
        {
            key: 'updated_at',
            title: 'Updated at',
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
            key: 'id',
            title: 'Actions',
            render: (_: any, row: any) => (
                <div className="flex items-center justify-end gap-3 pr-2">
                    <GlassButton
                        icon={<FiEye />}
                        color="blue"
                        title="View"
                        onClick={() =>
                            showModal({
                                title: 'View Partner Request',
                                content: <PartnerViewModal id={row.id} />,
                                type: 'custom',
                                size: 'xxl',
                            })
                        }
                    />
                </div>
            ),
            width: '100px',
            align: 'center',
        },

    ];

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
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
                        placeholder="Search partners..."
                        className="mx-4"
                    />

                    <div className="flex items-center gap-4">
                        <ExportFile
                            pdfApi={() => downloadPartnerPdfApi({
                                search: debouncedSearchTerm,
                                first_name: debouncedFilters.first_name,
                                last_name: debouncedFilters.last_name,
                                email: debouncedFilters.email,
                                mobile: debouncedFilters.mobile,
                                partner_type: debouncedFilters.partner_type === 'all' ? '' : debouncedFilters.partner_type,
                                start_date: startDate,
                                end_date: endDate
                            })}
                            excelApi={() => downloadPartnerExcelApi({
                                search: debouncedSearchTerm,
                                first_name: debouncedFilters.first_name,
                                last_name: debouncedFilters.last_name,
                                email: debouncedFilters.email,
                                mobile: debouncedFilters.mobile,
                                partner_type: debouncedFilters.partner_type === 'all' ? '' : debouncedFilters.partner_type,
                                start_date: startDate,
                                end_date: endDate
                            })}
                            fileNamePrefix="partner-requests"
                        />
                    </div>
                </div>

                <DynamicFilter
                    show={showFilter}
                    config={partnerFilterConfig}
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

export default ManagePartnersRequest;
