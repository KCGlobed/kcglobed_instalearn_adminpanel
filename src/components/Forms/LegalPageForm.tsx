import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useModal } from '../../context/ModalContext';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addLegalPage, editLegalPage, getLegalPages } from '../../store/slices/legalPageSlice';
import toast from 'react-hot-toast';
import type { LegalPage } from '../../utils/types';
import LexicalEditor from "../TextEditor";
import { FileText, Globe, Save } from 'lucide-react';



type LegalPageFormValues = {
  title: string;
  page_type: string;
  description: string;
  meta_title: string;
  meta_description: string;
  meta_keys: string;
};

type Props = {
  pageData?: LegalPage;
  onSuccess?: () => void;
};

const LegalPageForm: React.FC<Props> = ({ pageData, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useAppDispatch();
  const { hideModal } = useModal();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LegalPageFormValues>({
    defaultValues: {
      title: '',
      page_type: '',
      description: '',
      meta_title: '',
      meta_description: '',
      meta_keys: '',
    },
  });

  // Populate data in edit mode
  useEffect(() => {
    if (pageData) {
      reset({
        title: pageData.title || '',
        page_type: pageData.page_type?.toString() || '',
        description: pageData.description || '',
        meta_title: pageData.meta_title || '',
        meta_description: pageData.meta_description || '',
        meta_keys: pageData.meta_keys || pageData.meta_keywords || '',
      });
    }
  }, [pageData, reset]);

  const onSubmit = async (formData: LegalPageFormValues) => {
    setIsSubmitting(true);
    try {
      const payload: any = {
        title: formData.title.trim(),
        page_type: formData.page_type,
        description: formData.description,
        meta_title: formData.meta_title?.trim() || '',
        meta_description: formData.meta_description?.trim() || '',
        meta_keys: formData.meta_keys?.trim() || '',
      };

      if (pageData?.id) {
        await dispatch(editLegalPage({ id: pageData.id, pageData: payload })).unwrap();
        toast.success('Legal page updated successfully');
      } else {
        await dispatch(addLegalPage(payload)).unwrap();
        toast.success('Legal page created successfully');
      }
      dispatch(getLegalPages({}));
      if (onSuccess) onSuccess();
      hideModal();
    } catch (err: any) {
      console.error('Legal page submission error:', err);
      toast.error(err || 'Failed to save legal page');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-h-[82vh] overflow-y-auto px-1 custom-scrollbar">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info Section */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <FileText className="text-indigo-600" size={20} />
            <h2 className="text-base font-bold text-gray-800">Page Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Page Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('title', {
                  required: 'Page title is required',
                  minLength: { value: 2, message: 'Title must be at least 2 characters' }
                })}
                className={`w-full border ${errors.title ? 'border-red-400' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-indigo-500 px-4 py-2.5 rounded-xl text-gray-800 placeholder-gray-400 text-sm`}
                placeholder="e.g. Terms and Conditions"
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.title.message}</p>
              )}
            </div>

            {/* Page Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Page Type <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('page_type', { required: 'Page type is required' })}
                className={`w-full border ${errors.page_type ? 'border-red-400' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-indigo-500 px-4 py-2.5 rounded-xl text-gray-800 placeholder-gray-400 text-sm`}
                placeholder="e.g. Terms & Conditions"
              />
              {errors.page_type && (
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.page_type.message}</p>
              )}
            </div>
          </div>

          {/* Rich Text Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Page Content / Description <span className="text-red-500">*</span>
            </label>
            <Controller
              name="description"
              control={control}
              rules={{
                required: 'Description is required',
                validate: (val) =>
                  (val && val.replace(/<[^>]*>?/gm, '').trim().length > 0) ||
                  'Description content cannot be empty',
              }}
              render={({ field }) => (
                <div
                  className={`rounded-xl border ${
                    errors.description
                      ? 'border-red-400 focus-within:ring-red-500/20'
                      : 'border-gray-200 focus-within:ring-indigo-500/20'
                  } overflow-hidden focus-within:ring-2 focus-within:border-indigo-500 transition-all bg-white min-h-[220px]`}
                >
                  <LexicalEditor
                    type="description"
                    value={field.value || ''}
                    onChange={field.onChange}
                    placeholder="Enter full page content here..."
                  />
                </div>
              )}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600 font-medium">{errors.description.message}</p>
            )}
          </div>
        </div>

        {/* SEO & Meta Tags Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Globe className="text-indigo-600" size={20} />
            <h2 className="text-base font-bold text-gray-800">SEO & Metadata</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Meta Title</label>
              <input
                type="text"
                {...register('meta_title')}
                className="w-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 px-4 py-2.5 rounded-xl text-gray-800 placeholder-gray-400 text-sm"
                placeholder="Enter meta title for SEO..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Meta Keywords / Keys
              </label>
              <input
                type="text"
                {...register('meta_keys')}
                className="w-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 px-4 py-2.5 rounded-xl text-gray-800 placeholder-gray-400 text-sm"
                placeholder="terms, conditions, policy, agreement (comma-separated)"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Meta Description</label>
            <textarea
              {...register('meta_description')}
              rows={3}
              className="w-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 px-4 py-2.5 rounded-xl text-gray-800 placeholder-gray-400 text-sm resize-none"
              placeholder="Enter brief meta description for search engines..."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => hideModal()}
            className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 hover:shadow-lg transition-all shadow-indigo-200 shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            {isSubmitting ? 'Saving...' : pageData?.id ? 'Update Page' : 'Create Page'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LegalPageForm;
