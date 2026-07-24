import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { CorporateSubcription, Pagination } from "../../utils/types";
import { fetchCoAdminSubscriptionsApi } from "../../services/apiServices";

interface AdminSubcription extends Pagination<CorporateSubcription> {}

const initialState: AdminSubcription = {
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

export const getCoAdminSubscriptions = createAsyncThunk<
  Pagination<CorporateSubcription>, { page?: number; search?: string; first_name?: string; last_name?: string; email?: string; ordering?: string; status?: string; startDate?: string; endDate?: string }
>(
  "coAdminSubscription/getCoAdminSubscriptions",
  async (
    { page = 1, search = "", first_name = "", last_name = "", email = "", ordering = "", status = "", startDate = "", endDate = "" },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetchCoAdminSubscriptionsApi(page, search, first_name, last_name, email, ordering, status, startDate, endDate);
      return response as Pagination<CorporateSubcription>;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Something went wrong");
    }
  }
)

export const CoAdminSubscriptionSlice = createSlice({
  name: "CoAdminSubscription",
  initialState,
  reducers: {
    setPage(state, action) {
      state.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCoAdminSubscriptions.pending, (state) => {
        state.loading = true
      })
      .addCase(getCoAdminSubscriptions.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload.data
        state.pagination = action.payload.pagination
      })
      .addCase(getCoAdminSubscriptions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const { setPage } = CoAdminSubscriptionSlice.actions;
export default CoAdminSubscriptionSlice.reducer;
