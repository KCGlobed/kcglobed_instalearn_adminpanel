import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Announcement, Pagination } from "../../utils/types";
import { fetchCourseAnnouncementApi, viewCourseAnnouncementApi, updateCourseAnnouncementApi, updateCourseAnnouncementStatusApi } from "../../services/apiServices";


interface courseAnnouncement extends Pagination<Announcement> { 
    currentAnnouncement: Announcement | null;
    currentAnnouncementLoading: boolean;
};

const initialState: courseAnnouncement = {
    data: [],
    next: null,
    previous: null,
    pagination: {
        total_results: null,
        total_pages: null,
        current_page: null,
        next_page: null,
        page_size: null,
        previous_page: null,
    },
    page: 1,
    loading: false,
    error: null,
    currentAnnouncement: null,
    currentAnnouncementLoading: false,
}

export const getCourseAnnouncement = createAsyncThunk<Pagination<Announcement>, { page?: number; search?: string; title?: string; description?: string; ordering?: string; status?: string; startDate?: string; endDate?: string, course?: string; }>("course/getCourseAnnouncement", async ({ page = 1, search = "", title = "", description = "", ordering = "", status = "", startDate = "", endDate = "", course = "" }, { rejectWithValue }) => {
    try {
        return await fetchCourseAnnouncementApi(page, search, title, description, ordering, status, startDate, endDate, course)
    } catch (error: any) {
        return rejectWithValue(error.message)
    }
})


export const viewCourseAnnouncement = createAsyncThunk<Announcement, string | number>(
    "course/viewCourseAnnouncement",
    async (id, { rejectWithValue }) => {
        try {
            return await viewCourseAnnouncementApi(id);
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to view announcement");
        }
    }
);

export const updateCourseAnnouncement = createAsyncThunk<any, { id: string | number, payload: any }>(
    "course/updateCourseAnnouncement",
    async ({ id, payload }, { rejectWithValue }) => {
        try {
            return await updateCourseAnnouncementApi(id, payload);
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to update announcement");
        }
    }
);

export const updateCourseAnnouncementStatus = createAsyncThunk<any, { id: string | number, status: boolean }>(
    "course/updateCourseAnnouncementStatus",
    async ({ id, status }, { rejectWithValue }) => {
        try {
            return await updateCourseAnnouncementStatusApi(id, { status });
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to update status");
        }
    }
);


const courseAnnouncementSlice = createSlice({
    name: 'courseAnnouncement',
    initialState,
    reducers: {
        setPage(state, action: PayloadAction<number>) {
            state.page = action.payload;
        },
        removeCourse: (state, action: PayloadAction<Number | string>) => {
            state.data = state.data.filter((item) => item.id !== action.payload);
        },
        statusCourse: (state, action: PayloadAction<Number | string>) => {
            state.data = state.data.map((item) => item.id.toString() === action.payload.toString() ? { ...item, status: !item.status } : item)
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getCourseAnnouncement.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getCourseAnnouncement.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(getCourseAnnouncement.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(viewCourseAnnouncement.pending, (state) => {
                state.currentAnnouncementLoading = true;
                state.error = null;
                state.currentAnnouncement = null;
            })
            .addCase(viewCourseAnnouncement.fulfilled, (state, action) => {
                state.currentAnnouncementLoading = false;
                state.currentAnnouncement = action.payload;
            })
            .addCase(viewCourseAnnouncement.rejected, (state, action) => {
                state.currentAnnouncementLoading = false;
                state.error = action.payload as string;
            })
            .addCase(updateCourseAnnouncement.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCourseAnnouncement.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(updateCourseAnnouncement.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
})

export const {setPage,removeCourse,statusCourse} = courseAnnouncementSlice.actions

export default courseAnnouncementSlice.reducer