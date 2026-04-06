import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import {
    createTrailUser,
    fetchTrailCourseList,
} from "../../../../../services/phaseTwoService";
import { useEffect, useState } from "react";
import Select from "react-select";
import { useModal } from "../../../../../context/ModalContext";
import { useAppDispatch } from "../../../../../hooks/useAppDispatch";
import { getTrailUser } from "../../../../../store/slices/trailSlice";

// ----------------------
// Validation Schema
// ----------------------
const schema = yup.object().shape({
    first_name: yup.string().required("First name is required"),
    last_name: yup.string().required("Last name is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    phone: yup
        .string()
        .matches(/^[0-9]{10}$/, "Phone must be 10 digits")
        .required("Phone is required"),
    course_id: yup
        .array()
        .min(1, "Select at least one course")
        .required("Courses are required"),
    billing_address: yup.string().required("Billing address is required"),
    state: yup.string().required("State is required"),
    city: yup.string().required("City is required"),
    country: yup.string().required("Country is required"),
});

const AddTrailUser = ({ setSearch }: any) => {
    const [courseOptions, setCourseOptions] = useState([]);
    const [loading, setLoading] = useState(false);     // 🔹 Submit Loader
    const [errorMsg, setErrorMsg] = useState("");      // 🔹 Submit Error
    const { hideModal } = useModal();
    const dispatch = useAppDispatch();

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            first_name: "",
            last_name: "",
            email: "",
            phone: "",
            course_id: [],
            billing_address: "",
            state: "",
            city: "",
            country: "",
        },
    });

    const onSubmit = async (data: any) => {
        setLoading(true);
        setErrorMsg("");

        try {
            data.course_id = data.course_id.map((c: any) => c.value);

            const res = await createTrailUser(data);
            hideModal();
            dispatch(getTrailUser({ page: 1, }));
            if (res?.status !== 200 && res?.status !== 201) {
                throw new Error(res?.message || "Something went wrong");
            }
        } catch (error: any) {
            setErrorMsg(error?.message || "Failed to submit form");
        } finally {
            setLoading(false);
        }
    };

    const handleFetchCourses = async () => {
        try {
            const result = await fetchTrailCourseList();
            const list = result?.data || result || [];

            const formatted = list.map((course: any) => ({
                value: course.id,
                label: course.title || course.name,
            }));

            setCourseOptions(formatted);
        } catch (err) {
            console.log("Course fetch error", err);
        }
    };

    useEffect(() => {
        handleFetchCourses();
    }, []);

    return (
        <div className="flex justify-center items-center bg-gray-100">
            <div className="w-full bg-white p-6">
                <h2 className="text-2xl font-semibold text-center mb-6">
                    User Registration Form
                </h2>

                {/* ERROR MESSAGE BOX */}
                {errorMsg && (
                    <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-4">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* GRID - INPUT FIELDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                        {/* FIRST NAME */}
                        <div>
                            <label className="block font-medium mb-1">First Name</label>
                            <input
                                type="text"
                                {...register("first_name")}
                                className="w-full border rounded px-3 py-2 focus:outline-blue-500"
                                placeholder="Enter first name"
                            />
                            {errors.first_name && (
                                <p className="text-red-500 text-sm">{errors.first_name.message}</p>
                            )}
                        </div>

                        {/* LAST NAME */}
                        <div>
                            <label className="block font-medium mb-1">Last Name</label>
                            <input
                                type="text"
                                {...register("last_name")}
                                className="w-full border rounded px-3 py-2 focus:outline-blue-500"
                                placeholder="Enter last name"
                            />
                            {errors.last_name && (
                                <p className="text-red-500 text-sm">{errors.last_name.message}</p>
                            )}
                        </div>

                        {/* EMAIL */}
                        <div>
                            <label className="block font-medium mb-1">Email</label>
                            <input
                                type="email"
                                {...register("email")}
                                className="w-full border rounded px-3 py-2 focus:outline-blue-500"
                                placeholder="Enter email address"
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm">{errors.email.message}</p>
                            )}
                        </div>

                        {/* PHONE */}
                        <div>
                            <label className="block font-medium mb-1">Phone</label>
                            <input
                                type="text"
                                {...register("phone")}
                                className="w-full border rounded px-3 py-2 focus:outline-blue-500"
                                placeholder="Enter phone number"
                            />
                            {errors.phone && (
                                <p className="text-red-500 text-sm">{errors.phone.message}</p>
                            )}
                        </div>

                        {/* BILLING ADDRESS */}
                        <div>
                            <label className="block font-medium mb-1">Billing Address</label>
                            <input
                                type="text"
                                {...register("billing_address")}
                                className="w-full border rounded px-3 py-2 focus:outline-blue-500"
                                placeholder="Enter billing address"
                            />
                            {errors.billing_address && (
                                <p className="text-red-500 text-sm">{errors.billing_address.message}</p>
                            )}
                        </div>

                        {/* STATE */}
                        <div>
                            <label className="block font-medium mb-1">State</label>
                            <input
                                type="text"
                                {...register("state")}
                                className="w-full border rounded px-3 py-2 focus:outline-blue-500"
                                placeholder="Enter state"
                            />
                            {errors.state && (
                                <p className="text-red-500 text-sm">{errors.state.message}</p>
                            )}
                        </div>

                        {/* CITY */}
                        <div>
                            <label className="block font-medium mb-1">City</label>
                            <input
                                type="text"
                                {...register("city")}
                                className="w-full border rounded px-3 py-2 focus:outline-blue-500"
                                placeholder="Enter city"
                            />
                            {errors.city && (
                                <p className="text-red-500 text-sm">{errors.city.message}</p>
                            )}
                        </div>

                        {/* COUNTRY */}
                        <div>
                            <label className="block font-medium mb-1">Country</label>
                            <input
                                type="text"
                                {...register("country")}
                                className="w-full border rounded px-3 py-2 focus:outline-blue-500"
                                placeholder="Enter country"
                            />
                            {errors.country && (
                                <p className="text-red-500 text-sm">{errors.country.message}</p>
                            )}
                        </div>
                    </div>

                    {/* MULTI SELECT */}
                    <div>
                        <label className="block font-medium mb-2">Select Courses</label>

                        <Controller
                            control={control}
                            name="course_id"
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    options={courseOptions}
                                    isMulti
                                    className="basic-multi-select"
                                    classNamePrefix="select"
                                    placeholder="Select courses..."
                                    onChange={field.onChange}
                                />
                            )}
                        />

                        {errors.course_id && (
                            <p className="text-red-500 text-sm mt-1">{errors.course_id.message}</p>
                        )}
                    </div>

                    {/* SUBMIT BUTTON */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full text-white py-2 rounded mt-2 ${loading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                            }`}
                    >
                        {loading ? "Submitting..." : "Submit"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddTrailUser;
