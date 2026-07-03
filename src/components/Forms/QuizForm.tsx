import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Select from 'react-select';
import { MessageSquare, AlertCircle, Loader2 } from 'lucide-react';
import { useModal } from '../../context/ModalContext';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addQuiz, editQuiz, getQuiz } from '../../store/slices/QuizSlice';
import { fetchAllChapters, viewQuizApi } from '../../services/apiServices';
import toast from 'react-hot-toast';
import { CropperModal } from '../ImageCropper/components/CropperModal';
import type { CropResult } from '../ImageCropper/utils/cropCanvas';

interface Option { label: string; value: any; }

const schema = yup.object().shape({
    name: yup.string().required('Quiz name is required'),
    description: yup.string().required('Description is required'),
    chapter: yup.object().shape({
        label: yup.string().required(),
        value: yup.mixed().required(),
    }).required('Chapter is required').nullable(),
    pass_percentage: yup
        .number()
        .typeError('Pass percentage must be a number')
        .required('Pass percentage is required')
        .min(0, 'Minimum is 0')
        .max(100, 'Maximum is 100'),
    thumbnail: yup.mixed().nullable().default(null),
});

type FormData = yup.InferType<typeof schema>;

interface QuizFormProps {
    quizId?: string | number;
}

const QuizForm: React.FC<QuizFormProps> = ({ quizId }) => {
    const [chapters, setChapters] = useState<Option[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { hideModal } = useModal();
    const dispatch = useAppDispatch();

    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
    const [originalImageFormat, setOriginalImageFormat] = useState<'image/png' | 'image/jpeg'>('image/png');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            name: '',
            description: '',
            chapter: null,
            pass_percentage: 50,
            thumbnail: null,
        },
    });

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetchAllChapters();
                const data = res?.data || res?.results || res || [];
                const chapterOptions = data.map((ch: any) => ({
                    label: ch.name,
                    value: String(ch.id),
                }));
                setChapters(chapterOptions);

                if (quizId) {
                    const detail = await viewQuizApi(quizId);
                    const quizData = detail?.data || detail;
                    if (quizData) {
                        setValue('name', quizData.name || '');
                        setValue('description', quizData.description || '');
                        setValue('pass_percentage', quizData.pass_percentage ?? 50);
                        if (quizData.chapter) {
                            const matchedChapter = chapterOptions.find(
                                (c: Option) => c.value === String(quizData.chapter?.id || quizData.chapter_id)
                            );
                            if (matchedChapter) {
                                setValue('chapter', matchedChapter as any);
                            } else {
                                setValue('chapter', {
                                    label: quizData.chapter.name || `Chapter ${quizData.chapter.id}`,
                                    value: String(quizData.chapter.id),
                                } as any);
                            }
                        }
                        if (quizData.thumbnail) {
                            setPreviewUrl(quizData.thumbnail);
                        }
                    }
                }
            } catch {
                toast.error('Failed to load form data.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [quizId, setValue]);

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

    const onSubmit = async (data: FormData) => {
        // Custom Image Validation for creation
        if (!quizId && !data.thumbnail) {
            setImageError("Thumbnail is mandatory");
            return;
        }

        try {
            setSaving(true);
            const payload = new window.FormData();
            payload.append('name', data.name.trim());
            payload.append('description', data.description.trim());
            payload.append('chapter_id', parseInt(String(data.chapter?.value || '0'), 10).toString());
            payload.append('pass_percentage', parseFloat(String(data.pass_percentage)).toString());
            payload.append('status', 'true');
            
            if (data.thumbnail instanceof File) {
                payload.append('thumbnail', data.thumbnail);
            }

            let res;
            if (quizId) {
                res = await dispatch(editQuiz({ id: quizId, data: payload })).unwrap();
                toast.success('Quiz updated successfully');
            } else {
                res = await dispatch(addQuiz(payload)).unwrap();
                toast.success('Quiz added successfully');
            }
            dispatch(getQuiz({ page: 1 }));
            hideModal();
        } catch (error: any) {
            toast.error(error?.message || 'Failed to save quiz');
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
                    <MessageSquare size={18} />
                </span>
                <div>
                    <p className="text-sm font-semibold text-indigo-800">{quizId ? 'Edit Quiz' : 'Add Quiz'}</p>
                    <p className="text-xs text-indigo-500 mt-0.5">{quizId ? 'Update details of the quiz.' : 'Create a new quiz.'}</p>
                </div>
            </div>

            {/* Quiz Name */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Quiz Name <span className="text-red-500">*</span>
                </label>
                {loading ? (
                    <div className="flex items-center gap-2 py-4 text-gray-400 text-sm">
                        <Loader2 size={16} className="animate-spin" /> Loading...
                    </div>
                ) : (
                    <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                            <input
                                {...field}
                                type="text"
                                placeholder="e.g. Intermediate Logics"
                                disabled={saving}
                                className={`w-full px-4 py-3 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all ${
                                    errors.name
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30'
                                        : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-300'
                                }`}
                            />
                        )}
                    />
                )}
                {errors.name && (
                    <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                        <AlertCircle size={13} /> {errors.name.message}
                    </p>
                )}
            </div>

            {/* Chapter Select */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Chapter <span className="text-red-500">*</span>
                </label>
                {loading ? (
                    <div className="flex items-center gap-2 py-4 text-gray-400 text-sm">
                        <Loader2 size={16} className="animate-spin" /> Loading chapters...
                    </div>
                ) : (
                    <Controller
                        name="chapter"
                        control={control}
                        render={({ field }) => (
                            <Select
                                {...field}
                                options={chapters}
                                placeholder="Search and select chapter..."
                                classNamePrefix="react-select"
                                isDisabled={saving}
                                styles={{
                                    control: (base, state) => ({
                                        ...base,
                                        borderRadius: '12px',
                                        borderColor: errors.chapter ? '#ef4444' : state.isFocused ? '#4f46e5' : '#e5e7eb',
                                        boxShadow: errors.chapter ? '0 0 0 3px rgba(239,68,68,0.15)' : state.isFocused ? '0 0 0 3px rgba(79,70,229,0.15)' : 'none',
                                        fontSize: '14px',
                                        padding: '2px 0',
                                        '&:hover': { borderColor: errors.chapter ? '#ef4444' : '#4f46e5' },
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
                {errors.chapter && (
                    <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                        <AlertCircle size={13} /> {errors.chapter.message}
                    </p>
                )}
            </div>

            {/* Description */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Description <span className="text-red-500">*</span>
                </label>
                <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                        <textarea
                            {...field}
                            placeholder="Enter short description..."
                            rows={4}
                            disabled={saving}
                            className={`w-full px-4 py-3 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all resize-y ${
                                errors.description
                                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30'
                                    : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-300'
                            }`}
                        />
                    )}
                />
                {errors.description && (
                    <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                        <AlertCircle size={13} /> {errors.description.message}
                    </p>
                )}
            </div>

            {/* Pass Percentage */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Pass Percentage (%) <span className="text-red-500">*</span>
                </label>
                <Controller
                    name="pass_percentage"
                    control={control}
                    render={({ field }) => (
                        <input
                            {...field}
                            type="number"
                            min="0"
                            max="100"
                            placeholder="e.g. 65.0"
                            disabled={saving}
                            onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                            className={`w-full px-4 py-3 rounded-xl text-sm font-medium border focus:outline-none focus:ring-4 transition-all ${
                                errors.pass_percentage
                                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30'
                                    : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-300'
                            }`}
                        />
                    )}
                />
                {errors.pass_percentage && (
                    <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                        <AlertCircle size={13} /> {errors.pass_percentage.message}
                    </p>
                )}
            </div>

            {/* Image */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Thumbnail <span className="text-red-500">{quizId ? '' : '*'}</span>
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
                    disabled={saving || loading}
                    className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm flex items-center gap-2"
                >
                    {saving && <Loader2 size={14} className="animate-spin" />}
                    {saving ? 'Saving...' : (quizId ? 'Update Quiz' : 'Add Quiz')}
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

export default QuizForm;
