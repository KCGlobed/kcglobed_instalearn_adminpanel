import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useModal } from '../../context/ModalContext';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addInstructor, updateInstructor } from '../../store/slices/instructorSlice';
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
        reset
    } = useForm<InstructorFormValues>({
        defaultValues: {
            first_name: " ",
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

    
    // Set default values on edit
    useEffect(() => {
        if (instructorData) {
            reset({
                first_name: instructorData.first_name || '',
                last_name: instructorData.last_name || '',
                email: instructorData.email || '',
                address: instructorData.address || '',
                city: instructorData.city || '',
                state: instructorData.state || '',
                country: instructorData.country || '',
                pincode: instructorData.pincode || '',
                dob: instructorData.dob ? instructorData.dob.split('T')[0] : '',
            });
        }
    }, [instructorData, reset]);

    // Submit handler
    const onSubmit = async (data: InstructorFormValues) => {
        setIsSubmitting(true);
        try {
           const formdata= new FormData();
                formdata.append("first_name", data.first_name);
                formdata.append("last_name", data.last_name);
                formdata.append("email", data.email);
                formdata.append("address", data.address);
                formdata.append("city", data.city);
                formdata.append("state", data.state);
                formdata.append("country", data.country);
                formdata.append("pincode", data.pincode);
                formdata.append("dob", data.dob);

            if (instructorData?.id) {
                
                await dispatch(updateInstructor({ id: instructorData.id, instructorData: formdata })).unwrap();
                toast.success("Instructor updated successfully");
            } else {
                await dispatch(addInstructor(formdata)).unwrap();
                toast.success("Instructor added successfully");
            }
            reset();
            hideModal();
        } catch (err: any) {
            console.error('Instructor submission failed:', err);
            toast.error(err || "Failed to add instructor");
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
                            disabled={!!instructorData?.id} // Usually email cant be changed easily
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

                    {/* City */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            City
                        </label>
                        <input
                            type="text"
                            {...register('city')}
                            className="w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-2 rounded-md"
                            placeholder="Enter the City"
                        />
                    </div>

                    {/* State */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            State
                        </label>
                        <input
                            type="text"
                            {...register('state')}
                            className="w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-2 rounded-md"
                            placeholder="Enter the State"
                        />
                    </div>

                    {/* Country */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Country
                        </label>
                        <input
                            type="text"
                            {...register('country')}
                            className="w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-2 rounded-md"
                            placeholder="Enter the Country"
                        />
                    </div>

                    {/* Pincode */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pincode
                        </label>
                        <input
                            type="text"
                            {...register('pincode')}
                            className="w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-2 rounded-md"
                            placeholder="Enter the Pincode"
                        />
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
                                <svg
                                    className="animate-spin h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                    />
                                </svg>
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
