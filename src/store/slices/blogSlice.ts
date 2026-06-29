import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { Blog, Pagination } from "../../utils/types";
import {
  addBlogPostApi,
  deleteBlogPostApi,
  fetchBlogPostApi,
  updateBlogPostApi,
  updateBlogStatusApi
} from "../../services/apiServices";

interface BlogState extends Pagination<Blog> { }

const initialState: BlogState = {
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

export const getBlogs = createAsyncThunk<
  Pagination<Blog>,
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
  "blog/getBlogs",
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
      return await fetchBlogPostApi(
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
      return rejectWithValue(err?.message || "Failed to fetch blogs");
    }
  }
);

export const addBlog = createAsyncThunk<Blog, any, { rejectValue: string }>(
  "blog/addBlog",
  async (formData, { rejectWithValue }) => {
    try {
      const data = await addBlogPostApi(formData);
      return data?.data ? data.data : data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create blog");
    }
  }
);

export const editBlog = createAsyncThunk<
  Blog,
  { id: number | string; blogData: any },
  { rejectValue: string }
>(
  "blog/editBlog",
  async ({ id, blogData }, { rejectWithValue }) => {
    try {
      const data = await updateBlogPostApi(id, blogData);
      return data.data ? data.data : data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update blog");
    }
  }
);

export const deleteBlog = createAsyncThunk<
  number | string,
  number | string,
  { rejectValue: string }
>("blog/deleteBlog", async (id, { rejectWithValue }) => {
  try {
    await deleteBlogPostApi(id);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to delete blog");
  }
});

export const updateBlogStatus = createAsyncThunk<
  { id: number | string; status: boolean },
  { id: number | string; status: boolean },
  { rejectValue: string }
>("blog/updateBlogStatus", async ({ id, status }, { rejectWithValue }) => {
  try {
    await updateBlogStatusApi(id, { status });
    return { id, status };
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to update status");
  }
});

const blogSlice = createSlice({
  name: "blog",
  initialState,
  reducers: {
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    removeBlog: (state, action: PayloadAction<number | string>) => {
      state.data = state.data.filter((item) => item.id !== action.payload);
    },
    statusBlog: (state, action: PayloadAction<number | string>) => {
      state.data = state.data.map((item) =>
        item.id.toString() === action.payload.toString()
          ? { ...item, status: !item.status }
          : item
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBlogs.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addBlog.fulfilled, (state, action) => {
        state.loading = false;
        state.data.unshift(action.payload);
      })
      .addCase(editBlog.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.map((item) =>
          item.id === action.payload.id ? action.payload : item
        );
      })
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.filter((item) => item.id !== action.payload);
      })
      .addCase(updateBlogStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.map((item) =>
          item.id.toString() === action.payload.id.toString()
            ? { ...item, status: action.payload.status }
            : item
        );
      });
  },
});

export const { setPage, removeBlog, statusBlog } = blogSlice.actions;

export default blogSlice.reducer;