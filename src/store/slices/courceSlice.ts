import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Courses, Pagination } from "../../utils/types";
import { fetchCourseApi, deleteCourseApi, fetchCourseDetailApi, uploadCourseSampleVideoApi } from "../../services/apiServices";

interface CourseState extends Pagination<Courses> { }

const initialState: CourseState = {
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

}

export const getCource = createAsyncThunk<Pagination<Courses>, { page?: number; search?: string; name?: string; chapter?: string, description?: string; ordering?: string; status?: string; startDate?: string; endDate?: string, }>(
    "course/getCource",
    async ({
        page = 1, search = "", name = "", description = "", ordering = "", status = "", startDate = "", endDate = "", chapter = "" }, { rejectWithValue }
    ) => {
        try {
            return await fetchCourseApi(page, search, name, chapter, description, ordering, status, startDate, endDate)
        } catch (error: any) {
            return rejectWithValue(error.message)
        }
    }

)

export const deleteCourse = createAsyncThunk<number | string, number | string, { rejectValue: string }>(
    "course/deleteCourse",
    async (id, { rejectWithValue }) => {
        try {
            await deleteCourseApi(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error?.message || "Failed to delete course");
        }
    }
);




export const uploadCourseSampleVideo = createAsyncThunk<any, FormData, { rejectValue: string }>(
    "course/uploadCourseSampleVideo",
    async (payload, { rejectWithValue }) => {
        try {
            return await uploadCourseSampleVideoApi(payload);
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to upload course sample video");
        }
    }
);



export const getCourseDetail = createAsyncThunk<any, string | number, { rejectValue: string }>(
    "course/getCourseDetail",
    async (id, { rejectWithValue }) => {
        try {
            return await fetchCourseDetailApi(id);
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to fetch course detail");
        }
    }
);


const courseSlice = createSlice({
    name: "Course",
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
            .addCase(getCource.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getCource.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(getCource.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(deleteCourse.fulfilled, (state, action) => {
                state.data = state.data.filter((item) => item.id !== action.payload);
            });
    }
})

export const { setPage, removeCourse, statusCourse } = courseSlice.actions
export default courseSlice.reducer
