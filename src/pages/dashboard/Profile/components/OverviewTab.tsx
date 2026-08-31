import React, { useState, useEffect } from 'react';
import {
    FiUser, FiMapPin, FiMail,
    FiPhone, FiGlobe, FiLoader, FiHome
} from 'react-icons/fi';

// --- Local UI Helpers ---

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-white border border-zinc-200 rounded-lg p-6 sm:p-8 ${className}`}>
        {children}
    </div>
);

const SectionHeading: React.FC<{ title: string; description?: string }> = ({ title, description }) => (
    <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">{title}</h2>
        {description && <p className="text-sm text-zinc-500 mt-1">{description}</p>}
    </div>
);

interface InputFieldProps {
    label: string;
    name: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    icon?: React.ElementType;
    disabled?: boolean;
    required?: boolean;
    placeholder?: string;
}

const InputField: React.FC<InputFieldProps> = ({
    label, name, value = '', onChange,
    type = 'text', icon: Icon, disabled = false,
    required = false, placeholder = ''
}) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            {label} {required && <span className="text-rose-500">*</span>}
        </label>
        <div className="relative">
            {Icon && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon className="text-zinc-400 w-4 h-4" />
                </div>
            )}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                placeholder={placeholder}
                required={required}
                className={`w-full ${disabled ? 'bg-zinc-100 text-zinc-500 cursor-not-allowed' : 'bg-zinc-50 text-zinc-900 focus:bg-white'} border border-zinc-200 text-sm rounded-md focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-colors outline-none py-2.5 ${Icon ? 'pl-9 pr-3' : 'px-3'}`}
            />
        </div>
    </div>
);

// --- Form Field Config ---

const PROFILE_FIELDS: { label: string; name: string; icon: React.ElementType; type?: string; required?: boolean; placeholder: string; disabled?: boolean }[] = [
    { label: 'First Name', name: 'first_name', icon: FiUser, required: true, placeholder: 'First name' },
    { label: 'Last Name', name: 'last_name', icon: FiUser, required: true, placeholder: 'Last name' },
    { label: 'Email Address', name: 'email', icon: FiMail, type: 'email', disabled: true, placeholder: '' },
    { label: 'Primary Phone (Phone 1)', name: 'phone_1', icon: FiPhone, type: 'tel', placeholder: 'e.g. 9915039343' },
    { label: 'Secondary Phone (Phone 2)', name: 'phone_2', icon: FiPhone, type: 'tel', placeholder: 'Secondary phone' },
    { label: 'Address', name: 'address', icon: FiMapPin, placeholder: '#123, South City' },
    { label: 'City', name: 'city', icon: FiMapPin, placeholder: 'City' },
    { label: 'State / Province', name: 'state', icon: FiMapPin, placeholder: 'State' },
    { label: 'Country', name: 'country', icon: FiGlobe, placeholder: 'Country' },
    { label: 'Pincode / Postal Code', name: 'pincode', icon: FiHome, placeholder: 'Pincode' },
];

// --- Main Component ---

interface OverviewTabProps {
    data: any;
    updateLoading: boolean;
    onSave: (payload: any) => Promise<void>;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ data, updateLoading, onSave }) => {
    const [formData, setFormData] = useState({
        first_name: '', last_name: '',
        phone_1: '', phone_2: '',
        address: '', city: '', state: '',
        country: '', pincode: '',
    });

    useEffect(() => {
        if (data) {
            setFormData({
                first_name: data.first_name || '',
                last_name: data.last_name || '',
                phone_1: data.phone_1 || data.phone1 || '',
                phone_2: data.phone_2 || data.phone2 || '',
                address: data.address || '',
                city: data.city || '',
                state: data.state || '',
                country: data.country || '',
                pincode: data.pincode || '',
            });
        }
    }, [data]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave(formData);
    };

    return (
        <Card>
            <form onSubmit={handleSubmit}>
                <div className="flex items-center justify-between mb-8">
                    <SectionHeading
                        title="Personal Information"
                        description="Manage your basic profile details, contact numbers, and address."
                    />
                    <button
                        type="submit"
                        disabled={updateLoading}
                        className="px-5 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-md hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer disabled:bg-zinc-400 disabled:cursor-not-allowed flex items-center gap-2 active:scale-95"
                    >
                        {updateLoading ? (
                            <>
                                <FiLoader className="w-4 h-4 animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <span>Save Changes</span>
                        )}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {PROFILE_FIELDS.map((field) => (
                        <InputField
                            key={field.name}
                            label={field.label}
                            name={field.name}
                            value={field.disabled ? (data?.email || '') : (formData as any)[field.name]}
                            onChange={field.disabled ? undefined : handleInputChange}
                            type={field.type}
                            icon={field.icon}
                            disabled={field.disabled}
                            required={field.required}
                            placeholder={field.placeholder}
                        />
                    ))}
                </div>
            </form>
        </Card>
    );
};

export default OverviewTab;
