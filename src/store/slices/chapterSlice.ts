// src/store/slices/chapterSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction, } from "@reduxjs/toolkit";
import type { Chapter, Pagination } from "../../utils/types";
import { createChapter, fetchChapterViewData, getChapterApi, updateChapterApi, updateChapterStatusApi } from "../../services/apiServices";

interface ChapterState extends Pagination<Chapter> { }

const initialState: ChapterState = {
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

// Async thunk to fetch paginated chapter data
export const getChapter = createAsyncThunk<Pagination<Chapter>, { page?: number; search?: string; name?: string; description?: string; ordering?: string; status?: string; start_date?: string; end_date?: string }>(
    "chapter/getChapter",
    async ({ page = 1, search = "", name = "", description = "", ordering = "", status = "", start_date = "", end_date = "" }, { rejectWithValue }) => {
        try {
            return await getChapterApi(page, search, name, description, ordering, status, start_date, end_date);
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to fetch chapters");
        }
    }
);

export const addChapter = createAsyncThunk<Chapter, any, { rejectValue: string }>(
    "chapter/addChapter",
    async (chapterData, { rejectWithValue }) => {
        try {
            const data = await createChapter(chapterData);
            return data?.data ? data.data : data;

        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to create chapter");
        }
    }
);

export const updateChapter = createAsyncThunk<Chapter, any, { rejectValue: string }>(
    "chapter/updateChapter",
    async ({ id, chapterData }, { rejectWithValue }) => {
        try {
            const data = await updateChapterApi(id, chapterData);
            return data.data;

        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to fetch chapters");
        }
    }
);

export const updateChapterStatus = createAsyncThunk<Chapter, any, { rejectValue: string }>
    ("chapter/updateChapterStatus",
        async ({ id, status }, { rejectWithValue }) => {
            try {
                const data = await updateChapterStatusApi(id, { status });
                return data.data;
            } catch (error: any) {
                return rejectWithValue(error.message || "Failed to update chapter status");
            }
        }
    );


const chapterSlice = createSlice({
    name: "chapter",
    initialState,
    reducers: {
        setPage(state, action) {
            state.page = action.payload;
        },
        removeChapter: (state, action: PayloadAction<Number | string>) => {
            state.data = state.data.filter((item) => item.id !== action.payload);
        },
        statusChapter: (state, action: PayloadAction<number | string>) => {
            state.data = state.data.map((item) =>
                item.id.toString() === action.payload.toString()
                    ? { ...item, status: !item.status }
                    : item
            );
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getChapter.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getChapter.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination
            })
            .addCase(getChapter.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(addChapter.fulfilled, (state, action) => {
                state.loading = false;
                state.data.unshift(action.payload);
            })
            .addCase(updateChapter.fulfilled, (state, action) => {
                state.loading = false;
                const updatedId = action.payload?.id || action.meta.arg.id;
                state.data = state.data.map(item => item.id == updatedId ? { ...item, ...action.payload } : item);
            })
            .addCase(updateChapterStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.map(item => item.id == action.meta.arg.id ? { ...item, status: action.meta.arg.status, ...action.payload } : item);
            })
    },
});

export const { setPage, removeChapter, statusChapter } = chapterSlice.actions;

export default chapterSlice.reducer;