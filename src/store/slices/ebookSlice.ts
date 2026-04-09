import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { Ebook, Pagination } from "../../utils/types";
import { createEbook, fetchEbook, updateEbookApi, updateEbookStatusApi } from "../../services/apiServices";

interface EbookState extends Pagination<Ebook> { }

const initialState: EbookState = {
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

// Async thunk to fetch paginated ebook data
export const getEbooks = createAsyncThunk<Pagination<Ebook>, { page?: number; search?: string; name?: string; ordering?: string; status?: string; startDate?: string; endDate?: string }>(
    "ebook/getEbooks",
    async ({ page = 1, search = "", name = "", ordering = "", status = "", startDate = "", endDate = "" }, { rejectWithValue }) => {
        try {
            return await fetchEbook(page, search, name, ordering, status, startDate, endDate);
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to fetch ebooks");
        }
    }
);

export const addEbook = createAsyncThunk<Ebook, any, { rejectValue: string }>(
    "ebook/addEbook",
    async (ebookData, { rejectWithValue }) => {
        try {
            const data = await createEbook(ebookData);
            return data?.data ? data.data : data;
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to create ebook");
        }
    }
);

export const editEbook = createAsyncThunk<Ebook, any, { rejectValue: string }>(
    "ebook/editEbook",
    async ({ id, ebookData }, { rejectWithValue }) => {
        try {
            const data = await updateEbookApi(id, ebookData);
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to update ebook");
        }
    }
);

export const updateEbookStatus = createAsyncThunk<Ebook, any, { rejectValue: string }>(
    "ebook/updateEbookStatus",
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const data = await updateEbookStatusApi(id, { status });
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to update ebook status");
        }
    }
);

const ebookSlice = createSlice({
    name: "ebook",
    initialState,
    reducers: {
        setPage(state, action: PayloadAction<number>) {
            state.page = action.payload;
        },
        removeEbook: (state, action: PayloadAction<number | string>) => {
            state.data = state.data.filter((item) => item.id !== action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getEbooks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getEbooks.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(getEbooks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(addEbook.fulfilled, (state, action) => {
                state.loading = false;
                state.data.unshift(action.payload);
            })
            .addCase(editEbook.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.map(item => item.id == action.payload.id ? action.payload : item);
            })
            .addCase(updateEbookStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.map(item => item.id == action.payload.id ? action.payload : item);
            });
    },
});

export const { setPage, removeEbook } = ebookSlice.actions;
export default ebookSlice.reducer;