import React, { useState } from 'react';
import { FiLock, FiEye, FiEyeOff, FiLoader, FiAlertCircle, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useRedux';
import { updatePassword } from '../../../store/slices/profileSlice';
import type { UpdatePasswordPayload } from '../../../utils/types';

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

interface PasswordInputFieldProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: () => void;
    showPassword: boolean;
    onToggleShowPassword: () => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
}

const PasswordInputField: React.FC<PasswordInputFieldProps> = ({
    label,
    name,
    value,
    onChange,
    onBlur,
    showPassword,
    onToggleShowPassword,
    placeholder = '',
    required = true,
    disabled = false,
    error,
}) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            {label} {required && <span className="text-rose-500">*</span>}
        </label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className={`w-4 h-4 ${error ? 'text-rose-400' : 'text-zinc-400'}`} />
            </div>
            <input
                type={showPassword ? 'text' : 'password'}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                disabled={disabled}
                placeholder={placeholder}
                required={required}
                className={`w-full text-zinc-900 text-sm rounded-md transition-colors outline-none py-2.5 pl-9 pr-10 ${
                    error
                        ? 'bg-rose-50/30 border border-rose-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 focus:bg-white'
                        : 'bg-zinc-50 border border-zinc-200 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 focus:bg-white'
                } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
            />
            <button
                type="button"
                onClick={onToggleShowPassword}
                disabled={disabled}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 transition focus:outline-none"
            >
                {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
            </button>
        </div>
        {error && (
            <div className="flex items-center gap-1.5 text-xs text-rose-600 mt-0.5 animate-in fade-in duration-200">
                <FiAlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{error}</span>
            </div>
        )}
    </div>
);

export interface ChangePasswordProps {
    onSave?: (payload: UpdatePasswordPayload) => Promise<void>;
    loading?: boolean;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ onSave, loading: externalLoading }) => {
    const dispatch = useAppDispatch();
    const { passwordLoading } = useAppSelector((state: any) => state.profile || {});

    const isLoading = externalLoading ?? passwordLoading ?? false;

    const [formData, setFormData] = useState<UpdatePasswordPayload>({
        current_password: '',
        password: '',
        confirm_password: '',
    });

    const [errors, setErrors] = useState<{
        current_password?: string;
        password?: string;
        confirm_password?: string;
    }>({});

    const [touched, setTouched] = useState<{
        current_password?: boolean;
        password?: boolean;
        confirm_password?: boolean;
    }>({});

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Validation logic
    const validateField = (name: string, value: string, currentForm: UpdatePasswordPayload) => {
        let error = '';

        if (name === 'current_password') {
            if (!value.trim()) {
                error = 'Current password is required.';
            }
        }

        if (name === 'password') {
            if (!value.trim()) {
                error = 'New password is required.';
            } else if (value.length < 8) {
                error = 'New password must have at least 8 characters.';
            } else if (currentForm.current_password && value === currentForm.current_password) {
                error = 'New password must be different from current password.';
            }
        }

        if (name === 'confirm_password') {
            if (!value.trim()) {
                error = 'Please confirm your new password.';
            } else if (value.length < 8) {
                error = 'Confirm password must have at least 8 characters.';
            } else if (currentForm.password && value !== currentForm.password) {
                error = 'Passwords do not match.';
            }
        }

        return error;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const updatedForm = {
            ...formData,
            [name]: value,
        };
        setFormData(updatedForm);

        // If field was already touched, validate on change
        if (touched[name as keyof typeof touched]) {
            const fieldError = validateField(name, value, updatedForm);
            setErrors((prev) => ({
                ...prev,
                [name]: fieldError || undefined,
            }));

            // Also revalidate confirm_password if password changes
            if (name === 'password' && touched.confirm_password) {
                const confirmError = validateField('confirm_password', updatedForm.confirm_password, updatedForm);
                setErrors((prev) => ({
                    ...prev,
                    confirm_password: confirmError || undefined,
                }));
            }
        }
    };

    const handleBlur = (field: keyof UpdatePasswordPayload) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        const fieldError = validateField(field, formData[field], formData);
        setErrors((prev) => ({
            ...prev,
            [field]: fieldError || undefined,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Mark all touched
        setTouched({
            current_password: true,
            password: true,
            confirm_password: true,
        });

        // Validate all fields
        const curError = validateField('current_password', formData.current_password, formData);
        const passError = validateField('password', formData.password, formData);
        const confError = validateField('confirm_password', formData.confirm_password, formData);

        const newErrors = {
            current_password: curError || undefined,
            password: passError || undefined,
            confirm_password: confError || undefined,
        };

        setErrors(newErrors);

        if (curError || passError || confError) {
            const firstError = curError || passError || confError;
            toast.error(firstError);
            return;
        }

        try {
            if (onSave) {
                await onSave(formData);
            } else {
                await dispatch(updatePassword(formData)).unwrap();
                toast.success('Password updated successfully!');
            }

            // Reset form upon successful update
            setFormData({
                current_password: '',
                password: '',
                confirm_password: '',
            });
            setErrors({});
            setTouched({});
        } catch (err: any) {
            if (!onSave) {
                const errorMsg = typeof err === 'string' ? err : err?.message || 'Failed to update password';
                toast.error(errorMsg);
            }
        }
    };

    // Live validation indicators for new password
    const hasMinLength = formData.password.length >= 8;
    const passwordsMatch = Boolean(formData.password && formData.confirm_password && formData.password === formData.confirm_password);

    return (
        <Card>
            <SectionHeading
                title="Update Password"
                description="Ensure your account uses a secure and strong password with at least 8 characters."
            />

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-5">
                    <PasswordInputField
                        label="Current Password"
                        name="current_password"
                        value={formData.current_password}
                        onChange={handleChange}
                        onBlur={() => handleBlur('current_password')}
                        showPassword={showCurrentPassword}
                        onToggleShowPassword={() => setShowCurrentPassword((prev) => !prev)}
                        placeholder="Enter your current password"
                        disabled={isLoading}
                        error={touched.current_password ? errors.current_password : undefined}
                    />

                    <PasswordInputField
                        label="New Password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={() => handleBlur('password')}
                        showPassword={showNewPassword}
                        onToggleShowPassword={() => setShowNewPassword((prev) => !prev)}
                        placeholder="Enter new password (min. 8 characters)"
                        disabled={isLoading}
                        error={touched.password ? errors.password : undefined}
                    />

                    <PasswordInputField
                        label="Confirm New Password"
                        name="confirm_password"
                        value={formData.confirm_password}
                        onChange={handleChange}
                        onBlur={() => handleBlur('confirm_password')}
                        showPassword={showConfirmPassword}
                        onToggleShowPassword={() => setShowConfirmPassword((prev) => !prev)}
                        placeholder="Confirm your new password (min. 8 characters)"
                        disabled={isLoading}
                        error={touched.confirm_password ? errors.confirm_password : undefined}
                    />
                </div>

                {/* Password Requirements Helper Checklist */}
                {formData.password.length > 0 && (
                    <div className="bg-zinc-50 border border-zinc-200/80 rounded-md p-3.5 text-xs space-y-1.5 animate-in fade-in duration-200">
                        <p className="font-semibold text-zinc-700 mb-1">Password Requirements:</p>
                        <div className="flex items-center gap-2">
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                                hasMinLength ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-200 text-zinc-500'
                            }`}>
                                <FiCheck className="w-2.5 h-2.5" />
                            </span>
                            <span className={hasMinLength ? 'text-emerald-700 font-medium' : 'text-zinc-500'}>
                                Minimum 8 characters
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                                passwordsMatch ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-200 text-zinc-500'
                            }`}>
                                <FiCheck className="w-2.5 h-2.5" />
                            </span>
                            <span className={passwordsMatch ? 'text-emerald-700 font-medium' : 'text-zinc-500'}>
                                New password and confirm password match
                            </span>
                        </div>
                    </div>
                )}

                <div className="flex justify-end pt-4 border-t border-zinc-100">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-md hover:bg-zinc-800 transition-colors shadow-sm ${
                            isLoading ? 'cursor-not-allowed opacity-75' : ''
                        }`}
                    >
                        {isLoading ? (
                            <>
                                <FiLoader className="w-4 h-4 animate-spin" />
                                <span>Updating Password...</span>
                            </>
                        ) : (
                            <span>Change Password</span>
                        )}
                    </button>
                </div>
            </form>
        </Card>
    );
};

export default ChangePassword;
