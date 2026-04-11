import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Faq, Pagination } from "../../utils/types";
import { fetchFaqApi, addFaqApi, updateFaqApi, deleteFaqApi, updateFaqStatusApi } from "../../services/apiServices";

interface faqState extends Pagination<Faq>{}


const initialState:faqState={
    data:[],
    next:null,
    previous:null,
    page:1,
    pagination:{
        total_results:null,
        total_pages:null,
        current_page:null,
        next_page:null,
        page_size:null,
        previous_page:null,
    },
    loading:false,
    error:null
}

export const getFaq = createAsyncThunk<Pagination<Faq>,{ page?: number;search?: string;title?: string;ordering?: string;description?: string;start_date?: string;end_date?: string;status?: string;}>(
  "faq/getFaq",
  async (
    { page = 1, title = "",description = "",search = "",ordering = "",start_date = "",end_date = "",status = "",},{ rejectWithValue }) => {
    try {
      return await fetchFaqApi(page,search,title,description,ordering,start_date,end_date,status);
    } catch (err: any) {
      return rejectWithValue(err?.message || "Failed to fetch FAQ");
    }
  }
);

export const addFaq = createAsyncThunk<Faq, any, { rejectValue: string }>(
    "faq/addFaq",
    async (faqData, { rejectWithValue }) => {
        try {
            const data = await addFaqApi(faqData);
            return data?.data ? data.data : data;
        } catch (error: any) {
            return rejectWithValue(error?.message || "Failed to add the Faq");
        }
    }
);

export const updateFaq = createAsyncThunk<Faq, { id: number | string, payload: any }, { rejectValue: string }>(
    "faq/updateFaq",
    async ({ id, payload }, { rejectWithValue }) => {
        try {
            const data = await updateFaqApi(id, payload);
            return data?.data ? data.data : data;
        } catch (error: any) {
            return rejectWithValue(error?.message || "Failed to update the Faq");
        }
    }
);

export const deleteFaq = createAsyncThunk<number | string, number | string, { rejectValue: string }>(
    "faq/deleteFaq",
    async (id, { rejectWithValue }) => {
        try {
            await deleteFaqApi(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error?.message || "Failed to delete the Faq");
        }
    }
);

export const updateFaqStatus = createAsyncThunk<{ id: number | string, status: boolean }, { id: number | string, status: boolean }, { rejectValue: string }>(
    "faq/updateFaqStatus",
    async ({ id, status }, { rejectWithValue }) => {
        try {
            await updateFaqStatusApi(id, { status });
            return { id, status };
        } catch (error: any) {
            return rejectWithValue(error?.message || "Failed to update status");
        }
    }
);

const FaqSlice = createSlice({
    name: 'faq',
    initialState,
    reducers: {
        setPage(state, action: PayloadAction<number>) {
            state.page = action.payload;
        },
        removeFaq(state, action: PayloadAction<number | string>) {
            state.data = state.data.filter((item) => item.id !== action.payload);
        },
        statusFaq(state, action: PayloadAction<number | string>) {
            state.data = state.data.map((item) =>
                item.id.toString() === action.payload.toString()
                    ? { ...item, status: !item.status }
                    : item
            );
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getFaq.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getFaq.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(getFaq.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(addFaq.fulfilled, (state, action) => {
                state.loading = false;
                state.data.unshift(action.payload);
            })
            .addCase(updateFaq.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.map((item) =>
                    item.id === action.payload.id ? action.payload : item
                );
            })
            .addCase(deleteFaq.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.filter((item) => item.id !== action.payload);
            })
            .addCase(updateFaqStatus.fulfilled, (state, action) => {
                state.data = state.data.map((item) =>
                    item.id.toString() === action.payload.id.toString()
                        ? { ...item, status: action.payload.status }
                        : item
                );
            });
    }
});

export const { setPage, removeFaq, statusFaq } = FaqSlice.actions;
export default FaqSlice.reducer;