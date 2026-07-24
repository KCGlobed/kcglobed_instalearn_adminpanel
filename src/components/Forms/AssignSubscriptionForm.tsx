import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import { useModal } from '../../context/ModalContext';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { getCorporateAdmins } from '../../store/slices/corporateAdminSlice';
import { assignCorporateAdminSubscriptionApi, getSubscriptionPlanDropdownApi } from '../../services/apiServices';
import toast from 'react-hot-toast';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';

type AssignSubscriptionFormValues = {
    plan_id: number | '';
};

type Props = {
    adminId: number;
    currentPlanId?: number;
};

const AssignSubscriptionForm = ({ adminId, currentPlanId }: Props) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [plans, setPlans] = useState<{ value: number; label: string }[]>([]);
    const [loadingPlans, setLoadingPlans] = useState(true);
    const dispatch = useAppDispatch();
    const { hideModal } = useModal();

    const { control, handleSubmit, reset, formState: { errors } } = useForm<AssignSubscriptionFormValues>({
        defaultValues: {
            plan_id: currentPlanId || '',
        },
    });

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await getSubscriptionPlanDropdownApi();
                const dataList = response?.data?.results || response?.data?.data || response?.data || [];
                if (Array.isArray(dataList)) {
                    setPlans(dataList.map((plan: any) => ({
                        value: plan.id,
                        label: plan.plan_name || plan.name || `Plan #${plan.id}`
                    })));
                }
            } catch (error) {
                console.error("Failed to load plans", error);
                toast.error("Failed to load subscription plans");
            } finally {
                setLoadingPlans(false);
            }
        };
        fetchPlans();
    }, []);

    const onSubmit = async (data: AssignSubscriptionFormValues) => {
        if (!data.plan_id) return;
        setIsSubmitting(true);
        try {
            await assignCorporateAdminSubscriptionApi(adminId, { plan_id: Number(data.plan_id), user_id: adminId });
            toast.success("Subscription assigned successfully");
            dispatch(getCorporateAdmins({ page: 1 }));
            hideModal();
        } catch (err: any) {
            console.error('Subscription assignment failed:', err);
            toast.error(err.response?.data?.message || err.message || "Failed to assign subscription");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-indigo-50 border border-indigo-100">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <CheckCircle size={22} />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-indigo-900">
                        Assign Subscription
                    </h3>
                    <p className="text-xs text-indigo-500 mt-1 leading-relaxed">
                        Choose the subscription plan for this corporate admin account.
                    </p>
                </div>
            </div>

            {/* Select */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Subscription Plan <span className="text-red-500">*</span>
                </label>
                {loadingPlans ? (
                    <div className="flex items-center gap-2 py-4 text-gray-400 text-sm font-medium">
                        <Loader2 size={16} className="animate-spin" /> Loading plans...
                    </div>
                ) : (
                    <div className="relative">
                        <Controller
                            name="plan_id"
                            control={control}
                            rules={{ required: 'Please select a subscription plan' }}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    options={plans}
                                    value={plans.find(p => p.value === field.value) || null}
                                    onChange={(selected) => field.onChange(selected ? selected.value : '')}
                                    placeholder="Search and select a plan..."
                                    classNamePrefix="react-select"
                                    isDisabled={isSubmitting}
                                    isClearable
                                    isSearchable
                                    classNames={{
                                        control: (state) =>
                                            `!min-h-[48px] !rounded-xl text-sm font-medium transition-colors !shadow-none !bg-white ` +
                                            (errors.plan_id
                                                ? '!border-red-500 ring-3 ring-red-500/15 hover:!border-red-500'
                                                : state.isFocused
                                                    ? '!border-indigo-500 ring-3 ring-indigo-500/15'
                                                    : '!border-gray-200 hover:!border-indigo-500'),
                                        placeholder: () => '!text-gray-400 text-sm',
                                        menu: () => '!rounded-xl !shadow-lg !border !border-gray-200 !overflow-hidden !mt-1 !bg-white !z-50',
                                        option: (state) =>
                                            `!text-sm !cursor-pointer !px-3 !py-2 ` +
                                            (state.isSelected
                                                ? '!bg-indigo-100 !text-indigo-600 !font-semibold'
                                                : state.isFocused
                                                    ? '!bg-gray-100 !text-gray-900 !font-medium'
                                                    : '!bg-white !text-gray-900 !font-medium'),
                                    }}
                                />
                            )}
                        />
                    </div>
                )}
                {errors.plan_id && (
                    <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                        <AlertCircle size={13} />
                        {errors.plan_id.message}
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
                    disabled={isSubmitting || loadingPlans}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all active:scale-95 shadow-sm flex items-center gap-2 disabled:opacity-60"
                >
                    {isSubmitting && (
                        <Loader2 size={15} className="animate-spin" />
                    )}
                    {isSubmitting ? 'Assigning...' : 'Assign Subscription'}
                </button>
            </div>
        </form>
    );
};

export default AssignSubscriptionForm;
