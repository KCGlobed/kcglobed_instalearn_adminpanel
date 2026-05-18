import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Lock, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useModal } from '../../context/ModalContext';
import { changeStudentPasswordApi } from '../../services/apiServices';

interface StudentPasswordFormProps {
    studentId: number | string;
}

interface PasswordFormValues {
    password: string;
    confirm_password: string;
}

const StudentPasswordForm: React.FC<StudentPasswordFormProps> = ({
    studentId,
}) => {
    const { hideModal } = useModal();

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<PasswordFormValues>();

    const passwordValue = watch('password');

    const onSubmit = async (data: PasswordFormValues) => {
        try {
            const payload = {
                user_id: studentId,
                password: data.password,
                confirm_password: data.confirm_password,
            };

            const res = await changeStudentPasswordApi(payload);

            if (res.status) {
                toast.success(res.message || 'Password updated successfully');
                reset();
                hideModal();
            } else {
                toast.error(res.message || 'Failed to update password');
            }
        } catch (error) {
            toast.error('Something went wrong');
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
        >
            {/* Header */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-indigo-50 border border-indigo-100">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <ShieldCheck size={22} />
                </div>

                <div>
                    <h3 className="text-sm font-bold text-indigo-900">
                        Change Student Password
                    </h3>

                    <p className="text-xs text-indigo-500 mt-1 leading-relaxed">
                        Create a secure password for the student account.
                        Make sure both passwords match before saving.
                    </p>
                </div>
            </div>

            {/* New Password */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    New Password <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                    <Lock
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                        type="password"
                        placeholder="Enter new password"
                        {...register('password', {
                            required: 'Password is required',
                            minLength: {
                                value: 6,
                                message:
                                    'Password must be at least 6 characters',
                            },
                            validate: {
                                hasSpecialCharacter: (value) =>
                                    /[!@#$%^&*(),.?":{}|<>]/.test(value) ||
                                    'Password must contain at least one special character.',
                            },
                        })}
                        className={`w-full h-12 pl-12 pr-4 rounded-2xl border bg-white text-sm font-medium transition-all outline-none
                        ${errors.password
                                ? 'border-red-300 focus:ring-4 focus:ring-red-100'
                                : 'border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
                            }`}
                    />
                </div>

                {errors.password && (
                    <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                        <AlertCircle size={13} />
                        {errors.password.message}
                    </p>
                )}
            </div>

            {/* Confirm Password */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                    <Lock
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                        type="password"
                        placeholder="Confirm password"
                        {...register('confirm_password', {
                            required: 'Confirm password is required',
                            validate: (value) =>
                                value === passwordValue ||
                                'Passwords do not match',
                        })}
                        className={`w-full h-12 pl-12 pr-4 rounded-2xl border bg-white text-sm font-medium transition-all outline-none
                        ${errors.confirm_password
                                ? 'border-red-300 focus:ring-4 focus:ring-red-100'
                                : 'border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
                            }`}
                    />
                </div>

                {errors.confirm_password && (
                    <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                        <AlertCircle size={13} />
                        {errors.confirm_password.message}
                    </p>
                )}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                    type="button"
                    onClick={() => {
                        reset();
                        hideModal();
                    }}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all active:scale-95 shadow-sm flex items-center gap-2 disabled:opacity-60"
                >
                    {isSubmitting && (
                        <Loader2 size={15} className="animate-spin" />
                    )}

                    {isSubmitting ? 'Saving...' : 'Update Password'}
                </button>
            </div>
        </form>
    );
};

export default StudentPasswordForm;