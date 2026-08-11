// src/store/slices/communityCategorySlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { communityCategory, Pagination } from "../../utils/types";
import {
    createCommunityCategory,
    fetchCommunityCategory,
    updateCommunityCategoryApi,
    updateCommunityCategoryStatusApi,
    deleteCommunityCategoryApi
} from "../../services/apiServices";

interface CommunityCategoryState extends Pagination<communityCategory> { }

const initialState: CommunityCategoryState = {
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

export const getCommunityCategory = createAsyncThunk<Pagination<communityCategory>, { page?: number; search?: string; title?: string; ordering?: string; status?: string; startDate?: string; endDate?: string }>(
    "communityCategory/getCommunityCategory",
    async ({ page = 1, search = "", title = "", ordering = "", status = "", startDate = "", endDate = "" }, { rejectWithValue }) => {
        try {
            return await fetchCommunityCategory(page, search, title, ordering, status, startDate, endDate);
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to fetch community categories");
        }
    }
);

export const addCommunityCategory = createAsyncThunk<communityCategory, any, { rejectValue: string }>(
    "communityCategory/addCommunityCategory",
    async (categoryData, { rejectWithValue }) => {
        try {
            const data = await createCommunityCategory(categoryData);
            return data?.data ? data.data : data;
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to create community category");
        }
    }
);

export const editCommunityCategory = createAsyncThunk<communityCategory, any, { rejectValue: string }>(
    "communityCategory/editCommunityCategory",
    async ({ id, categoryData }, { rejectWithValue }) => {
        try {
            const data = await updateCommunityCategoryApi(id, categoryData);
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to update community category");
        }
    }
);

export const updateCommunityCategoryStatus = createAsyncThunk<communityCategory, any, { rejectValue: string }>(
    "communityCategory/updateCommunityCategoryStatus",
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const data = await updateCommunityCategoryStatusApi(id, { status });
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to update community category status");
        }
    }
);

export const deleteCommunityCategory = createAsyncThunk<number, number | string, { rejectValue: string }>(
    "communityCategory/deleteCommunityCategory",
    async (id, { rejectWithValue }) => {
        try {
            await deleteCommunityCategoryApi(id);
            return Number(id);
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to delete community category");
        }
    }
);


const communityCategorySlice = createSlice({
    name: "communityCategory",
    initialState,
    reducers: {
        setPage(state, action) {
            state.page = action.payload;
        },
        removeCommunityCategory: (state, action: PayloadAction<number | string>) => {
            state.data = state.data.filter((item) => item.id.toString() !== action.payload.toString());
        },
        StatusCommunityCategory: (state, action: PayloadAction<number | string>) => {
            state.data = state.data.map((item) =>
                item.id.toString() === action.payload.toString()
                    ? { ...item, status: !item.status }
                    : item
            );
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getCommunityCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getCommunityCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(getCommunityCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(addCommunityCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.data.unshift(action.payload);
            })
            .addCase(editCommunityCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.map(item => item.id == action.payload.id ? action.payload : item);
            })
            .addCase(updateCommunityCategoryStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.map(item => item.id == action.payload.id ? action.payload : item);
            })
            .addCase(deleteCommunityCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.filter(item => item.id !== action.payload);
            });
    },
});

export const { setPage, removeCommunityCategory, StatusCommunityCategory } = communityCategorySlice.actions;

export default communityCategorySlice.reducer;
