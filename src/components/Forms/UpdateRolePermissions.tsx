import { useEffect, useState, useMemo, useRef } from "react";
import { fetchRolePermissionsApi, updateRolePermissionApi } from "../../services/apiServices";
import { useModal } from "../../context/ModalContext";
import { ChevronDown, CheckCircle2, Search } from "lucide-react";
import Toggle from "../Toggle";
import toast from "react-hot-toast";

const UpdateRolePermissions = ({ roleName }: { roleName: string }) => {
    const [permissions, setPermissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPermissionCode, setSelectedPermissionCode] = useState('');
    const [toggledStatus, setToggledStatus] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasChanged, setHasChanged] = useState(false);
    const { hideModal } = useModal();

    // Custom dropdown state
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    const fetchPermissions = async () => {
        setLoading(true);
        try {
            const res = await fetchRolePermissionsApi(roleName);
            const data = Array.isArray(res) ? res : (res?.data || []);
            setPermissions(data);
        } catch (error) {
            console.error("Failed to fetch role permissions", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (roleName) {
            fetchPermissions();
        }
    }, [roleName]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
                setSearchQuery('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus search when dropdown opens
    useEffect(() => {
        if (dropdownOpen && searchRef.current) {
            searchRef.current.focus();
        }
    }, [dropdownOpen]);

    const groupedPermissions = useMemo(() => {
        const grouped: { [key: string]: any[] } = {};
        permissions.forEach((p: any) => {
            const parts = p.code.split('_');
            let moduleName = 'Other';
            if (parts.length > 1) {
                const actions = ['listing', 'create', 'update', 'delete', 'view'];
                const moduleParts = parts.filter((part: string) => !actions.includes(part));
                if (moduleParts.length > 0) {
                    moduleName = moduleParts
                        .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
                        .join(' ');
                }
            }
            if (!grouped[moduleName]) grouped[moduleName] = [];
            grouped[moduleName].push(p);
        });
        return grouped;
    }, [permissions]);

    // Filter grouped permissions by search
    const filteredGroups = useMemo(() => {
        if (!searchQuery) return groupedPermissions;
        const filtered: { [key: string]: any[] } = {};
        Object.entries(groupedPermissions).forEach(([module, items]) => {
            const matchingItems = items.filter((item: any) =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.code.toLowerCase().includes(searchQuery.toLowerCase())
            );
            if (matchingItems.length > 0) {
                filtered[module] = matchingItems;
            }
        });
        return filtered;
    }, [groupedPermissions, searchQuery]);

    const selectedPermission = permissions.find(p => p.code === selectedPermissionCode);

    // Pre-fill toggle when a permission is selected
    useEffect(() => {
        if (selectedPermissionCode) {
            const perm = permissions.find(p => p.code === selectedPermissionCode);
            setToggledStatus(perm?.status || false);
            setHasChanged(false);
        }
    }, [selectedPermissionCode, permissions]);

    const handleSelectPermission = (code: string) => {
        setSelectedPermissionCode(code);
        setDropdownOpen(false);
        setSearchQuery('');
    };

    const handleToggle = () => {
        if (!selectedPermissionCode) return;
        setToggledStatus(prev => !prev);
        setHasChanged(true);
    };

    const handleSubmit = async () => {
        if (!selectedPermissionCode) {
            toast.error('Please select a permission first');
            return;
        }
        if (!hasChanged) {
            toast.error('No changes to save');
            return;
        }

        setIsSubmitting(true);
        try {
            await updateRolePermissionApi({
                role_name: roleName,
                code: selectedPermissionCode,
                status: toggledStatus
            });
            setPermissions(prev =>
                prev.map(p =>
                    p.code === selectedPermissionCode ? { ...p, status: toggledStatus } : p
                )
            );
            setHasChanged(false);
            toast.success('Permission updated successfully');
            hideModal();
        } catch (error: any) {
            toast.error(error?.message || 'Failed to update permission');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-500 font-medium animate-pulse">Loading permissions...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-1">
            {/* Custom Dropdown */}
            <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                    Select Permission <span className="text-red-500">*</span>
                </label>
                <div ref={dropdownRef} className="relative">
                    {/* Trigger */}
                    <button
                        type="button"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl text-sm transition-all cursor-pointer ${
                            dropdownOpen
                                ? 'border-indigo-400 ring-2 ring-indigo-100 bg-white'
                                : 'border-gray-200 bg-gray-50/80 hover:border-indigo-300'
                        }`}
                    >
                        <span className={selectedPermission ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                            {selectedPermission ? selectedPermission.name : 'Choose a permission to update'}
                        </span>
                        <ChevronDown
                            size={18}
                            className={`text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {/* Dropdown Panel — always opens DOWNWARD */}
                    {dropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            {/* Search */}
                            <div className="p-3 border-b border-gray-100">
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        ref={searchRef}
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search permissions..."
                                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-gray-50"
                                    />
                                </div>
                            </div>

                            {/* Items */}
                            <div className="max-h-56 overflow-y-auto">
                                {Object.keys(filteredGroups).length === 0 ? (
                                    <div className="px-4 py-6 text-center text-sm text-gray-400">
                                        No permissions found
                                    </div>
                                ) : (
                                    Object.entries(filteredGroups).map(([module, items]) => (
                                        <div key={module}>
                                            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                                    {module}
                                                </span>
                                            </div>
                                            {items.map((item: any) => (
                                                <button
                                                    key={item.code}
                                                    type="button"
                                                    onClick={() => handleSelectPermission(item.code)}
                                                    className={`w-full text-left px-4 py-3 flex items-center gap-3 text-sm transition-colors cursor-pointer ${
                                                        selectedPermissionCode === item.code
                                                            ? 'bg-indigo-50 text-indigo-700 font-semibold'
                                                            : 'text-gray-700 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                                                        item.status ? 'bg-green-500' : 'bg-gray-300'
                                                    }`} />
                                                    <span>{item.name}</span>
                                                    {selectedPermissionCode === item.code && (
                                                        <CheckCircle2 size={16} className="ml-auto text-indigo-600" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Toggle Section */}
            <div className={`transition-all duration-300 p-5 rounded-2xl border ${
                selectedPermissionCode
                    ? 'bg-white border-indigo-100 shadow-md'
                    : 'bg-gray-50 border-gray-100 opacity-50 pointer-events-none'
            }`}>
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            Permission Status
                            {selectedPermissionCode && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                    toggledStatus ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {toggledStatus ? 'Enabled' : 'Disabled'}
                                </span>
                            )}
                        </h4>
                        <p className="text-xs text-gray-500">Toggle the switch then click Done to save.</p>
                    </div>

                    <div
                        className={`${!selectedPermissionCode ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        onClick={handleToggle}
                    >
                        <div className="pointer-events-none">
                            <Toggle enabled={toggledStatus ? 1 : 0} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                    type="button"
                    onClick={hideModal}
                    className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    disabled={!hasChanged || isSubmitting}
                    onClick={handleSubmit}
                    className={`px-8 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 transition-all flex items-center gap-2 active:scale-95 ${
                        !hasChanged || isSubmitting
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:shadow-xl hover:shadow-indigo-200 hover:scale-[1.02]'
                    }`}
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Updating...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 size={18} />
                            Update
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default UpdateRolePermissions;
