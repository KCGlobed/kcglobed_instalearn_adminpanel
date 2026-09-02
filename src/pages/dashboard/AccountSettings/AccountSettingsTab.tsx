import React from 'react';

const AccountSettingsTab: React.FC = () => (
    <div className="bg-white border border-zinc-200 rounded-lg p-6 sm:p-8">
        <div className="mb-6">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900">Account Settings</h2>
            <p className="text-sm text-zinc-500 mt-1">Manage your preferences and platform settings.</p>
        </div>

        <div className="space-y-6">
            <div className="flex items-center justify-between pb-6 border-b border-zinc-100">
                <div>
                    <h3 className="text-sm font-semibold text-zinc-900">Email Notifications</h3>
                    <p className="text-xs text-zinc-500 mt-1">Receive system alerts and administrative reports.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-zinc-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-zinc-900"></div>
                </label>
            </div>
        </div>
    </div>
);

export default AccountSettingsTab;
