import { useEffect, useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useModal } from '../../context/ModalContext';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addInstructor, updateInstructor, getInstructor } from '../../store/slices/instructorSlice';
import { Country, State, City } from 'country-state-city';
import Select from 'react-select';
import toast from 'react-hot-toast';

type InstructorFormValues = {
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
    instructorData?: {
        id: number;
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
};

const InstructorForm = ({ instructorData }: Props) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dispatch = useAppDispatch();
    const { hideModal } = useModal();

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
        reset,
        control
    } = useForm<InstructorFormValues>({
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

    const formatDobForInput = (dob: string | null | undefined) => {
        if (!dob || dob === 'None' || dob === 'null') return '';
        return dob.split('T')[0];
    };

    const customSelectStyles = {
        control: (provided: any, state: any) => ({
            ...provided,
            borderRadius: '0.375rem',
            borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
            boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none',
            padding: '2px 4px',
            '&:hover': {
                borderColor: state.isFocused ? '#3b82f6' : '#d1d5db'
            }
        }),
        option: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#2563eb' : state.isFocused ? '#dbeafe' : 'white',
            color: state.isSelected ? 'white' : '#374151',
            cursor: 'pointer',
        })
    };

    // Set default values on edit
    useEffect(() => {
        if (instructorData) {
            const countryIso = getCountryIso(instructorData.country);
            const stateIso = getStateIso(countryIso, instructorData.state);
            reset({
                first_name: instructorData.first_name || '',
                last_name: instructorData.last_name || '',
                email: instructorData.email || '',
                address: instructorData.address || '',
                city: instructorData.city || '',
                state: stateIso,
                country: countryIso,
                pincode: instructorData.pincode || '',
                dob: formatDobForInput(instructorData.dob),
            });
        }
    }, [instructorData, reset]);

    // Submit handler
    const onSubmit = async (data: InstructorFormValues) => {
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

            if (instructorData?.id) {
                await dispatch(updateInstructor({ id: instructorData.id, instructorData: formdata })).unwrap();
                toast.success("Instructor updated successfully");
            } else {
                await dispatch(addInstructor(formdata)).unwrap();
                toast.success("Instructor added successfully");
            }
            dispatch(getInstructor({ page: 1 }));
            reset();
            hideModal();
        } catch (err: any) {
            console.error('Instructor submission failed:', err);
            toast.error(err || "Failed to submit instructor");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative">
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
                                minLength: { value: 2, message: 'First Name must be at least 2 characters' },
                                validate: value => value.trim().length > 0 || 'Cannot be empty'
                            })}
                            className="w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-2 rounded-md"
                            placeholder="Enter the First Name"
                        />
                        {errors.first_name && (
                            <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
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
                                minLength: { value: 2, message: 'Last Name must be at least 2 characters' },
                                validate: value => value.trim().length > 0 || 'Cannot be empty'
                            })}
                            className="w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-2 rounded-md"
                            placeholder="Enter the Last Name"
                        />
                        {errors.last_name && (
                            <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="md:col-span-2">
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
                            className="w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-2 rounded-md"
                            placeholder="Enter the Email Address"
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Date of Birth */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date of Birth
                        </label>
                        <input
                            type="date"
                            {...register('dob')}
                            className="w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-2 rounded-md"
                        />
                    </div>

                    {/* Pincode */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pincode
                        </label>
                        <input
                            type="text"
                            {...register('pincode', {
                                pattern: {
                                    value: /^[0-9]+$/,
                                    message: 'Enter a valid pincode'
                                }
                            })}
                            className="w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-2 rounded-md"
                            placeholder="Enter the Pincode"
                        />
                        {errors.pincode && (
                            <p className="mt-1 text-sm text-red-600">{errors.pincode.message}</p>
                        )}
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address
                        </label>
                        <input
                            type="text"
                            {...register('address')}
                            className="w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-2 rounded-md"
                            placeholder="Enter the Street Address"
                        />
                    </div>

                    {/* Country */}
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
                            <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
                        )}
                    </div>

                    {/* State */}
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
                            <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
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
                            <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4 border-t border-gray-200">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 transition duration-200 text-white font-semibold py-2.5 rounded-md ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Saving...
                            </>
                        ) : instructorData ? 'Update Instructor' : 'Create Instructor'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InstructorForm;
