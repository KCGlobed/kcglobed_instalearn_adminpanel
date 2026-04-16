// src/store/slices/mcqSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { Mcq, Pagination } from "../../utils/types";
import { createMcq, fetchMcq, updateMcqApi, updateMcqStatusApi } from "../../services/apiServices";

interface McqState extends Pagination<Mcq> { }

const initialState: McqState = {
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

// Async thunk to fetch paginated MCQ data
export const getMcq = createAsyncThunk<Pagination<Mcq>, { page?: number; search?: string; id_number?: string; ordering?: string; status?: string; startDate?: string; endDate?: string }>(
    "mcq/getMcq",
    async ({ page = 1, search = "", id_number = "", ordering = "", status = "", startDate = "", endDate = "" }, { rejectWithValue }) => {
        try {
            return await fetchMcq(page, search, id_number, ordering, status, startDate, endDate);
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to fetch MCQs");
        }
    }
);

export const addMcq = createAsyncThunk<Mcq, any, { rejectValue: string }>(
    "mcq/addMcq",
    async (mcqData, { rejectWithValue }) => {
        try {
            const data = await createMcq(mcqData);
            // the API response might be direct object or wrapped in `data`
            return data?.data ? data.data : data;
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to create MCQ");
        }
    }
);

export const editMcq = createAsyncThunk<Mcq, any, { rejectValue: string }>(
    "mcq/editMcq",
    async ({ id, mcqData }, { rejectWithValue }) => {
        try {
            const data = await updateMcqApi(id, mcqData);
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to edit MCQ");
        }
    }
);

export const updateMcqStatus = createAsyncThunk<Mcq, any, { rejectValue: string }>(
    "mcq/updateMcqStatus",
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const data = await updateMcqStatusApi(id, { status });
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to update MCQ status");
        }
    }
);

const mcqSlice = createSlice({
    name: "mcq",
    initialState,
    reducers: {
        setPage(state, action: PayloadAction<number>) {
            state.page = action.payload;
        },
        removeMcq: (state, action: PayloadAction<number | string>) => {
            state.data = state.data.filter((item) => item.id.toString() !== action.payload.toString());
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getMcq.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getMcq.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(getMcq.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(addMcq.fulfilled, (state, action) => {
                state.loading = false;
                state.data.unshift(action.payload);
            })
            .addCase(editMcq.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.map(item => item.id === action.payload.id ? action.payload : item);
            })
            .addCase(updateMcqStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.map(item => item.id === action.payload.id ? action.payload : item);
            });
    },
});

export const { setPage, removeMcq } = mcqSlice.actions;

export default mcqSlice.reducer;
