import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { LegalPage, Pagination } from "../../utils/types";
import {
  addLegalPageApi,
  deleteLegalPageApi,
  fetchLegalPagesApi,
  updateLegalPageApi,
  updateLegalPageStatusApi
} from "../../services/apiServices";

interface LegalPageState extends Pagination<LegalPage> { }

const initialState: LegalPageState = {
  data: [],
  next: null,
  pagination: {
    total_results: null,
    total_pages: null,
    current_page: null,
    next_page: null,
    page_size: null,
    previous_page: null,
  },
  previous: null,
  page: 1,
  loading: false,
  error: null,
};

export const getLegalPages = createAsyncThunk<
  Pagination<LegalPage>,
  {
    page?: number;
    search?: string;
    title?: string;
    page_type?: string;
    ordering?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }
>(
  "legalPage/getLegalPages",
  async (
    {
      page = 1,
      search = "",
      title = "",
      page_type = "",
      ordering = "",
      status = "",
      startDate = "",
      endDate = "",
    },
    { rejectWithValue }
  ) => {
    try {
      return await fetchLegalPagesApi(
        page,
        search,
        title,
        page_type,
        ordering,
        status,
        startDate,
        endDate
      );
    } catch (err: any) {
      return rejectWithValue(err?.message || "Failed to fetch legal pages");
    }
  }
);

export const addLegalPage = createAsyncThunk<LegalPage, any, { rejectValue: string }>(
  "legalPage/addLegalPage",
  async (formData, { rejectWithValue }) => {
    try {
      const data = await addLegalPageApi(formData);
      return data?.data ? data.data : data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create legal page");
    }
  }
);

export const editLegalPage = createAsyncThunk<
  LegalPage,
  { id: number | string; pageData: any },
  { rejectValue: string }
>(
  "legalPage/editLegalPage",
  async ({ id, pageData }, { rejectWithValue }) => {
    try {
      const data = await updateLegalPageApi(id, pageData);
      return data.data ? data.data : data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update legal page");
    }
  }
);

export const deleteLegalPage = createAsyncThunk<
  number | string,
  number | string,
  { rejectValue: string }
>("legalPage/deleteLegalPage", async (id, { rejectWithValue }) => {
  try {
    await deleteLegalPageApi(id);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to delete legal page");
  }
});

export const updateLegalPageStatus = createAsyncThunk<
  { id: number | string; status: boolean },
  { id: number | string; status: boolean },
  { rejectValue: string }
>("legalPage/updateLegalPageStatus", async ({ id, status }, { rejectWithValue }) => {
  try {
    await updateLegalPageStatusApi(id, { status });
    return { id, status };
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to update status");
  }
});

const legalPageSlice = createSlice({
  name: "legalPage",
  initialState,
  reducers: {
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    removeLegalPage: (state, action: PayloadAction<number | string>) => {
      state.data = state.data.filter((item) => item.id !== action.payload);
    },
    statusLegalPage: (state, action: PayloadAction<number | string>) => {
      state.data = state.data.map((item) =>
        item.id.toString() === action.payload.toString()
          ? { ...item, status: !item.status }
          : item
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getLegalPages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLegalPages.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getLegalPages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addLegalPage.fulfilled, (state, action) => {
        state.loading = false;
        state.data.unshift(action.payload);
      })
      .addCase(editLegalPage.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.map((item) =>
          item.id === action.payload.id ? action.payload : item
        );
      })
      .addCase(deleteLegalPage.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.filter((item) => item.id !== action.payload);
      })
      .addCase(updateLegalPageStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.map((item) =>
          item.id.toString() === action.payload.id.toString()
            ? { ...item, status: action.payload.status }
            : item
        );
      });
  },
});

export const { setPage, removeLegalPage, statusLegalPage } = legalPageSlice.actions;

export default legalPageSlice.reducer;
