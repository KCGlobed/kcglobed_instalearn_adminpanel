import React, { useMemo } from "react";
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
  BarController,
  LineController,
  DoughnutController,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import {
  Building2,
  BarChart2,
  TrendingUp as LineChartIcon,
  PieChart as DoughnutChartIcon,
  Loader2,
} from "lucide-react";

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
  Filler,
  BarController,
  LineController,
  DoughnutController
);

const DOUGHNUT_COLORS = [
  "#4f46e5",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#ec4899",
  "#8b5cf6",
  "#14b8a6",
  "#f97316",
  "#06b6d4",
  "#6366f1",
  "#8b5cf6",
  "#d946ef",
  "#f43f5e",
];

export type ChartType = "bar" | "line" | "doughnut";

export interface CorporateAdminsChartProps {
  corporateAdminGraph: any[];
  loading: boolean;
  filter: string;
  chartType: ChartType;
  onFilterChange: (filter: string) => void;
  onChartTypeChange: (type: ChartType) => void;
}

export const CorporateAdminsChart: React.FC<CorporateAdminsChartProps> = ({
  corporateAdminGraph,
  loading,
  filter,
  chartType,
  onFilterChange,
  onChartTypeChange,
}) => {
  const corpAdminList = Array.isArray(corporateAdminGraph) ? corporateAdminGraph : [];
  const corpAdminLabels = corpAdminList.map((item: any) => {
    if (!item.start_date) return "";
    if (filter === "year") return moment(item.start_date).format("YYYY");
    if (filter === "month") return moment(item.start_date).format("MMM YYYY");
    return moment(item.start_date).format("MMM DD");
  });
  const corpAdminCounts = corpAdminList.map(
    (item: any) => Number(item.total_corporate_registered) || 0
  );
  const hasCorpAdminData = corpAdminCounts.some((val: number) => val > 0);

  const chartData = useMemo(() => ({
    labels: corpAdminLabels,
    datasets: [
      {
        type: chartType,
        label: "Corporate Admins",
        data: corpAdminCounts,
        backgroundColor:
          chartType === "doughnut"
            ? DOUGHNUT_COLORS
            : chartType === "line"
            ? "rgba(6, 182, 212, 0.14)"
            : "rgba(6, 182, 212, 1)",
        borderColor:
          chartType === "doughnut"
            ? "#ffffff"
            : chartType === "line"
            ? "#06b6d4"
            : "#ffffffff",
        hoverBackgroundColor: chartType === "doughnut" ? undefined : "rgba(8, 145, 178, 1)",
        hoverBorderColor: chartType === "doughnut" ? undefined : "#000000",
        hoverOffset: chartType === "doughnut" ? 8 : 0,
        borderRadius: 0,
        borderSkipped: false as const,
        barPercentage: 0.6,
        categoryPercentage: 0.8,
        maxBarThickness: 32,
        fill: chartType === "line",
        tension: 0.4,
        borderWidth: chartType === "line" ? 3 : 1,
        pointBackgroundColor: "#06b6d4",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [corporateAdminGraph, chartType, filter]);

  const chartOptions: any = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation:
      chartType === "doughnut"
        ? {
            animateRotate: true,
            animateScale: true,
            duration: 1200,
            easing: "easeOutQuart" as const,
          }
        : {
            duration: 1200,
            easing: "easeOutQuart" as const,
            y: {
              from: (ctx: any) => ctx.chart.scales?.y?.getPixelForValue(0),
              duration: 1200,
              easing: "easeOutQuart" as const,
            },
            delay: (ctx: any) => ctx.dataIndex * 80,
          },
    plugins: {
      legend: {
        display: chartType === "doughnut",
        position: "bottom" as const,
        labels: {
          padding: 12,
          usePointStyle: true,
          pointStyle: "circle",
          font: { size: 11, weight: "600" },
          generateLabels: (chart: any) => {
            if (chartType === "doughnut") {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                return data.labels
                  .map((label: string, i: number) => {
                    const meta = chart.getDatasetMeta(0);
                    const style = meta.controller.getStyle(i);
                    const value = data.datasets[0].data[i];
                    return {
                      text: label,
                      fillStyle: style.backgroundColor,
                      strokeStyle: style.borderColor,
                      lineWidth: style.borderWidth,
                      hidden: isNaN(value) || meta.data[i].hidden,
                      index: i,
                      _value: value,
                    };
                  })
                  .filter((item: any) => item._value > 0);
              }
            }
            return ChartJS.defaults.plugins.legend.labels.generateLabels(chart);
          },
        },
        onClick: (e: any, legendItem: any, legend: any) => {
          if (chartType === "doughnut") {
            const index = legendItem.index;
            const chart = legend.chart;
            chart.toggleDataVisibility(index);
            chart.update();
          } else {
            ChartJS.defaults.plugins.legend.onClick.call(legend, e, legendItem, legend);
          }
        },
      },
      tooltip: {
        backgroundColor: "#222222",
        titleFont: { size: 12, weight: "bold" },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 4,
        displayColors: chartType === "doughnut",
        callbacks: {
          label: (context: any) =>
            chartType === "doughnut"
              ? ` ${context.label}: ${context.parsed}`
              : ` Corporate Admins: ${context.parsed.y}`,
        },
      },
    },
    ...(chartType === "doughnut" ? { cutout: "60%" } : {}),
    scales:
      chartType === "doughnut"
        ? undefined
        : {
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
  }), [chartType]);

  return (
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
              Institutions &amp; Enterprises onboarded
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Chart Type Toggle */}
          <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
            <button
              onClick={() => onChartTypeChange("bar")}
              title="Bar Chart"
              className={`p-1.5 rounded-md transition ${
                chartType === "bar"
                  ? "bg-white text-cyan-600 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <BarChart2 size={13} />
            </button>
            <button
              onClick={() => onChartTypeChange("line")}
              title="Line Chart"
              className={`p-1.5 rounded-md transition ${
                chartType === "line"
                  ? "bg-white text-cyan-600 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <LineChartIcon size={13} />
            </button>
            <button
              onClick={() => onChartTypeChange("doughnut")}
              title="Doughnut Chart"
              className={`p-1.5 rounded-md transition ${
                chartType === "doughnut"
                  ? "bg-white text-cyan-600 shadow-xs"
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
                onClick={() => onFilterChange(f)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all uppercase ${
                  filter === f
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
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[1px] z-10">
            <div className="flex items-center gap-2 text-cyan-600 text-xs font-medium">
              <Loader2 size={16} className="animate-spin" />
              <span>Loading corporate admins data...</span>
            </div>
          </div>
        )}

        {(chartType === "doughnut" ? hasCorpAdminData : corpAdminList.length > 0) ? (
          <div className="w-full h-full">
            <Chart type="bar" data={chartData} options={chartOptions} />
          </div>
        ) : (
          !loading && (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-300">
              <div className="relative mb-3 flex items-center justify-center">
                <div className="w-28 h-28 rounded-full border-[6px] border-dashed border-gray-200/90 flex items-center justify-center transition-transform hover:scale-105 duration-300">
                  <div className="w-16 h-16 rounded-full bg-gray-50/80 border border-gray-100 flex items-center justify-center shadow-inner">
                    <Building2 size={22} className="text-cyan-500" />
                  </div>
                </div>
                <span className="absolute -bottom-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-gray-50 text-gray-500 rounded-full border border-gray-200 shadow-2xs">
                  0 {filter}
                </span>
              </div>
              <h5 className="text-xs font-bold text-gray-700">
                No Corporate Admins Recorded
              </h5>
              <p className="text-[11px] text-gray-400 mt-0.5 max-w-[240px]">
                No data available for this <span className="font-semibold text-gray-600 uppercase">{filter}</span>. Try selecting a different timeframe.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default CorporateAdminsChart;
