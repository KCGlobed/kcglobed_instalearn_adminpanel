import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import type { promotionalCampaign } from "../../utils/types";
import { useModal } from "../../context/ModalContext";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { useAppSelector } from "../../hooks/useRedux";
import { addPromoCamp, editPromoCamp } from "../../store/slices/promotionalCampaignSlice";
import { getCoupons } from "../../store/slices/couponSlice";
import toast from "react-hot-toast";
import moment from "moment";
import { Tag, Loader2, AlertCircle } from "lucide-react";
import { CropperModal } from "../ImageCropper/components/CropperModal";
import type { CropResult } from "../ImageCropper/utils/cropCanvas";

interface Option { label: string; value: any; }

const schema = yup.object().shape({
    title: yup.string().required("Title is mandatory"),
    display_text: yup.string().nullable().default(""),
    coupon: yup.object().shape({
        label: yup.string().required(),
        value: yup.mixed().required(),
    }).nullable().default(null),
    start_time: yup.string().required("Start time is mandatory"),
    end_time: yup.string().required("End time is mandatory"),
    thumbnail: yup.mixed().nullable().default(null),
});

type FormData = yup.InferType<typeof schema>;

interface PromoCampFormProps {
  campaignData?: promotionalCampaign;
}

const PromoCampForm: React.FC<PromoCampFormProps> = ({ campaignData }) => {
  const [couponOptions, setCouponOptions] = useState<Option[]>([]);
  const [saving, setSaving] = useState(false);
  const dispatch = useAppDispatch();
  const { hideModal } = useModal();
  const { data: couponsList, loading: couponsLoading } = useAppSelector((state) => state.coupons);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: "",
      display_text: "",
      coupon: null,
      start_time: "",
      end_time: "",
      thumbnail: null,
    },
  });

  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [originalImageFormat, setOriginalImageFormat] = useState<'image/png' | 'image/jpeg'>('image/png');
  const [previewUrl, setPreviewUrl] = useState<string | null>(campaignData?.thumbnail || null);
  const [imageError, setImageError] = useState<string | null>(null);

  // Load coupons list for dropdown if not loaded
  useEffect(() => {
    if (!couponsList || couponsList.length === 0) {
      dispatch(getCoupons({ page: 1 }));
    }
  }, [dispatch, couponsList]);

  // Set coupon options when couponsList changes
  useEffect(() => {
      if (couponsList) {
          const options = couponsList.map(c => ({
              label: `${c.code} (${c.discount_type === 'percentage' ? `${c.discount_value}%` : `$${c.discount_value}`})`,
              value: c.id
          }));
          setCouponOptions(options);
      }
  }, [couponsList]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const isJpeg = file.type === 'image/jpeg' || file.type === 'image/jpg';
          setOriginalImageFormat(isJpeg ? 'image/jpeg' : 'image/png');

          const r = new FileReader();
          r.onloadend = () => {
              setRawImageSrc(r.result as string);
              setIsCropperOpen(true);
          };
          r.readAsDataURL(file);
          e.target.value = '';
      }
  };

  const handleCropComplete = (result: CropResult) => {
      setValue("thumbnail", result.file as any, { shouldValidate: true });
      setPreviewUrl(result.dataUrl);
      setImageError(null);
  };

  // Set default values when editing
  useEffect(() => {
    if (campaignData) {
      setValue("title", campaignData.title || "");
      setValue("display_text", campaignData.display_text || "");
      setValue("start_time", campaignData.start_time ? moment(campaignData.start_time).format("YYYY-MM-DDTHH:mm") : "");
      setValue("end_time", campaignData.end_time ? moment(campaignData.end_time).format("YYYY-MM-DDTHH:mm") : "");
      
      if (campaignData.coupon_info?.id) {
          setValue("coupon", {
              label: (campaignData.coupon_info as any).code || campaignData.coupon_info.name || `Coupon #${campaignData.coupon_info.id}`,
              value: campaignData.coupon_info.id
          });
      }
    }
  }, [campaignData, setValue]);

  const onSubmit = async (data: FormData) => {
    // Custom Image Validation for creation
    if (!campaignData?.id && !data.thumbnail) {
        setImageError("Thumbnail is mandatory");
        return;
    }

    try {
      setSaving(true);
      const payload = new window.FormData();
      payload.append('title', data.title.trim());
      payload.append('display_text', (data.display_text || "").trim());
      if (data.coupon) {
          payload.append('coupons_id', String(data.coupon.value));
      }
      payload.append('start_time', data.start_time);
      payload.append('end_time', data.end_time);

      if (data.thumbnail instanceof File) {
          payload.append('thumbnail', data.thumbnail);
      }

      let res;
      if (campaignData?.id) {
        res = await dispatch(editPromoCamp({ id: campaignData.id, promoData: payload })).unwrap();
        toast.success("Promotional Campaign updated successfully");
      } else {
        res = await dispatch(addPromoCamp(payload)).unwrap();
        toast.success("Promotional Campaign added successfully");
      }

      hideModal();
    } catch (err: any) {
      console.error("Promotional Campaign submission failed:", err);
      toast.error(err || "Failed to save promotional campaign");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {/* Header info */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
            <span className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                <Tag size={18} />
            </span>
            <div>
                <p className="text-sm font-semibold text-indigo-800">{campaignData ? 'Edit Promotional Campaign' : 'Add Promotional Campaign'}</p>
                <p className="text-xs text-indigo-500 mt-0.5">{campaignData ? 'Update details of the campaign.' : 'Create a new promotional campaign.'}</p>
            </div>
        </div>

        {/* Campaign Title */}
        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                Campaign Title <span className="text-red-500">*</span>
            </label>
            <Controller
                name="title"
                control={control}
                render={({ field }) => (
                    <input
                        {...field}
                        type="text"
                        placeholder="e.g. Summer Mega Sale"
                        disabled={saving}
                        className={`w-full px-4 py-3 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all ${
                            errors.title 
                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30' 
                            : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-300'
                        }`}
                    />
                )}
            />
            {errors.title && (
                <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                    <AlertCircle size={13} /> {errors.title.message}
                </p>
            )}
        </div>

        {/* Display Text Textarea */}
        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                Display Text / Subtitle
            </label>
            <Controller
                name="display_text"
                control={control}
                render={({ field: { value, onChange, onBlur, ref } }) => (
                    <textarea
                        value={value || ''}
                        onChange={onChange}
                        onBlur={onBlur}
                        ref={ref}
                        placeholder="e.g. Get up to 50% off on all courses this weekend!"
                        rows={3}
                        disabled={saving}
                        className={`w-full px-4 py-3 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all resize-y ${
                            errors.display_text 
                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30' 
                            : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-300'
                        }`}
                    />
                )}
            />
            {errors.display_text && (
                <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                    <AlertCircle size={13} /> {errors.display_text.message}
                </p>
            )}
        </div>

        {/* Coupon Select */}
        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                Select Coupon
            </label>
            {couponsLoading && couponOptions.length === 0 ? (
                <div className="flex items-center gap-2 py-4 text-gray-400 text-sm">
                    <Loader2 size={16} className="animate-spin" /> Loading coupons...
                </div>
            ) : (
                <Controller
                    name="coupon"
                    control={control}
                    render={({ field }) => (
                        <Select
                            {...field}
                            options={couponOptions}
                            isClearable
                            placeholder="Search and select coupon..."
                            classNamePrefix="react-select"
                            isDisabled={saving}
                            styles={{
                                control: (base, state) => ({
                                    ...base,
                                    borderRadius: '12px',
                                    borderColor: errors.coupon ? '#ef4444' : state.isFocused ? '#4f46e5' : '#e5e7eb',
                                    boxShadow: errors.coupon ? '0 0 0 3px rgba(239,68,68,0.15)' : state.isFocused ? '0 0 0 3px rgba(79,70,229,0.15)' : 'none',
                                    fontSize: '14px',
                                    '&:hover': { borderColor: errors.coupon ? '#ef4444' : '#4f46e5' },
                                }),
                                menu: (base) => ({
                                    ...base,
                                    borderRadius: '12px',
                                    border: '1px solid #e5e7eb',
                                }),
                            }}
                        />
                    )}
                />
            )}
            {errors.coupon && (
                <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                    <AlertCircle size={13} /> {errors.coupon.message}
                </p>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Start Time */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Start Time <span className="text-red-500">*</span>
                </label>
                <Controller
                    name="start_time"
                    control={control}
                    render={({ field }) => (
                        <input
                            {...field}
                            type="datetime-local"
                            disabled={saving}
                            className={`w-full px-4 py-3 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all ${
                                errors.start_time 
                                ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30' 
                                : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-300'
                            }`}
                        />
                    )}
                />
                {errors.start_time && (
                    <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                        <AlertCircle size={13} /> {errors.start_time.message}
                    </p>
                )}
            </div>

            {/* End Time */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    End Time <span className="text-red-500">*</span>
                </label>
                <Controller
                    name="end_time"
                    control={control}
                    render={({ field }) => (
                        <input
                            {...field}
                            type="datetime-local"
                            disabled={saving}
                            className={`w-full px-4 py-3 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all ${
                                errors.end_time 
                                ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30' 
                                : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-300'
                            }`}
                        />
                    )}
                />
                {errors.end_time && (
                    <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                        <AlertCircle size={13} /> {errors.end_time.message}
                    </p>
                )}
            </div>
        </div>

        {/* Thumbnail Image */}
        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                Thumbnail <span className="text-red-500">{campaignData?.id ? '' : '*'}</span>
            </label>
            <div className="flex items-center gap-4">
                {previewUrl && (
                    <div className="h-16 w-16 rounded-xl border border-gray-200 overflow-hidden flex-shrink-0 bg-gray-50 flex items-center justify-center">
                        <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                )}
                <div className="flex-1">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={saving}
                        className={`w-full px-4 py-3 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer ${
                            imageError 
                            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30' 
                            : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-300'
                        }`}
                    />
                    {imageError && (
                        <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                            <AlertCircle size={13} /> {imageError}
                        </p>
                    )}
                </div>
            </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button
                type="button"
                onClick={hideModal}
                disabled={saving}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-50"
            >
                Cancel
            </button>
            <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm flex items-center gap-2"
            >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? 'Saving...' : (campaignData ? 'Update Campaign' : 'Add Campaign')}
            </button>
        </div>
      </form>

      <CropperModal
          imageSrc={rawImageSrc}
          isOpen={isCropperOpen}
          onClose={() => setIsCropperOpen(false)}
          onCropComplete={handleCropComplete}
          initialFormat={originalImageFormat}
      />
    </div>
  );
};

export default PromoCampForm;