import React, { useState, useRef } from "react";
import { importUniversityStudentsApi } from "../../services/apiServices";
import toast from "react-hot-toast";
import { FiUploadCloud, FiFileText, FiX, FiCheckCircle, FiInfo } from "react-icons/fi";
import { useModal } from "../../context/ModalContext";

interface ImportUniversityStudentsProps {
    universityId: number | string;
    institutionName?: string;
    onSuccess?: () => void;
    onClose?: () => void;
}

const ImportUniversityStudents: React.FC<ImportUniversityStudentsProps> = ({
    universityId,
    institutionName,
    onSuccess,
    onClose
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { hideModal } = useModal();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            validateAndSetFile(selectedFile);
        }
    };

    const validateAndSetFile = (selectedFile: File) => {
        const validExtensions = ['.xlsx', '.xls', '.csv'];
        const fileName = selectedFile.name.toLowerCase();
        const isValid = validExtensions.some(ext => fileName.endsWith(ext));

        if (!isValid) {
            toast.error("Invalid file format. Please upload Excel or CSV file.");
            return;
        }

        if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
            toast.error("File is too large. Max limit is 10MB.");
            return;
        }

        setFile(selectedFile);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) {
            validateAndSetFile(droppedFile);
        }
    };

    const handleSubmit = async () => {
        if (!file) {
            toast.error("Please select an Excel or CSV file first");
            return;
        }

        if (!universityId) {
            toast.error("University ID is required");
            return;
        }

        try {
            setIsLoading(true);
            const formData = new FormData();
            formData.append("excel_file", file);
            formData.append("university_id", String(universityId));

            const response = await importUniversityStudentsApi(formData);
            
            toast.success(response?.message || "Students imported successfully!");
            if (onSuccess) {
                onSuccess();
            }
            setTimeout(() => {
                if (onClose) {
                    onClose();
                } else {
                    hideModal();
                }
            }, 500);
        } catch (err: any) {
            console.error("Import students error:", err);
            toast.error(err?.message || err?.detail || "Failed to import students data. Check template format.");
        } finally {
            setIsLoading(false);
        }
    };

    const removeFile = () => {
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="flex flex-col gap-5 p-1">
            {/* Header info */}
            <div className="flex items-start gap-3 p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100">
                <FiInfo className="text-indigo-600 mt-1 shrink-0" size={20} />
                <div className="flex flex-col gap-1">
                    <h4 className="text-sm font-bold text-indigo-900">
                        Import Students {institutionName ? `for ${institutionName}` : ""}
                    </h4>
                    <p className="text-xs text-indigo-700 leading-relaxed font-medium">
                        Upload an Excel (.xlsx, .xls) or CSV (.csv) file to import students for <span className="font-semibold">University #{universityId}</span>. Max file size: 10MB.
                    </p>
                </div>
            </div>

            {/* Dropzone Area */}
            {!file ? (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative group cursor-pointer flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-3xl transition-all duration-300 ${
                        isDragging 
                            ? "bg-indigo-50 border-indigo-400 scale-[0.99] shadow-inner" 
                            : "bg-gray-50/40 border-gray-200 hover:border-indigo-300 hover:bg-gray-50/70"
                    }`}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".xlsx, .xls, .csv"
                        className="hidden"
                    />
                    
                    <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-indigo-100 group-hover:shadow-md">
                        <FiUploadCloud className={`text-3xl ${isDragging ? "text-indigo-500" : "text-gray-400"}`} />
                    </div>
                    
                    <div className="mt-4 text-center">
                        <p className="text-sm font-bold text-gray-700">Click or drag spreadsheet to upload</p>
                        <p className="text-[11px] font-medium text-gray-400 mt-1 uppercase tracking-wider">Excel / CSV (.xlsx, .xls, .csv)</p>
                    </div>
                </div>
            ) : (
                <div className="relative flex items-center gap-4 p-4 bg-white border border-indigo-100 rounded-2xl shadow-sm animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center justify-center w-12 h-12 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-500">
                        <FiFileText size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">{file.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">{(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload</p>
                    </div>
                    <button 
                        type="button"
                        onClick={removeFile}
                        className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    >
                        <FiX size={18} />
                    </button>
                    <div className="absolute top-0 right-0 -mr-1.5 -mt-1.5">
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-500 items-center justify-center text-white shadow-sm">
                            <FiCheckCircle size={12} />
                        </span>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-1">
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all active:scale-95"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!file || isLoading}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 active:scale-[0.98]"
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Importing...</span>
                        </div>
                    ) : (
                        <>
                            <FiCheckCircle size={15} />
                            Import Students
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ImportUniversityStudents;
