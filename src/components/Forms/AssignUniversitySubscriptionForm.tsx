import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import { useModal } from '../../context/ModalContext';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { getUniversities } from '../../store/slices/universitySlice';
import { assignUniversitySubscriptionApi, getSubscriptionPlanDropdownApi } from '../../services/apiServices';
import toast from 'react-hot-toast';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';

type AssignUniversitySubscriptionFormValues = {
    plan_id: number | '';
    no_of_licence: number | '';
};

type Props = {
    universityId: number;
    currentPlanId?: number;
};

const AssignUniversitySubscriptionForm = ({ universityId, currentPlanId }: Props) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [plans, setPlans] = useState<{ value: number; label: string; no_of_licence?: number }[]>([]);
    const [loadingPlans, setLoadingPlans] = useState(true);
    const dispatch = useAppDispatch();
    const { hideModal } = useModal();

    const { control, handleSubmit, reset, register, setValue, formState: { errors } } = useForm<AssignUniversitySubscriptionFormValues>({
        defaultValues: {
            plan_id: currentPlanId || '',
            no_of_licence: '',
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
                        label: plan.plan_name || plan.name || `Plan #${plan.id}`,
                        no_of_licence: plan.no_of_licence || plan.no_of_licences
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

    const onSubmit = async (data: AssignUniversitySubscriptionFormValues) => {
        if (!data.plan_id || !data.no_of_licence) return;
        setIsSubmitting(true);
        try {
            await assignUniversitySubscriptionApi(universityId, { plan_id: Number(data.plan_id), no_of_licence: Number(data.no_of_licence) });
            toast.success("Subscription assigned successfully");
            dispatch(getUniversities({ page: 1 }));
            hideModal();
        } catch (err: any) {
            console.error('Subscription assignment failed:', err);
            const validationError = err.response?.data?.error?.errors?.[0]?.detail;
            toast.error(validationError || err.response?.data?.message || err.message || "Failed to assign subscription");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-indigo-50 border border-indigo-100">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <CheckCircle size={22} />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-indigo-900">
                        Assign Subscription
                    </h3>
                    <p className="text-xs text-indigo-500 mt-1 leading-relaxed">
                        Choose the subscription plan and enter the number of licences for this university.
                    </p>
                </div>
            </div>

            {currentPlanId ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                    <div>
                        <h4 className="text-sm font-bold text-amber-900">Active Subscription Exists</h4>
                        <p className="text-xs text-amber-700 mt-1">This university already has an active subscription. You cannot assign a new subscription until the current one expires or is cancelled.</p>
                    </div>
                </div>
            ) : null}

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
                                    onChange={(selected) => {
                                        field.onChange(selected ? selected.value : '');
                                        if (selected && selected.no_of_licence !== undefined) {
                                            setValue('no_of_licence', selected.no_of_licence, { shouldValidate: true });
                                        }
                                    }}
                                    placeholder="Search and select a plan..."
                                    classNamePrefix="react-select"
                                    isDisabled={isSubmitting || !!currentPlanId}
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

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Number of Licences <span className="text-red-500">*</span>
                </label>
                <input
                    type="number"
                    min="1"
                    {...register('no_of_licence', { required: 'Please enter the number of licences', min: { value: 1, message: 'Must be at least 1' } })}
                    placeholder="Enter number of licences"
                    className={`w-full min-h-[48px] rounded-xl text-sm font-medium transition-colors px-3 shadow-none bg-white border ${errors.no_of_licence ? 'border-red-500 ring-3 ring-red-500/15' : 'border-gray-200 hover:border-indigo-500 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15'} outline-none disabled:bg-gray-50 disabled:text-gray-400`}
                    disabled={isSubmitting || !!currentPlanId}
                />
                {errors.no_of_licence && (
                    <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                        <AlertCircle size={13} />
                        {errors.no_of_licence.message}
                    </p>
                )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                    type="button"
                    onClick={() => {
                        reset();
                        hideModal();
                    }}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                >
                    {currentPlanId ? 'Close' : 'Cancel'}
                </button>

                {!currentPlanId && (
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
                )}
            </div>
        </form>
    );
};

export default AssignUniversitySubscriptionForm;
