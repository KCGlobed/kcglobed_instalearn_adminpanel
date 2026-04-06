import { useState, useMemo, useEffect } from 'react';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useRedux';
import { useModal } from '../../../context/ModalContext';
import type { ColumnDefinition } from '../../../components/Table/Table';
import DynamicServerTable from '../../../components/Table/Table';
import {UserExamDateApi, UserExamDateExcelApi } from '../../../services/ReportService';
import { FiChevronDown, FiChevronUp, FiDownload, FiFileText, FiRotateCcw } from 'react-icons/fi';
import Select, { type MultiValue } from "react-select";
import { coursesDropDownList } from '../../../services/subscriptionService';
import { getUserExamDate } from '../../../store/slices/reportUserExamDateSlice';

const StudentExamDateScoreReport = () => {
    const dispatch = useAppDispatch();
    const { showModal } = useModal();
    const { data, loading, pagination } = useAppSelector((state) => state.userExamDateReport);

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
        dispatch(getUserExamDate(filters));
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
        console.log("Raw Data:", data);
        const transformed = data.map((user, index) => ({
            index: (currentPage - 1) * 20 + (index + 1),
            id: user.id,
            first_name: user.user_detail?.first_name || 'N/A',
            last_name: user.user_detail?.last_name || 'N/A',
            email: user.user_detail?.email || 'N/A',
            phone: user.user_detail?.phone1 || 'N/A',
            reference_id: user.user_detail?.reference_id || 'N/A',
            category:user.user_detail?.category || 'N/A',
            student_type: user.user_detail?.student_type || 'N/A',
            course_detail: user.course_detail?.name || 'N/A',
            subject_detail: user.subject_detail?.name || 'N/A',
            exam_date: user.exam_date || 'N/A',
            exam_score:  `${user.exam_score}%`,
            date_joined: user.user_detail?.date_joined || 'N/A',
            
           
        }));
        setFlattenedData(transformed);
    }, [data]);

    // ------------------- Columns -------------------
    const columns: ColumnDefinition<any>[] = useMemo(() => [
        { key: 'index', title: 'ID', align: 'center' },
        { key: 'first_name', title: 'First Name', align: 'center' },
        { key: 'last_name', title: 'Last Name', align: 'center' },
        { key: 'email', title: 'Email', align: 'center' },
        { key: 'reference_id', title: 'Reference ID', align: 'center' },
        { key: 'category', title: 'Category', align: 'center' },
        { key: 'student_type', title: 'Type of Student', align: 'center' },
        { key: 'course_detail', title: 'Course', align: 'center' },
        { key: 'subject_detail', title: 'Subject', align: 'center' },
        { key: 'exam_date', title: 'Exam Date', align: 'center' },
        { key: 'exam_score', title: 'Exam Score', align: 'center' },
        { key: 'date_joined', title: 'Joined Date', align: 'center' },

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
            const res = await UserExamDateApi(filters);
            const fileUrl = res?.data?.report_url;
            if (fileUrl) window.open(fileUrl, "_blank");
        } finally {
            setPdfLoading(false);
        }
    };

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
            const res = await UserExamDateExcelApi(filters);
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

    // ------------------- UI -------------------
    return (
        <div className="p-6 space-y-5">
            {/* Header */}
            <div className="backdrop-blur-md bg-white/30 border border-white/20 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">Student Exam Date & Score Report</h2>
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

// ------------------- Reusable Filter Component -------------------
const Filter = ({ label, options, value, onChange, disabled = false }: any) => (
    <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        <Select
            isMulti
            options={options}
            value={value}
            onChange={onChange}
            placeholder={`Select ${label}(s)`}
            isDisabled={disabled}
            menuPortalTarget={document.body}
            className="react-select-container"
            classNamePrefix="react-select"
        />
    </div>
);

// ------------------- Date Input Component -------------------
const DateInput = ({ label, value, onChange }: any) => (
    <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 transition"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
);

export default StudentExamDateScoreReport;
