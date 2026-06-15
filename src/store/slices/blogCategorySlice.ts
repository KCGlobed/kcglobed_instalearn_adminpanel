// src/store/slices/blogCategorySlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { BlogCategory, Pagination } from "../../utils/types";
import {
  addBlogCategoryApi,
  deleteBlogCategoryApi,
  fetchBlogCategoryApi,
  updateBlogCategoryApi,
  updateBlogCategoryStatusApi,
} from "../../services/apiServices";

interface BlogCategoryState extends Pagination<BlogCategory> {}

const initialState: BlogCategoryState = {
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

export const getBlogCategories = createAsyncThunk<
  Pagination<BlogCategory>,
  {
    page?: number;
    search?: string;
    title?: string;
    description?: string;
    ordering?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }
>(
  "blogCategory/getBlogCategories",
  async (
    {
      page = 1,
      search = "",
      title = "",
      description = "",
      ordering = "",
      status = "",
      startDate = "",
      endDate = "",
    },
    { rejectWithValue }
  ) => {
    try {
      return await fetchBlogCategoryApi(
        page,
        search,
        title,
        description,
        ordering,
        status,
        startDate,
        endDate
      );
    } catch (err: any) {
      return rejectWithValue(err?.message || "Failed to fetch blog categories");
    }
  }
);

export const addBlogCategory = createAsyncThunk<BlogCategory, any, { rejectValue: string }>(
  "blogCategory/addBlogCategory",
  async (formData, { rejectWithValue }) => {
    try {
      const data = await addBlogCategoryApi(formData);
      return data?.data ? data.data : data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create blog category");
    }
  }
);

export const editBlogCategory = createAsyncThunk<
  BlogCategory,
  { id: number | string; categoryData: any },
  { rejectValue: string }
>(
  "blogCategory/editBlogCategory",
  async ({ id, categoryData }, { rejectWithValue }) => {
    try {
      const data = await updateBlogCategoryApi(id, categoryData);
      return data.data ? data.data : data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update blog category");
    }
  }
);

export const deleteBlogCategory = createAsyncThunk<
  number | string,
  number | string,
  { rejectValue: string }
>("blogCategory/deleteBlogCategory", async (id, { rejectWithValue }) => {
  try {
    await deleteBlogCategoryApi(id);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to delete blog category");
  }
});

export const updateBlogCategoryStatus = createAsyncThunk<
  { id: number | string; status: boolean },
  { id: number | string; status: boolean },
  { rejectValue: string }
>("blogCategory/updateBlogCategoryStatus", async ({ id, status }, { rejectWithValue }) => {
  try {
    await updateBlogCategoryStatusApi(id, { status });
    return { id, status };
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to update status");
  }
});

const blogCategorySlice = createSlice({
  name: "blogCategory",
  initialState,
  reducers: {
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    removeBlogCategory: (state, action: PayloadAction<number | string>) => {
      state.data = state.data.filter((item) => item.id !== action.payload);
    },
    statusBlogCategory: (state, action: PayloadAction<number | string>) => {
      state.data = state.data.map((item) =>
        item.id.toString() === action.payload.toString()
          ? { ...item, status: !item.status }
          : item
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBlogCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBlogCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getBlogCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addBlogCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.data.unshift(action.payload);
      })
      .addCase(editBlogCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.map((item) =>
          item.id === action.payload.id ? action.payload : item
        );
      })
      .addCase(deleteBlogCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.filter((item) => item.id !== action.payload);
      })
      .addCase(updateBlogCategoryStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.map((item) =>
          item.id.toString() === action.payload.id.toString()
            ? { ...item, status: action.payload.status }
            : item
        );
      });
  },
});

export const { setPage, removeBlogCategory, statusBlogCategory } = blogCategorySlice.actions;

export default blogCategorySlice.reducer;
