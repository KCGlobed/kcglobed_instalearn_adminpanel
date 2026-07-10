import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Pagination, TrailStudent } from "../../utils/types";
import { fetchTrailStudentListing, createTrailRegistration } from "../../services/apiServices";

interface TrailStudentState extends Pagination<TrailStudent> { }

const initialState: TrailStudentState = {
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

export const getTrailStudents = createAsyncThunk<Pagination<TrailStudent>, { page?: number; search?: string; first_name?: string; last_name?: string; email?: string; ordering?: string; start_date?: string; end_date?: string; subscription_status?: string }>(
    "trailStudent/getTrailStudents",
    async ({ page = 1, search = "", first_name = "", last_name = "", email = "", ordering = "", start_date = "", end_date = "", subscription_status = "" }, { rejectWithValue }) => {
        console.log("getTrailStudents payload:", { page, search, first_name, last_name, email, ordering, start_date, end_date, subscription_status });
        try {
            return await fetchTrailStudentListing(page, search, first_name, last_name, email, ordering, start_date, end_date, subscription_status);
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to fetch trail students");
        }
    }
);

export const addTrailStudent = createAsyncThunk<any, any, { rejectValue: string }>(
    "trailStudent/addTrailStudent",
    async (payload, { rejectWithValue }) => {
        try {
            const data = await createTrailRegistration(payload);
            return data?.data ? data.data : data;
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to create trail student");
        }
    }
);

const trailStudentSlice = createSlice({
    name: "trailStudent",
    initialState,
    reducers: {
        setPage(state, action) {
            state.page = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getTrailStudents.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getTrailStudents.fulfilled, (state, action: PayloadAction<any>) => {
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
            })
            .addCase(getTrailStudents.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(addTrailStudent.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload) {
                    state.data.unshift(action.payload);
                }
            });
    },
});

export const { setPage } = trailStudentSlice.actions;

export default trailStudentSlice.reducer;
