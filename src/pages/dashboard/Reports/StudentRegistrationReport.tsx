import { useState, useMemo, useEffect } from 'react';

import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useRedux';
import { useModal } from '../../../context/ModalContext';
import type { ColumnDefinition } from '../../../components/Table/Table';
import DynamicServerTable from '../../../components/Table/Table';
import { UserRegistrationExcelApi, UserRegistrationPdfApi } from '../../../services/ReportService';
import { getUserRegistor } from '../../../store/slices/ReportUserRegistor';

const StudentRegistrationReport = () => {
    const dispatch = useAppDispatch();
    const { showModal } = useModal();

    const { data, loading, pagination } = useAppSelector((state) => state.userRegistor);

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
        dispatch(getUserRegistor({ page: currentPage, search: debouncedSearch }));
    }, [dispatch, currentPage, debouncedSearch]);

    // Flatten nested data
    useEffect(() => {
        const transformed = data.map((user,index) => ({
            index: (currentPage - 1) * 20 + (index + 1),
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            reference_source: user.reference_source,
            is_active: user.is_active ? 'Active' : 'Inactive',
            trail_mode: user.order_detail.trail_mode ? 'Yes' : 'No',
            start_date: user.order_detail?.start_date || '-',
            end_date: user.order_detail?.end_date || '-',
            subscription_status:  getStatusText(user.order_detail?.subscription_status) || '-',
            course_detail: user.course_detail.map((item:any)=> item.name).join(', ') || "_",
        }));
        setFlattenedData(transformed);
    }, [data]);

    const columns: ColumnDefinition<any>[] = useMemo(() => [
        { key: 'index', title: 'ID', align: 'center' },
        { key: 'first_name', title: 'First Name', align: 'center' },
        { key: 'last_name', title: 'Last Name', align: 'center' },
        { key: 'email', title: 'Email', align: 'center' },
        // { key: 'is_active', title: 'Status', align: 'center' },
        { key: 'trail_mode', title: 'Trail Mode', align: 'center' },
        { key: 'start_date', title: 'Start Date', align: 'center' },
        { key: 'end_date', title: 'End Date', align: 'center' },
        { key: 'subscription_status', title: 'subscription Status', align: 'center' },
        { key: 'course_detail', title: 'Course', align: 'center' },
      
    ], [showModal]);

    const handleDownloadpdf = async () => {
        try {
            setPdfLoading(true);
            const res = await UserRegistrationPdfApi();
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
            const res = await UserRegistrationExcelApi();
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

function getStatusText(status:any) {
  switch (status) {
    case 1:
      return 'Initiate';

    case 2:
      return 'Active';

    case 3:
      return 'Expired';

    case 4:
      return 'Paused';

    case 5:
      return 'Cancelled';

    default:
      return '_';
  }
}

    return (
        <>
            {/* Header Search & Button */}
            <div className="backdrop-blur-md bg-white/30 border border-white/20 rounded-xl p-4 mb-4 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Student Registration Report</h2>
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

export default StudentRegistrationReport;
