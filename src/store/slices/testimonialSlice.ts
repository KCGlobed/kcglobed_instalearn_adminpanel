import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { Pagination, Testimonials } from "../../utils/types";
import { 
  fetchTestimonialsApi, 
  createTestimonialsApi,
  updateTestimonialsApi,
  deleteTestimonialsApi,
  updateTestimonialStatusApi
} from "../../services/apiServices";

interface testimonialState extends Pagination<Testimonials> { }

const initialState : testimonialState = {
    data: [],
    pagination: {
        total_results: null,
        total_pages: null,
        current_page: null,
        next_page: null,
        page_size: null,
        previous_page: null,
    },
    previous: null,
    next: null,
    page: 1,
    loading: false,
    error: null,
}

export const getTestimonials = createAsyncThunk<
  Pagination<Testimonials>,
  {
    page?: number;
    search?: string;
    name?: string;
    testimonials_type?: string;
    ordering?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }
>(
  "testimonial/getTestimonials",
  async (
    { page = 1, search = "", name = "", testimonials_type = "", ordering = "", status = "", startDate = "", endDate = "",
    },
    { rejectWithValue }
  ) => {
    try {
      return await fetchTestimonialsApi(
        page,
        search,
        name,
        testimonials_type,
        ordering,
        status,
        startDate,
        endDate
      );
    } catch (err: any) {
      return rejectWithValue(err?.message || "Failed to fetch testimonials");
    }
  }
);

export const addTestimonial = createAsyncThunk<Testimonials, any, { rejectValue: string }>(
  "testimonial/addTestimonial",
  async (formData, { rejectWithValue }) => {
    try {
      const data = await createTestimonialsApi(formData);
      return data?.data ? data.data : data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create testimonial");
    }
  }
);

export const editTestimonial = createAsyncThunk<
  Testimonials,
  { id: number | string; testimonialData: any },
  { rejectValue: string }
>(
  "testimonial/editTestimonial",
  async ({ id, testimonialData }, { rejectWithValue }) => {
    try {
      const data = await updateTestimonialsApi(id, testimonialData);
      return data.data ? data.data : data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update testimonial");
    }
  }
);

export const deleteTestimonial = createAsyncThunk<
  number | string,
  number | string,
  { rejectValue: string }
>("testimonial/deleteTestimonial", async (id, { rejectWithValue }) => {
  try {
    await deleteTestimonialsApi(id);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to delete testimonial");
  }
});

export const updateTestimonialStatus = createAsyncThunk<
  { id: number | string; status: boolean },
  { id: number | string; status: boolean },
  { rejectValue: string }
>("testimonial/updateTestimonialStatus", async ({ id, status }, { rejectWithValue }) => {
  try {
    await updateTestimonialStatusApi(id, { status });
    return { id, status };
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to update status");
  }
});

const testimonialSlice = createSlice({
    name: "testimonial",
    initialState,
    reducers: {
        setPage(state, action: PayloadAction<number>) {
            state.page = action.payload;
        },
        removeTestimonial: (state, action: PayloadAction<number | string>) => {
            state.data = state.data.filter((item) => item.id !== action.payload);
        },
        statusTestimonial: (state, action: PayloadAction<number | string>) => {
            state.data = state.data.map((item) =>
                item.id.toString() === action.payload.toString()
                    ? { ...item, status: !item.status }
                    : item
            );
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getTestimonials.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getTestimonials.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload && action.payload.data) {
                    state.data = action.payload.data;
                    state.pagination = action.payload.pagination;
                } else {
                     // In case the API returns the array directly, depending on formatting
                     state.data = action.payload as any;
                }
            })
            .addCase(getTestimonials.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(addTestimonial.fulfilled, (state, action) => {
                state.loading = false;
                state.data.unshift(action.payload);
            })
            .addCase(editTestimonial.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.map((item) =>
                  item.id === action.payload.id ? action.payload : item
                );
            })
            .addCase(deleteTestimonial.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.filter((item) => item.id !== action.payload);
            })
            .addCase(updateTestimonialStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.map((item) =>
                  item.id.toString() === action.payload.id.toString()
                    ? { ...item, status: action.payload.status }
                    : item
                );
            });
    },
});

export const { setPage, removeTestimonial, statusTestimonial } = testimonialSlice.actions;

export default testimonialSlice.reducer;
