    import React from 'react';
import { FiUser, FiSettings, FiLock } from 'react-icons/fi';

interface NavigationProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const navItems = [
    { id: 'overview', label: 'Personal Info', icon: FiUser },
    { id: 'settings', label: 'Account Settings', icon: FiSettings },
    { id: 'Change Password', label: "Change Password", icon: FiLock }
];

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => (
    <nav className="flex flex-col gap-8">
        <div className="flex flex-col gap-1">
            {navItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer ${activeTab === item.id
                            ? 'bg-zinc-100 text-zinc-900 font-semibold'
                            : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                        }`}
                >
                    <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-zinc-900' : 'text-zinc-400'}`} />
                    {item.label}
                </button>
            ))}
        </div>
    </nav>
);

export default Navigation;
