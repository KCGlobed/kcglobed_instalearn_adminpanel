import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useModal } from '../../context/ModalContext';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addEbook, editEbook } from '../../store/slices/ebookSlice';
import toast from 'react-hot-toast';
import { FileText, X, UploadCloud, Info } from 'lucide-react';
import { fetchEbookViewData } from '../../services/apiServices';

type EbookFormValues = {
    name: string;
    book_file: FileList | null;
};

type Props = {
    ebookData?: {
        id: number;
        name: string;
        book_file?: string;
    };
};

const EbookForm = ({ ebookData }: Props) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dispatch = useAppDispatch();
    const { hideModal } = useModal();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue,
    } = useForm<EbookFormValues>({
        defaultValues: {
            name: ebookData?.name || '',
            book_file: null,
        },
    });

    const ebookFile = watch('book_file');
    const [previewUrl, setPreviewUrl] = useState<string | null>(ebookData?.book_file || null);

    useEffect(() => {
        if (ebookFile && ebookFile.length > 0) {
            const file = ebookFile[0];
            if (file.type === 'application/pdf') {
                const url = URL.createObjectURL(file);
                setPreviewUrl(url);
                return () => URL.revokeObjectURL(url);
            }
        } else if (ebookData?.book_file) {
            setPreviewUrl(ebookData.book_file);
        } else {
            setPreviewUrl(null);
        }
    }, [ebookFile, ebookData?.book_file]);

    const onSubmit = async (data: EbookFormValues) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('name', data.name.trim());

            if (data.book_file && data.book_file.length > 0) {
                formData.append('book_file', data.book_file[0]);
            }

            if (ebookData?.id) {
                await dispatch(editEbook({ id: ebookData.id, ebookData: formData })).unwrap();
                toast.success("Ebook updated successfully");
            } else {
                await dispatch(addEbook(formData)).unwrap();
                toast.success("Ebook added successfully");
            }

            reset();
            hideModal();
        } catch (err: any) {
            console.error('Ebook submission failed:', err);
            toast.error(err || "Failed to submit ebook");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveFile = () => {
        setValue('book_file', null);
        setPreviewUrl(ebookData?.book_file || null);
    };

    const handleFetchEbook = async (id: number) => {
        try {
            const res = await fetchEbookViewData(id);
            if (res.status && res.data) {
                setValue('name', res.data.name);
                if (res.data.book_file) {
                    setPreviewUrl(res.data.book_file);
                }
            }
        } catch (error) {
            console.error("Failed to fetch ebook data", error);
            toast.error("Could not refresh ebook data from server");
        }
    }

    useEffect(() => {
        if (ebookData?.id) {
            handleFetchEbook(ebookData.id);
        }
    }, [ebookData?.id]);

    return (
        <div className="relative">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left side: Form Fields */}
                    <div className="w-full lg:w-3/5 flex flex-col gap-6">
                        <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100 flex flex-col gap-5">
                            {/* Name Field */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                                    Ebook Title <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        {...register('name', {
                                            required: 'Ebook title is required',
                                            minLength: { value: 3, message: 'Title must be at least 3 characters' },
                                            validate: value => value.trim().length > 0 || 'Title cannot be empty'
                                        })}
                                        className="w-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-4 py-3 rounded-xl transition-all bg-white"
                                        placeholder="e.g. Modern UI Design Principles"
                                    />
                                </div>
                                {errors.name && (
                                    <p className="mt-1 text-xs text-red-600 font-semibold flex items-center gap-1">
                                        <Info size={12} /> {errors.name.message}
                                    </p>
                                )}
                            </div>

                            {/* File Upload Field */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                                    Upload PDF <span className="text-red-500">{ebookData?.id ? '' : '*'}</span>
                                </label>

                                <div className={`relative group border-2 border-dashed rounded-2xl transition-all duration-300 ${ebookFile && ebookFile.length > 0
                                    ? 'border-indigo-200 bg-indigo-50/30'
                                    : 'border-gray-200 hover:border-indigo-400 bg-white'
                                    }`}>
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        {...register('book_file', {
                                            validate: (value) => {
                                                if (!ebookData?.id && (!value || value.length === 0)) return 'PDF file is required';
                                                if (value && value.length > 0) {
                                                    const file = value[0];
                                                    if (file.type !== 'application/pdf') return 'Only PDF files are allowed';
                                                    if (file.size > 10 * 1024 * 1024) return 'File size must be less than 10MB';
                                                }
                                                return true;
                                            }
                                        })}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />

                                    <div className="p-6 flex flex-col items-center justify-center text-center">
                                        {ebookFile && ebookFile.length > 0 ? (
                                            <div className="flex flex-col items-center animate-in zoom-in-95 duration-200">
                                                <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600 mb-2">
                                                    <FileText size={28} />
                                                </div>
                                                <p className="text-xs font-bold text-gray-900 truncate max-w-[150px]">
                                                    {ebookFile[0].name}
                                                </p>
                                                <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                                                    {(ebookFile[0].size / (1024 * 1024)).toFixed(2)} MB
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveFile();
                                                    }}
                                                    className="mt-3 flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-red-100 transition-colors pointer-events-auto relative z-20"
                                                >
                                                    <X size={12} /> Remove
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="p-3 bg-white rounded-xl text-gray-400 group-hover:text-indigo-500 group-hover:scale-110 transition-all duration-300 shadow-sm mb-2">
                                                    <UploadCloud size={28} />
                                                </div>
                                                <p className="text-xs font-bold text-gray-900">Choose PDF</p>
                                                <p className="text-[10px] text-gray-500 font-medium">Max. 10MB</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                                {errors.book_file && (
                                    <p className="mt-1.5 text-xs text-red-600 font-semibold flex items-center gap-1">
                                        <Info size={12} /> {errors.book_file.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Submit Actions - Pushed to bottom of left col */}
                        <div className="mt-auto pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition duration-300 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 active:scale-[0.98] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></div>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud size={18} />
                                        <span>{ebookData ? 'Update Ebook' : 'Publish Ebook'}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Right side: PDF Preview */}
                    <div className="w-full lg:w-3/5 flex flex-col gap-2">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                            {previewUrl ? 'Live Preview' : 'Preview Area'}
                        </label>
                        <div className="flex-1 bg-gray-900 rounded-2xl overflow-hidden shadow-2xl relative border-4 border-white min-h-[450px] flex flex-col">
                            <div className="p-3 bg-gray-800 flex items-center justify-between border-b border-gray-700/50">
                                <div className="flex items-center gap-2 text-gray-300">
                                    <FileText size={16} />
                                    <span className="text-xs font-bold truncate max-w-[200px]">
                                        {ebookFile && ebookFile.length > 0 ? ebookFile[0].name : (ebookData?.name || 'Preview')}
                                    </span>
                                </div>
                                <div className="flex gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-red-400 opacity-50"></div>
                                    <div className="w-2 h-2 rounded-full bg-yellow-400 opacity-50"></div>
                                    <div className="w-2 h-2 rounded-full bg-green-400 opacity-50"></div>
                                </div>
                            </div>
                            <div className="flex-1 bg-gray-100 flex items-center justify-center relative">
                                {previewUrl ? (
                                    <iframe
                                        src={`${previewUrl}#toolbar=0&view=FitH`}
                                        className="w-full h-full border-0 absolute inset-0"
                                        title="Ebook PDF Preview"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center text-gray-400 gap-3">
                                        <div className="p-4 bg-white rounded-full shadow-sm">
                                            <FileText size={40} className="opacity-20" />
                                        </div>
                                        <p className="text-sm font-medium italic">No PDF selected for preview</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EbookForm;