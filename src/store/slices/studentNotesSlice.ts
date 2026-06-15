import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Pagination, StudentNoteListing, StudentNoteDetail } from "../../utils/types";
import { fetchStudentNotesReportApi, fetchStudentNotesDetailApi } from "../../services/apiServices";

interface StudentNotesSliceState extends Pagination<StudentNoteListing> {
    detailData: StudentNoteDetail | null;
    detailLoading: boolean;
}

const initialState: StudentNotesSliceState = {
    data: [],
    count: 0,
    pagination: {
        total_results: null,
        total_pages: null,
        current_page: null,
        next_page: null,
        page_size: null,
        previous_page: null,
    },
    next: null,
    previous: null,
    page: 1,
    loading: false,
    error: null,
    detailData: null,
    detailLoading: false,
};

export const getStudentNotes = createAsyncThunk<
    any, { page?: number; search?: string; first_name?: string; last_name?: string; email?: string; ordering?: string; course?: string; startDate?: string; endDate?: string }
>(
    "studentNotes/getStudentNotes",
    async (
        { page = 1, search = "", first_name = "", last_name = "", email = "", ordering = "", course = "", startDate = "", endDate = "" },
        { rejectWithValue }
    ) => {
        try {
            const response = await fetchStudentNotesReportApi(page, search, first_name, last_name, email, ordering, course, startDate, endDate);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || "Something went wrong");
        }
    }
);

export const getStudentNotesDetail = createAsyncThunk<
    any, { userId: string | number; courseId: string | number }
>(
    "studentNotes/getStudentNotesDetail",
    async ({ userId, courseId }, { rejectWithValue }) => {
        try {
            const response = await fetchStudentNotesDetailApi(userId, courseId);
            return response.data;
        } catch (error: any) {
            console.error("getStudentNotesDetail error:", error);
            return rejectWithValue(error.message || "Something went wrong");
        }
    }
);

export const studentNotesSlice = createSlice({
    name: "studentNotes",
    initialState,
    reducers: {
        setPage(state, action) {
            state.page = action.payload;
        },
        clearStudentNotesDetail(state) {
            state.detailData = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getStudentNotes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getStudentNotes.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination;
                state.error = null;
            })
            .addCase(getStudentNotes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(getStudentNotesDetail.pending, (state) => {
                state.detailLoading = true;
                state.error = null;
            })
            .addCase(getStudentNotesDetail.fulfilled, (state, action) => {
                state.detailLoading = false;
                state.detailData = action.payload;
                state.error = null;
            })
            .addCase(getStudentNotesDetail.rejected, (state, action) => {
                state.detailLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setPage, clearStudentNotesDetail } = studentNotesSlice.actions;
export default studentNotesSlice.reducer;
