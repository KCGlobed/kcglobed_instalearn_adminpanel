import { useState, useMemo, useEffect } from 'react';

import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useRedux';
import { useModal } from '../../../context/ModalContext';
import type { ColumnDefinition } from '../../../components/Table/Table';
import DynamicServerTable from '../../../components/Table/Table';
import { UserScoreExcelApi, UserScorePdfApi } from '../../../services/ReportService';
import { getUserScore } from '../../../store/slices/reportUserScoreSlice';

const StudentScoreReport = () => {
    const dispatch = useAppDispatch();
    const { showModal } = useModal();
    const { data, loading, pagination } = useAppSelector((state) => state.userScoreReport);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [flattenedData, setFlattenedData] = useState<any[]>([]);

    // Loader states for pdf & excel
    const [pdfLoading, setPdfLoading] = useState(false);
    const [excelLoading, setExcelLoading] = useState(false);

    // Debounce search
    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedSearch(search);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timeout);
    }, [search]);

    // Fetch API
    useEffect(() => {
        dispatch(getUserScore({ page: currentPage, search: debouncedSearch }));
    }, [dispatch, currentPage, debouncedSearch]);

    // Flatten nested data
    useEffect(() => {
        const transformed = data.map((user,index) => ({
            index: (currentPage - 1) * 20 + (index + 1),
            id: user.id,
            first_name: user.user_detail?.first_name || '-',
            last_name: user.user_detail?.last_name || '-',
            email: user.user_detail?.email || '-',
            reference_source: user.user_detail?.reference_source || '-',
            course_detail: user.course_detail?.name || '-',
            subject_detail: user.subject_detail?.name || '-',
            class_viewed: user.performance_report?.classes_viewed || '-',
            mcq_score: user.performance_report?.mcq_score || '-',
            mock_score: user.performance_report?.mock_score || '-',
            section_completed: user.performance_report?.sections_completed || '-',
            sim_score: user.performance_report?.simulation_score || '-',
        }));
        setFlattenedData(transformed);
    }, [data]);

    const columns: ColumnDefinition<any>[] = useMemo(() => [
        { key: 'index', title: 'ID', align: 'center' },
        { key: 'first_name', title: 'First Name', align: 'center' },
        { key: 'last_name', title: 'Last Name', align: 'center' },
        { key: 'email', title: 'Email', align: 'center' },
        { key: 'reference_source', title: 'Reference Source', align: 'center' },
        { key: 'course_detail', title: 'Course', align: 'center' },
        { key: 'subject_detail', title: 'Subject', align: 'center' },
        { key: 'class_viewed', title: 'Classes Viewed', align: 'center' },
        { key: 'mcq_score', title: 'MCQ Score', align: 'center' },
        { key: 'mock_score', title: 'Mock Score', align: 'center' },
        { key: 'section_completed', title: 'Sections Completed', align: 'center' },

    ], [showModal]);

    const handleDownloadpdf = async () => {
        try {
            setPdfLoading(true);
            const res = await UserScorePdfApi();
            const fileUrl = res?.data?.report_url;

            if (!fileUrl) {
                console.error("No file URL received");
                return;
            }
            window.open(fileUrl, "_blank");
        } catch (error) {
            console.error("Failed to download pdf", error);
        } finally {
            setPdfLoading(false);
        }
    };

    const handleDownloadExcel = async () => {
        try {
            setExcelLoading(true);
            const res = await UserScoreExcelApi();
            const fileUrl = res?.data?.report_url;
            if (!fileUrl) {
                console.error("Excel URL not found");
                return;
            }
            const link = document.createElement("a");
            link.href = fileUrl;
            link.setAttribute("download", "report.xlsx");
            document.body.appendChild(link);
            link.click();
            link.remove();
            console.log("Excel downloaded from:", fileUrl);
        } catch (error) {
            console.error("Failed to download excel", error);
        } finally {
            setExcelLoading(false);
        }
    };

    return (
        <>
            {/* Header Search & Button */}
            <div className="backdrop-blur-md bg-white/30 border border-white/20 rounded-xl p-4 mb-4 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Student Score Report</h2>
                <div className="flex gap-2 items-center">
                    <input
                        type="text"
                        placeholder="Search students..."
                        className="px-4 py-2 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 transition w-[250px]"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button
                        className="cursor-pointer px-5 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                        onClick={handleDownloadpdf}
                        disabled={pdfLoading}
                    >
                        {pdfLoading ? "Loading PDF..." : "Download PDF"}
                    </button>
                    <button
                        className="cursor-pointer px-5 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                        onClick={handleDownloadExcel}
                        disabled={excelLoading}
                    >
                        {excelLoading ? "Loading Excel..." : "Download Excel"}
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <DynamicServerTable
                    data={flattenedData}
                    columns={columns}
                    currentPage={currentPage}
                    pageSize={20}
                    totalCount={pagination.total_results ?? 0}
                    onPageChange={setCurrentPage}
                    loading={loading}
                />
            </div>
        </>
    );
};

export default StudentScoreReport;
