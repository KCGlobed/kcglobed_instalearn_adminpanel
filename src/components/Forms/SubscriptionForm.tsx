import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useModal } from "../../context/ModalContext";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { addSubscription, editSubscription } from "../../store/slices/subscriptionSlice";
import toast from "react-hot-toast";
import { Package, Loader2, AlertCircle, Plus, Trash2 } from "lucide-react";
import type { Subscription } from "../../utils/types";

interface Option { label: string; value: string; }

const planTypeOptions: Option[] = [
    { label: "Monthly", value: "1" },
    { label: "Half Yearly", value: "2" },
    { label: "Yearly", value: "3" },
];

const schema = yup.object().shape({
    plan_name: yup.string().required("Plan Name is mandatory"),
    banner_text: yup.string().nullable().default(""),
    plan_description: yup.string().required("Description is mandatory"),
    currency: yup.string().required("Currency is mandatory"),
    amount: yup.number().typeError("Amount must be a number").min(0, "Cannot be negative").required("Amount is mandatory"),
    original_price: yup.number().transform((value, originalValue) => (String(originalValue).trim() === '' ? null : value)).nullable(),
    monthly_amount: yup.number().transform((value, originalValue) => (String(originalValue).trim() === '' ? null : value)).nullable(),
    plan_type: yup.object().shape({
        label: yup.string().required(),
        value: yup.string().required(),
    }).required("Plan Type is mandatory"),
    no_of_licence: yup.number().typeError("Licenses must be a number").min(1, "Must be at least 1").required("Licenses is mandatory"),
    feature: yup.array().of(
        yup.object().shape({
            value: yup.string().required("Feature is mandatory")
        })
    ).min(1, "At least one feature is required").required()
});

type FormData = yup.InferType<typeof schema>;

interface SubscriptionFormProps {
    subscriptionData?: Subscription;
}

const SubscriptionForm: React.FC<SubscriptionFormProps> = ({ subscriptionData }) => {
    const [saving, setSaving] = useState(false);
    const dispatch = useAppDispatch();
    const { hideModal } = useModal();

    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema) as any,
        defaultValues: {
            plan_name: "",
            banner_text: "",
            plan_description: "",
            currency: "INR",
            amount: "" as any,
            original_price: "" as any,
            monthly_amount: "" as any,
            plan_type: planTypeOptions[0],
            no_of_licence: "" as any,
            feature: [{ value: "" }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "feature",
    });

    useEffect(() => {
        if (subscriptionData) {
            setValue("plan_name", subscriptionData.plan_name || "");
            setValue("banner_text", subscriptionData.banner_text || "");
            setValue("plan_description", subscriptionData.plan_description || "");
            setValue("currency", subscriptionData.currency as string || "INR");
            setValue("amount", subscriptionData.amount);
            setValue("original_price", subscriptionData.original_price || ("" as any));
            setValue("monthly_amount", subscriptionData.monthly_amount || ("" as any));
            setValue("no_of_licence", subscriptionData.no_of_licence);
            
            const typeOption = planTypeOptions.find(opt => opt.value === String(subscriptionData.plan_type));
            if (typeOption) {
                setValue("plan_type", typeOption);
            }

            if (subscriptionData.feature && subscriptionData.feature.length > 0) {
                setValue("feature", (subscriptionData.feature as string[]).map(f => ({ value: f })));
            } else {
                setValue("feature", [{ value: "" }]);
            }
        }
    }, [subscriptionData, setValue]);

    const onSubmit = async (data: FormData) => {
        try {
            setSaving(true);
            
            const payload = {
                plan_name: data.plan_name.trim(),
                banner_text: data.banner_text?.trim() || "",
                plan_description: data.plan_description.trim(),
                currency: data.currency,
                amount: Number(data.amount),
                original_price: data.original_price ? Number(data.original_price) : 0,
                monthly_amount: data.monthly_amount ? Number(data.monthly_amount) : 0,
                plan_type: Number(data.plan_type.value),
                no_of_licence: Number(data.no_of_licence),
                feature: data.feature.map(f => f.value.trim()).filter(Boolean),
            };

            if (subscriptionData?.id) {
                await dispatch(editSubscription({ id: subscriptionData.id, payload })).unwrap();
                toast.success("Subscription updated successfully");
            } else {
                await dispatch(addSubscription(payload)).unwrap();
                toast.success("Subscription created successfully");
            }

            hideModal();
        } catch (err: any) {
            console.error("Subscription submission failed:", err);
            toast.error(err || "Failed to save subscription");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="relative">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
                <div className="flex-1 max-h-[65vh] overflow-y-auto pr-2 space-y-5 custom-scrollbar">
                    {/* Header info */}
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                        <span className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                            <Package size={18} />
                        </span>
                        <div>
                            <p className="text-sm font-semibold text-indigo-800">{subscriptionData ? 'Edit Subscription Plan' : 'Add Subscription Plan'}</p>
                            <p className="text-xs text-indigo-500 mt-0.5">{subscriptionData ? 'Update details of the subscription plan.' : 'Create a new subscription plan.'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Plan Name */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                                Plan Name <span className="text-red-500">*</span>
                            </label>
                            <Controller
                                name="plan_name"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="text"
                                        placeholder="e.g. Business"
                                        disabled={saving}
                                        className={`w-full px-4 py-3 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all ${
                                            errors.plan_name 
                                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30' 
                                            : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-300'
                                        }`}
                                    />
                                )}
                            />
                            {errors.plan_name && (
                                <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                                    <AlertCircle size={13} /> {errors.plan_name.message}
                                </p>
                            )}
                        </div>

                        {/* Banner Text */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                                Banner Text
                            </label>
                            <Controller
                                name="banner_text"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        value={field.value || ""}
                                        type="text"
                                        placeholder="e.g. Recommended"
                                        disabled={saving}
                                        className={`w-full px-4 py-3 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all ${
                                            errors.banner_text 
                                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30' 
                                            : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-300'
                                        }`}
                                    />
                                )}
                            />
                        </div>

                        {/* Plan Type */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                                Plan Type <span className="text-red-500">*</span>
                            </label>
                            <Controller
                                name="plan_type"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        options={planTypeOptions}
                                        placeholder="Select plan type..."
                                        classNamePrefix="react-select"
                                        isDisabled={saving}
                                        styles={{
                                            control: (base, state) => ({
                                                ...base,
                                                borderRadius: '12px',
                                                borderColor: errors.plan_type ? '#ef4444' : state.isFocused ? '#4f46e5' : '#e5e7eb',
                                                boxShadow: errors.plan_type ? '0 0 0 3px rgba(239,68,68,0.15)' : state.isFocused ? '0 0 0 3px rgba(79,70,229,0.15)' : 'none',
                                                fontSize: '14px',
                                                padding: '2px 0',
                                                '&:hover': { borderColor: errors.plan_type ? '#ef4444' : '#4f46e5' },
                                            }),
                                            menu: (base) => ({
                                                ...base,
                                                borderRadius: '12px',
                                                border: '1px solid #e5e7eb',
                                            }),
                                        }}
                                    />
                                )}
                            />
                            {errors.plan_type && (
                                <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                                    <AlertCircle size={13} /> {(errors.plan_type as any).message || (errors.plan_type?.label?.message) || "Plan type is mandatory"}
                                </p>
                            )}
                        </div>

                        {/* Licenses */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                                Number of Licenses <span className="text-red-500">*</span>
                            </label>
                            <Controller
                                name="no_of_licence"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="number"
                                        placeholder="e.g. 50"
                                        disabled={saving}
                                        className={`w-full px-4 py-3 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all ${
                                            errors.no_of_licence 
                                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30' 
                                            : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-300'
                                        }`}
                                    />
                                )}
                            />
                            {errors.no_of_licence && (
                                <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                                    <AlertCircle size={13} /> {errors.no_of_licence.message}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <Controller
                                name="plan_description"
                                control={control}
                                render={({ field: { value, onChange, onBlur, ref } }) => (
                                    <textarea
                                        value={value || ''}
                                        onChange={onChange}
                                        onBlur={onBlur}
                                        ref={ref}
                                        placeholder="Enter plan description..."
                                        rows={2}
                                        disabled={saving}
                                        className={`w-full px-4 py-3 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all resize-y ${
                                            errors.plan_description 
                                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30' 
                                            : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-300'
                                        }`}
                                    />
                                )}
                            />
                            {errors.plan_description && (
                                <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                                    <AlertCircle size={13} /> {errors.plan_description.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Pricing Fields */}
                    <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Pricing Details</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Currency *</label>
                                <Controller
                                    name="currency"
                                    control={control}
                                    render={({ field }) => (
                                        <select
                                            {...field}
                                            disabled={saving}
                                            className="w-full px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all bg-white"
                                        >
                                            <option value="INR">INR (₹)</option>
                                            <option value="USD">USD ($)</option>
                                        </select>
                                    )}
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Amount *</label>
                                <Controller
                                    name="amount"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="number"
                                            placeholder="Final Price"
                                            disabled={saving}
                                            className={`w-full px-3 py-2 rounded-lg text-sm font-medium border focus:outline-none focus:ring-2 transition-all bg-white ${
                                                errors.amount ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                                            }`}
                                        />
                                    )}
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Original Price</label>
                                <Controller
                                    name="original_price"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            value={field.value || ""}
                                            type="number"
                                            placeholder="Before Discount"
                                            disabled={saving}
                                            className="w-full px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all bg-white"
                                        />
                                    )}
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Monthly Eqv.</label>
                                <Controller
                                    name="monthly_amount"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            value={field.value || ""}
                                            type="number"
                                            placeholder="Per Month"
                                            disabled={saving}
                                            className="w-full px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all bg-white"
                                        />
                                    )}
                                />
                            </div>
                        </div>
                        {errors.amount && (
                            <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                                <AlertCircle size={13} /> {errors.amount.message}
                            </p>
                        )}
                    </div>

                    {/* Features */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">
                                Features <span className="text-red-500">*</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => append({ value: "" })}
                                disabled={saving}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors disabled:opacity-50"
                            >
                                <Plus size={14} strokeWidth={3} /> Add Feature
                            </button>
                        </div>

                        <div className="space-y-3">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex items-start gap-3">
                                    <div className="flex-1">
                                        <Controller
                                            name={`feature.${index}.value`}
                                            control={control}
                                            render={({ field: inputField }) => (
                                                <input
                                                    {...inputField}
                                                    placeholder={`e.g. Premium Support`}
                                                    disabled={saving}
                                                    className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all ${
                                                        errors.feature?.[index]?.value 
                                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30' 
                                                        : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-300'
                                                    }`}
                                                />
                                            )}
                                        />
                                        {errors.feature?.[index]?.value && (
                                            <p className="mt-1 text-xs text-red-500">{errors.feature[index]?.value?.message}</p>
                                        )}
                                    </div>
                                    {fields.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            disabled={saving}
                                            className="p-2.5 mt-0.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
                    <button
                        type="button"
                        onClick={hideModal}
                        disabled={saving}
                        className="px-5 py-2 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm flex items-center gap-2"
                    >
                        {saving && <Loader2 size={14} className="animate-spin" />}
                        {saving ? 'Saving...' : (subscriptionData ? 'Update Plan' : 'Create Plan')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SubscriptionForm;
