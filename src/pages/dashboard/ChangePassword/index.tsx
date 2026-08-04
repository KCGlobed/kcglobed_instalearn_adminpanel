import React from 'react';
import { FiLock } from 'react-icons/fi';

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
    type?: string;
    icon?: React.ElementType;
}

const InputField: React.FC<InputFieldProps> = ({ label, type = 'text', icon: Icon }) => (
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
                className={`w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-colors outline-none py-2.5 ${Icon ? 'pl-9 pr-3' : 'px-3'}`}
            />
        </div>
    </div>
);

const ChangePassword: React.FC = () => {
    return (
        <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 pb-20">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Change Password</h1>
                    <p className="text-sm text-zinc-500 mt-1">Update your account password to stay secure.</p>
                </div>

                <Card>
                    <SectionHeading title="Update Password" description="Ensure your account uses a long, random password." />
                    
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            <InputField label="Current Password" type="password" icon={FiLock} />
                            <InputField label="New Password" type="password" icon={FiLock} />
                            <InputField label="Confirm New Password" type="password" icon={FiLock} />
                        </div>
                        
                        <div className="flex justify-end pt-4 border-t border-zinc-100">
                            <button className="px-6 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-md hover:bg-zinc-800 transition-colors shadow-sm">
                                Change Password
                            </button>
                        </div>
                    </div>
                </Card>

            </div>
        </div>
    );
};

export default ChangePassword;
