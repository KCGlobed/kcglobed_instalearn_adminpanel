import React, { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import DynamicServerTable from '../../components/Table/Table';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useRedux';
import { fetchRoles } from '../../store/slices/roleSlice';
import useDebounce from '../../hooks/useDebounce';
import GlassButton from '../../components/Button/Button';
import { FiEdit, FiEye } from 'react-icons/fi';
import SortDropdown from '../../components/common/SortDropdown';
import SearchInput from '../../components/common/SearchInput';
import { useModal } from '../../context/ModalContext';
import ViewRolePermissions from '../../components/View/ViewRolePermissions';
import UpdateRolePermissions from '../../components/Forms/UpdateRolePermissions';

// Interface matching the Table component's column requirement
interface ColumnDef {
    key: string;
    title: string;
    render?: (value: any, row: any) => React.ReactNode;
    width?: string;
    align?: 'left' | 'center' | 'right';
    sortable?: boolean;
}

const ManageRole: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [ordering, setOrdering] = useState<string>('');
    const [showSort, setShowSort] = useState(false);

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const dispatch = useAppDispatch();
    const {
        data: rawData,
        loading,
        pagination
    } = useAppSelector((state: any) => state.roles);

    // Ensure data is an array
    const data = Array.isArray(rawData) ? rawData : [];
    const pageSize = 5;

    const sortRef = useRef<HTMLDivElement>(null);
    const { showModal } = useModal();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sortRef.current && !sortRef.current.contains(event.target as Node)) setShowSort(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        dispatch(fetchRoles({
            page: currentPage,
            search: debouncedSearchTerm,
            ordering
        }));
    }, [dispatch, currentPage, debouncedSearchTerm, ordering]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm]);

    const handleSort = (key: any, direction: 'asc' | 'desc') => {
        const orderPrefix = direction === 'desc' ? '-' : '';
        setOrdering(`${orderPrefix}${key}`);
    };

    const handleDirectionSort = (direction: 'asc' | 'desc') => {
        const currentKey = ordering.replace(/^-/, '') || 'name';
        handleSort(currentKey, direction);
        setShowSort(false);
    };

    const columns: ColumnDef[] = [
        {
            key: 'name',
            title: 'Role Name',
            render: (_: any, row: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm bg-indigo-50 text-indigo-600 border border-indigo-100">
                        {row.name ? row.name.charAt(0).toUpperCase() : 'R'}
                    </div>
                    <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">{row.name}</span>
                </div>
            ),
            sortable: true,
            width: '300px',
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
                        onClick={() => {
                            showModal({
                                title: `Permissions for ${row.name}`,
                                content: <ViewRolePermissions roleName={row.name} />,
                                type: 'custom',
                                size: 'lg',
                            });
                        }}
                    />
                    <GlassButton
                        icon={<FiEdit />}
                        color="green"
                        title="Edit"
                        onClick={() => {
                            showModal({
                                title: `Manage Permissions: ${row.name}`,
                                content: <UpdateRolePermissions roleName={row.name} />,
                                type: 'custom',
                                size: 'lg',
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
                        placeholder="Search roles..."
                        className="mx-4"
                    />

                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95 shadow-indigo-200 shadow-lg"
                            onClick={() => {/* Open Add Role Modal */ }}
                        >
                            <Plus size={18} strokeWidth={3} />
                            Add Role
                        </button>
                    </div>
                </div>
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

export default ManageRole;
