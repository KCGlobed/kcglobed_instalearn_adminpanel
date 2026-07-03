import { createSlice, createAsyncThunk, type PayloadAction, } from "@reduxjs/toolkit";
import type { supportArticle, Pagination } from "../../utils/types";
import { createSupportArticle, fetchSupportArticle, updateSupportArticleApi, updateSupportArticleStatusApi,  } from "../../services/apiServices";

interface SupportArticleState extends Pagination<supportArticle> { }

const initialState: SupportArticleState = {
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

// Async thunk to fetch paginated support article data
export const getSupportArticle = createAsyncThunk<Pagination<supportArticle>, { page?: number; search?: string; title?: string; description?: string; ordering?: string; status?: string; startDate?: string; endDate?: string }>(
    "supportArticle/getSupportArticle",
    async ({ page = 1, search = "", title = "", ordering = "", status = "", startDate = "", endDate = "" }, { rejectWithValue }) => {
        try {
            return await fetchSupportArticle(page, search, title, ordering, status, startDate, endDate);
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to fetch support articles");
        }
    }
);

export const addSupportArticle = createAsyncThunk<supportArticle, any, { rejectValue: string }>(
    "supportArticle/addSupportArticle",
    async (articleData, { rejectWithValue }) => {
        try {
            const data = await createSupportArticle(articleData);
            return data?.data ? data.data : data;
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to create support article");
        }
    }
);

export const editSupportArticle = createAsyncThunk<supportArticle, any, { rejectValue: string }>(
    "supportArticle/editSupportArticle",
    async ({ id, articleData }, { rejectWithValue }) => {
        try {
            const data = await updateSupportArticleApi(id, articleData);
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to update support article");
        }
    }
);

export const updateSupportArticleStatus = createAsyncThunk<supportArticle, any, { rejectValue: string }>
    ("supportArticle/updateSupportArticleStatus",
        async ({ id, status }, { rejectWithValue }) => {
            try {
                const data = await updateSupportArticleStatusApi(id, { status });
                return data.data;
            } catch (error: any) {
                return rejectWithValue(error.message || "Failed to update support article status");
            }
        }
    );

const supportArticleSlice = createSlice({
    name: "supportArticle",
    initialState,
    reducers: {
        setPage(state, action) {
            state.page = action.payload;
        },
        removeSupportArticle: (state, action: PayloadAction<Number | string>) => {
            state.data = state.data.filter((item) => item.id !== action.payload);
        },
        StatusSupportArticle: (state, action: PayloadAction<number | string>) => {
            state.data = state.data.map((item) =>
                item.id.toString() === action.payload.toString()
                    ? { ...item, status: !item.status }
                    : item
            );
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getSupportArticle.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getSupportArticle.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(getSupportArticle.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(addSupportArticle.fulfilled, (state, action) => {
                state.loading = false;
                state.data.unshift(action.payload);
            })
            .addCase(editSupportArticle.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.map(item => item.id == action.payload.id ? action.payload : item);
            })
            .addCase(updateSupportArticleStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.map(item => item.id == action.payload.id ? action.payload : item);
            });
    },
});

export const { setPage, removeSupportArticle, StatusSupportArticle } = supportArticleSlice.actions;

export default supportArticleSlice.reducer;
