import React, { useState, useEffect, useRef } from 'react';
import { Filter, Plus, Calendar, FileText } from 'lucide-react';
import DynamicServerTable from '../../components/Table/Table';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useRedux';
import {getLegalPages,updateLegalPageStatus,} from '../../store/slices/legalPageSlice';
import useDebounce from '../../hooks/useDebounce';
import moment from 'moment';
import { useModal } from '../../context/ModalContext';
import toast from 'react-hot-toast';
import GlassButton from '../../components/Button/Button';
import { FiEdit, FiEye } from 'react-icons/fi';
import LegalPageView from '../../components/View/LegalPageView';
import LegalPageForm from '../../components/Forms/LegalPageForm';

import InlineDateFilter from '../../components/common/InlineDateFilter';
import SortDropdown from '../../components/common/SortDropdown';
import SearchInput from '../../components/common/SearchInput';
import DynamicFilter from '../../components/common/DynamicFilter';
import { legalPageFilterConfig } from '../../utils/filterConfiguration';
import type { LegalPage } from '../../utils/types';

interface ColumnDef {
  key: string;
  title: string;
  render?: (value: any, row: any) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}



const stripHtml = (html: string) => {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '').trim();
};

const ManageLegalPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [ordering, setOrdering] = useState<string>('');
  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showDate, setShowDate] = useState(false);  
  const { showModal } = useModal();

  // Filter states
  const [filters, setFilters] = useState({
    title: '',
    page_type: '',
    status: 'all' as 'all' | 'active' | 'deactive',
  });
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedFilters = useDebounce(filters, 500);

  const dispatch = useAppDispatch();
  const { data, loading, pagination } = useAppSelector(
    (state) => state.legalPages
  );
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

  // Fetch data on filters/pagination change
  useEffect(() => {
    dispatch(
      getLegalPages({
        page: currentPage,
        search: debouncedSearchTerm,
        title: debouncedFilters.title,
        page_type: debouncedFilters.page_type,
        ordering,
        status: debouncedFilters.status,
        startDate,
        endDate,
      })
    );
  }, [dispatch, currentPage, debouncedSearchTerm, debouncedFilters, startDate, endDate, ordering]);

  // Reset to page 1 on filter/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, debouncedFilters, startDate, endDate]);

  const handleFilterChange = (name: string, value: any) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      title: '',
      page_type: '',
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

  // Columns definition
  const columns: ColumnDef[] = [
    {
      key: 'title',
      title: 'Page Title',
      render: (_: any, row: LegalPage) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm bg-indigo-50 border border-indigo-100 text-indigo-600 shrink-0">
            <FileText size={18} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-gray-900 text-sm truncate max-w-xs" title={row.title}>
              {row.title}
            </span>
            {row.slug && (
              <span className="text-[11px] text-gray-400 font-mono">/{row.slug}</span>
            )}
          </div>
        </div>
      ),
      sortable: true,
      width: '260px',
    },
    {
      key: 'page_type',
      title: 'Page Type',
      render: (value: string | number) => {
        return (
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold border bg-gray-50 text-gray-700 border-gray-200 inline-block whitespace-nowrap"
          >
            {value?.toString() || 'General'}
          </span>
        );
      },
      sortable: true,
      width: '180px',
    },
    {
      key: 'description',
      title: 'Content Preview',
      render: (value: string) => {
        const textContent = stripHtml(value);
        return (
          <div className="text-gray-600 text-xs w-full max-w-sm line-clamp-2" title={textContent}>
            {textContent || 'No description content.'}
          </div>
        );
      },
      width: '320px',
    },
    {
      key: 'created_at',
      title: 'Created On',
      render: (value: string) => (
        <div className="flex flex-col">
          <span className="text-gray-800 text-sm font-semibold">
            {value ? moment(value).format('MMM DD, YYYY') : '-'}
          </span>
          <span className="text-gray-400 text-[10px] uppercase font-bold">
            {value ? moment(value).format('hh:mm A') : ''}
          </span>
        </div>
      ),
      sortable: true,
      width: '140px',
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: boolean, row: LegalPage) => (
        <button
          onClick={() => {
            dispatch(updateLegalPageStatus({ id: row.id, status: !value }))
              .unwrap()
              .then(() => toast.success(`Page ${!value ? 'activated' : 'deactivated'} successfully`))
              .catch((err) => toast.error(err || 'Failed to update status'));
          }}
          className={`px-3 cursor-pointer py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 hover:shadow-sm ${
            value
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
      render: (_, row: LegalPage) => (
        <div className="flex items-center justify-end gap-2 pr-2">
          <GlassButton
            icon={<FiEye />}
            color="blue"
            title="View Page"
            onClick={() => {
              showModal({
                title: 'View Legal Page',
                content: <LegalPageView page={row} />,
                type: 'custom',
                size: 'xxl',
              });
            }}
          />
          <GlassButton
            icon={<FiEdit />}
            color="green"
            title="Edit Page"
            onClick={() => {
              showModal({
                title: 'Edit Legal Page',
                content: <LegalPageForm pageData={row} />,
                type: 'custom',
                size: 'xxl',
              });
            }}
          />

        </div>
      ),
      width: '130px',
      align: 'right',
    },
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Top Action Bar */}
      <div className="flex flex-col bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 relative">
        <div className="flex flex-wrap items-center justify-between px-5 py-4 gap-4">
          <div className="flex items-center gap-4">
            {/* Filter Toggle */}
            <button
              onClick={() => {
                setShowFilter(!showFilter);
                setShowDate(false);
              }}
              className={`group flex items-center gap-2 px-3.5 py-2 border rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                showFilter
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Filter
                size={16}
                className={
                  showFilter ? 'text-indigo-500' : 'text-gray-400 group-hover:text-indigo-500'
                }
              />
              Filter
            </button>

            {/* Sort Dropdown */}
            <SortDropdown
              showSort={showSort}
              setShowSort={setShowSort}
              ordering={ordering}
              onDirectionSort={handleDirectionSort}
              sortRef={sortRef}
            />

            {/* Date Filter */}
            <button
              onClick={() => {
                setShowDate(!showDate);
                setShowFilter(false);
              }}
              className={`group flex items-center gap-2 px-3.5 py-2 border rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                showDate || startDate
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Calendar
                size={16}
                className={
                  showDate || startDate ? 'text-indigo-500' : 'text-gray-400 group-hover:text-indigo-500'
                }
              />
              {startDate ? `${startDate} - ${endDate}` : 'Date Range'}
            </button>
          </div>

          {/* Search Input */}
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search legal pages..."
            className="mx-4"
          />

          {/* Add Page Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                showModal({
                  title: 'Create Legal Page',
                  content: <LegalPageForm />,
                  type: 'custom',
                  size: 'xxl',
                });
              }}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95 shadow-indigo-200 shadow-lg"
            >
              <Plus size={18} strokeWidth={3} />
              Add Page
            </button>
          </div>
        </div>

        {/* Dynamic Filter Section */}
        <DynamicFilter
          show={showFilter}
          config={legalPageFilterConfig}
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

export default ManageLegalPage;
