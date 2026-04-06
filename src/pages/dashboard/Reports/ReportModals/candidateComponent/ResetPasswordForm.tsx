import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { resetPasswordUser } from "../../../../../services/phaseTwoService";
import { useModal } from "../../../../../context/ModalContext";
import { useAppDispatch } from "../../../../../hooks/useAppDispatch";
import { getCandidateReport } from "../../../../../store/slices/userReportSlice";
import { useState } from "react";

// ----------------------
// Validation Schema
// ----------------------
const schema = yup.object().shape({
    password: yup
        .string()
        .required("Password is required")
        .min(6, "Password must be at least 6 characters")
        .matches(
            /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).*$/,
            "Password must contain letters, numbers and special character"
        ),
    confirm_password: yup
        .string()
        .oneOf([yup.ref("password")], "Passwords must match")
        .required("Confirm password is required"),
});

const ResetPasswordForm = ({ userId }: any) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });

    const { hideModal } = useModal();
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data: any) => {
        setLoading(true); // start loader
        try {
            await resetPasswordUser({
                user_id: userId,
                password: data.password,
                confirm_password: data.confirm_password,
            });
            dispatch(getCandidateReport({ page: 1 }));
            hideModal();
        } catch (error) {
            console.error("Password reset failed:", error);
        } finally {
            setLoading(false); // stop loader
        }
    };

    return (
        <div className="">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Password */}
                <div>
                    <label className="block mb-1 font-medium">New Password</label>
                    <input
                        type="password"
                        {...register("password")}
                        className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.password ? "border-red-500" : "border-gray-300"
                            }`}
                        placeholder="Enter new password"
                        disabled={loading}
                    />
                    {errors.password && (
                        <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                    )}
                </div>

                {/* Confirm Password */}
                <div>
                    <label className="block mb-1 font-medium">Confirm Password</label>
                    <input
                        type="password"
                        {...register("confirm_password")}
                        className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.confirm_password ? "border-red-500" : "border-gray-300"
                            }`}
                        placeholder="Confirm password"
                        disabled={loading}
                    />
                    {errors.confirm_password && (
                        <p className="text-red-500 text-sm mt-1">{errors.confirm_password.message}</p>
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition flex items-center justify-center"
                    disabled={loading}
                >
                    {loading ? (
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
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            ></path>
                        </svg>
                    ) : (
                        "Reset Password"
                    )}
                </button>
            </form>
        </div>
    );
};

export default ResetPasswordForm;
