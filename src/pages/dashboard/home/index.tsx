import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/useRedux";
import {
  getDashboardData,
  getStudentRegistrationChart,
  getRevenueChart,
  getVideoLectureChart,
  getStudentOrderChart,
  getCorporateAdminChart,
} from "../../../store/slices/dashboardSlice";
import moment from "moment";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  Loader2,
  Users,
  ShoppingBag,
  CreditCard,
  PlayCircle,
  TrendingUp,
  GraduationCap,
  FileText,
  Tag,
  BookOpen,
  Building2,
  Crown,
  Video,
  BarChart2,
  TrendingUp as LineChartIcon,
  PieChart as DoughnutChartIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    counters,
    studentsGraph,
    revenueGraph,
    videoGraph,
    orderGraph,
    recentCorporateAdmins,
    recentStudents,
    loading,
    loadingRecentCorporateAdmins,
    loadingRecentStudents,
    loadingStudentsChart,
    loadingRevenueChart,
    loadingVideoChart,
    loadingOrderChart,
    corporateAdminGraph,
    loadingCorporateAdminChart,
  } = useAppSelector((state) => state.dashboard);

  const recentCorpList = Array.isArray(recentCorporateAdmins) ? recentCorporateAdmins : [];
  const recentStudentList = Array.isArray(recentStudents) ? recentStudents : [];

  // Filters for the 4 distinct Graph APIs
  const [studentFilter, setStudentFilter] = useState<string>("month");
  const [revenueFilter, setRevenueFilter] = useState<string>("month");
  const [videoFilter, setVideoFilter] = useState<string>("month");
  const [orderFilter, setOrderFilter] = useState<string>("month");

  // Chart type switcher states for each graph
  const [studentChartType, setStudentChartType] = useState<"bar" | "line" | "doughnut">("bar");
  const [revenueChartType, setRevenueChartType] = useState<"bar" | "line" | "doughnut">("bar");
  const [videoChartType, setVideoChartType] = useState<"bar" | "line" | "doughnut">("bar");
  const [orderChartType, setOrderChartType] = useState<"bar" | "line" | "doughnut">("bar");
  const [corporateAdminFilter, setCorporateAdminFilter] = useState<string>("month");
  const [corporateAdminChartType, setCorporateAdminChartType] = useState<"bar" | "line" | "doughnut">("bar");

  useEffect(() => {
    dispatch(getDashboardData());
  }, [dispatch]);

  // Handler functions for independent filter toggles
  const handleStudentFilter = (f: string) => {
    setStudentFilter(f);
    dispatch(getStudentRegistrationChart({ id: f }));
  };

  const handleRevenueFilter = (f: string) => {
    setRevenueFilter(f);
    dispatch(getRevenueChart({ id: f }));
  };

  const handleVideoFilter = (f: string) => {
    setVideoFilter(f);
    dispatch(getVideoLectureChart({ id: f }));
  };

  const handleOrderFilter = (f: string) => {
    setOrderFilter(f);
    dispatch(getStudentOrderChart({ id: f }));
  };

  const handleCorporateAdminFilter = (f: string) => {
    setCorporateAdminFilter(f);
    dispatch(getCorporateAdminChart({ id: f }));
  };

  // Helper formatting for duration
  const formatMinutes = (minutes: number = 0) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins} mins`;
    if (mins === 0) return `${hrs.toLocaleString()} hrs`;
    return `${hrs.toLocaleString()} hrs ${mins} mins`;
  };

  // ==========================================
  // CHART 1: Student Registrations (Bar / Line)
  // ==========================================
  const studentList = Array.isArray(studentsGraph) ? studentsGraph : [];
  const studentLabels = studentList.map((item: any) =>
    item.start_date ? moment(item.start_date).format("MMM DD") : ""
  );
  const studentCounts = studentList.map(
    (item: any) => Number(item.total_student_registered) || 0
  );

  const studentChartData = {
    labels: studentLabels,
    datasets: [
      {
        label: "Registrations",
        data: studentCounts,
        backgroundColor: studentChartType === "doughnut" ? ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#ec4899", "#8b5cf6", "#14b8a6", "#f97316", "#06b6d4", "#6366f1", "#8b5cf6", "#d946ef", "#f43f5e"] : studentChartType === "line" ? "rgba(79, 70, 229, 0.14)" : "rgba(79, 70, 229, 1)", // Indigo
        borderColor: studentChartType === "doughnut" ? "#ffffff" : studentChartType === "line" ? "#4f46e5" : "#333333",
        hoverBackgroundColor: studentChartType === "doughnut" ? undefined : "rgba(67, 56, 202, 1)",
        hoverBorderColor: studentChartType === "doughnut" ? undefined : "#000000",
        hoverOffset: studentChartType === "doughnut" ? 8 : 0,
        borderRadius: 0,
        borderSkipped: false as const,
        barPercentage: 1.0,
        categoryPercentage: 1.0,
        fill: studentChartType === "line",
        tension: 0.4,
        borderWidth: studentChartType === "line" ? 3 : 1,
        pointBackgroundColor: "#4f46e5",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const studentChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 800,
      easing: "easeInOutQuart" as const,
    },
    plugins: {
      legend: { display: studentChartType === "doughnut", position: "bottom" as const, labels: { padding: 12, usePointStyle: true, pointStyle: "circle", font: { size: 11, weight: "600" } } },
      tooltip: {
        backgroundColor: "#222222",
        titleFont: { size: 12, weight: "bold" },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 4,
        displayColors: studentChartType === "doughnut",
        callbacks: {
          label: (context: any) => studentChartType === "doughnut" ? ` ${context.label}: ${context.parsed}` : ` Students Registered: ${context.parsed.y}`,
        },
      },
    },
    ...(studentChartType === "doughnut" ? { cutout: "60%" } : {}),
    scales: studentChartType === "doughnut" ? undefined : {
      x: {
        grid: { display: false },
        ticks: { color: "#333333", font: { size: 12, weight: "bold" } },
      },
      y: {
        grid: { color: "#cccccc" },
        ticks: { color: "#333333", font: { size: 12, weight: "bold" }, precision: 0 },
        beginAtZero: true,
      },
    },
  };

  // ==========================================
  // CHART 2: Revenue Earnings (Line / Bar)
  // ==========================================
  const revenueList = Array.isArray(revenueGraph) ? revenueGraph : [];
  const revenueLabels = revenueList.map((item: any) =>
    item.start_date ? moment(item.start_date).format("MMM DD") : ""
  );
  const revenueAmounts = revenueList.map(
    (item: any) => Number(item.total_amount) || 0
  );

  const revenueChartData = {
    labels: revenueLabels,
    datasets: [
      {
        label: "Revenue",
        data: revenueAmounts,
        backgroundColor: revenueChartType === "doughnut" ? ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#ec4899", "#8b5cf6", "#14b8a6", "#f97316", "#06b6d4", "#6366f1", "#8b5cf6", "#d946ef", "#f43f5e"] : revenueChartType === "line" ? "rgba(16, 185, 129, 0.14)" : "rgba(16, 185, 129, 1)", // Emerald
        borderColor: revenueChartType === "doughnut" ? "#ffffff" : revenueChartType === "line" ? "#10b981" : "#333333",
        hoverBackgroundColor: revenueChartType === "doughnut" ? undefined : "rgba(5, 150, 105, 1)",
        hoverBorderColor: revenueChartType === "doughnut" ? undefined : "#000000",
        hoverOffset: revenueChartType === "doughnut" ? 8 : 0,
        borderRadius: 0,
        borderSkipped: false as const,
        barPercentage: 1.0,
        categoryPercentage: 1.0,
        fill: revenueChartType === "line",
        tension: 0.4,
        borderWidth: revenueChartType === "line" ? 3 : 1,
        pointBackgroundColor: "#10b981",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const revenueChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 800,
      easing: "easeInOutQuart" as const,
    },
    plugins: {
      legend: { display: revenueChartType === "doughnut", position: "bottom" as const, labels: { padding: 12, usePointStyle: true, pointStyle: "circle", font: { size: 11, weight: "600" } } },
      tooltip: {
        backgroundColor: "#222222",
        titleFont: { size: 12, weight: "bold" },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 4,
        displayColors: revenueChartType === "doughnut",
        callbacks: {
          label: (context: any) =>
            revenueChartType === "doughnut" ? ` ${context.label}: ₹${Number(context.parsed).toLocaleString()}` : ` Total Revenue: ₹${Number(context.parsed.y).toLocaleString()}`,
        },
      },
    },
    ...(revenueChartType === "doughnut" ? { cutout: "60%" } : {}),
    scales: revenueChartType === "doughnut" ? undefined : {
      x: {
        grid: { display: false },
        ticks: { color: "#333333", font: { size: 12, weight: "bold" } },
      },
      y: {
        grid: { color: "#cccccc" },
        ticks: {
          color: "#333333",
          font: { size: 12, weight: "bold" },
          callback: (value: any) =>
            `₹${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`,
        },
        beginAtZero: true,
      },
    },
  };

  // ==========================================
  // CHART 3: Video Lecture Activity (Doughnut / Bar)
  // ==========================================
  const videoList = Array.isArray(videoGraph) ? videoGraph : [];
  const videoLabels = videoList.map((item: any) =>
    item.start_date ? moment(item.start_date).format("MMM DD") : ""
  );
  const videoWatchedCounts = videoList.map(
    (item: any) => Number(item.total_video_watched) || 0
  );

  const videoChartData = {
    labels: videoLabels,
    datasets: [
      {
        label: "Videos Watched",
        data: videoWatchedCounts,
        backgroundColor: videoChartType === "doughnut" ? ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#ec4899", "#8b5cf6", "#14b8a6", "#f97316", "#06b6d4", "#6366f1", "#8b5cf6", "#d946ef", "#f43f5e"] : videoChartType === "line" ? "rgba(245, 158, 11, 0.14)" : "rgba(245, 158, 11, 1)", // Amber
        borderColor: videoChartType === "doughnut" ? "#ffffff" : videoChartType === "line" ? "#f59e0b" : "#333333",
        hoverBackgroundColor: videoChartType === "doughnut" ? undefined : "rgba(217, 119, 6, 1)",
        hoverBorderColor: videoChartType === "doughnut" ? undefined : "#000000",
        hoverOffset: videoChartType === "doughnut" ? 8 : 0,
        borderRadius: 0,
        borderSkipped: false as const,
        barPercentage: 1.0,
        categoryPercentage: 1.0,
        fill: videoChartType === "line",
        tension: 0.4,
        borderWidth: videoChartType === "line" ? 3 : 1,
        pointBackgroundColor: "#f59e0b",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const videoChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 800,
      easing: "easeInOutQuart" as const,
    },
    plugins: {
      legend: { display: videoChartType === "doughnut", position: "bottom" as const, labels: { padding: 12, usePointStyle: true, pointStyle: "circle", font: { size: 11, weight: "600" } } },
      tooltip: {
        backgroundColor: "#222222",
        titleFont: { size: 12, weight: "bold" },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 4,
        displayColors: videoChartType === "doughnut",
        callbacks: {
          label: (context: any) => videoChartType === "doughnut" ? ` ${context.label}: ${context.parsed}` : ` Videos Watched: ${context.parsed.y}`,
        },
      },
    },
    ...(videoChartType === "doughnut" ? { cutout: "60%" } : {}),
    scales: videoChartType === "doughnut" ? undefined : {
      x: {
        grid: { display: false },
        ticks: { color: "#333333", font: { size: 12, weight: "bold" } },
      },
      y: {
        grid: { color: "#cccccc" },
        ticks: { color: "#333333", font: { size: 12, weight: "bold" }, precision: 0 },
        beginAtZero: true,
      },
    },
  };

  // ==========================================
  // CHART 4: Student Orders (Pie / Line)
  // ==========================================
  const orderList = Array.isArray(orderGraph) ? orderGraph : [];
  const orderLabels = orderList.map((item: any) =>
    item.start_date ? moment(item.start_date).format("MMM DD") : ""
  );
  const orderCounts = orderList.map(
    (item: any) => Number(item.total_orders) || 0
  );

  const orderChartData = {
    labels: orderLabels,
    datasets: [
      {
        label: "Orders",
        data: orderCounts,
        backgroundColor: orderChartType === "doughnut" ? ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#ec4899", "#8b5cf6", "#14b8a6", "#f97316", "#06b6d4", "#6366f1", "#8b5cf6", "#d946ef", "#f43f5e"] : orderChartType === "line" ? "rgba(139, 92, 246, 0.14)" : "rgba(139, 92, 246, 1)", // Purple
        borderColor: orderChartType === "doughnut" ? "#ffffff" : orderChartType === "line" ? "#8b5cf6" : "#333333",
        hoverBackgroundColor: orderChartType === "doughnut" ? undefined : "rgba(124, 58, 237, 1)",
        hoverBorderColor: orderChartType === "doughnut" ? undefined : "#000000",
        hoverOffset: orderChartType === "doughnut" ? 8 : 0,
        borderRadius: 0,
        borderSkipped: false as const,
        barPercentage: 1.0,
        categoryPercentage: 1.0,
        fill: orderChartType === "line",
        tension: 0.4,
        borderWidth: orderChartType === "line" ? 3 : 1,
        pointBackgroundColor: "#8b5cf6",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const orderChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 800,
      easing: "easeInOutQuart" as const,
    },
    plugins: {
      legend: { display: orderChartType === "doughnut", position: "bottom" as const, labels: { padding: 12, usePointStyle: true, pointStyle: "circle", font: { size: 11, weight: "600" } } },
      tooltip: {
        backgroundColor: "#222222",
        titleFont: { size: 12, weight: "bold" },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 4,
        displayColors: orderChartType === "doughnut",
        callbacks: {
          label: (context: any) => orderChartType === "doughnut" ? ` ${context.label}: ${context.parsed}` : ` Orders Placed: ${context.parsed.y}`,
        },
      },
    },
    ...(orderChartType === "doughnut" ? { cutout: "60%" } : {}),
    scales: orderChartType === "doughnut" ? undefined : {
      x: {
        grid: { display: false },
        ticks: { color: "#333333", font: { size: 12, weight: "bold" } },
      },
      y: {
        grid: { color: "#cccccc" },
        ticks: { color: "#333333", font: { size: 12, weight: "bold" }, precision: 0 },
        beginAtZero: true,
      },
    },
  };

  // ==========================================
  // CHART 5: Corporate Admins (Bar / Line)
  // ==========================================
  const corpAdminList = Array.isArray(corporateAdminGraph) ? [...corporateAdminGraph].reverse() : [];
  const corpAdminLabels = corpAdminList.map((item: any) => {
    if (!item.start_date) return "";
    if (corporateAdminFilter === "year") return moment(item.start_date).format("YYYY");
    if (corporateAdminFilter === "month") return moment(item.start_date).format("MMM YYYY");
    return moment(item.start_date).format("MMM DD");
  });
  const corpAdminCounts = corpAdminList.map(
    (item: any) => Number(item.total_corporate_registered) || 0
  );

  const corpAdminChartData = {
    labels: corpAdminLabels,
    datasets: [
      {
        label: "Corporate Admins",
        data: corpAdminCounts,
        backgroundColor: corporateAdminChartType === "doughnut" ? ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#ec4899", "#8b5cf6", "#14b8a6", "#f97316", "#06b6d4", "#6366f1", "#8b5cf6", "#d946ef", "#f43f5e"] : corporateAdminChartType === "line" ? "rgba(6, 182, 212, 0.14)" : "rgba(6, 182, 212, 1)", // Cyan
        borderColor: corporateAdminChartType === "doughnut" ? "#ffffff" : corporateAdminChartType === "line" ? "#06b6d4" : "#333333",
        hoverBackgroundColor: corporateAdminChartType === "doughnut" ? undefined : "rgba(8, 145, 178, 1)",
        hoverBorderColor: corporateAdminChartType === "doughnut" ? undefined : "#000000",
        hoverOffset: corporateAdminChartType === "doughnut" ? 8 : 0,
        borderRadius: 0,
        borderSkipped: false as const,
        barPercentage: 1.0,
        categoryPercentage: 1.0,
        fill: corporateAdminChartType === "line",
        tension: 0.4,
        borderWidth: corporateAdminChartType === "line" ? 3 : 1,
        pointBackgroundColor: "#06b6d4",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const corpAdminChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 800,
      easing: "easeInOutQuart" as const,
    },
    plugins: {
      legend: { display: corporateAdminChartType === "doughnut", position: "bottom" as const, labels: { padding: 12, usePointStyle: true, pointStyle: "circle", font: { size: 11, weight: "600" } } },
      tooltip: {
        backgroundColor: "#222222",
        titleFont: { size: 12, weight: "bold" },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 4,
        displayColors: corporateAdminChartType === "doughnut",
        callbacks: {
          label: (context: any) => corporateAdminChartType === "doughnut" ? ` ${context.label}: ${context.parsed}` : ` Corporate Admins: ${context.parsed.y}`,
        },
      },
    },
    ...(corporateAdminChartType === "doughnut" ? { cutout: "60%" } : {}),
    scales: corporateAdminChartType === "doughnut" ? undefined : {
      x: {
        grid: { display: false },
        ticks: { color: "#333333", font: { size: 12, weight: "bold" } },
      },
      y: {
        grid: { color: "#cccccc" },
        ticks: { color: "#333333", font: { size: 12, weight: "bold" }, precision: 0 },
        beginAtZero: true,
      },
    },
  };

  if (loading && !counters) {
    return (
      <div className="flex justify-center items-center h-80">
        <div className="flex flex-col items-center gap-3 text-indigo-600">
          <Loader2 className="w-10 h-10 animate-spin" />
          <span className="text-sm font-medium text-gray-600">
            Loading dashboard analytics...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="text-gray-900 font-sans space-y-6 pb-8">
      {/* 1. Welcome Banner */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Welcome back, Admin 👋
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {moment().format("dddd, MMMM D, YYYY")} &bull; Platform Overview &amp; Analytics
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/dashboard/courses"
            className="bg-indigo-600 text-white py-2 px-4 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-sm flex items-center gap-2"
          >
            <BookOpen size={16} /> Manage Courses
          </Link>
          <Link
            to="/dashboard/students"
            className="bg-white border border-gray-200 text-gray-700 py-2 px-4 rounded-xl text-sm font-semibold hover:bg-gray-50 transition shadow-sm flex items-center gap-2"
          >
            <Users size={16} /> View Students
          </Link>
        </div>
      </section>

      {/* 2. All Counters from reports/admin-dashboard-counters/ */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Metric 1: Total Students + Monthly Growth */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Total Students
              </p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {counters?.total_students?.toLocaleString() ?? 0}
              </h3>
            </div>
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
              <Users size={18} />
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-2">
            <TrendingUp size={13} />
            <span>+{counters?.new_students_current_month ?? 0} this month</span>
          </div>
        </div>

        {/* Metric 2: Corporate Admins */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Corporate Admins
              </p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {counters?.total_corporate_admins?.toLocaleString() ?? 0}
              </h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
              <Building2 size={18} />
            </div>
          </div>
          <p className="text-[11px] text-gray-400 font-medium mt-2">
            Institutions &amp; Enterprises
          </p>
        </div>

        {/* Metric 3: Active Orders */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Active Orders
              </p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {counters?.total_active_orders?.toLocaleString() ?? 0}
              </h3>
            </div>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <ShoppingBag size={18} />
            </div>
          </div>
          <p className="text-[11px] text-gray-400 font-medium mt-2">
            Total course orders
          </p>
        </div>

        {/* Metric 4: Active Subscriptions */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Active Subscriptions
              </p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {counters?.total_active_subscription?.toLocaleString() ?? 0}
              </h3>
            </div>
            <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
              <Crown size={18} />
            </div>
          </div>
          <p className="text-[11px] text-gray-400 font-medium mt-2">
            Active recurring plans
          </p>
        </div>

        {/* Metric 5: Total Watch Time */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Watch Time (Learned)
              </p>
              <h3 className="text-xl font-bold text-gray-900 mt-1">
                {formatMinutes(counters?.total_duration_watched)}
              </h3>
            </div>
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
              <PlayCircle size={18} />
            </div>
          </div>
          <p className="text-[11px] text-amber-700 font-medium mt-2">
            Across all video streams
          </p>
        </div>

        {/* Metric 6: Total Library Duration */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Content Duration
              </p>
              <h3 className="text-xl font-bold text-gray-900 mt-1">
                {formatMinutes(counters?.total_duration)}
              </h3>
            </div>
            <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
              <Video size={18} />
            </div>
          </div>
          <p className="text-[11px] text-gray-400 font-medium mt-2">
            Total video catalog
          </p>
        </div>
      </section>

      {/* 3. The 4 Distinct Charts (Bar, Line, Doughnut, Pie) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ============================================================ */}
        {/* CHART 1: BAR CHART (Student Registrations) */}
        {/* ============================================================ */}
        <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-5 flex flex-col h-[390px] transition-all hover:shadow-[0_6px_24px_rgba(79,70,229,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Users size={16} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 leading-none">
                  Student Registrations
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Registration volume over time
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Chart Type Toggle (Bar / Line) */}
              <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                <button
                  onClick={() => setStudentChartType("bar")}
                  title="Bar Chart"
                  className={`p-1.5 rounded-md transition ${
                    studentChartType === "bar"
                      ? "bg-white text-indigo-600 shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <BarChart2 size={13} />
                </button>
                <button
                  onClick={() => setStudentChartType("line")}
                  title="Line Chart"
                  className={`p-1.5 rounded-md transition ${
                    studentChartType === "line"
                      ? "bg-white text-indigo-600 shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <LineChartIcon size={13} />
                </button>
                <button
                  onClick={() => setStudentChartType("doughnut")}
                  title="Doughnut Chart"
                  className={`p-1.5 rounded-md transition ${
                    studentChartType === "doughnut"
                      ? "bg-white text-indigo-600 shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <DoughnutChartIcon size={13} />
                </button>
              </div>

              {/* Time Filter */}
              <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl border border-gray-200/60">
                {(["week", "month", "year"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => handleStudentFilter(f)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all uppercase ${
                      studentFilter === f
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 w-full min-h-0 relative">
            {loadingStudentsChart && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[1px] z-10">
                <div className="flex items-center gap-2 text-indigo-600 text-xs font-medium">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Loading registration data...</span>
                </div>
              </div>
            )}

            {studentList.length > 0 ? (
              <div className="w-full h-full">
                {studentChartType === "bar" ? (
                  <Bar key={studentFilter + studentChartType} data={studentChartData} options={studentChartOptions} />
                ) : studentChartType === "line" ? (
                  <Line key={studentFilter + studentChartType} data={studentChartData} options={studentChartOptions} />
                ) : (
                  <Doughnut key={studentFilter + studentChartType} data={studentChartData} options={studentChartOptions} />
                )}
              </div>
            ) : (
              !loadingStudentsChart && (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs gap-1">
                  <Users size={24} className="opacity-40" />
                  <p>No registration data recorded</p>
                </div>
              )
            )}
          </div>
        </div>

       
        <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-5 flex flex-col h-[390px] transition-all hover:shadow-[0_6px_24px_rgba(16,185,129,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CreditCard size={16} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 leading-none">
                  Revenue Generated
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Financial earnings and cash flow
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Chart Type Toggle (Line / Bar) */}
              <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                <button
                  onClick={() => setRevenueChartType("line")}
                  title="Line Area Chart"
                  className={`p-1.5 rounded-md transition ${
                    revenueChartType === "line"
                      ? "bg-white text-emerald-600 shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <LineChartIcon size={13} />
                </button>
                <button
                  onClick={() => setRevenueChartType("doughnut")}
                  title="Doughnut Chart"
                  className={`p-1.5 rounded-md transition ${
                    revenueChartType === "doughnut"
                      ? "bg-white text-indigo-600 shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <DoughnutChartIcon size={13} />
                </button>
                <button
                  onClick={() => setRevenueChartType("bar")}
                  title="Bar Chart"
                  className={`p-1.5 rounded-md transition ${
                    revenueChartType === "bar"
                      ? "bg-white text-emerald-600 shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <BarChart2 size={13} />
                </button>
              </div>

              {/* Time Filter */}
              <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl border border-gray-200/60">
                {(["week", "month", "year"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => handleRevenueFilter(f)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all uppercase ${
                      revenueFilter === f
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 w-full min-h-0 relative">
            {loadingRevenueChart && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[1px] z-10">
                <div className="flex items-center gap-2 text-emerald-600 text-xs font-medium">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Loading revenue data...</span>
                </div>
              </div>
            )}

            {revenueList.length > 0 ? (
              <div className="w-full h-full">
                {revenueChartType === "bar" ? (
                  <Bar key={revenueFilter + revenueChartType} data={revenueChartData} options={revenueChartOptions} />
                ) : revenueChartType === "line" ? (
                  <Line key={revenueFilter + revenueChartType} data={revenueChartData} options={revenueChartOptions} />
                ) : (
                  <Doughnut key={revenueFilter + revenueChartType} data={revenueChartData} options={revenueChartOptions} />
                )}
              </div>
            ) : (
              !loadingRevenueChart && (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs gap-1">
                  <CreditCard size={24} className="opacity-40" />
                  <p>No revenue data recorded</p>
                </div>
              )
            )}
          </div>
        </div>

       
        <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-5 flex flex-col h-[390px] transition-all hover:shadow-[0_6px_24px_rgba(245,158,11,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <PlayCircle size={16} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 leading-none">
                  Video Lectures Watched
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Student video engagement distribution
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Chart Type Toggle (Doughnut / Bar) */}
              <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                <button
                  onClick={() => setVideoChartType("bar")}
                  title="Bar Chart"
                  className={`p-1.5 rounded-md transition ${
                    videoChartType === "bar"
                      ? "bg-white text-amber-600 shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <BarChart2 size={13} />
                </button>
                <button
                  onClick={() => setVideoChartType("line")}
                  title="Line Chart"
                  className={`p-1.5 rounded-md transition ${
                    videoChartType === "line"
                      ? "bg-white text-amber-600 shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <LineChartIcon size={13} />
                </button>
                <button
                  onClick={() => setVideoChartType("doughnut")}
                  title="Doughnut Chart"
                  className={`p-1.5 rounded-md transition ${
                    videoChartType === "doughnut"
                      ? "bg-white text-indigo-600 shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <DoughnutChartIcon size={13} />
                </button>
              </div>

              {/* Time Filter */}
              <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl border border-gray-200/60">
                {(["week", "month", "year"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => handleVideoFilter(f)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all uppercase ${
                      videoFilter === f
                        ? "bg-amber-600 text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 w-full min-h-0 relative flex items-center justify-center">
            {loadingVideoChart && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[1px] z-10">
                <div className="flex items-center gap-2 text-amber-600 text-xs font-medium">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Loading video stats...</span>
                </div>
              </div>
            )}

            {videoList.length > 0 ? (
              <div className="w-full h-full">
                {videoChartType === "bar" ? (
                  <Bar key={videoFilter + videoChartType} data={videoChartData} options={videoChartOptions} />
                ) : videoChartType === "line" ? (
                  <Line key={videoFilter + videoChartType} data={videoChartData} options={videoChartOptions} />
                ) : (
                  <Doughnut key={videoFilter + videoChartType} data={videoChartData} options={videoChartOptions} />
                )}
              </div>
            ) : (
              !loadingVideoChart && (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs gap-1">
                  <PlayCircle size={24} className="opacity-40" />
                  <p>No video activity recorded</p>
                </div>
              )
            )}
          </div>
        </div>

  
        <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-5 flex flex-col h-[390px] transition-all hover:shadow-[0_6px_24px_rgba(139,92,246,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <ShoppingBag size={16} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 leading-none">
                  Student Orders Breakdown
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Course purchases and checkout share
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Chart Type Toggle (Pie / Line) */}
              <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                <button
                  onClick={() => setOrderChartType("bar")}
                  title="Bar Chart"
                  className={`p-1.5 rounded-md transition ${
                    orderChartType === "bar"
                      ? "bg-white text-purple-600 shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <BarChart2 size={13} />
                </button>
                <button
                  onClick={() => setOrderChartType("line")}
                  title="Line Chart"
                  className={`p-1.5 rounded-md transition ${
                    orderChartType === "line"
                      ? "bg-white text-purple-600 shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <LineChartIcon size={13} />
                </button>
                <button
                  onClick={() => setOrderChartType("doughnut")}
                  title="Doughnut Chart"
                  className={`p-1.5 rounded-md transition ${
                    orderChartType === "doughnut"
                      ? "bg-white text-indigo-600 shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <DoughnutChartIcon size={13} />
                </button>
              </div>

              {/* Time Filter */}
              <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl border border-gray-200/60">
                {(["week", "month", "year"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => handleOrderFilter(f)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all uppercase ${
                      orderFilter === f
                        ? "bg-purple-600 text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 w-full min-h-0 relative flex items-center justify-center">
            {loadingOrderChart && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[1px] z-10">
                <div className="flex items-center gap-2 text-purple-600 text-xs font-medium">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Loading orders data...</span>
                </div>
              </div>
            )}

            {orderList.length > 0 ? (
              <div className="w-full h-full">
                {orderChartType === "bar" ? (
                  <Bar key={orderFilter + orderChartType} data={orderChartData} options={orderChartOptions} />
                ) : orderChartType === "line" ? (
                  <Line key={orderFilter + orderChartType} data={orderChartData} options={orderChartOptions} />
                ) : (
                  <Doughnut key={orderFilter + orderChartType} data={orderChartData} options={orderChartOptions} />
                )}
              </div>
            ) : (
              !loadingOrderChart && (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs gap-1">
                  <ShoppingBag size={24} className="opacity-40" />
                  <p>No order data recorded</p>
                </div>
              )
            )}
          </div>
        </div>

       
        <div className="w-full lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-5 flex flex-col h-[390px] transition-all hover:shadow-[0_6px_24px_rgba(6,182,212,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <Building2 size={16} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 leading-none">
                  Corporate Admins
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Institutions & Enterprises onboarded
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Chart Type Toggle (Bar / Line) */}
              <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                <button
                  onClick={() => setCorporateAdminChartType("bar")}
                  title="Bar Chart"
                  className={`p-1.5 rounded-md transition ${
                    corporateAdminChartType === "bar"
                      ? "bg-white text-cyan-600 shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <BarChart2 size={13} />
                </button>
                <button
                  onClick={() => setCorporateAdminChartType("line")}
                  title="Line Chart"
                  className={`p-1.5 rounded-md transition ${
                    corporateAdminChartType === "line"
                      ? "bg-white text-cyan-600 shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <LineChartIcon size={13} />
                </button>
                <button
                  onClick={() => setCorporateAdminChartType("doughnut")}
                  title="Doughnut Chart"
                  className={`p-1.5 rounded-md transition ${
                    corporateAdminChartType === "doughnut"
                      ? "bg-white text-indigo-600 shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <DoughnutChartIcon size={13} />
                </button>
              </div>

              {/* Time Filter */}
              <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl border border-gray-200/60">
                {(["week", "month", "year"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => handleCorporateAdminFilter(f)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all uppercase ${
                      corporateAdminFilter === f
                        ? "bg-cyan-600 text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 w-full min-h-0 relative flex items-center justify-center">
            {loadingCorporateAdminChart && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[1px] z-10">
                <div className="flex items-center gap-2 text-cyan-600 text-xs font-medium">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Loading corporate admins data...</span>
                </div>
              </div>
            )}

            {corpAdminList.length > 0 ? (
              <div className="w-full h-full">
                {corporateAdminChartType === "bar" ? (
                  <Bar key={corporateAdminFilter + corporateAdminChartType} data={corpAdminChartData} options={corpAdminChartOptions} />
                ) : corporateAdminChartType === "line" ? (
                  <Line key={corporateAdminFilter + corporateAdminChartType} data={corpAdminChartData} options={corpAdminChartOptions} />
                ) : (
                  <Doughnut key={corporateAdminFilter + corporateAdminChartType} data={corpAdminChartData} options={corpAdminChartOptions} />
                )}
              </div>
            ) : (
              !loadingCorporateAdminChart && (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs gap-1">
                  <Building2 size={24} className="opacity-40" />
                  <p>No corporate admins recorded</p>
                </div>
              )
            )}
          </div>
        </div>

      </section>

 
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Recent Enrollments (Students) */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-gray-900">
                Recent Enrollments
              </h3>
              <Link
                to="/dashboard/students"
                className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold transition"
              >
                See all
              </Link>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {loadingRecentStudents || (loading && recentStudentList.length === 0) ? (
                <div className="p-10 flex flex-col items-center justify-center text-center">
                  <Loader2 size={24} className="animate-spin text-indigo-600 mb-2" />
                  <p className="text-xs text-gray-400 font-medium">Loading enrollments...</p>
                </div>
              ) : recentStudentList.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      <th className="pb-3.5 pr-3 font-bold">STUDENT</th>
                      <th className="pb-3.5 px-3 font-bold">EMAIL</th>
                      <th className="pb-3.5 px-3 font-bold">DATE JOINED</th>
                      <th className="pb-3.5 pl-3 font-bold text-right">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm">
                    {recentStudentList.slice(0, 5).map((student: any) => {
                      const fullName = [student.first_name, student.last_name].filter(Boolean).join(" ").trim() || "Student";
                      const initial = (student.first_name?.[0] || fullName[0] || "S").toUpperCase();
                      const joinedFormatted = student.date_joined || student.created_at
                        ? moment(student.date_joined || student.created_at).format("MMM DD, YYYY")
                        : "-";
                      const isActive = student.is_active !== false && student.status !== false && !student.is_locked;

                      return (
                        <tr
                          key={student.id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          {/* STUDENT Avatar + Name */}
                          <td className="py-3.5 pr-3 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#EEF2FF] text-[#4F46E5] font-bold text-xs flex items-center justify-center shrink-0">
                                {initial}
                              </div>
                              <span className="font-medium text-gray-800 text-sm">{fullName}</span>
                            </div>
                          </td>

                          {/* EMAIL */}
                          <td className="py-3.5 px-3 text-xs text-gray-500 max-w-[140px] truncate" title={student.email}>
                            {student.email || "-"}
                          </td>

                          {/* DATE JOINED */}
                          <td className="py-3.5 px-3 text-xs text-gray-500 whitespace-nowrap">
                            {joinedFormatted}
                          </td>

                          {/* STATUS */}
                          <td className="py-3.5 pl-3 text-right whitespace-nowrap">
                            {isActive ? (
                              <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/80 uppercase tracking-wide">
                                ACTIVE
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200/80 uppercase tracking-wide">
                                INACTIVE
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 flex flex-col items-center justify-center text-center text-gray-400">
                  <p className="text-xs text-gray-400 font-medium">No enrollments found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Recent Corporate Admins */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-gray-900">
                Recent Corporate Admins
              </h3>
              <Link
                to="/dashboard/corporate-admin"
                className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold transition"
              >
                See all
              </Link>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {loadingRecentCorporateAdmins || (loading && recentCorpList.length === 0) ? (
                <div className="p-10 flex flex-col items-center justify-center text-center">
                  <Loader2 size={24} className="animate-spin text-indigo-600 mb-2" />
                  <p className="text-xs text-gray-400 font-medium">Loading corporate admins...</p>
                </div>
              ) : recentCorpList.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      <th className="pb-3.5 pr-3 font-bold">ADMIN</th>
                      <th className="pb-3.5 px-3 font-bold">EMAIL</th>
                      <th className="pb-3.5 px-3 font-bold">PHONE</th>
                      <th className="pb-3.5 pl-3 font-bold text-right">DATE JOINED</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm">
                    {recentCorpList.slice(0, 5).map((admin: any) => {
                      const fullName = [admin.first_name, admin.last_name].filter(Boolean).join(" ").trim() || "Corporate Admin";
                      const initial = (admin.first_name?.[0] || fullName[0] || "C").toUpperCase();
                      const joinedFormatted = admin.date_joined || admin.created_at
                        ? moment(admin.date_joined || admin.created_at).format("MMM DD, YYYY")
                        : "-";

                      return (
                        <tr
                          key={admin.id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          {/* ADMIN Avatar + Name */}
                          <td className="py-3.5 pr-3 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#EEF2FF] text-[#4F46E5] font-bold text-xs flex items-center justify-center shrink-0">
                                {initial}
                              </div>
                              <span className="font-medium text-gray-800 text-sm">{fullName}</span>
                            </div>
                          </td>

                          {/* EMAIL */}
                          <td className="py-3.5 px-3 text-xs text-gray-500 max-w-[140px] truncate" title={admin.email}>
                            {admin.email || "-"}
                          </td>

                          {/* PHONE */}
                          <td className="py-3.5 px-3 text-xs text-gray-500 whitespace-nowrap">
                            {admin.phone1 || "-"}
                          </td>

                          {/* DATE JOINED */}
                          <td className="py-3.5 pl-3 text-xs text-gray-500 text-right whitespace-nowrap">
                            {joinedFormatted}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 flex flex-col items-center justify-center text-center text-gray-400">
                  <p className="text-xs text-gray-400 font-medium">No corporate admins found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Quick Status & Overview Details */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <GraduationCap size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Platform Instructors</p>
              <span className="text-sm font-bold text-gray-900">Active Faculty</span>
            </div>
          </div>
          <span className="text-lg font-bold text-indigo-600">12</span>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Published Articles</p>
              <span className="text-sm font-bold text-gray-900">Knowledge Base</span>
            </div>
          </div>
          <span className="text-lg font-bold text-emerald-600">24</span>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Tag size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Featured Campaign</p>
              <span className="text-sm font-bold text-gray-900">Active Discount</span>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
            FLAT50OFF
          </span>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;