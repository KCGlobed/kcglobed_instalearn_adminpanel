import { useEffect, useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useModal } from '../../context/ModalContext';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addCorporateAdmin, editCorporateAdmin } from '../../store/slices/corporateAdminSlice';
import { Country, State, City } from 'country-state-city';
import Select from 'react-select';
import toast from 'react-hot-toast';
import { Loader2, Settings, AlertCircle } from 'lucide-react';
import { CropperModal } from '../ImageCropper/components/CropperModal';
import type { CropResult } from '../ImageCropper/utils/cropCanvas';

type CorporateAdminFormValues = {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    image: File | string | null;
};

type Props = {
    adminData?: any;
    onSuccess?: () => void;
};

const CorporateAdminForm = ({ adminData, onSuccess }: Props) => {
    const [saving, setSaving] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [imageError, setImageError] = useState('');
    
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [rawImageSrc, setRawImageSrc] = useState<string>('');
    const [originalImageFormat, setOriginalImageFormat] = useState<"image/png" | "image/jpeg">('image/png');
    
    const dispatch = useAppDispatch();
    const { hideModal } = useModal();

    const {
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
        reset,
        control
    } = useForm<CorporateAdminFormValues>({
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
            image: null,
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

    const customSelectClassNames = (error?: any) => ({
        control: (state: any) =>
            `!rounded-xl !p-[2px] transition-all !shadow-none ` +
            (error
                ? '!border-red-500 !bg-red-50/30 ring-4 ring-red-500/20 hover:!border-red-500'
                : state.isFocused
                    ? '!border-indigo-500 !bg-white ring-4 ring-indigo-500/20'
                    : '!border-gray-200 !bg-white hover:!border-gray-300'),
        option: (state: any) =>
            `!cursor-pointer ` +
            (state.isSelected
                ? '!bg-indigo-600 !text-white'
                : state.isFocused
                    ? '!bg-indigo-100 !text-gray-700'
                    : '!bg-white !text-gray-700'),
        placeholder: () => '!text-gray-400 !text-sm !font-medium',
    });

    useEffect(() => {
        if (adminData) {
            const countryIso = getCountryIso(adminData.country);
            const stateIso = getStateIso(countryIso, adminData.state);
            reset({
                first_name: adminData.first_name || '',
                last_name: adminData.last_name || '',
                email: adminData.email || '',
                phone: adminData.phone || adminData.phone1 || '',
                address: adminData.address || '',
                city: adminData.city || '',
                state: stateIso,
                country: countryIso,
                pincode: adminData.pincode || '',
            });
            if (adminData.image) {
                setPreviewUrl(adminData.image);
            }
        }
    }, [adminData, reset]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const isJpeg = file.type === 'image/jpeg' || file.type === 'image/jpg';
            setOriginalImageFormat(isJpeg ? 'image/jpeg' : 'image/png');
            setImageError('');

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
        setValue("image", result.file, { shouldValidate: true });
        setPreviewUrl(result.dataUrl);
    };

    const onSubmit = async (data: CorporateAdminFormValues) => {
        setSaving(true);
        try {
            const formdata = new FormData();
            formdata.append("first_name", data.first_name);
            formdata.append("last_name", data.last_name);
            formdata.append("email", data.email);
            if (data.phone) formdata.append("phone", data.phone);
            if (data.address) formdata.append("address", data.address);
            if (data.city) formdata.append("city", data.city);
            if (data.state) formdata.append("state", data.state);
            if (data.country) formdata.append("country", data.country);
            if (data.pincode) formdata.append("pincode", data.pincode);
            
            if (data.image instanceof File) {
                formdata.append("image", data.image);
            }

            if (adminData?.id) {
                await dispatch(editCorporateAdmin({ id: adminData.id, adminData: formdata })).unwrap();
                toast.success("Corporate Admin updated successfully");
            } else {
                await dispatch(addCorporateAdmin(formdata)).unwrap();
                toast.success("Corporate Admin added successfully");
            }
            hideModal();
            onSuccess?.();
        } catch (err: any) {
            console.error('Corporate Admin submission failed:', err);
            toast.error(err || "Failed to submit corporate admin");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
            <div className="flex-1 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="flex flex-col gap-5 pb-2">
                
                {/* Header info */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                    <span className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                        <Settings size={18} />
                    </span>
                    <div>
                        <p className="text-sm font-semibold text-indigo-800">{adminData ? 'Edit Corporate Admin' : 'Add Corporate Admin'}</p>
                        <p className="text-xs text-indigo-500 mt-0.5">{adminData ? 'Update details of the corporate admin.' : 'Create a new corporate admin profile.'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* First Name */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                            First Name <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="first_name"
                            control={control}
                            rules={{
                                required: 'First Name is required',
                                minLength: { value: 2, message: 'Must be at least 2 characters' }
                            }}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    type="text"
                                    placeholder="Enter First Name"
                                    disabled={saving}
                                    className={`w-full px-4 py-3 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all ${
                                        errors.first_name 
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30' 
                                        : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-300'
                                    }`}
                                />
                            )}
                        />
                        {errors.first_name && (
                            <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                                <AlertCircle size={13} /> {errors.first_name.message}
                            </p>
                        )}
                    </div>
                    
                    {/* Last Name */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                            Last Name <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="last_name"
                            control={control}
                            rules={{
                                required: 'Last Name is required',
                                minLength: { value: 2, message: 'Must be at least 2 characters' }
                            }}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    type="text"
                                    placeholder="Enter Last Name"
                                    disabled={saving}
                                    className={`w-full px-4 py-3 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all ${
                                        errors.last_name 
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30' 
                                        : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-300'
                                    }`}
                                />
                            )}
                        />
                        {errors.last_name && (
                            <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                                <AlertCircle size={13} /> {errors.last_name.message}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="email"
                            control={control}
                            rules={{
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email address'
                                }
                            }}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    type="email"
                                    placeholder="email@example.com"
                                    disabled={saving || !!adminData}
                                    className={`w-full px-4 py-3 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed ${
                                        errors.email 
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30' 
                                        : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-300'
                                    }`}
                                />
                            )}
                        />
                        {errors.email && (
                            <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                                <AlertCircle size={13} /> {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                            Phone
                        </label>
                        <Controller
                            name="phone"
                            control={control}
                            rules={{
                                pattern: {
                                    value: /^[6-9][0-9]{9}$/,
                                    message: 'please enter a valid  number'
                                }
                            }}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    type="text"
                                    maxLength={10}
                                    placeholder="Phone Number"
                                    disabled={saving}
                                    onInput={(e: any) => {
                                        e.target.value = e.target.value.replace(/[^0-9]/g, '');
                                        field.onChange(e);
                                    }}
                                    className={`w-full px-4 py-3 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all ${
                                        errors.phone 
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30' 
                                        : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-300'
                                    }`}
                                />
                            )}
                        />
                        {errors.phone && (
                            <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                                <AlertCircle size={13} /> {errors.phone.message}
                            </p>
                        )}
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                            Address
                        </label>
                        <Controller
                            name="address"
                            control={control}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    type="text"
                                    placeholder="Street Address"
                                    disabled={saving}
                                    className="w-full px-4 py-3 rounded-xl text-sm font-medium border border-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 hover:border-gray-300 transition-all"
                                />
                            )}
                        />
                    </div>

                    {/* Country */}
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                            Country
                        </label>
                        <Controller
                            name="country"
                            control={control}
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
                                    isDisabled={saving}
                                    placeholder="Select Country"
                                    classNames={customSelectClassNames(errors.country)}
                                />
                            )}
                        />
                    </div>

                    {/* State */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                            State
                        </label>
                        <Controller
                            name="state"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    options={stateOptions}
                                    value={stateOptions.find(s => s.value === field.value) || null}
                                    onChange={(selected) => {
                                        field.onChange(selected ? selected.value : '');
                                        setValue('city', '');
                                    }}
                                    isDisabled={!watchCountry || saving}
                                    isClearable
                                    isSearchable
                                    placeholder="Select State"
                                    classNames={customSelectClassNames(errors.state)}
                                />
                            )}
                        />
                    </div>

                    {/* City */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                            City
                        </label>
                        <Controller
                            name="city"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    options={cityOptions}
                                    value={cityOptions.find(c => c.value === field.value) || null}
                                    onChange={(selected) => field.onChange(selected ? selected.value : '')}
                                    isDisabled={!watchState || saving}
                                    isClearable
                                    isSearchable
                                    placeholder="Select City"
                                    classNames={customSelectClassNames(errors.city)}
                                />
                            )}
                        />
                    </div>

                    {/* Pincode */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                            Pincode
                        </label>
                        <Controller
                            name="pincode"
                            control={control}
                            rules={{
                                pattern: {
                                    value: /^[0-9]{1,6}$/,
                                    message: 'Enter a valid pincode'
                                }
                            }}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    type="text"
                                    placeholder="Postal Code"
                                    maxLength={6}
                                    disabled={saving}
                                    onInput={(e: any) => {
                                        e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                                        field.onChange(e);
                                    }}
                                    className={`w-full px-4 py-3 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all ${
                                        errors.pincode 
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30' 
                                        : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-300'
                                    }`}
                                />
                            )}
                        />
                        {errors.pincode && (
                            <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                                <AlertCircle size={13} /> {errors.pincode.message}
                            </p>
                        )}
                    </div>
                </div>

                {/* Profile Image Section */}
                <div className="mt-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                        Profile Image
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

                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
                <button
                    type="button"
                    onClick={hideModal}
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm flex items-center gap-2"
                >
                    {saving && <Loader2 size={14} className="animate-spin" />}
                    {saving ? 'Saving...' : (adminData ? 'Update Profile' : 'Add Profile')}
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
        </>
    );
};

export default CorporateAdminForm;
