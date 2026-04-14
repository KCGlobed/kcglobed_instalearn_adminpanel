import React, { useState, useRef } from "react";
import { importMcq } from "../../services/apiServices";
import toast from "react-hot-toast";
import { FiUploadCloud, FiFileText, FiX, FiDownload, FiCheckCircle, FiInfo } from "react-icons/fi";
import { useModal } from "../../context/ModalContext";

const ImportMcq = () => {
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
            toast.error("Invalid file format. Please upload Excel or CSV.");
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
            toast.error("Please select an Excel file first");
            return;
        }

        try {
            setIsLoading(true);
            const formData = new FormData();
            // Using the requested payload key: excel_file
            formData.append("excel_file", file);

            await importMcq(formData);
            
            toast.success("MCQs imported successfully!");
            setTimeout(() => {
                hideModal();
                // Optionally refresh listing here if needed
                window.location.reload(); 
            }, 1000);
        } catch (err: any) {
            console.error("Import error:", err);
            toast.error(err?.message || "Failed to import MCQ data. Check template format.");
        } finally {
            setIsLoading(false);
        }
    };

    const removeFile = () => {
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="flex flex-col gap-6 p-1">
            {/* Header info */}
            <div className="flex items-start gap-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                <FiInfo className="text-indigo-600 mt-1 shrink-0" size={20} />
                <div className="flex flex-col gap-1">
                    <h4 className="text-sm font-bold text-indigo-900">Import Guidelines</h4>
                    <p className="text-xs text-indigo-700 leading-relaxed font-medium">
                        Please use our official template to ensure data integrity. Supported formats: <span className="font-bold">.xlsx, .xls, .csv</span>. Max size: 10MB.
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
                    className={`relative group cursor-pointer flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-3xl transition-all duration-300 ${
                        isDragging 
                            ? "bg-indigo-50 border-indigo-400 scale-[0.99] shadow-inner" 
                            : "bg-gray-50/30 border-gray-200 hover:border-indigo-300 hover:bg-gray-50/60"
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
                    
                    <div className="mt-5 text-center">
                        <p className="text-sm font-bold text-gray-700">Click or drag file to upload</p>
                        <p className="text-[11px] font-medium text-gray-400 mt-1 uppercase tracking-wider">Excel / CSV Spreadsheet</p>
                    </div>
                </div>
            ) : (
                <div className="relative flex items-center gap-4 p-5 bg-white border border-indigo-100 rounded-3xl shadow-sm animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center justify-center w-12 h-12 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-500">
                        <FiFileText size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">{file.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">{(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to import</p>
                    </div>
                    <button 
                        onClick={removeFile}
                        className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    >
                        <FiX size={20} />
                    </button>
                    <div className="absolute top-0 right-0 -mr-2 -mt-2">
                        <span className="flex h-5 w-5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-500 items-center justify-center text-white">
                                <FiCheckCircle size={12} />
                            </span>
                        </span>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 mt-2">
                <button
                    onClick={() => toast("Sample template downloading...")} // Replace with actual download logic if available
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-50 text-gray-600 rounded-2xl text-xs font-bold hover:bg-gray-100 transition-all border border-gray-100 active:scale-95"
                >
                    <FiDownload size={16} />
                    Sample Template
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={!file || isLoading}
                    className="flex-[2] relative flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl text-xs font-black disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-[0.98] overflow-hidden"
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Processing...</span>
                        </div>
                    ) : (
                        <>
                            <FiCheckCircle size={16} />
                            Start Bulk Import
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ImportMcq;