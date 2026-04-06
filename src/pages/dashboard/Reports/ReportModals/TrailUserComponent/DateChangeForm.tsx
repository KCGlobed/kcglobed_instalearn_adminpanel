import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState, forwardRef } from "react";
import moment from "moment";
import { changeSubscriptionDateUser } from "../../../../../services/phaseTwoService";
import { useModal } from "../../../../../context/ModalContext";
import { useAppDispatch } from "../../../../../hooks/useAppDispatch";
import { getTrailUser } from "../../../../../store/slices/trailSlice";

// -------------------------------
// Validation Schema
// -------------------------------
const schema = yup.object().shape({
    end_date: yup.date().required("End date is required"),
});

// -------------------------------
// Custom Tailwind Input for DatePicker
// -------------------------------
const CustomInput = forwardRef(({ value, onClick }: any, ref: any) => (
    <button
        type="button"
        onClick={onClick}
        ref={ref}
        className="
      w-full text-left border border-gray-300 
      px-3 py-2 rounded 
      focus:ring-2 focus:ring-blue-500 focus:outline-none
      bg-white
    "
    >
        {value || "Select date"}
    </button>
));

const DateChangeForm = ({ start_date, id }: any) => {
    const {
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: { end_date: new Date(start_date) },
    });

    const [selectedDate, setSelectedDate] = useState(new Date(start_date));
    const [loading, setLoading] = useState(false); // LOADER STATE
    const [apiError, setApiError] = useState(""); // ERROR MESSAGE

    const { hideModal } = useModal();
    const dispatch = useAppDispatch();

    const onSubmit = async (data: any) => {
        setLoading(true);      // START LOADER
        setApiError("");       // RESET ERROR

        try {
            await changeSubscriptionDateUser({
                trail_id: id,
                date: moment(data.end_date).format("YYYY-MM-DD"),
            });

            dispatch(getTrailUser({ page: 1 }));
            hideModal();
        } catch (error: any) {
            console.error(error);
            setApiError(error?.message || "Something went wrong, try again!");
        } finally {
            setLoading(false); // STOP LOADER
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                {/* Date Picker */}
                <div>
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date: any) => {
                            setSelectedDate(date);
                            setValue("end_date", date);
                        }}
                        dateFormat="yyyy-MM-dd"
                        minDate={new Date(start_date)}
                        customInput={<CustomInput />}
                        className="w-[100%]"
                    />

                    {errors.end_date && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.end_date.message}
                        </p>
                    )}
                </div>

                {/* API ERROR */}
                {apiError && (
                    <p className="text-red-600 text-sm font-medium">{apiError}</p>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-blue-600 text-white py-2 rounded 
            hover:bg-blue-700 flex justify-center items-center gap-2 
            ${loading && "opacity-70 cursor-not-allowed"}
          `}
                >
                    {loading && (
                        <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    )}
                    {loading ? "Updating..." : "Update Date"}
                </button>
            </form>
        </div>
    );
};

export default DateChangeForm;
