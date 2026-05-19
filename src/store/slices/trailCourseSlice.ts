import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Pagination, TrailCourses } from "../../utils/types";
import { fetchTrailCourse, addTrailCourseApi } from "../../services/apiServices";

interface TrailCourse extends Pagination<TrailCourses> {
}

const initialState:TrailCourse={
    data:[],
    next:null,
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

export const getTrailCourse = createAsyncThunk<Pagination<TrailCourse>, { page?: number; search?: string; name?: string; description?: string; ordering?: string; status?: string; startDate?: string; endDate?: string }>(
    "trailCourse/getTrailCourse",
    async ({ page = 1, search = "", name = "", description = "", ordering = "", status = "", startDate = "", endDate = "" }, { rejectWithValue }) => {
        try {
            return await fetchTrailCourse(page, search, name, description, ordering, status, startDate, endDate);
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to fetch categories");
        }
    }
);

export const addTrailCourse = createAsyncThunk<any, any, { rejectValue: string }>(
    "trailCourse/addTrailCourse",
    async (payload, { rejectWithValue }) => {
        try {
            const data = await addTrailCourseApi(payload);
            return data?.data ? data.data : data;
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to add trail course");
        }
    }
);



const trailCourseSlice = createSlice({
    name: "trailCourse",
    initialState,
    reducers: {
         setPage(state, action) {
            state.page = action.payload;
        },
        removeTrailCourse: (state, action: PayloadAction<Number | string>) => {
            state.data = state.data.filter((item) => item.id !== action.payload);
        },
        StatusTrailCourse: (state, action: PayloadAction<number | string>) => {
            state.data = state.data.map((item) =>
                item.id.toString() === action.payload.toString()
                    ? { ...item, status: !item.status }
                    : item
            );

        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getTrailCourse.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                getTrailCourse.fulfilled, (state, action: PayloadAction<any>) => {
                    state.loading = false;
                    const { data, pagination } = action.payload;
                    if (data) {
                        state.data = data.results || data;
                    }
                    if (pagination) {
                        state.pagination = pagination;
                    }
                    state.next = action.payload.next || null;
                    state.previous = action.payload.previous || null;
                }
            )
            .addCase(getTrailCourse.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(addTrailCourse.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload) {
                    state.data.unshift(action.payload);
                }
            });
    },
});

export const {setPage,removeTrailCourse,StatusTrailCourse} = trailCourseSlice.actions

export default trailCourseSlice.reducer;