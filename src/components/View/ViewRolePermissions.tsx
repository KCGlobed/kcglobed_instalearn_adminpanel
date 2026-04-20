import { useEffect, useState, useMemo } from "react";
import { fetchRolePermissionsApi } from "../../services/apiServices";
import { Shield, CheckCircle } from "lucide-react";

const ViewRolePermissions = ({ roleName }: { roleName: string }) => {
    const [permissions, setPermissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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

    const activePermissions = useMemo(() => {
        return permissions.filter((p: any) => p.status);
    }, [permissions]);

    const groupedPermissions = useMemo(() => {
        const grouped: { [key: string]: any[] } = {};
        activePermissions.forEach((p: any) => {
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
    }, [activePermissions]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-500 font-medium animate-pulse">Loading permissions...</p>
            </div>
        );
    }

    if (activePermissions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center min-h-[300px]">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                    <Shield className="text-gray-300" size={32} />
                </div>
                <p className="font-bold text-lg text-gray-900">No Active Permissions</p>
                <p className="text-sm text-gray-500 mt-1">This role currently has no active access controls.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 p-1">
            {/* Summary Header */}
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100">
                    <Shield size={18} />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-gray-900">{roleName}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        {activePermissions.length} Active Permission{activePermissions.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {/* Permissions List */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm max-h-[55vh] overflow-y-auto">
                {Object.entries(groupedPermissions).map(([module, items]) => (
                    <div key={module}>
                        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 sticky top-0">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                {module}
                            </span>
                            <span className="ml-2 text-[10px] text-gray-400 font-bold">
                                ({items.length})
                            </span>
                        </div>
                        {items.map((item: any) => (
                            <div
                                key={item.code}
                                className="px-4 py-3 flex items-center gap-3 border-b border-gray-50 last:border-b-0 hover:bg-indigo-50/30 transition-colors"
                            >
                                <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center text-green-600 border border-green-100 shrink-0">
                                    <CheckCircle size={14} strokeWidth={3} />
                                </div>
                                <span className="text-sm font-medium text-gray-800">{item.name}</span>
                                <span className="ml-auto text-[10px] text-green-600 font-bold uppercase bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                    Active
                                </span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ViewRolePermissions;
