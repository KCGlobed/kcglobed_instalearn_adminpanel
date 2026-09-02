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
import DashboardSkeleton from "./components/DashboardSkeleton";
import WelcomeBanner from "./components/WelcomeBanner";
import DashboardCounters from "./components/DashboardCounters";
import StudentRegistrationsChart from "./components/StudentRegistrationsChart";
import RevenueChart from "./components/RevenueChart";
import VideoLecturesChart from "./components/VideoLecturesChart";
import StudentOrdersChart from "./components/StudentOrdersChart";
import CorporateAdminsChart from "./components/CorporateAdminsChart";
import RecentEnrollmentsTable from "./components/RecentEnrollmentsTable";
import RecentCorporateAdminsTable from "./components/RecentCorporateAdminsTable";
import QuickStatusCards from "./components/QuickStatusCards";

type ChartType = "bar" | "line" | "doughnut";

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

  // Filter states for the 5 distinct Graph APIs
  const [studentFilter, setStudentFilter] = useState<string>("month");
  const [revenueFilter, setRevenueFilter] = useState<string>("month");
  const [videoFilter, setVideoFilter] = useState<string>("month");
  const [orderFilter, setOrderFilter] = useState<string>("month");
  const [corporateAdminFilter, setCorporateAdminFilter] = useState<string>("month");

  // Chart type switcher states for each graph
  const [studentChartType, setStudentChartType] = useState<ChartType>("bar");
  const [revenueChartType, setRevenueChartType] = useState<ChartType>("bar");
  const [videoChartType, setVideoChartType] = useState<ChartType>("bar");
  const [orderChartType, setOrderChartType] = useState<ChartType>("bar");
  const [corporateAdminChartType, setCorporateAdminChartType] = useState<ChartType>("bar");

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

  if (!counters) return <DashboardSkeleton />;

  return (
    <div className="text-gray-900 font-sans space-y-6 pb-8">
      {/* 1. Welcome Banner */}
      <WelcomeBanner />

      {/* 2. All Counters / Metrics */}
      <DashboardCounters counters={counters} />

      {/* 3. The 5 Distinct Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StudentRegistrationsChart
          studentsGraph={studentsGraph}
          loading={loadingStudentsChart}
          filter={studentFilter}
          chartType={studentChartType}
          onFilterChange={handleStudentFilter}
          onChartTypeChange={setStudentChartType}
        />

        <RevenueChart
          revenueGraph={revenueGraph}
          loading={loadingRevenueChart}
          filter={revenueFilter}
          chartType={revenueChartType}
          onFilterChange={handleRevenueFilter}
          onChartTypeChange={setRevenueChartType}
        />

        <VideoLecturesChart
          videoGraph={videoGraph}
          loading={loadingVideoChart}
          filter={videoFilter}
          chartType={videoChartType}
          onFilterChange={handleVideoFilter}
          onChartTypeChange={setVideoChartType}
        />

        <StudentOrdersChart
          orderGraph={orderGraph}
          loading={loadingOrderChart}
          filter={orderFilter}
          chartType={orderChartType}
          onFilterChange={handleOrderFilter}
          onChartTypeChange={setOrderChartType}
        />

        <CorporateAdminsChart
          corporateAdminGraph={corporateAdminGraph}
          loading={loadingCorporateAdminChart}
          filter={corporateAdminFilter}
          chartType={corporateAdminChartType}
          onFilterChange={handleCorporateAdminFilter}
          onChartTypeChange={setCorporateAdminChartType}
        />
      </section>

      {/* 4. Recent Activity Tables */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentEnrollmentsTable
          recentStudents={recentStudents}
          loading={loadingRecentStudents}
          initialLoading={loading}
        />

        <RecentCorporateAdminsTable
          recentCorporateAdmins={recentCorporateAdmins}
          loading={loadingRecentCorporateAdmins}
          initialLoading={loading}
        />
      </section>

      {/* 5. Quick Status & Overview Details */}
      <QuickStatusCards />
    </div>
  );
};

export default DashboardPage;