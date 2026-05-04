import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useModal } from '../../context/ModalContext';
import { Plus, List, Upload, Loader2, X, Image as ImageIcon, FileText, AlertCircle, Trash2, CheckCircle2 } from 'lucide-react';
import { assignCourseIncludedApi, fetchCourseIncludedApi, deleteCourseIncludedApi } from '../../services/apiServices';

interface AssignCourseIncludedProps {
    courseId: number | string;
}

interface CourseIncludedFormData {
    text: string;
}

const AssignCourseIncluded: React.FC<AssignCourseIncludedProps> = ({ courseId }) => {
    // ─── Form Setup ─────────────────────────────────────────────────────────────
    const { register, handleSubmit, reset, formState: { errors } } = useForm<CourseIncludedFormData>();

    // ─── State ──────────────────────────────────────────────────────────────────
    const [iconFile, setIconFile] = useState<File | null>(null);
    const [iconPreview, setIconPreview] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'add' | 'list'>('add');
    const [items, setItems] = useState<any[]>([]);
    const [fetching, setFetching] = useState(false);

    const { hideModal } = useModal();

    // ─── Fetch Items ────────────────────────────────────────────────────────────
    const fetchItems = async () => {
        setFetching(true);
        try {
            const res = await fetchCourseIncludedApi(courseId);
            if (res.status && res.data) {
                setItems(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch includes", error);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'list') {
            fetchItems();
        }
    }, [activeTab]);

    // ─── Handlers ───────────────────────────────────────────────────────────────
    const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const picked = e.target.files?.[0] ?? null;
        setIconFile(picked);
        if (picked) {
            setIconPreview(URL.createObjectURL(picked));
        } else {
            setIconPreview(null);
        }
    };

    const clearIcon = () => {
        setIconFile(null);
        setIconPreview(null);
    };

    const handleDelete = async (id: string | number) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;

        try {
            const res = await deleteCourseIncludedApi(id);
            if (res.status) {
                toast.success('Item deleted');
                fetchItems();
            } else {
                toast.error(res.message || 'Failed to delete');
            }
        } catch (error) {
            toast.error('Error deleting item');
        }
    };

    const onSubmit = async (data: CourseIncludedFormData) => {
        if (!iconFile) return toast.error('Please upload an icon.');

        try {
            setSaving(true);
            const formData = new FormData();
            formData.append('course_id', String(courseId));
            formData.append('text', data.text);
            formData.append('icon', iconFile);

            const res = await assignCourseIncludedApi(formData);

            if (res.status) {
                toast.success(res.message || 'Added successfully!');
                reset();
                clearIcon();
                setActiveTab('list');
            } else {
                toast.error(res.message || 'Failed to add.');
            }
        } catch (error) {
            console.error("Submission Error:", error);
            toast.error('Failed to add. Please check your connection.');
        } finally {
            setSaving(false);
        }
    };

    // Cleanup preview URL
    useEffect(() => {
        return () => {
            if (iconPreview) URL.revokeObjectURL(iconPreview);
        };
    }, [iconPreview]);

    return (
        <div className="flex flex-col gap-6 max-h-[85vh] overflow-y-auto px-1">
            {/* ─── Header ─── */}
            <div className="flex items-center justify-between p-2 rounded-2xl bg-indigo-50 border border-indigo-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl text-indigo-600 shadow-sm border border-indigo-100">
                        <CheckCircle2 size={20} className="animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                            Course Includes
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            Manage what's included in this course
                        </p>
                    </div>
                </div>
            </div>

            {/* ─── Tabs ─── */}
            <div className="flex p-1.5 bg-slate-100/80 rounded-2xl w-full">
                <button
                    onClick={() => setActiveTab('add')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'add'
                        ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-100'
                        : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    <Plus size={14} /> Add New
                </button>
                <button
                    onClick={() => setActiveTab('list')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'list'
                        ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-100'
                        : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    <List size={14} /> View List
                </button>
            </div>

            {activeTab === 'add' ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            <FileText size={12} className="text-indigo-400" /> Title Text
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                {...register('text', { required: 'Title text is required' })}
                                placeholder="e.g. 24/7 Support"
                                className={`w-full px-4 py-3 bg-white border rounded-2xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300 text-slate-600 shadow-sm ${errors.text ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'
                                    }`}
                            />
                            {errors.text && (
                                <span className="flex items-center gap-1 mt-1 text-[10px] font-bold text-rose-500 ml-1">
                                    <AlertCircle size={10} /> {errors.text.message}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Icon Image
                        </label>
                        {!iconFile ? (
                            <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-[2rem] cursor-pointer bg-slate-50 hover:bg-slate-100/50 transition-all group overflow-hidden border-slate-200 hover:border-indigo-300">
                                <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                                    <ImageIcon size={24} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                </div>
                                <p className="text-xs font-bold text-slate-500 mt-4 group-hover:text-indigo-600">Upload Icon</p>
                                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">PNG, JPG, SVG up to 1MB</p>
                                <input type="file" accept="image/*" className="hidden" onChange={handleIconChange} />
                            </label>
                        ) : (
                            <div className="relative h-44 rounded-[2rem] overflow-hidden border border-slate-200 bg-slate-100 group shadow-lg">
                                <img src={iconPreview!} alt="Preview" className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105" />
                                <button
                                    type="button"
                                    onClick={clearIcon}
                                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-md rounded-xl text-rose-500 shadow-xl hover:bg-rose-500 hover:text-white transition-all transform hover:-translate-y-0.5"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={hideModal}
                            disabled={saving}
                            className="px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-3 px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 hover:shadow-indigo-300 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
                        >
                            {saving ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Upload size={16} />
                                    Submit
                                </>
                            )}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 p-2 min-h-[300px]">
                    {fetching ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 size={32} className="text-indigo-500 animate-spin mb-4" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading List...</p>
                        </div>
                    ) : items.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                            {items.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all group">
                                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        <img src={item.icon} alt="" className="w-8 h-8 object-contain" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate">{item.text}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-2.5 rounded-xl bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-slate-100 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center px-10">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                                <List size={24} className="text-slate-300" />
                            </div>
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Items Found</h4>
                            <p className="text-[11px] text-slate-400 mt-2">Add new items to see them here.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AssignCourseIncluded;