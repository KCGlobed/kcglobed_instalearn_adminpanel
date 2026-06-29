import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { coupons } from "../../utils/types";
import { useModal } from "../../context/ModalContext";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { addCoupon, editCoupon } from "../../store/slices/couponSlice";
import toast from "react-hot-toast";
import moment from "moment";

type CouponFormValues = {
  code: string;
  discount_type: "fixed" | "percentage";
  discount_value: number;
  valid_to: string;
  max_usages: number;
  minimum_cart_value: number;
};

type CouponFormProps = {
  couponData?: coupons;
};

const CouponForm: React.FC<CouponFormProps> = ({ couponData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useAppDispatch();
  const { hideModal } = useModal();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CouponFormValues>({
    defaultValues: {
      code: "",
      discount_type: "fixed",
      discount_value: 0,
      valid_to: "",
      max_usages: 1,
      minimum_cart_value: 0,
    },
  });

  // Set default values on edit
  useEffect(() => {
    if (couponData) {
      reset({
        code: couponData.code || "",
        discount_type: (couponData.discount_type as "fixed" | "percentage") || "fixed",
        discount_value: couponData.discount_value || 0,
        valid_to: couponData.valid_to ? moment(couponData.valid_to).format("YYYY-MM-DD") : "",
        max_usages: (couponData as any).max_usages ?? couponData.max_usage ?? 1,
        minimum_cart_value: couponData.minimum_cart_value || 0,
      });
    }
  }, [couponData, reset]);

  // Submit handler
  const onSubmit = async (data: CouponFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        code: data.code.trim(),
        discount_type: data.discount_type,
        discount_value: Number(data.discount_value),
        valid_to: data.valid_to,
        max_usages: Number(data.max_usages),
        minimum_cart_value: Number(data.minimum_cart_value),
      };

      if (couponData?.id) {
        await dispatch(editCoupon({ id: couponData.id, couponData: payload })).unwrap();
        toast.success("Coupon updated successfully");
      } else {
        await dispatch(addCoupon(payload)).unwrap();
        toast.success("Coupon added successfully");
      }

      reset();
      hideModal();
    } catch (err: any) {
      console.error("Coupon submission failed:", err);
      toast.error(err || "Failed to save coupon");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coupon Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Coupon Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. FIXED50"
              {...register("code", {
                required: "Coupon code is required",
                minLength: { value: 2, message: "Code must be at least 2 characters" },
                validate: (value) => value.trim().length > 0 || "Code cannot be empty",
              })}
              className="w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-2 rounded-md"
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
            )}
          </div>

          {/* Discount Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Type <span className="text-red-500">*</span>
            </label>
            <select
              {...register("discount_type", { required: "Discount type is required" })}
              className="w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-2 rounded-md bg-white"
            >
              <option value="fixed">Fixed</option>
              <option value="percentage">Percentage</option>
            </select>
            {errors.discount_type && (
              <p className="mt-1 text-sm text-red-600">{errors.discount_type.message}</p>
            )}
          </div>

          {/* Discount Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Value <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="any"
              placeholder="1000"
              {...register("discount_value", {
                required: "Discount value is required",
                valueAsNumber: true,
                min: { value: 0.01, message: "Must be greater than 0" },
              })}
              className="w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-2 rounded-md"
            />
            {errors.discount_value && (
              <p className="mt-1 text-sm text-red-600">{errors.discount_value.message}</p>
            )}
          </div>

          {/* Valid Till */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valid Till <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register("valid_to", {
                required: "Expiry date is required",
              })}
              className="w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-2 rounded-md bg-white"
            />
            {errors.valid_to && (
              <p className="mt-1 text-sm text-red-600">{errors.valid_to.message}</p>
            )}
          </div>

          {/* Maximum Usage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Usages <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              placeholder="10"
              {...register("max_usages", {
                required: "Maximum usage is required",
                valueAsNumber: true,
                min: { value: 1, message: "Must be at least 1" },
              })}
              className="w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-2 rounded-md"
            />
            {errors.max_usages && (
              <p className="mt-1 text-sm text-red-600">{errors.max_usages.message}</p>
            )}
          </div>

          {/* Minimum Cart Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Cart Value <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="any"
              placeholder="2000"
              {...register("minimum_cart_value", {
                required: "Minimum cart value is required",
                valueAsNumber: true,
                min: { value: 0, message: "Cannot be negative" },
              })}
              className="w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-2 rounded-md"
            />
            {errors.minimum_cart_value && (
              <p className="mt-1 text-sm text-red-600">{errors.minimum_cart_value.message}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 transition duration-200 text-white font-semibold py-2.5 rounded-md ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
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
            ) : couponData ? (
              "Update Coupon"
            ) : (
              "Create Coupon"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CouponForm;