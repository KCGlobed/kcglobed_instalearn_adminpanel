import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { jobApplication, Pagination } from "../../utils/types";
import { getJobApplicationApi } from "../../services/apiServices";

interface jobApplicationState extends Pagination<jobApplication> { }

const initialState: jobApplicationState = {
    data: [],
    next: null,
    previous: null,
    page: 1,
    pagination: {
        total_results: null,
        total_pages: null,
        current_page: null,
        next_page: null,
        page_size: null,
        previous_page: null,
    },
    loading: false,
    error: null
}

export const getJobApplication = createAsyncThunk<Pagination<jobApplication>, { page?: number; search?: string; ordering?: string; start_date?: string; end_date?: string; full_name?: string; email?: string; mobile?: string }>(
    "jobApplication/getJobApplication",
    async ({
        page = 1,
        search = "",
        ordering = "",
        start_date = "",
        end_date = "",
        full_name = "",
        email = "",
        mobile = "",
    }, { rejectWithValue }) => {
        try {
            return await getJobApplicationApi(page, search, ordering, start_date, end_date, full_name, email, mobile);
        } catch (error: any) {
            return rejectWithValue(error?.message || "Failed to fetch job applications");
        }
    }
)

const jobApplicationSlice = createSlice({
    name: 'jobApplication',
    initialState,
    reducers: {
        setPage(state, action: PayloadAction<number>) {
            state.page = action.payload;
        },
        removeJobApplication(state, action: PayloadAction<number|string>) {
            state.data = state.data.filter((item) => item.id !== action.payload);
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getJobApplication.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getJobApplication.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(getJobApplication.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
    }
});

export const { setPage, removeJobApplication } = jobApplicationSlice.actions;
export default jobApplicationSlice.reducer;