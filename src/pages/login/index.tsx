import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useNavigate } from 'react-router-dom';
import { getRoles, loginUser } from '../../store/slices/authSlice';
import { useAppSelector } from '../../hooks/useRedux';
import type { LoginCred } from '../../utils/types';
import { Loader2, Eye, EyeOff } from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Deterministic fingerprint for this browser/device session */
const getDeviceId = (): string => {
  const stored = localStorage.getItem('device_id');
  if (stored) return stored;
  const id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
  localStorage.setItem('device_id', id);
  return id;
};

const getDeviceType = (): string => {
  const ua = navigator.userAgent.toLowerCase();
  if (/mobile|android|iphone|ipod/.test(ua)) return 'mobile';
  if (/ipad|tablet/.test(ua)) return 'tablet';
  return 'desktop';
};

// ─── Validation schema ───────────────────────────────────────────────────────

const schema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  role: yup.string().required('Please select a role'),
});

type FormValues = yup.InferType<typeof schema>;

// ─── Component ───────────────────────────────────────────────────────────────

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);

  const { role } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { email: '', password: '', role: '' },
  });

  // Fetch available roles on mount
  useEffect(() => {
    dispatch(getRoles());
  }, [dispatch]);

  const onSubmit = async (data: FormValues) => {
    const payload: LoginCred = {
      ...data,
      device_id: getDeviceId(),
      device_type: getDeviceType(),
    };

    const result = await dispatch(loginUser(payload));

    if (loginUser.fulfilled.match(result)) {
      toast.success('Login successful! Redirecting…');
      navigate('/dashboard');
    } else {
      const errorMsg =
        (result.payload as string) ||
        'Login failed. Please check your credentials.';
      toast.error(errorMsg);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8 mx-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to access your dashboard</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register('email')}
              className={`w-full px-3 py-2.5 text-sm border rounded-lg outline-none transition
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.email ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                {...register('password')}
                className={`w-full px-3 py-2.5 pr-10 text-sm border rounded-lg outline-none transition
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${errors.password ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Role
            </label>
            <select
              id="role"
              {...register('role')}
              className={`w-full px-3 py-2.5 text-sm border rounded-lg outline-none transition bg-white
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.role ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
            >
              <option value="" disabled>
                Select a role
              </option>
              {role?.data?.map((r: { name: string }, index: number) => (
                <option key={index} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
            {errors.role && (
              <p className="mt-1 text-xs text-red-500">{errors.role.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700
              disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg
              transition text-sm mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Signing in…
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        {/* Forgot password */}
        <p className="mt-5 text-sm text-slate-500 text-center">
          <a
            href="/forgot-password"
            className="text-blue-600 hover:underline font-medium"
          >
            Forgot password?
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
