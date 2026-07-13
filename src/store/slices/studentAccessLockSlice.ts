import { createAsyncThunk, createSlice, } from "@reduxjs/toolkit";
import type { Pagination } from "../../utils/types";
import { fetchStudentAccessLockReportApi } from "../../services/apiServices";

interface StudentAccessLockState extends Pagination<any> {}

const initialState: StudentAccessLockState = {
  data: [],
  count: 0,
  pagination: {
    total_results: null,
    total_pages: null,
    current_page: null,
    next_page: null,
    page_size: null,
    previous_page: null
  },
  next: null,
  previous: null,
  page: 1,
  loading: false,
  error: null,
}


export const getStudentAccessLockReport = createAsyncThunk<
  Pagination<any>, { page?: number; search?: string; first_name?: string; last_name?: string; email?: string; ordering?: string; category?: string; startDate?: string; endDate?: string, status?: string }
>(
  "studentAccessLock/getStudentAccessLockReport",
  async (
    { page = 1, search = "", first_name = "", last_name = "", email = "", ordering = "", status = "", startDate = "", endDate = "" },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetchStudentAccessLockReportApi(page, search, first_name, last_name, email, ordering, status, startDate, endDate);
      return response as Pagination<any>;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Something went wrong");
    }
  }
)

export const studentAccessLockSlice = createSlice({
    name: "studentAccessLock",
    initialState,
    reducers: {
        setPage(state, action) {
            state.page = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(getStudentAccessLockReport.pending, (state) => {
            state.loading = true
        })
        .addCase(getStudentAccessLockReport.fulfilled, (state, action) => {
            state.loading = false
            state.data = action.payload.data
            state.pagination = action.payload.pagination
        })
        .addCase(getStudentAccessLockReport.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload as string
        })
    }
})


export const { setPage } = studentAccessLockSlice.actions;
export default studentAccessLockSlice.reducer;
