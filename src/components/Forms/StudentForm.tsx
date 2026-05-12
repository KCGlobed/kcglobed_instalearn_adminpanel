import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useModal } from '../../context/ModalContext';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { createStudent, updateStudent, getStudents } from '../../store/slices/studentSlice';
import { viewStudentDetailApi } from '../../services/apiServices';
import toast from 'react-hot-toast';

type StudentFormValues = {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    dob: string;
};

type Props = {
    studentData?: any;
};

const StudentForm = ({ studentData }: Props) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dispatch = useAppDispatch();
    const { hideModal } = useModal();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<StudentFormValues>({
        defaultValues: {
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
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
        const fetchFullDetail = async () => {
            if (studentData?.id) {
                try {
                    const res = await viewStudentDetailApi(studentData.id);
                    const fullData = res.data || res;
                    reset({
                        first_name: fullData.first_name || '',
                        last_name: fullData.last_name || '',
                        email: fullData.email || '',
                        phone: fullData.phone1 || fullData.phone || '',
                        address: fullData.address || '',
                        city: fullData.city || '',
                        state: fullData.state || '',
                        country: fullData.country || '',
                        pincode: fullData.pincode || '',
                        dob: fullData.dob ? fullData.dob.split('T')[0] : '',
                    });
                } catch (error) {
                    console.error("Failed to fetch student details for editing", error);
                    reset({
                        first_name: studentData.first_name || '',
                        last_name: studentData.last_name || '',
                        email: studentData.email || '',
                        phone: studentData.phone1 || studentData.phone || '',
                        address: studentData.address || '',
                        city: studentData.city || '',
                        state: studentData.state || '',
                        country: studentData.country || '',
                        pincode: studentData.pincode || '',
                        dob: studentData.dob ? studentData.dob.split('T')[0] : '',
                    });
                }
            }
        };

        if (studentData) {
            fetchFullDetail();
        }
    }, [studentData, reset]);

    // Submit handler
    const onSubmit = async (data: StudentFormValues) => {
        setIsSubmitting(true);
        try {
            const formdata = new FormData();
            formdata.append("first_name", data.first_name);
            formdata.append("last_name", data.last_name);
            formdata.append("email", data.email);
            formdata.append("phone", data.phone);
            formdata.append("address", data.address);
            formdata.append("city", data.city);
            formdata.append("state", data.state);
            formdata.append("country", data.country);
            formdata.append("pincode", data.pincode);
            if (data.dob) formdata.append("dob", data.dob);

            if (studentData?.id) {
                await dispatch(updateStudent({ id: studentData.id, studentData: formdata })).unwrap();
                toast.success("Student updated successfully");
            } else {
                await dispatch(createStudent(formdata)).unwrap();
                toast.success("Student created successfully");
            }

            // Refresh list
            dispatch(getStudents({ page: 1 }));

            reset();
            hideModal();
        } catch (err: any) {
            console.error('Student creation failed:', err);
            toast.error(err || "Failed to create student");
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
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...register('phone', {
                                required: 'Phone number is required',
                                pattern: {
                                    value: /^[0-9]{10}$/,
                                    message: 'Enter a valid 10-digit phone number'
                                }
                            })}
                            className="w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2 rounded-xl transition-all"
                            placeholder="Enter 10-digit Phone"
                        />
                        {errors.phone && (
                            <p className="mt-1 text-[10px] font-bold text-red-500 uppercase tracking-wider">{errors.phone.message}</p>
                        )}
                    </div>

                    {/* Date of Birth */}
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

                    {/* City */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            City
                        </label>
                        <input
                            type="text"
                            {...register('city')}
                            className="w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2 rounded-xl transition-all"
                            placeholder="Enter City"
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
                            className="w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2 rounded-xl transition-all"
                            placeholder="Enter State"
                        />
                    </div>

                    {/* Country */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Country
                        </label>
                        <input
                            type="text"
                            {...register('country')}
                            className="w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-4 py-2 rounded-xl transition-all"
                            placeholder="Enter Country"
                        />
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
                                {studentData ? 'Updating Student...' : 'Creating Student...'}
                            </>
                        ) : studentData ? 'Update Student' : 'Create Student'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default StudentForm;
