import { useEffect, useState } from "react"
import { fetchEbookViewData } from "../../services/apiServices";
import { FileText, Calendar, Info, CheckCircle, XCircle, Download, ExternalLink } from "lucide-react";
import moment from "moment";

const EbookView = ({ ebookData }: { ebookData: any }) => {
    const [ebook, setEbook] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const handleFetchEbook = async (id: number) => {
        setLoading(true);
        try {
            const res = await fetchEbookViewData(id);
            if (res.status) {
                setEbook(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch ebook data", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (ebookData?.id) {
            handleFetchEbook(ebookData.id);
        }
    }, [ebookData]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-500 font-medium animate-pulse">Loading ebook details...</p>
            </div>
        );
    }

    if (!ebook) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center text-red-500 min-h-[300px]">
                <Info size={48} className="mb-4 opacity-20" />
                <p className="font-bold text-lg">Ebook data not found</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6 p-1 max-h-[85vh] overflow-hidden">
            {/* Left: Metadata Section */}
            <div className="w-full lg:w-2/3 flex flex-col gap-6">
                {/* Header Card */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white rounded-xl text-indigo-600 shadow-sm border border-indigo-50">
                            <FileText size={24} />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 leading-tight">{ebook.name}</h2>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">ID: #{ebook.id}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                        {ebook.status ? (
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wider border border-green-200">
                                <CheckCircle size={12} /> Active
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-bold uppercase tracking-wider border border-red-200">
                                <XCircle size={12} /> Inactive
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 pt-4 border-t border-gray-200/60">
                        <div className="flex items-start gap-3">
                            <div className="text-gray-400 mt-0.5"><Calendar size={16} /></div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Added On</p>
                                <p className="text-sm font-semibold text-gray-700">
                                    {moment(ebook.created_at).format('MMMM DD, YYYY')}
                                </p>
                                <p className="text-[10px] text-gray-500 font-medium">
                                    at {moment(ebook.created_at).format('hh:mm A')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions Card */}
                <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100">
                    <h3 className="font-bold mb-3 flex items-center gap-2">
                        Quick Actions
                    </h3>
                    <div className="flex flex-col gap-3">
                        <a
                            href={ebook.book_file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white text-indigo-600 rounded-xl font-bold text-sm transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <Download size={18} /> Download Ebook
                        </a>
                        <a
                            href={ebook.book_file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-indigo-500/50 text-white rounded-xl font-bold text-sm border border-indigo-400/30 transition-all hover:bg-indigo-500/80"
                        >
                            <ExternalLink size={18} /> Open in New Tab
                        </a>
                    </div>
                </div>
            </div>

            {/* Right: PDF Viewer Section */}
            <div className="w-full lg:w-2/3 bg-gray-900 rounded-2xl overflow-hidden shadow-2xl relative border-4 border-white min-h-[500px] flex flex-col">
                <div className="p-3 bg-gray-800 flex items-center justify-between border-b border-gray-700/50">
                    <div className="flex items-center gap-2 text-gray-300">
                        <FileText size={16} />
                        <span className="text-xs font-bold truncate max-w-[200px]">{ebook.name}.pdf</span>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                    </div>
                </div>
                <div className="flex-1 bg-gray-100 relative group">
                    <iframe
                        src={`${ebook.book_file}#toolbar=0&view=FitH`}
                        className="w-full h-full border-0 absolute inset-0"
                        title="Ebook PDF Viewer"
                    />
                    {/* Interaction Hint Overlay */}
                    <div className="absolute top-4 right-4 animate-bounce pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-indigo-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg border border-white/20">
                            Scroll to read
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EbookView;