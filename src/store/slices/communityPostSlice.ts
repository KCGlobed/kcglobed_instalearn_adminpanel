import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { communityPost, Pagination } from "../../utils/types";
import { fetchCommunityPosts, createCommunityPostApi, updateCommunityPostApi, updateCommunityPostStatusApi, deleteCommunityPostApi } from "../../services/apiServices";


interface CommunityPostState extends Pagination<communityPost> { };

const initialState: CommunityPostState = {
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

export const getCommunityPosts = createAsyncThunk<Pagination<communityPost>, { page?: number; search?: string; title?: string; description?: string; ordering?: string; status?: string; startDate?: string; endDate?: string }>(
    "communityPost/getCommunityPosts",
    async ({ page = 1, search = "", title = "", description = "", ordering = "", status = "", startDate = "", endDate = "" }, { rejectWithValue }) => {
        try {
            return await fetchCommunityPosts(page, search, title, description, ordering, status, startDate, endDate);
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to fetch community posts");
        }
    }
);

export const addCommunityPost = createAsyncThunk<communityPost, any, { rejectValue: string }>(
    "communityPost/addCommunityPost",
    async (postData, { rejectWithValue }) => {
        try {
            const data = await createCommunityPostApi(postData);
            return data?.data ? data.data : data;
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to create community post");
        }
    }
);

export const editCommunityPost = createAsyncThunk<communityPost, any, { rejectValue: string }>(
    "communityPost/editCommunityPost",
    async ({ id, postData }, { rejectWithValue }) => {
        try {
            const data = await updateCommunityPostApi(id, postData);
            return data?.data ? data.data : data;
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to update community post");
        }
    }
);

export const updateCommunityPostStatus = createAsyncThunk<communityPost, any, { rejectValue: string }>(
    "communityPost/updateCommunityPostStatus",
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const data = await updateCommunityPostStatusApi(id, { status });
            return data?.data ? data.data : data;
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to update community post status");
        }
    }
);

export const deleteCommunityPost = createAsyncThunk<number, number | string, { rejectValue: string }>(
    "communityPost/deleteCommunityPost",
    async (id, { rejectWithValue }) => {
        try {
            await deleteCommunityPostApi(id);
            return Number(id);
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to delete community post");
        }
    }
);

const communityPostSlice = createSlice({
    name: "communityPost",
    initialState,
    reducers: {
        setPage(state, action) {
            state.page = action.payload;
        },
        removePost(state, action: PayloadAction<string | number>) {
            state.data = state.data.filter((item) => item.id != action.payload);
            if (state.pagination && state.pagination.total_results !== null) {
                state.pagination.total_results = Math.max(0, state.pagination.total_results - 1);
            }
        },
        statusPost(state, action) {
            state.data = state.data.map((item) => {
                if (item.id == action.payload.id) {
                    return { ...item, status: !item.status };
                }
                return item;
            });
        }
    },

    extraReducers: (builder) => {
        builder
            .addCase(getCommunityPosts.pending, (state) => {
                state.loading = true;
            })
            .addCase(getCommunityPosts.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(getCommunityPosts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(addCommunityPost.fulfilled, (state, action) => {
                state.loading = false;
                state.data.unshift(action.payload);
                if (state.pagination && state.pagination.total_results !== null) {
                    state.pagination.total_results += 1;
                }
            })
            .addCase(editCommunityPost.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.map(item => item.id == action.payload.id ? action.payload : item);
            })
            .addCase(updateCommunityPostStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.map(item => item.id == action.payload.id ? action.payload : item);
            })
            .addCase(deleteCommunityPost.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.filter(item => item.id !== action.payload);
                if (state.pagination && state.pagination.total_results !== null) {
                    state.pagination.total_results = Math.max(0, state.pagination.total_results - 1);
                }
            });
    }

});

export const { setPage, removePost, statusPost } = communityPostSlice.actions;

export default communityPostSlice.reducer;
