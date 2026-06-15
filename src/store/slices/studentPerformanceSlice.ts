import { createAsyncThunk, createSlice, } from "@reduxjs/toolkit";
import type { Pagination, StudentPerformance } from "../../utils/types";

interface StudentPerformanceState extends Pagination<StudentPerformance> {}

const initialState: StudentPerformanceState = {
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

import { fetchStudentPerformanceApi } from "../../services/apiServices";

export const getStudentPerformance = createAsyncThunk<
  Pagination<StudentPerformance>, { page?: number; search?: string; first_name?: string; last_name?: string; email?: string; ordering?: string; category?: string; startDate?: string; endDate?: string }
>(
  "studentPerformance/getStudentPerformance",
  async (
    { page = 1, search = "", first_name = "", last_name = "", email = "", ordering = "", category = "", startDate = "", endDate = "" },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetchStudentPerformanceApi(page, search, first_name, last_name, email, ordering, category, startDate, endDate);
      return response as Pagination<StudentPerformance>;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Something went wrong");
    }
  }
)

export const studentPerformanceSlice = createSlice({
    name: "studentPerformance",
    initialState,
    reducers: {
        setPage(state, action) {
            state.page = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(getStudentPerformance.pending, (state) => {
            state.loading = true
        })
        .addCase(getStudentPerformance.fulfilled, (state, action) => {
            state.loading = false
            state.data = action.payload.data
            state.pagination = action.payload.pagination
        })
        .addCase(getStudentPerformance.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload as string
        })
    }
})


export const { setPage } = studentPerformanceSlice.actions;
export default studentPerformanceSlice.reducer;
