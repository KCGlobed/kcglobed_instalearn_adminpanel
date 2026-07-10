import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import toast from 'react-hot-toast';
import { assignMcqsToQuizApi, getMcqsListByQuizApi, viewQuizApi } from '../../services/apiServices';
import { useModal } from '../../context/ModalContext';
import { Loader2, AlertCircle, ListChecks } from 'lucide-react';

interface Option {
    label: string;
    value: any;
}

interface AssignMcqFormValues {
    mcqs: Option[];
}

interface AssignMcqFormProps {
    quizId: number | string;
    onSuccess?: () => void;
}

const AssignMcqForm: React.FC<AssignMcqFormProps> = ({ quizId, onSuccess }) => {
    const [options, setOptions] = useState<Option[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const { hideModal } = useModal();

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setValue,
    } = useForm<AssignMcqFormValues>({
        defaultValues: { mcqs: [] },
    });

    useEffect(() => {
        const load = async () => {
            if (!quizId) {
                toast.error('Invalid Quiz ID.');
                setLoadingOptions(false);
                return;
            }

            try {
                // Fetch MCQs for the quiz
                const mcqsRes = await getMcqsListByQuizApi(quizId);
                const mcqsData = mcqsRes?.data || mcqsRes?.results || mcqsRes || [];
                
                const formatLabel = (item: any) => {
                    let label = item.id_number || `Question ${item.id}`;
                    if (item.question_detail?.question) {
                        const stripped = item.question_detail.question.replace(/<[^>]*>?/gm, '');
                        const shortQ = stripped.length > 50 ? stripped.substring(0, 50) + '...' : stripped;
                        label += ` - ${shortQ}`;
                    }
                    return label;
                };

                const mcqOptions: Option[] = mcqsData.map((item: any) => ({
                    label: formatLabel(item),
                    value: item.id
                }));
                
                setOptions(mcqOptions);

                // Pre-populate with currently assigned MCQs
                if (quizId) {
                    const quizRes = await viewQuizApi(quizId);
                    const quizData = quizRes?.data || quizRes;
                    
                    if (quizData?.quiz_questions) {
                        const assignedOptions = quizData.quiz_questions.map((q: any) => {
                            // Find matching option from the fetched list to get the exact label
                            const matched = mcqOptions.find(opt => opt.value === q.question_id || opt.value === q.id);
                            if (matched) return matched;
                            
                            // Fallback label if not found in list for some reason
                            return {
                                label: formatLabel(q),
                                value: q.question_id || q.id
                            };
                        });
                        setValue('mcqs', assignedOptions);
                    }
                }
            } catch (err) {
                console.error(err);
                toast.error('Failed to load MCQs.');
            } finally {
                setLoadingOptions(false);
            }
        };
        
        load();
    }, [quizId, setValue]);

    const onSubmit = async (data: AssignMcqFormValues) => {
        try {
            const payload = {
                quiz_id: Number(quizId),
                mcq_ids: data.mcqs.map((c) => Number(c.value))
            };
            
            const res = await assignMcqsToQuizApi(payload);
            
            // Assuming successful response structure (adjust if needed)
            toast.success(res?.message || 'MCQs assigned successfully');
            if (onSuccess) onSuccess();
            reset();
            hideModal();
        } catch (error: any) {
            toast.error(error?.message || 'Failed to assign MCQs. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                <span className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <ListChecks size={18} />
                </span>
                <div>
                    <p className="text-sm font-semibold text-indigo-800">Assign MCQs</p>
                    <p className="text-xs text-indigo-500 mt-0.5">
                        Select one or more questions to link to this quiz.
                    </p>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Multiple Choice Questions <span className="text-red-500">*</span>
                </label>

                {loadingOptions ? (
                    <div className="flex items-center gap-2 py-4 text-gray-400 text-sm">
                        <Loader2 size={16} className="animate-spin" />
                        Loading questions...
                    </div>
                ) : (
                    <Controller
                        name="mcqs"
                        control={control}
                        rules={{
                            validate: (val) =>
                                val.length > 0 || 'Please select at least one question.',
                        }}
                        render={({ field }) => (
                            <Select
                                {...field}
                                isMulti
                                options={options}
                                placeholder="Search and select questions..."
                                classNamePrefix="react-select"
                                closeMenuOnSelect={false}
                                isDisabled={isSubmitting}
                                styles={{
                                    control: (base, state) => ({
                                        ...base,
                                        borderRadius: '12px',
                                        borderColor: errors.mcqs
                                            ? '#ef4444'
                                            : state.isFocused
                                                ? '#6366f1'
                                                : '#e5e7eb',
                                        boxShadow: errors.mcqs
                                            ? '0 0 0 3px rgba(239,68,68,0.15)'
                                            : state.isFocused
                                                ? '0 0 0 3px rgba(99,102,241,0.15)'
                                                : 'none',
                                        fontSize: '14px',
                                        transition: 'border-color 0.2s, box-shadow 0.2s',
                                        '&:hover': {
                                            borderColor: errors.mcqs ? '#ef4444' : '#6366f1',
                                        },
                                    }),
                                    multiValue: (base) => ({
                                        ...base,
                                        backgroundColor: '#eef2ff',
                                        borderRadius: '8px',
                                    }),
                                    multiValueLabel: (base) => ({
                                        ...base,
                                        color: '#4f46e5',
                                        fontWeight: 600,
                                        fontSize: '12px',
                                    }),
                                    multiValueRemove: (base) => ({
                                        ...base,
                                        color: '#6366f1',
                                        borderRadius: '0 8px 8px 0',
                                        '&:hover': {
                                            backgroundColor: '#c7d2fe',
                                            color: '#4338ca',
                                        },
                                    }),
                                    placeholder: (base) => ({
                                        ...base,
                                        color: '#9ca3af',
                                        fontSize: '14px',
                                    }),
                                    menu: (base) => ({
                                        ...base,
                                        borderRadius: '12px',
                                        boxShadow:
                                            '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)',
                                        border: '1px solid #e5e7eb',
                                        overflow: 'hidden',
                                    }),
                                    option: (base, state) => ({
                                        ...base,
                                        backgroundColor: state.isSelected
                                            ? '#eef2ff'
                                            : state.isFocused
                                                ? '#f5f3ff'
                                                : 'white',
                                        color: state.isSelected ? '#4338ca' : '#111827',
                                        fontWeight: state.isSelected ? 600 : 400,
                                        fontSize: '14px',
                                    }),
                                }}
                            />
                        )}
                    />
                )}

                {errors.mcqs && (
                    <p className="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500">
                        <AlertCircle size={13} />
                        {errors.mcqs.message}
                    </p>
                )}

                {!errors.mcqs && !loadingOptions && (
                    <p className="mt-1.5 text-[11px] text-gray-400">
                        You can select multiple questions. They will be linked to this quiz immediately.
                    </p>
                )}
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button
                    type="button"
                    onClick={() => { reset(); hideModal(); }}
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting || loadingOptions}
                    className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm flex items-center gap-2"
                >
                    {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                    {isSubmitting ? 'Saving...' : 'Assign MCQs'}
                </button>
            </div>
        </form>
    );
};

export default AssignMcqForm;
