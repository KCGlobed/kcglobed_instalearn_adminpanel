import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { forgotPassword } from '../../services/apiServices';

// ─── Validation schema ───────────────────────────────────────────────────────

const schema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
});

type FormValues = yup.InferType<typeof schema>;

// ─── Component ───────────────────────────────────────────────────────────────

const ForgotPassword: React.FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await forgotPassword({ email: data.email });
      toast.success('Password reset link sent! Please check your inbox.');
      reset();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to send reset link. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-purple-200">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-2">
          Forgot Password
        </h1>
        <p className="text-center text-gray-500 text-sm mb-6">
          Enter your registered email and we'll send you a reset link.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register('email')}
              className={`w-full px-4 py-2.5 border rounded-lg text-sm outline-none transition
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700
              disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5
              rounded-lg transition text-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Sending…
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        <div className="mt-5 text-center">
          <a href="/login" className="text-sm text-blue-600 hover:underline font-medium">
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
