import { useEffect, useState } from 'react';
import Select from 'react-select';
import toast from 'react-hot-toast';
import { fetchInstructor } from '../../services/apiServices';
import { useModal } from '../../context/ModalContext';
import { UserCheck, Loader2 } from 'lucide-react';

interface Option { label: string; value: any; }

interface AssignInstructorFormProps {
    courseId: number | string;
}

const AssignInstructorForm: React.FC<AssignInstructorFormProps> = ({ courseId }) => {
    const [options, setOptions] = useState<Option[]>([]);
    const [selected, setSelected] = useState<Option | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { hideModal } = useModal();

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetchInstructor();
                setOptions(
                    (res?.data || []).map((item: any) => ({
                        label: `${item.first_name} ${item.last_name}`,
                        value: item.id,
                    }))
                );
            } catch {
                toast.error('Failed to load instructors.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [courseId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selected) {
            toast.error('Please select an instructor.');
            return;
        }
        try {
            setSaving(true);
            // TODO: call your assign-instructor API here
            // await assignInstructorApi(courseId, selected.value);
            console.log('Assigning instructor:', { courseId, instructor: selected.value });
            toast.success('Instructor assigned successfully!');
            hideModal();
        } catch {
            toast.error('Failed to assign instructor.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Header info */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                <span className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                    <UserCheck size={18} />
                </span>
                <div>
                    <p className="text-sm font-semibold text-emerald-800">Assign Instructor</p>
                    <p className="text-xs text-emerald-500 mt-0.5">Choose the instructor responsible for this course.</p>
                </div>
            </div>

            {/* Select */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Instructor
                </label>
                {loading ? (
                    <div className="flex items-center gap-2 py-4 text-gray-400 text-sm">
                        <Loader2 size={16} className="animate-spin" /> Loading instructors...
                    </div>
                ) : (
                    <Select
                        options={options}
                        value={selected}
                        onChange={(val) => setSelected(val as Option)}
                        placeholder="Search and select instructor..."
                        classNamePrefix="react-select"
                        styles={{
                            control: (base) => ({
                                ...base,
                                borderRadius: '12px',
                                borderColor: '#e5e7eb',
                                boxShadow: 'none',
                                fontSize: '14px',
                                '&:hover': { borderColor: '#10b981' },
                            }),
                            option: (base, state) => ({
                                ...base,
                                backgroundColor: state.isSelected ? '#d1fae5' : state.isFocused ? '#f0fdf4' : 'white',
                                color: state.isSelected ? '#065f46' : '#111827',
                                fontWeight: state.isSelected ? 600 : 400,
                            }),
                        }}
                    />
                )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button
                    type="button"
                    onClick={hideModal}
                    className="px-5 py-2 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={saving || loading}
                    className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
                >
                    {saving ? 'Saving...' : 'Assign Instructor'}
                </button>
            </div>
        </form>
    );
};

export default AssignInstructorForm;
