import { useState, useEffect } from 'react';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useRedux';
import {
    getProfile,
    updateProfile,
    updateProfileImage,
    updateBannerImage,
    removeProfileImage,
    updatePassword,
} from '../../../store/slices/profileSlice';
import { CropperModal } from '../../../components/ImageCropper/components/CropperModal';
import type { CropResult } from '../../../components/ImageCropper/utils/cropCanvas';
import toast from 'react-hot-toast';
import { FiLoader } from 'react-icons/fi';

import HeroProfile from './components/HeroProfile';
import Navigation from './components/Navigation';
import OverviewTab from './components/OverviewTab';
import AccountSettingsTab from '../AccountSettings/AccountSettingsTab';
import ChangePassword from '../ChangePassword/index';

const Profile = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const dispatch = useAppDispatch();
    const { data, loading, updateLoading, imageLoading, bannerLoading, passwordLoading } = useAppSelector(
        (state: any) => state.profile || { data: null, loading: false }
    );

    // Cropper state
    const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
    const [cropTarget, setCropTarget] = useState<'profile' | 'banner' | null>(null);
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [originalImageFormat, setOriginalImageFormat] = useState<'image/png' | 'image/jpeg'>('image/jpeg');
    const [previewProfile, setPreviewProfile] = useState<string | null>(null);
    const [previewBanner, setPreviewBanner] = useState<string | null>(null);

    useEffect(() => {
        dispatch(getProfile());
    }, [dispatch]);

    const handleInitiateCrop = (file: File, target: 'profile' | 'banner') => {
        const isJpeg = file.type === 'image/jpeg' || file.type === 'image/jpg';
        setOriginalImageFormat(isJpeg ? 'image/jpeg' : 'image/png');

        const reader = new FileReader();
        reader.onloadend = () => {
            setRawImageSrc(reader.result as string);
            setCropTarget(target);
            setIsCropperOpen(true);
        };
        reader.readAsDataURL(file);
    };

    const handleUpdateProfile = async (payload: any) => {
        try {
            await dispatch(updateProfile(payload)).unwrap();
            toast.success("Profile updated successfully!");
            dispatch(getProfile());
        } catch (err: any) {
            const errorMsg = typeof err === 'string' ? err : err?.message || "Failed to update profile";
            toast.error(errorMsg);
        }
    };

    const handleUpdatePassword = async (payload: any) => {
        try {
            await dispatch(updatePassword(payload)).unwrap();
            toast.success("Password updated successfully!");
        } catch (err: any) {
            const errorMsg = typeof err === 'string' ? err : err?.message || "Failed to update password";
            toast.error(errorMsg);
            throw err;
        }
    };

    const handleUpdateProfileImage = async (file: File) => {
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Profile image must be less than 5MB");
            return;
        }
        const formData = new FormData();
        formData.append("image", file);
        try {
            await dispatch(updateProfileImage(formData)).unwrap();
            toast.success("Profile image updated successfully!");
            dispatch(getProfile());
        } catch (err: any) {
            const errorMsg = typeof err === 'string' ? err : err?.message || "Failed to update profile image";
            toast.error(errorMsg);
        } finally {
            setPreviewProfile(null);
        }
    };

    const handleUpdateBannerImage = async (file: File) => {
        if (file.size > 10 * 1024 * 1024) {
            toast.error("Banner image must be less than 10MB");
            return;
        }
        const formData = new FormData();
        formData.append("banner_image", file);
        try {
            await dispatch(updateBannerImage(formData)).unwrap();
            toast.success("Banner image updated successfully!");
            dispatch(getProfile());
        } catch (err: any) {
            const errorMsg = typeof err === 'string' ? err : err?.message || "Failed to update banner image";
            toast.error(errorMsg);
        } finally {
            setPreviewBanner(null);
        }
    };

    const handleCropComplete = async (result: CropResult) => {
        setIsCropperOpen(false);
        setRawImageSrc(null);

        if (cropTarget === 'profile' && result.file) {
            const previewUrl = URL.createObjectURL(result.file);
            setPreviewProfile(previewUrl);
            await handleUpdateProfileImage(result.file);
            URL.revokeObjectURL(previewUrl);
        } else if (cropTarget === 'banner' && result.file) {
            const previewUrl = URL.createObjectURL(result.file);
            setPreviewBanner(previewUrl);
            await handleUpdateBannerImage(result.file);
            URL.revokeObjectURL(previewUrl);
        }
        setCropTarget(null);
    };

    const handleRemoveProfileImage = async () => {
        try {
            await dispatch(removeProfileImage()).unwrap();
            toast.success("Profile image removed successfully!");
            dispatch(getProfile());
        } catch (err: any) {
            const errorMsg = typeof err === 'string' ? err : err?.message || "Failed to remove profile image";
            toast.error(errorMsg);
        }
    };

    if (loading && !data) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center bg-zinc-50">
                <div className="flex flex-col items-center gap-3">
                    <FiLoader className="w-8 h-8 text-zinc-900 animate-spin" />
                    <p className="text-sm font-medium text-zinc-500">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 pb-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Account Settings</h1>
                    <p className="text-sm text-zinc-500 mt-1">Manage your administrative profile and security preferences.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Sidebar (Sticky) */}
                    <aside className="w-full lg:w-72 flex-shrink-0">
                        <div className="lg:sticky lg:top-8 space-y-6">
                            <HeroProfile
                                data={data}
                                imageLoading={imageLoading}
                                bannerLoading={bannerLoading}
                                onInitiateCrop={handleInitiateCrop}
                                onRemoveProfileImage={handleRemoveProfileImage}
                                previewProfile={previewProfile}
                                previewBanner={previewBanner}
                            />
                            <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
                        </div>
                    </aside>

                    {/* Right Content Area */}
                    <main className="flex-1 min-w-0">
                        <div className="animate-in fade-in duration-300">
                            {activeTab === 'overview' && (
                                <OverviewTab
                                    data={data}
                                    updateLoading={updateLoading}
                                    onSave={handleUpdateProfile}
                                />
                            )}
                            {activeTab === 'settings' && <AccountSettingsTab />}
                            {activeTab === 'Change Password' && (
                                <ChangePassword
                                    onSave={handleUpdatePassword}
                                    loading={passwordLoading}
                                />
                            )}
                        </div>
                    </main>
                </div>
            </div>

            {/* Image Cropper Modal */}
            <CropperModal
                imageSrc={rawImageSrc}
                isOpen={isCropperOpen}
                onClose={() => {
                    setIsCropperOpen(false);
                    setRawImageSrc(null);
                    setCropTarget(null);
                }}
                onCropComplete={handleCropComplete}
                initialFormat={originalImageFormat}
            />
        </div>
    );
};

export default Profile;