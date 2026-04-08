// src/store/slices/videoSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { CourseVideo, Pagination } from "../../utils/types";
import { fetchVideo, createVideo, updateVideoApi, updateVideoStatusApi } from "../../services/apiServices";

interface VideoState extends Pagination<CourseVideo> { }

const initialState: VideoState = {
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

// Async thunk to fetch paginated video data
export const getVideoListing = createAsyncThunk<
    Pagination<CourseVideo>,
    { page?: number; search?: string; name?: string; description?: string; ordering?: string; status?: string; startDate?: string; endDate?: string }
>(
    "video/getVideoListing",
    async ({ page = 1, search = "", name = "", description = "", ordering = "", status = "", startDate = "", endDate = "" }, { rejectWithValue }) => {
        try {
            return await fetchVideo(page, search, name, description, ordering, status, startDate, endDate);
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to fetch videos");
        }
    }
);

export const addVideo = createAsyncThunk<CourseVideo, any, { rejectValue: string }>(
    "video/addVideo",
    async (videoData, { rejectWithValue }) => {
        try {
            const data = await createVideo(videoData);
            return data?.data ? data.data : data;
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to create video");
        }
    }
);

export const editVideo = createAsyncThunk<CourseVideo, { id: string | number; videoData: any }, { rejectValue: string }>(
    "video/editVideo",
    async ({ id, videoData }, { rejectWithValue }) => {
        try {
            const data = await updateVideoApi(id, videoData);
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to update video");
        }
    }
);

export const updateVideoStatus = createAsyncThunk<CourseVideo, { id: string | number; status: boolean }, { rejectValue: string }>(
    "video/updateVideoStatus",
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const data = await updateVideoStatusApi(id, { status });
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to update video status");
        }
    }
);

const videoSlice = createSlice({
    name: "video",
    initialState,
    reducers: {
        setPage(state, action: PayloadAction<number>) {
            state.page = action.payload;
        },
        removeVideo: (state, action: PayloadAction<number | string>) => {
            state.data = state.data.filter((item) => item.id !== action.payload);
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getVideoListing.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getVideoListing.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination;
                state.next = action.payload.next;
                state.previous = action.payload.previous;
            })
            .addCase(getVideoListing.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(addVideo.fulfilled, (state, action) => {
                state.loading = false;
                state.data.unshift(action.payload);
            })
            .addCase(editVideo.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.map(item => item.id === action.payload.id ? action.payload : item);
            })
            .addCase(updateVideoStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.map(item => item.id === action.payload.id ? action.payload : item);
            });
    },
});

export const { setPage, removeVideo } = videoSlice.actions;

export default videoSlice.reducer;