import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Pagination, StudentDetail, Students } from "../../utils/types";
import { fetchStudents, viewStudentDetailApi, createStudentApi, updateStudentApi, updateStudentStatusApi, fetchStudentVideoReportsApi } from "../../services/apiServices";

interface  studentState extends Pagination<Students> {
    selectedStudent: StudentDetail | null;
    selectedStudentLoading: boolean;
    selectedStudentError: string | null;
    selectedStudentReports: any | null;
    selectedStudentReportsLoading: boolean;
    selectedStudentReportsError: string | null;
}

const initialState: studentState = {
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
    selectedStudent: null,
    selectedStudentLoading: false,
    selectedStudentError: null,
    selectedStudentReports: null,
    selectedStudentReportsLoading: false,
    selectedStudentReportsError: null,
};

export const getStudents= createAsyncThunk<Pagination<Students>, { page?: number; search?: string; first_name?: string; last_name?: string; description?: string; ordering?: string; is_active?: string; startDate?: string; endDate?: string;email?: string;status?: string; }>
( "student/getStudents", async ({ page = 1, search = "", first_name = "", last_name = "", description = "", ordering = "", is_active = "", startDate = "", endDate = "", email = "",status="" }, { rejectWithValue }) => {
    try {
        return await fetchStudents(page, search, first_name, last_name, description, ordering, is_active, startDate, endDate, email,status);
    } catch (err: any) {
        return rejectWithValue(err?.message || "Failed to fetch students");
    }
})

export const getStudentDetail = createAsyncThunk<StudentDetail, string | number>(
    "student/getStudentDetail",
    async (id, { rejectWithValue }) => {
        try {
            const response = await viewStudentDetailApi(id);
            return response.data;
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to fetch student detail");
    }
}
)

export const getStudentReports = createAsyncThunk<any, { id: string | number; courseId: string | number }>(
    "student/getStudentReports",
    async ({ id, courseId }, { rejectWithValue }) => {
        try {
            const response: any = await fetchStudentVideoReportsApi(id, courseId);
            return response?.data?.data || response?.data || (response?.status ? response : null);
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to fetch student reports");
        }
    }
)


export const createStudent = createAsyncThunk<any, any>(
    "student/createStudent",
    async (payload, { rejectWithValue }) => {
        try {
            return await createStudentApi(payload);
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to create student");
    }
}
)

export const updateStudent = createAsyncThunk<any, { id: string | number; studentData: any }>(
    "student/updateStudent",
    async ({ id, studentData }, { rejectWithValue }) => {
        try {
            return await updateStudentApi(id, studentData);
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to update student");
        }
    }
)

export const updateStudentStatus = createAsyncThunk<any, { id: string | number; status: boolean }>(   
    "student/updateStudentStatus",
    async ({ id, status }, { rejectWithValue }) => {
        try {
            return await updateStudentStatusApi(id, { status });
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to update student status");
        }
    }
)


export const studentSlice = createSlice({
    name: "student",
    initialState,
   reducers: {
        setPage(state, action) {
            state.page = action.payload;
        },
        removeStudent: (state, action: PayloadAction<Number | string>) => {
            state.data = state.data.filter((item) => item.id !== action.payload);
        },
        StatusStudent: (state, action: PayloadAction<number | string>) => {
            state.data = state.data.map((item) =>
                item.id.toString() === action.payload.toString()
                    ? { ...item, is_active: !item.is_active, status: !item.status }
                    : item
            );
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getStudents.pending, (state) => {
                state.loading = true;
            })
            .addCase(getStudents.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(getStudents.rejected, (state, action) => {
                state.loading = false;
                state.error= action.payload as string;
            })
            .addCase(getStudentDetail.pending, (state) => {
                state.selectedStudentLoading = true;
                state.selectedStudentError = null;
            })
            .addCase(getStudentDetail.fulfilled, (state, action) => {
                state.selectedStudentLoading = false;
                state.selectedStudent = action.payload;
            })
            .addCase(getStudentDetail.rejected, (state, action) => {
                state.selectedStudentLoading = false;
                state.selectedStudentError = action.payload as string;
            })
            .addCase(updateStudentStatus.fulfilled, (state, action) => {
                const { id, status } = action.meta.arg;
                state.data = state.data.map((item) =>
                    item.id.toString() === id.toString()
                        ? { ...item, is_active: status, status: status }
                        : item
                );
                if (state.selectedStudent && state.selectedStudent.id.toString() === id.toString()) {
                    state.selectedStudent.is_active = status;
                    state.selectedStudent.status = status;
                }
            })
            .addCase(getStudentReports.pending, (state) => {
                state.selectedStudentReportsLoading = true;
                state.selectedStudentReportsError = null;
            })
            .addCase(getStudentReports.fulfilled, (state, action) => {
                state.selectedStudentReportsLoading = false;
                state.selectedStudentReports = action.payload;
            })
            .addCase(getStudentReports.rejected, (state, action) => {
                state.selectedStudentReportsLoading = false;
                state.selectedStudentReportsError = action.payload as string;
            });
    },
});

export const { setPage, removeStudent, StatusStudent } = studentSlice.actions;

export default studentSlice.reducer;