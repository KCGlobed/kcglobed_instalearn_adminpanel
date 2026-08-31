import React, { useRef } from 'react';
import {
    FiUser, FiEdit2, FiMapPin,
    FiCamera, FiTrash2, FiLoader
} from 'react-icons/fi';

interface HeroProfileProps {
    data: any;
    imageLoading: boolean;
    bannerLoading: boolean;
    onInitiateCrop: (file: File, target: 'profile' | 'banner') => void;
    onRemoveProfileImage: () => void;
    previewProfile?: string | null;
    previewBanner?: string | null;
}

const HeroProfile: React.FC<HeroProfileProps> = ({
    data,
    imageLoading,
    bannerLoading,
    onInitiateCrop,
    onRemoveProfileImage,
    previewProfile,
    previewBanner
}) => {
    const profileInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    const handleProfileFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) onInitiateCrop(file, 'profile');
        if (e.target) e.target.value = '';
    };

    const handleBannerFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) onInitiateCrop(file, 'banner');
        if (e.target) e.target.value = '';
    };

    const fullName = data ? `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Admin User' : 'Admin User';
    const email = data?.email || 'admin@example.com';
    const profileImg = previewProfile || data?.image;
    const bannerImg = previewBanner || data?.banner_image;

    return (
        <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden flex flex-col items-center text-center relative group">
            {/* Hidden file inputs */}
            <input type="file" ref={profileInputRef} onChange={handleProfileFile} accept="image/*" className="hidden" />
            <input type="file" ref={bannerInputRef} onChange={handleBannerFile} accept="image/*" className="hidden" />

            {/* Banner */}
            <div className="relative w-full h-24 bg-zinc-100 overflow-hidden group/banner">
                {bannerImg ? (
                    <img src={bannerImg} alt="Profile Banner" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-b from-zinc-200/60 to-transparent" />
                )}
                {bannerLoading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <FiLoader className="w-5 h-5 text-white animate-spin" />
                    </div>
                )}
                <button
                    type="button"
                    onClick={() => bannerInputRef.current?.click()}
                    disabled={bannerLoading}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white text-zinc-700 rounded-full shadow-xs border border-zinc-200 opacity-0 group-hover/banner:opacity-100 transition-opacity cursor-pointer text-xs"
                    title="Change Banner Image"
                >
                    <FiCamera className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Avatar */}
            <div className="relative -mt-12 mb-4">
                <div className="w-24 h-24 rounded-full border-2 border-white bg-zinc-50 flex items-center justify-center overflow-hidden shadow-xs relative group/avatar">
                    {profileImg ? (
                        <img src={profileImg} alt={fullName} className="w-full h-full object-cover" />
                    ) : (
                        <FiUser className="w-10 h-10 text-zinc-400" />
                    )}
                    {imageLoading && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                            <FiLoader className="w-5 h-5 text-white animate-spin" />
                        </div>
                    )}
                </div>
                <button
                    type="button"
                    onClick={() => profileInputRef.current?.click()}
                    disabled={imageLoading}
                    className="absolute bottom-0 right-0 bg-white border border-zinc-200 p-1.5 rounded-full text-zinc-600 hover:text-zinc-900 hover:border-zinc-300 transition-colors shadow-sm cursor-pointer"
                    title="Change Profile Picture"
                >
                    <FiEdit2 className="w-3.5 h-3.5" />
                </button>
                {profileImg && (
                    <button
                        type="button"
                        onClick={onRemoveProfileImage}
                        disabled={imageLoading}
                        className="absolute bottom-0 left-0 bg-white border border-zinc-200 p-1.5 rounded-full text-rose-500 hover:text-rose-700 hover:border-rose-300 transition-colors shadow-sm cursor-pointer"
                        title="Remove Profile Picture"
                    >
                        <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {/* Info */}
            <div className="px-6 pb-6 w-full">
                <h1 className="text-xl font-bold tracking-tight text-zinc-900">{fullName}</h1>
                <p className="text-sm text-zinc-500 mb-4">{email}</p>
                <div className="flex items-center justify-center gap-2 mb-2">
                    {data?.city && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-zinc-50 text-zinc-600 border border-zinc-200">
                            <FiMapPin className="w-3 h-3 text-zinc-400" />
                            {data.city}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HeroProfile;
