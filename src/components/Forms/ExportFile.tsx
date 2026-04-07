import { useState } from 'react';
import { Download, FileText } from "lucide-react";
import toast from 'react-hot-toast';

interface ExportFileProps {
    pdfApi?: () => Promise<any>;
    excelApi?: () => Promise<any>;
    fileNamePrefix?: string;
}

const ExportFile = ({ pdfApi, excelApi, fileNamePrefix = "export" }: ExportFileProps) => {
    const [isPdfLoading, setIsPdfLoading] = useState(false);
    const [isExcelLoading, setIsExcelLoading] = useState(false);

    const handleDownload = async (
        apiCall: () => Promise<any>,
        setLoading: React.Dispatch<React.SetStateAction<boolean>>,
        extension: 'pdf' | 'csv' | 'xlsx'
    ) => {
        setLoading(true);
        try {
            const response = await apiCall();

            // Scenario 1: API returns JSON with a pre-generated Cloud URL (e.g., report_url)
            if (response?.data?.report_url) {
                const fileUrl = response.data.report_url;

                // Construct a temporary link to trigger native URL navigation/download
                const link = document.createElement('a');
                link.href = fileUrl;
                link.target = '_blank'; // Required for safe cross-origin S3/GCS redirects
                link.download = `${fileNamePrefix}_${new Date().toISOString().split('T')[0]}.${extension}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                toast.success(`Records exported as ${extension.toUpperCase()}`);
                return;
            }

            // Scenario 2: API returns a raw File response stream directly 
            if (response && typeof response.blob === 'function') {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = url;
                link.download = `${fileNamePrefix}_${new Date().toISOString().split('T')[0]}.${extension}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                toast.success(`Records exported as ${extension.toUpperCase()}`);
                return;
            }

            // If neither of the valid formats returned, fallback gracefully to extract errors
            const errMsg = response?.message || response?.detail || "Invalid format returned from Server Details";
            throw new Error(errMsg);

        } catch (error: any) {
            console.error('Export failed:', error);
            toast.error(error?.message || `Failed to export ${extension.toUpperCase()}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {excelApi && (
                <button
                    type="button"
                    onClick={() => handleDownload(excelApi, setIsExcelLoading, 'csv')}
                    disabled={isExcelLoading}
                    className="flex items-center gap-2 px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 disabled:opacity-50"
                >
                    {isExcelLoading ? (
                        <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full" />
                    ) : (
                        <Download size={16} className="text-gray-400" />
                    )}
                    Export CSV
                </button>
            )}

            {pdfApi && (
                <button
                    type="button"
                    onClick={() => handleDownload(pdfApi, setIsPdfLoading, 'pdf')}
                    disabled={isPdfLoading}
                    className="flex items-center gap-2 px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 disabled:opacity-50"
                >
                    {isPdfLoading ? (
                        <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full" />
                    ) : (
                        <FileText size={16} className="text-gray-400" />
                    )}
                    Export PDF
                </button>
            )}
        </>
    );
};

export default ExportFile;