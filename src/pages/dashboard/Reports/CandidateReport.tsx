import { useState, useMemo, useEffect } from 'react';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useRedux';
import { useModal } from '../../../context/ModalContext';
import type { ColumnDefinition } from '../../../components/Table/Table';
import DynamicServerTable from '../../../components/Table/Table';
import {candidateExcelApi, candidateProfilePdfApi, candidateReportPdfApi} from '../../../services/ReportService';
import { FiChevronDown, FiChevronUp, FiDownload, FiEye, FiFileText, FiKey, FiRotateCcw } from 'react-icons/fi';
import { type MultiValue } from "react-select";
import { coursesDropDownList } from '../../../services/subscriptionService';
import toast from 'react-hot-toast';
import GlassButton from '../../../components/Button/Button';
import {getCandidateReport } from '../../../store/slices/userReportSlice';
import { DateInput, Filter } from '../../../components/ReportComponent/reportFilter';
import ViewCandidateReport from './ReportModals/candidateComponent/ViewCandidateReport';
import ResetPasswordForm from './ReportModals/candidateComponent/ResetPasswordForm';

const CandidateReport = () => {
    const dispatch = useAppDispatch();
    const { showModal } = useModal();
    const { data, loading, pagination } = useAppSelector((state) => state.reports);

    // ------------------- States -------------------
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [flattenedData, setFlattenedData] = useState<any[]>([]);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [excelLoading, setExcelLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Filters
    const [selectedCourses, setSelectedCourses] = useState<MultiValue<any>>([]);
    const [selectedSubjects, setSelectedSubjects] = useState<MultiValue<any>>([]);
    const [selectedStudentTypes, setSelectedStudentTypes] = useState<MultiValue<any>>([]);
    const [selectedCategories, setSelectedCategories] = useState<MultiValue<any>>([]);
    const [selectedSatus, setSelectedStatus] = useState<MultiValue<any>>([]);
    const [typeSatus, setTypeStatus] = useState<MultiValue<any>>([]);
    const [selectedCountries, setSelectedCountries] = useState<MultiValue<any>>([]);
    const [selectedStates, setSelectedStates] = useState<MultiValue<any>>([]);
    const [selectedCities, setSelectedCities] = useState<MultiValue<any>>([]);

    // Course data
    const [courseOptions, setCourseOptions] = useState<any[]>([]);
    const [courseData, setCourseData] = useState<any[]>([]);

    // ------------------- Static Options -------------------
    const studentTypeOptions = useMemo(() => [
        { value: "Institue", label: "Institue" },
        { value: "Corporate", label: "Corporate" },
        { value: "Retail", label: "Retail" },
        { value: "Government", label: "Government" },
    ], []);

    const categoryOptions = useMemo(() => [
        { value: "ATP", label: "ATP" },
        { value: "RESELLER", label: "RESELLER" },
        { value: "BUSINESS_ASSOCIATE", label: "BUSINESS ASSOCIATE" },
        { value: "CORPORATE", label: "CORPORATE" },
        { value: "INSTITUTION", label: "INSTITUTION" },
        { value: "DIRECT", label: "DIRECT" },
    ], []);


    // ------------------- Debounce Search -------------------
    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedSearch(search.trim());
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timeout);
    }, [search]);

    // ------------------- Fetch Courses -------------------
    const fetchCourseOptions = async () => {
        const response = await coursesDropDownList();
        const courseOpts = response?.map((course: any) => ({
            value: course.id,
            label: course.name,
        })) || [];
        setCourseOptions(courseOpts);
        setCourseData(response || []);
    };

    useEffect(() => {
        fetchCourseOptions();
    }, []);

    // ------------------- Subject Options -------------------
    const subjectOptions = useMemo(() => {
        if (!selectedCourses.length) return [];
        const selectedIds = selectedCourses.map((c) => c.value);
        return courseData
            .filter((c: any) => selectedIds.includes(c.id))
            .flatMap((c: any) =>
                c.subject_list.map((s: any) => ({
                    value: s.id,
                    label: s.subject_detail[0]?.name ?? "",
                }))
            );
    }, [selectedCourses, courseData]);

    useEffect(() => {
        setSelectedSubjects((prev) =>
            prev.filter((s) => subjectOptions.some((opt) => opt.value === s.value))
        );
    }, [subjectOptions]);

    // ------------------- Fetch Data -------------------
    useEffect(() => {
        const filters = {
            page: currentPage,
            search: debouncedSearch,
            course_id: selectedCourses.map((c) => c.value).join(","),
            subject_id: selectedSubjects.map((s) => s.value).join(","),
            student_type: selectedStudentTypes.map((t) => t.value).join(","),
            category: selectedCategories.map((c) => c.value).join(","),
            start_date: startDate || undefined,
            end_date: endDate || undefined,
        };
        dispatch(getCandidateReport(filters));
    }, [
        currentPage, debouncedSearch,
        JSON.stringify(selectedCourses),
        JSON.stringify(selectedSubjects),
        JSON.stringify(selectedStudentTypes),
        JSON.stringify(selectedCategories),
        JSON.stringify(selectedSatus),
        JSON.stringify(typeSatus),
        JSON.stringify(selectedCountries),
        JSON.stringify(selectedStates),
        JSON.stringify(selectedCities),
        startDate, endDate,
    ]);

    // ------------------- Flatten Data -------------------
    useEffect(() => {
        const transformed = data.map((user, index) => ({
            index: (currentPage - 1) * 20 + (index + 1),
            first_name: user.first_name || 'N/A',
            last_name: user.last_name || 'N/A',
            email: user.email || 'N/A',
            is_active: user.is_active,
            phone1: user.phone1 || 'N/A',
            category: user.category || 'N/A',
            reference_id: user.reference_id || 'N/A',
            student_type: user.student_type || 'N/A',
            user_id: user.id,
            id: user.id,
            // Add other fields as necessary
         
        }));
        setFlattenedData(transformed);
    }, [data]);
    // ------------------- Columns -------------------
    const columns: ColumnDefinition<any>[] = useMemo(() => [
        { key: 'index', title: 'ID', align: 'center' },
        { key: 'first_name', title: 'First Name', align: 'left' },
        { key: 'last_name', title: 'Last Name', align: 'left' },
        { key: 'email', title: 'Email', align: 'left' },
        { key: 'phone1', title: 'Phone', align: 'left' },
        { key: 'category', title: 'Category', align: 'left' },
        { key: 'student_type', title: 'Student Type', align: 'left' },
        

        {
            key: 'actions',
            title: 'Actions',
            align: 'center',
            render: (_, row) => (
                <div className="flex space-x-2">
                    <GlassButton
                        icon={<FiKey className="text-base" />}
                        color="red"
                        title="Change Password"
                        onClick={() => {
                              showModal({
                                title: 'Change Password',
                                content: <ResetPasswordForm userId={row.user_id} />,
                                type: 'success',
                                size: 'md',
                            });

                        }}
                    />
                    <GlassButton
                        onClick={() => {
                            showModal({
                                title: '',
                                content: <ViewCandidateReport data={row}  />,
                                type: 'success',
                                size: 'xxl',
                            });
                        }}
                        icon={<FiEye className="text-base" />}
                        color="green"
                        title="Edit"
                    />
                    <GlassButton
                        icon={<FiDownload className="text-base" />}
                        color="red"
                        title="Delete"
                        onClick={() => {
                            handleIndividualReportPdf(row);

                        }}
                    />
                </div>
            ),
        },


    ], [showModal]);

    // ------------------- PDF & Excel -------------------
    const handleDownloadpdf = async () => {
        const filters = {
            page: currentPage,
            search: debouncedSearch,
            course_id: selectedCourses.map((c) => c.value).join(","),
            subject_id: selectedSubjects.map((s) => s.value).join(","),
            student_type: selectedStudentTypes.map((t) => t.value).join(","),
            category: selectedCategories.map((c) => c.value).join(","),
            start_date: startDate || undefined,
            end_date: endDate || undefined,
        };
        try {
            setPdfLoading(true);
            const res = await candidateReportPdfApi(filters);
            const fileUrl = res?.data?.report_url;
            if (fileUrl) window.open(fileUrl, "_blank");
        } finally {
            setPdfLoading(false);
        }
    };

    const handleIndividualReportPdf = async (data: any) => {
        try {
            const res = await candidateProfilePdfApi(data.id);
            const fileUrl = res?.data?.report_url;
            if (fileUrl) window.open(fileUrl, "_blank");
        } finally {
            toast.error("Failed to generate PDF report");
        }
        // Implement individual report PDF download logic here
    }

    const handleDownloadExcel = async () => {
        const filters = {
            page: currentPage,
            search: debouncedSearch,
            course_id: selectedCourses.map((c) => c.value).join(","),
            subject_id: selectedSubjects.map((s) => s.value).join(","),
            student_type: selectedStudentTypes.map((t) => t.value).join(","),
            category: selectedCategories.map((c) => c.value).join(","),
            start_date: startDate || undefined,
            end_date: endDate || undefined,
        };
        try {
            setExcelLoading(true);
            const res = await candidateExcelApi(filters);
            const fileUrl = res?.data?.report_url;
            if (fileUrl) {
                const link = document.createElement("a");
                link.href = fileUrl;
                link.setAttribute("download", "report.xlsx");
                document.body.appendChild(link);
                link.click();
                link.remove();
            }
        } finally {
            setExcelLoading(false);
        }
    };

    // ------------------- Reset Filters -------------------
    const resetFilters = () => {
        setSelectedCourses([]);
        setSelectedSubjects([]);
        setSelectedStudentTypes([]);
        setSelectedCategories([]);
        setSelectedStatus([]);
        setTypeStatus([]);
        setSelectedCountries([]);
        setSelectedStates([]);
        setSelectedCities([]);
        setStartDate("");
        setEndDate("");
        setSearch("");
    };


    return (
        <div className="p-6 space-y-5">
            {/* Header */}
            <div className="backdrop-blur-md bg-white/30 border border-white/20 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">Candidate Report</h2>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-xl shadow-md hover:opacity-90 transition-all"
                    >
                        {showFilters ? <FiChevronUp /> : <FiChevronDown />}
                        {showFilters ? "Hide Filters" : "Show Filters"}
                    </button>
                </div>

                {/* Filters */}
                {showFilters && (
                    <div className="mt-4 bg-white/80 rounded-2xl shadow-inner p-6 border border-gray-200 backdrop-blur-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-700">🎯 Filter Options</h3>
                            <button
                                onClick={resetFilters}
                                className="flex items-center gap-2 text-sm text-red-600 font-semibold hover:text-red-800 transition"
                            >
                                <FiRotateCcw /> Reset Filters
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {/* All filters */}
                            <Filter label="Course" options={courseOptions} value={selectedCourses} onChange={setSelectedCourses} />
                            <Filter label="Subject" options={subjectOptions} value={selectedSubjects} onChange={setSelectedSubjects} />
                            <Filter label="Student Type" options={studentTypeOptions} value={selectedStudentTypes} onChange={setSelectedStudentTypes} />
                            <Filter label="Category" options={categoryOptions} value={selectedCategories} onChange={setSelectedCategories} />
                            {/* Dates */}
                            <DateInput label="Start Date" value={startDate} onChange={setStartDate} />
                            <DateInput label="End Date" value={endDate} onChange={setEndDate} />
                        </div>
                    </div>
                )}
            </div>

            {/* Search & Downloads */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/30 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-lg">
                <input
                    type="text"
                    placeholder="🔍 Search users..."
                    className="px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-400 transition w-full sm:w-[300px]"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <div className="flex gap-2 flex-wrap">
                    <button onClick={handleDownloadpdf} disabled={pdfLoading} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-700 text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50">
                        <FiFileText />
                        {pdfLoading ? "Generating PDF..." : "Download PDF"}
                    </button>
                    <button onClick={handleDownloadExcel} disabled={excelLoading} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-700 text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50">
                        <FiDownload />
                        {excelLoading ? "Generating Excel..." : "Download Excel"}
                    </button>
                </div>
            </div>

            {/* Table */}
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
    );
};

export default CandidateReport;
