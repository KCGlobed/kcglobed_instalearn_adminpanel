import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { fetchPaymentSettingsApi, updatePaymentSettingsApi } from "../../../services/apiServices";
import {
    CreditCard,
    Key,
    MonitorSmartphone,
    Clock,
    Save,
    Loader2,
    Eye,
    EyeOff,
    Copy,
    Info,
    Calendar,
    Server,
    ShieldCheck
} from "lucide-react";
import toast from "react-hot-toast";

// Validation Schema using Yup (already in package.json)
const schema = yup.object().shape({
    payment_type: yup.number().required("Payment type is required"),
    test_public_key: yup.string().required("Test Public Key is required"),
    test_secret_key: yup.string().required("Test Secret Key is required"),
    live_public_key: yup.string().required("Live Public Key is required"),
    live_secret_key: yup.string().required("Live Secret Key is required"),
    no_days_trail: yup.number().typeError("Must be a number").min(0, "Min 0 days").required(),
    try_for_free: yup.number().typeError("Must be a number").min(0, "Min 0 minutes").required(),
    allow_device_restriction: yup.boolean().required(),
    allowed_desktop: yup.number().typeError("Must be a number").min(0).required(),
    allowed_tablet: yup.number().typeError("Must be a number").min(0).required(),
    allowed_phone: yup.number().typeError("Must be a number").min(0).required(),
});

interface PaymentSettingsData {
    id?: number;
    payment_type: number;
    test_public_key: string;
    test_secret_key: string;
    live_public_key: string;
    live_secret_key: string;
    no_days_trail: number;
    try_for_free: number;
    allow_device_restriction: boolean;
    allowed_desktop: number;
    allowed_tablet: number;
    allowed_phone: number;
    created_at?: string;
    updated_at?: string;
}

const PaymentSettings = () => {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // UI States
    const [showTestSecret, setShowTestSecret] = useState(false);
    const [showLiveSecret, setShowLiveSecret] = useState(false);
    const [metaData, setMetaData] = useState<{ created_at?: string, updated_at?: string }>({});

    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<PaymentSettingsData>({
        resolver: yupResolver(schema),
        defaultValues: {
            payment_type: 1,
            allow_device_restriction: false,
            no_days_trail: 0,
            try_for_free: 0,
            allowed_desktop: 0,
            allowed_tablet: 0,
            allowed_phone: 0
        }
    });

    const allowDeviceRestriction = watch("allow_device_restriction");

    const getPaymentSettings = async () => {
        setLoading(true);
        try {
            const res = await fetchPaymentSettingsApi();
            if (res && res.data) {
                reset(res.data);
                setMetaData({
                    created_at: res.data.created_at,
                    updated_at: res.data.updated_at
                });
            }
        } catch (error) {
            console.error("Failed to fetch settings", error);
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getPaymentSettings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSubmit = async (data: PaymentSettingsData) => {
        setSubmitting(true);
        try {
            await updatePaymentSettingsApi(data);
            toast.success("Settings updated successfully");
            // Refresh metadata
            getPaymentSettings();
        } catch (error) {
            toast.error("Failed to save settings");
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const copyToClipboard = (text: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
                <p className="text-sm text-slate-500 font-medium">Fetching configuration...</p>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 mx-auto font-sans text-slate-900 min-h-screen selection:bg-indigo-100">
            {/* Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <CreditCard size={20} />
                        </div>
                        Payment & System Configuration
                    </h1>
                    <p className="text-sm text-slate-500 mt-1.5 ml-[52px]">Manage global payment gateways, credentials, and access restrictions.</p>
                </div>
                <button
                    onClick={handleSubmit(onSubmit)}
                    disabled={submitting}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-all disabled:opacity-70"
                >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Apply Changes
                </button>
            </div>

            <form className="grid grid-cols-1 lg:grid-cols-12 gap-8" onSubmit={handleSubmit(onSubmit)}>

                {/* Main section */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Gateway Section */}
                    <section className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-[13px] font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                <Server size={14} className="text-indigo-500" />
                                Payment Gateway
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="max-w-md">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Gatewway Provider</label>
                                <div className="relative">
                                    <select
                                        {...register("payment_type", { valueAsNumber: true })}
                                        className="w-full text-sm font-normal text-slate-900 p-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none appearance-none bg-white transition-all shadow-sm"
                                    >
                                        <option value={1}>Razorpay (International & Domestic)</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                    </div>
                                </div>
                                {errors.payment_type && <p className="text-xs text-red-500 mt-1.5">{errors.payment_type.message}</p>}
                            </div>
                        </div>
                    </section>

                    {/* API Credentials */}
                    <section className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-[13px] font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                <Key size={14} className="text-amber-500" />
                                API Credentials
                            </h2>
                        </div>
                        <div className="p-6 space-y-8">

                            {/* Test Keys */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                                    <h3 className="text-sm font-semibold text-slate-900">Sandbox Environment</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Test Public Key</label>
                                        <div className="relative group">
                                            <input {...register("test_public_key")} type="text" className="w-full text-sm font-normal font-mono p-2.5 pr-10 rounded-lg border border-slate-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/10 outline-none bg-slate-50 group-hover:bg-white transition-all shadow-sm" />
                                            <button type="button" onClick={() => copyToClipboard(watch("test_public_key"))} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-amber-600 transition-colors">
                                                <Copy size={16} />
                                            </button>
                                        </div>
                                        {errors.test_public_key && <p className="text-xs text-red-500 mt-1.5">{errors.test_public_key.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Test Secret Key</label>
                                        <div className="relative group">
                                            <input {...register("test_secret_key")} type={showTestSecret ? "text" : "password"} className="w-full text-sm font-normal font-mono p-2.5 pr-20 rounded-lg border border-slate-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/10 outline-none bg-slate-50 group-hover:bg-white transition-all shadow-sm" />
                                            <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
                                                <button type="button" onClick={() => setShowTestSecret(!showTestSecret)} className="p-1.5 text-slate-400 hover:text-amber-600 transition-colors">
                                                    {showTestSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                                <button type="button" onClick={() => copyToClipboard(watch("test_secret_key"))} className="p-1.5 text-slate-400 hover:text-amber-600 transition-colors">
                                                    <Copy size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        {errors.test_secret_key && <p className="text-xs text-red-500 mt-1.5">{errors.test_secret_key.message}</p>}
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            {/* Live Keys */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    <h3 className="text-sm font-semibold text-slate-900">Production Environment</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Live Public Key</label>
                                        <div className="relative group">
                                            <input {...register("live_public_key")} type="text" className="w-full text-sm font-normal font-mono p-2.5 pr-10 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/10 outline-none bg-slate-50 group-hover:bg-white transition-all shadow-sm" />
                                            <button type="button" onClick={() => copyToClipboard(watch("live_public_key"))} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-emerald-600 transition-colors">
                                                <Copy size={16} />
                                            </button>
                                        </div>
                                        {errors.live_public_key && <p className="text-xs text-red-500 mt-1.5">{errors.live_public_key.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Live Secret Key</label>
                                        <div className="relative group">
                                            <input {...register("live_secret_key")} type={showLiveSecret ? "text" : "password"} className="w-full text-sm font-normal font-mono p-2.5 pr-20 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/10 outline-none bg-slate-50 group-hover:bg-white transition-all shadow-sm" />
                                            <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
                                                <button type="button" onClick={() => setShowLiveSecret(!showLiveSecret)} className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors">
                                                    {showLiveSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                                <button type="button" onClick={() => copyToClipboard(watch("live_secret_key"))} className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors">
                                                    <Copy size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        {errors.live_secret_key && <p className="text-xs text-red-500 mt-1.5">{errors.live_secret_key.message}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-8">

                    {/* Trial Settings */}
                    <aside className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-[13px] font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                <Clock size={14} className="text-sky-500" />
                                Trial Configuration
                            </h2>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Trial Duration (Days)</label>
                                <input {...register("no_days_trail", { valueAsNumber: true })} type="number" min="0" className="w-full text-sm font-normal text-slate-900 p-2.5 rounded-lg border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 outline-none" />
                                {errors.no_days_trail && <p className="text-xs text-red-500 mt-1.5">{errors.no_days_trail.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Free Access (Minutes)</label>
                                <input {...register("try_for_free", { valueAsNumber: true })} type="number" min="0" className="w-full text-sm font-normal text-slate-900 p-2.5 rounded-lg border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 outline-none" />
                                {errors.try_for_free && <p className="text-xs text-red-500 mt-1.5">{errors.try_for_free.message}</p>}
                            </div>
                        </div>
                    </aside>

                    {/* Security Settings */}
                    <aside className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <h2 className="text-[13px] font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                <MonitorSmartphone size={14} className="text-purple-500" />
                                Access Policy
                            </h2>
                            <label className="relative inline-flex items-center cursor-pointer group">
                                <input type="checkbox" {...register("allow_device_restriction")} className="sr-only peer" />
                                <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-purple-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-focus:ring-2 peer-focus:ring-purple-200"></div>
                            </label>
                        </div>
                        <div className={`p-6 space-y-6 transition-all duration-300 ${!allowDeviceRestriction ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                            <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-lg text-xs text-purple-700 flex gap-2.5 leading-relaxed">
                                <ShieldCheck size={14} className="shrink-0 mt-0.5" />
                                Restrict the number of active sessions per user account across device types.
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-tighter text-center">Desktop</label>
                                    <input {...register("allowed_desktop", { valueAsNumber: true })} type="number" min="0" className="w-full text-sm font-normal p-2 rounded-lg border border-slate-200 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/20 outline-none text-center" />
                                    {errors.allowed_desktop && <p className="text-[10px] text-red-500 text-center">{errors.allowed_desktop.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-tighter text-center">Tablet</label>
                                    <input {...register("allowed_tablet", { valueAsNumber: true })} type="number" min="0" className="w-full text-sm font-normal p-2 rounded-lg border border-slate-200 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/20 outline-none text-center" />
                                    {errors.allowed_tablet && <p className="text-[10px] text-red-500 text-center">{errors.allowed_tablet.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-tighter text-center">Phone</label>
                                    <input {...register("allowed_phone", { valueAsNumber: true })} type="number" min="0" className="w-full text-sm font-normal p-2 rounded-lg border border-slate-200 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/20 outline-none text-center" />
                                    {errors.allowed_phone && <p className="text-[10px] text-red-500 text-center">{errors.allowed_phone.message}</p>}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Metadata Area */}
                    <aside className="bg-slate-50/80 rounded-xl border border-slate-200 p-6">
                        <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Info size={12} />
                            System Audit
                        </h2>
                        <div className="space-y-2.5">
                            <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                                <span className="text-xs font-medium text-slate-500">Created</span>
                                <span className="text-[11px] font-normal text-slate-700 flex items-center gap-1.5">
                                    <Calendar size={12} className="text-slate-400" /> {formatDate(metaData.created_at)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                                <span className="text-xs font-medium text-slate-500">Updated</span>
                                <span className="text-[11px] font-normal text-slate-700 flex items-center gap-1.5">
                                    <Calendar size={12} className="text-slate-400" /> {formatDate(metaData.updated_at)}
                                </span>
                            </div>
                        </div>
                    </aside>
                </div>

            </form>
        </div>
    );
};

export default PaymentSettings;