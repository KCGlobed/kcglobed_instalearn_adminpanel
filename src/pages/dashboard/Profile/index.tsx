import React, { useState } from 'react';
import { 
    FiUser, FiSettings, FiShield, 
    FiLogOut, FiHelpCircle, FiEdit2, 
    FiMapPin, FiBriefcase, FiMail, FiPhone, FiGlobe,
    FiMonitor
} from 'react-icons/fi';

// --- Shared UI Components ---

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => (
    <div className={`bg-white border border-zinc-200 rounded-lg p-6 sm:p-8 ${className}`}>
        {children}
    </div>
);

interface SectionHeadingProps {
    title: string;
    description?: string;
}

const SectionHeading: React.FC<SectionHeadingProps> = ({ title, description }) => (
    <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">{title}</h2>
        {description && <p className="text-sm text-zinc-500 mt-1">{description}</p>}
    </div>
);

interface InputFieldProps {
    label: string;
    value?: string;
    type?: string;
    icon?: React.ElementType;
}

const InputField: React.FC<InputFieldProps> = ({ label, value, type = 'text', icon: Icon }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</label>
        <div className="relative">
            {Icon && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon className="text-zinc-400 w-4 h-4" />
                </div>
            )}
            <input 
                type={type} 
                defaultValue={value}
                className={`w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-colors outline-none py-2.5 ${Icon ? 'pl-9 pr-3' : 'px-3'}`}
            />
        </div>
    </div>
);

// --- Sub-sections ---

const HeroProfile = () => (
    <div className="bg-white border border-zinc-200 rounded-lg p-6 flex flex-col items-center text-center relative overflow-hidden group">
        {/* Subtle background element */}
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-indigo-50/50 to-transparent"></div>
        
        <div className="relative mt-2 mb-4">
            <div className="w-24 h-24 rounded-full border border-zinc-200 bg-zinc-50 flex items-center justify-center overflow-hidden">
                <FiUser className="w-10 h-10 text-zinc-400" />
            </div>
            <button className="absolute bottom-0 right-0 bg-white border border-zinc-200 p-1.5 rounded-full text-zinc-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm">
                <FiEdit2 className="w-3.5 h-3.5" />
            </button>
        </div>
        
        <h1 className="text-xl font-bold tracking-tight text-zinc-900">Admin User</h1>
        <p className="text-sm text-zinc-500 mb-4">Super Admin</p>
        
        <div className="flex gap-2 mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                Administrator
            </span>
        </div>
    </div>
);

interface NavigationProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
    const navItems = [
        { id: 'overview', label: 'Personal Info', icon: FiUser },
        { id: 'settings', label: 'Account Settings', icon: FiSettings },
        { id: 'security', label: 'Security', icon: FiShield },
    ];

    const bottomItems = [
        { id: 'help', label: 'Help Center', icon: FiHelpCircle },
        { id: 'logout', label: 'Log out', icon: FiLogOut, danger: true },
    ];

    return (
        <nav className="flex flex-col gap-8">
            <div className="flex flex-col gap-1">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                            activeTab === item.id 
                            ? 'bg-zinc-100 text-zinc-900' 
                            : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                        }`}
                    >
                        <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-indigo-600' : 'text-zinc-400'}`} />
                        {item.label}
                    </button>
                ))}
            </div>

            <div className="flex flex-col gap-1 pt-6 border-t border-zinc-200">
                {bottomItems.map((item) => (
                    <button
                        key={item.id}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                            item.danger 
                            ? 'text-rose-600 hover:bg-rose-50' 
                            : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                        }`}
                    >
                        <item.icon className={`w-4 h-4 ${item.danger ? 'text-rose-500' : 'text-zinc-400'}`} />
                        {item.label}
                    </button>
                ))}
            </div>
        </nav>
    );
};

// --- Tab Components ---

const OverviewTab = () => (
    <Card>
        <div className="flex items-center justify-between mb-8">
            <SectionHeading title="Personal Information" description="Manage your basic profile details and contact information." />
            <button className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-md hover:bg-zinc-800 transition-colors shadow-sm">
                Save Changes
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <InputField label="Full Name" value="Admin User" icon={FiUser} />
            <InputField label="Email Address" value="admin@example.com" type="email" icon={FiMail} />
            <InputField label="Phone Number" value="+1 (555) 000-0000" type="tel" icon={FiPhone} />
            <InputField label="Location" value="Headquarters" icon={FiMapPin} />
            <InputField label="Occupation" value="Super Admin" icon={FiBriefcase} />
            <InputField label="Language" value="English (US)" icon={FiGlobe} />
            
            <div className="md:col-span-2 flex flex-col gap-1.5 mt-2">
                <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">Bio</label>
                <textarea 
                    rows={4}
                    defaultValue="System administrator managing the platform operations, users, and overall system health."
                    className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-colors outline-none p-3 resize-none"
                />
            </div>
        </div>
    </Card>
);

const AccountSettingsTab = () => (
    <Card>
        <SectionHeading title="Account Settings" description="Manage your preferences and platform settings." />
        
        <div className="space-y-6">
            <div className="flex items-center justify-between pb-6 border-b border-zinc-100">
                <div>
                    <h3 className="text-sm font-semibold text-zinc-900">Email Notifications</h3>
                    <p className="text-xs text-zinc-500 mt-1">Receive system alerts and administrative reports.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
            </div>

            <div className="flex items-center justify-between pb-6 border-b border-zinc-100">
                <div>
                    <h3 className="text-sm font-semibold text-zinc-900">Dark Mode</h3>
                    <p className="text-xs text-zinc-500 mt-1">Automatically switch based on system preferences.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
            </div>
        </div>
    </Card>
);

const SecurityTab = () => (
    <Card>
        <SectionHeading title="Security" description="Protect your account and review active sessions." />
        
        <div className="space-y-6">
            <div>
                <h3 className="text-sm font-semibold text-zinc-900 mb-4">Active Devices</h3>
                <div className="space-y-3">
                    <div className="flex items-center gap-4 p-4 border border-zinc-200 rounded-md">
                        <FiMonitor className="w-5 h-5 text-zinc-400" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-zinc-900">MacBook Pro - Admin Hub</p>
                            <p className="text-xs text-zinc-500">Active now • Chrome</p>
                        </div>
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Current</span>
                    </div>
                </div>
            </div>
        </div>
    </Card>
);

// --- Main Layout ---

const Profile = () => {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 pb-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Account Settings</h1>
                    <p className="text-sm text-zinc-500 mt-1">Manage your administrative profile and security preferences.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Sidebar (Sticky) */}
                    <aside className="w-full lg:w-72 flex-shrink-0">
                        <div className="lg:sticky lg:top-8 space-y-6">
                            <HeroProfile />
                            <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
                        </div>
                    </aside>
                    
                    {/* Right Content Area */}
                    <main className="flex-1 min-w-0">
                        <div className="animate-in fade-in duration-300">
                            {activeTab === 'overview' && <OverviewTab />}
                            {activeTab === 'settings' && <AccountSettingsTab />}
                            {activeTab === 'security' && <SecurityTab />}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Profile;