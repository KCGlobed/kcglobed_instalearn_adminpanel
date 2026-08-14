import { useEffect, useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useModal } from '../../context/ModalContext';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { createManager, updateManager, getManagers } from '../../store/slices/managerSlice';
import { Country, State, City } from 'country-state-city';
import Select from 'react-select'
import toast from 'react-hot-toast';

type ManagerFormValues = {
    first_name: string;
    last_name: string;
    email: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    dob: string;
};

type Props = {
    ManagerData?: any;
};

const ManagerForm = ({ ManagerData }: Props) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const dispatch = useAppDispatch();
    const { hideModal } = useModal();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        control,
        setValue
    } = useForm<ManagerFormValues>({
        defaultValues: {
            first_name: '',
            last_name: '',
            email: '',
            address: '',
            city: '',
            state: '',
            country: '',
            pincode: '',
            dob: '',
        },
    });

    const watchCountry = watch('country');
    const watchState = watch('state');

    const countryOptions = useMemo(() =>
        Country.getAllCountries().map(c => ({ value: c.isoCode, label: c.name }))
        , []);


    const stateOptions = useMemo(() => {
        if (!watchCountry) return [];
        return State.getStatesOfCountry(watchCountry).map(s => ({ value: s.isoCode, label: s.name }));
    }, [watchCountry]);


    const cityOptions = useMemo(() => {
        if (!watchCountry || !watchState) return [];
        return City.getCitiesOfState(watchCountry, watchState).map(c => ({ value: c.name, label: c.name }));
    }, [watchCountry, watchState]);

    const getCountryIso = (nameOrIso: string) => {
        if (!nameOrIso) return '';
        const country = Country.getAllCountries().find(c => c.isoCode === nameOrIso || c.name === nameOrIso);
        return country ? country.isoCode : nameOrIso;
    };


    const getStateIso = (countryIso: string, nameOrIso: string) => {
        if (!nameOrIso || !countryIso) return '';
        const state = State.getStatesOfCountry(countryIso).find(s => s.isoCode === nameOrIso || s.name === nameOrIso);
        return state ? state.isoCode : nameOrIso;
    };

    const customSelectStyles = {
        control: (provided: any, state: any) => ({
            ...provided,
            borderRadius: '0.75rem',
            borderColor: state.isFocused ? '#6366f1' : '#d1d5db',
            boxShadow: state.isFocused ? '0 0 0 2px rgba(99, 102, 241, 0.2)' : 'none',
            padding: '2px 4px',
            '&:hover': {
                borderColor: state.isFocused ? '#6366f1' : '#d1d5db'
            }
        }),
        option: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#4f46e5' : state.isFocused ? '#e0e7ff' : 'white',
            color: state.isSelected ? 'white' : '#374151',
            cursor: 'pointer',
        })
    };


    // Set default values on edit
    useEffect(() => {
        if (ManagerData) {
            const fbCountryIso = getCountryIso(ManagerData.country);
            const fbStateIso = getStateIso(fbCountryIso, ManagerData.state);
            reset({
                first_name: ManagerData.first_name || '',
                last_name: ManagerData.last_name || '',
                email: ManagerData.email || '',
                address: ManagerData.address || '',
                city: ManagerData.city || '',
                state: fbStateIso,
                country: fbCountryIso,
                pincode: ManagerData.pincode || '',
                dob: ManagerData.dob ? ManagerData.dob.split('T')[0] : '',
            });
        }
    }, [ManagerData, reset]);

    // Submit handler
    const onSubmit = async (data: ManagerFormValues) => {
        setIsSubmitting(true);
        try {
            const formdata = new FormData();
            formdata.append("first_name", data.first_name);
            formdata.append("last_name", data.last_name);
            formdata.append("email", data.email);
            formdata.append("address", data.address);
            formdata.append("city", data.city);
            formdata.append("state", data.state);
            formdata.append("country", data.country);
            formdata.append("pincode", data.pincode);
            if (data.dob) formdata.append("dob", data.dob);

            if (ManagerData?.id) {
                const actionResult = await dispatch(updateManager({ id: ManagerData.id, managerData: formdata }));
                if (updateManager.fulfilled.match(actionResult)) {
                    toast.success("Manager updated successfully");
                }
            } else {
                await dispatch(createManager(formdata)).unwrap();
                toast.success("Manager created successfully");
            }

            reset();
            hideModal();
        } catch (err: any) {
            console.error('Manager creation failed:', err);
            toast.error(err || "Failed to create Manager");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative max-h-[75vh] overflow-y-auto custom-scrollbar px-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...register('first_name', {
                                required: 'First Name is required',
                                minLength: { value: 2, message: 'First Name must be at least 2 characters' }
                            })}
                            className="w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2 rounded-xl transition-all"
                            placeholder="Enter First Name"
                        />
                        {errors.first_name && (
                            <p className="mt-1 text-[10px] font-bold text-red-500 uppercase tracking-wider">{errors.first_name.message}</p>
                        )}
                    </div>

                    {/* Last Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...register('last_name', {
                                required: 'Last Name is required',
                                minLength: { value: 2, message: 'Last Name must be at least 2 characters' }
                            })}
                            className="w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2 rounded-xl transition-all"
                            placeholder="Enter Last Name"
                        />
                        {errors.last_name && (
                            <p className="mt-1 text-[10px] font-bold text-red-500 uppercase tracking-wider">{errors.last_name.message}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email address'
                                }
                            })}
                            className="w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2 rounded-xl transition-all"
                            placeholder="Enter Email Address"
                        />
                        {errors.email && (
                            <p className="mt-1 text-[10px] font-bold text-red-500 uppercase tracking-wider">{errors.email.message}</p>
                        )}
                    </div>{/* Date of Birth */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date of Birth <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            {...register('dob', {
                                required: 'Date of Birth is required'
                            })}
                            className="w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2 rounded-xl transition-all"
                            placeholder="Enter Date of Birth"
                        />
                        {errors.dob && (
                            <p className="mt-1 text-[10px] font-bold text-red-500 uppercase tracking-wider">{errors.dob.message}</p>
                        )}
                    </div>

                    {/* Pincode */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pincode <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...register('pincode', {
                                required: 'Pincode is required',
                                pattern: {
                                    value: /^[0-9]{6}$/,
                                    message: 'Enter a valid 6-digit pincode'
                                }
                            })}
                            className="w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2 rounded-xl transition-all"
                            placeholder="Enter Pincode"
                        />
                        {errors.pincode && (
                            <p className="mt-1 text-[10px] font-bold text-red-500 uppercase tracking-wider">{errors.pincode.message}</p>
                        )}
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...register('address', {
                                required: 'Address is required',
                                minLength: { value: 5, message: 'Address is too short' }
                            })}
                            className="w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2 rounded-xl transition-all"
                            placeholder="Enter Street Address"
                        />
                        {errors.address && (
                            <p className="mt-1 text-[10px] font-bold text-red-500 uppercase tracking-wider">{errors.address.message}</p>
                        )}
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Country <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="country"
                            control={control}
                            rules={{ required: 'Country is required' }}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    options={countryOptions}
                                    value={countryOptions.find(c => c.value === field.value) || null}
                                    onChange={(selected) => {
                                        field.onChange(selected ? selected.value : '');
                                        setValue('state', '');
                                        setValue('city', '');
                                    }}
                                    isClearable
                                    isSearchable
                                    placeholder="Select Country"
                                    styles={customSelectStyles}
                                />
                            )}
                        />
                        {errors.country && (
                            <p className="mt-1 text-[10px] font-bold text-red-500 uppercase tracking-wider">{errors.country.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            State <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="state"
                            control={control}
                            rules={{ required: 'State is required' }}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    options={stateOptions}
                                    value={stateOptions.find(s => s.value === field.value) || null}
                                    onChange={(selected) => {
                                        field.onChange(selected ? selected.value : '');
                                        setValue('city', '');
                                    }}
                                    isDisabled={!watchCountry}
                                    isClearable
                                    isSearchable
                                    placeholder="Select State"
                                    styles={customSelectStyles}
                                />
                            )}
                        />
                        {errors.state && (
                            <p className="mt-1 text-[10px] font-bold text-red-500 uppercase tracking-wider">{errors.state.message}</p>
                        )}
                    </div>

                    {/* City */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            City <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="city"
                            control={control}
                            rules={{ required: 'City is required' }}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    options={cityOptions}
                                    value={cityOptions.find(c => c.value === field.value) || null}
                                    onChange={(selected) => field.onChange(selected ? selected.value : '')}
                                    isDisabled={!watchState}
                                    isClearable
                                    isSearchable
                                    placeholder="Select City"
                                    styles={customSelectStyles}
                                />
                            )}
                        />
                        {errors.city && (
                            <p className="mt-1 text-[10px] font-bold text-red-500 uppercase tracking-wider">{errors.city.message}</p>
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6 border-t border-gray-100">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition duration-200 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-100 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                {ManagerData ? 'Updating Manager...' : 'Creating Manager...'}
                            </>
                        ) : ManagerData ? 'Update Manager' : 'Create Manager'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ManagerForm;
