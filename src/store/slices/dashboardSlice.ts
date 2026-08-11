import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { DashboardState } from "../../utils/types";
import {
  fetchAdminDashboardCounters,
  fetchAdminDashboardStudentsGraph,
  fetchAdminDashboardRevenueGraph,
  fetchAdminDashboardVideoGraph,
  fetchAdminDashboardOrderGraph,
  fetchAdminDashboardCorporateAdminGraph,
  fetchPracticeChart,
  fetchRecentCorporateAdmins,
  fetchRecentStudents,
} from "../../services/apiServices";

const initialState: DashboardState = {
  counters: null,
  studentsGraph: [],
  revenueGraph: [],
  videoGraph: [],
  orderGraph: [],
  corporateAdminGraph: [],
  practiceGraph: [],
  recentCorporateAdmins: [],
  recentStudents: [],
  loading: false,
  loadingRecentCorporateAdmins: false,
  loadingRecentStudents: false,
  loadingStudentsChart: false,
  loadingRevenueChart: false,
  loadingVideoChart: false,
  loadingOrderChart: false,
  loadingCorporateAdminChart: false,
  loadingPracticeChart: false,
  error: null,
};

const extractArray = (res: any) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.results)) return res.results;
  return [];
};

const extractCounters = (res: any) => {
  if (res && typeof res === "object") {
    return res?.data || res;
  }
  return null;
};

// 1. Initial Dashboard Load (All Graph APIs + Counters + Recent Corporate Admins + Recent Students in Parallel)
export const getDashboardData = createAsyncThunk(
  "dashboard/getDashboardData",
  async (_, { rejectWithValue }) => {
    try {
      const [countersRes, studentsRes, revenueRes, videoRes, orderRes, corpAdminRes, recentCorpRes, recentStudentsRes] =
        await Promise.all([
          fetchAdminDashboardCounters(),
          fetchAdminDashboardStudentsGraph("month"),
          fetchAdminDashboardRevenueGraph("month"),
          fetchAdminDashboardVideoGraph("month"),
          fetchAdminDashboardOrderGraph("week"),
          fetchAdminDashboardCorporateAdminGraph("month"),
          fetchRecentCorporateAdmins(),
          fetchRecentStudents(),
        ]);

      return {
        counters: extractCounters(countersRes),
        studentsGraph: extractArray(studentsRes),
        revenueGraph: extractArray(revenueRes),
        videoGraph: extractArray(videoRes),
        orderGraph: extractArray(orderRes),
        corporateAdminGraph: extractArray(corpAdminRes),
        recentCorporateAdmins: extractArray(recentCorpRes),
        recentStudents: extractArray(recentStudentsRes),
      };
    } catch (err: any) {
      return rejectWithValue(err?.message || "Failed to fetch dashboard data");
    }
  }
);

// Recent Corporate Admins
export const getRecentCorporateAdmins = createAsyncThunk(
  "dashboard/getRecentCorporateAdmins",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetchRecentCorporateAdmins();
      return extractArray(res);
    } catch (err: any) {
      return rejectWithValue(err?.message || "Failed to fetch recent corporate admins");
    }
  }
);

// Recent Students
export const getRecentStudents = createAsyncThunk(
  "dashboard/getRecentStudents",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetchRecentStudents();
      return extractArray(res);
    } catch (err: any) {
      return rejectWithValue(err?.message || "Failed to fetch recent students");
    }
  }
);

// Graph API 1: Student Registrations Chart (week, month, year)
export const getStudentRegistrationChart = createAsyncThunk<any, { id?: string }>(
  "dashboard/getStudentRegistrationChart",
  async ({ id = "week" } = {}, { rejectWithValue }) => {
    try {
      const res = await fetchAdminDashboardStudentsGraph(id);
      return extractArray(res);
    } catch (err: any) {
      return rejectWithValue(err?.message || "Failed to fetch student registrations");
    }
  }
);

// Graph API 2: Revenue Chart (week, month, year)
export const getRevenueChart = createAsyncThunk<any, { id?: string }>(
  "dashboard/getRevenueChart",
  async ({ id = "month" } = {}, { rejectWithValue }) => {
    try {
      const res = await fetchAdminDashboardRevenueGraph(id);
      return extractArray(res);
    } catch (err: any) {
      return rejectWithValue(err?.message || "Failed to fetch revenue data");
    }
  }
);

// Graph API 3: Video Lecture Watch Time Chart (week, month, year)
export const getVideoLectureChart = createAsyncThunk<any, { id?: string }>(
  "dashboard/getVideoLectureChart",
  async ({ id = "month" } = {}, { rejectWithValue }) => {
    try {
      const res = await fetchAdminDashboardVideoGraph(id);
      return extractArray(res);
    } catch (err: any) {
      return rejectWithValue(err?.message || "Failed to fetch video watch data");
    }
  }
);

// Graph API 4: Student Orders Chart (week, month, year)
export const getStudentOrderChart = createAsyncThunk<any, { id?: string }>(
  "dashboard/getStudentOrderChart",
  async ({ id = "week" } = {}, { rejectWithValue }) => {
    try {
      const res = await fetchAdminDashboardOrderGraph(id);
      return extractArray(res);
    } catch (err: any) {
      return rejectWithValue(err?.message || "Failed to fetch order data");
    }
  }
);

// Practice Test Chart (week, month, year)
export const getPracticeTestChart = createAsyncThunk<any, { id?: string }>(
  "dashboard/getPracticeTestChart",
  async ({ id = "week" } = {}, { rejectWithValue }) => {
    try {
      const res = await fetchPracticeChart(id);
      return extractArray(res);
    } catch (err: any) {
      return rejectWithValue(err?.message || "Failed to fetch practice tests");
    }
  }
);

// Corporate Admin Chart (week, month, year)
export const getCorporateAdminChart = createAsyncThunk<any, { id?: string }>(
  "dashboard/getCorporateAdminChart",
  async ({ id = "month" } = {}, { rejectWithValue }) => {
    try {
      const res = await fetchAdminDashboardCorporateAdminGraph(id);
      return extractArray(res);
    } catch (err: any) {
      return rejectWithValue(err?.message || "Failed to fetch corporate admin data");
    }
  }
);

export const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboardState: (state) => {
      state.counters = null;
      state.studentsGraph = [];
      state.revenueGraph = [];
      state.videoGraph = [];
      state.orderGraph = [];
      state.corporateAdminGraph = [];
      state.practiceGraph = [];
      state.recentCorporateAdmins = [];
      state.recentStudents = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard Summary Initial
      .addCase(getDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.counters = action.payload.counters;
        state.studentsGraph = action.payload.studentsGraph;
        state.revenueGraph = action.payload.revenueGraph;
        state.videoGraph = action.payload.videoGraph;
        state.orderGraph = action.payload.orderGraph;
        state.corporateAdminGraph = action.payload.corporateAdminGraph;
        state.recentCorporateAdmins = action.payload.recentCorporateAdmins;
        state.recentStudents = action.payload.recentStudents;
      })
      .addCase(getDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Recent Corporate Admins
      .addCase(getRecentCorporateAdmins.pending, (state) => {
        state.loadingRecentCorporateAdmins = true;
      })
      .addCase(getRecentCorporateAdmins.fulfilled, (state, action) => {
        state.loadingRecentCorporateAdmins = false;
        state.recentCorporateAdmins = action.payload;
      })
      .addCase(getRecentCorporateAdmins.rejected, (state) => {
        state.loadingRecentCorporateAdmins = false;
      })

      // Recent Students
      .addCase(getRecentStudents.pending, (state) => {
        state.loadingRecentStudents = true;
      })
      .addCase(getRecentStudents.fulfilled, (state, action) => {
        state.loadingRecentStudents = false;
        state.recentStudents = action.payload;
      })
      .addCase(getRecentStudents.rejected, (state) => {
        state.loadingRecentStudents = false;
      })

      // Graph API 1: Student Registrations
      .addCase(getStudentRegistrationChart.pending, (state) => {
        state.loadingStudentsChart = true;
      })
      .addCase(getStudentRegistrationChart.fulfilled, (state, action) => {
        state.loadingStudentsChart = false;
        state.studentsGraph = action.payload;
      })
      .addCase(getStudentRegistrationChart.rejected, (state) => {
        state.loadingStudentsChart = false;
      })

      // Graph API 2: Revenue
      .addCase(getRevenueChart.pending, (state) => {
        state.loadingRevenueChart = true;
      })
      .addCase(getRevenueChart.fulfilled, (state, action) => {
        state.loadingRevenueChart = false;
        state.revenueGraph = action.payload;
      })
      .addCase(getRevenueChart.rejected, (state) => {
        state.loadingRevenueChart = false;
      })

      // Graph API 3: Video Watch
      .addCase(getVideoLectureChart.pending, (state) => {
        state.loadingVideoChart = true;
      })
      .addCase(getVideoLectureChart.fulfilled, (state, action) => {
        state.loadingVideoChart = false;
        state.videoGraph = action.payload;
      })
      .addCase(getVideoLectureChart.rejected, (state) => {
        state.loadingVideoChart = false;
      })

      // Graph API 4: Student Orders
      .addCase(getStudentOrderChart.pending, (state) => {
        state.loadingOrderChart = true;
      })
      .addCase(getStudentOrderChart.fulfilled, (state, action) => {
        state.loadingOrderChart = false;
        state.orderGraph = action.payload;
      })
      .addCase(getStudentOrderChart.rejected, (state) => {
        state.loadingOrderChart = false;
      })

      // Practice Test
      .addCase(getPracticeTestChart.pending, (state) => {
        state.loadingPracticeChart = true;
      })
      .addCase(getPracticeTestChart.fulfilled, (state, action) => {
        state.loadingPracticeChart = false;
        state.practiceGraph = action.payload;
      })
      .addCase(getPracticeTestChart.rejected, (state) => {
        state.loadingPracticeChart = false;
      })

      // Graph API 6: Corporate Admins
      .addCase(getCorporateAdminChart.pending, (state) => {
        state.loadingCorporateAdminChart = true;
      })
      .addCase(getCorporateAdminChart.fulfilled, (state, action) => {
        state.loadingCorporateAdminChart = false;
        state.corporateAdminGraph = action.payload;
      })
      .addCase(getCorporateAdminChart.rejected, (state) => {
        state.loadingCorporateAdminChart = false;
      });
  },
});

export const { clearDashboardState } = dashboardSlice.actions;
export default dashboardSlice.reducer;
