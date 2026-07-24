import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CorporateAdmin, Pagination } from "../../utils/types";
import { fetchCorporateAdminsApi, createCorporateAdminApi, updateCorporateAdminApi, updateCorporateAdminStatusApi } from "../../services/apiServices";

interface CoAdmin extends Pagination<CorporateAdmin> {}

const initialState: CoAdmin = {
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

export const getCorporateAdmins = createAsyncThunk<
  Pagination<CorporateAdmin>, { page?: number; search?: string; first_name?: string; last_name?: string; email?: string; ordering?: string; status?: string; startDate?: string; endDate?: string }
>(
  "corporateAdmin/getCorporateAdmins",
  async (
    { page = 1, search = "", first_name = "", last_name = "", email = "", ordering = "", status = "", startDate = "", endDate = "" },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetchCorporateAdminsApi(page, search, first_name, last_name, email, ordering, status, startDate, endDate);
      return response as Pagination<CorporateAdmin>;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Something went wrong");
    }
  }
)

export const addCorporateAdmin = createAsyncThunk<CorporateAdmin, any, { rejectValue: string }>(
    "corporateAdmin/addCorporateAdmin",
    async (adminData, { rejectWithValue }) => {
        try {
            const data = await createCorporateAdminApi(adminData);
            return data?.data ? data.data : data;
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to create corporate admin");
        }
    }
);

export const editCorporateAdmin = createAsyncThunk<CorporateAdmin, any, { rejectValue: string }>(
    "corporateAdmin/editCorporateAdmin",
    async ({ id, adminData }, { rejectWithValue }) => {
        try {
            const data = await updateCorporateAdminApi(id, adminData);
            return data?.data ? data.data : data;
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to edit corporate admin");
        }
    }
);

export const updateCorporateAdminStatus = createAsyncThunk(
  "corporateAdmin/updateCorporateAdminStatus",
  async ({ id, status }: { id: string | number; status: boolean }, { rejectWithValue }) => {
    try {
      await updateCorporateAdminStatusApi(id, { status: status ? 1 : 0 });
      return { id, status };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update status");
    }
  }
);

export const corporateAdminSlice = createSlice({
  name: "corporateAdmin",
  initialState,
  reducers: {
    setPage(state, action) {
      state.page = action.payload;
    },
    removeCorporateAdmin: (state, action: PayloadAction<number | string>) => {
      state.data = state.data.filter((item) => item.id !== action.payload);
    },
    StatusCorporateAdmin: (state, action: PayloadAction<number | string>) => {
        state.data = state.data.map((item) =>
            item.id.toString() === action.payload.toString()
                ? { ...item, is_active: !item.is_active }
                : item
        );
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCorporateAdmins.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCorporateAdmins.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload.data
        state.pagination = action.payload.pagination
      })
      .addCase(getCorporateAdmins.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(addCorporateAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.data.unshift(action.payload);
      })
      .addCase(editCorporateAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.map(item => item.id == action.payload.id ? action.payload : item);
      })
      .addCase(updateCorporateAdminStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.data.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.data[index].is_active = action.payload.status;
        }
      })
  }
})

export const { setPage, removeCorporateAdmin, StatusCorporateAdmin } = corporateAdminSlice.actions;
export default corporateAdminSlice.reducer;
