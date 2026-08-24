import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Pagination, University } from "../../utils/types";
import { fetchUniversityApi, updateUniversityStatusApi, approveRejectUniversityApi } from "../../services/apiServices";

interface UniversityState extends Pagination<University> { }

const initialState: UniversityState = {
    data: [],
    count: 0,
    pagination: {
        total_results: 0,
        total_pages: 0,
        current_page: 0,
        next_page: 0,
        page_size: 0,
        previous_page: 0
    },
    next: null,
    previous: null,
    page: 1,
    loading: false,
    error: null
}

export const getUniversities = createAsyncThunk<
    Pagination<University>,
    { page?: number, search?: string, first_name?: string, last_name?: string, work_email?: string, phone_number?: string, ordering?: string, status?: string, startDate?: string, endDate?: string }
>(
    "university/getUniversities",
    async (
        { page = 1, search = "", first_name = "", last_name = "", work_email = "", phone_number = "", ordering = "", status = "", startDate = "", endDate = "" }, { rejectWithValue }
    ) => {
        try {
            return await fetchUniversityApi(page, search, first_name, last_name, work_email, phone_number, ordering, status, startDate, endDate);
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to fetch university");
        }
    }
);

export const updateUniversityStatus = createAsyncThunk(
    "university/updateUniversityStatus",
    async ({ id, status }: { id: number | string; status: boolean | number }, { rejectWithValue }) => {
        try {
            await updateUniversityStatusApi(id, { status: status ? 1 : 0 });
            return { id, status };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || "Failed to update status");
        }
    }
);

export const approveRejectUniversity = createAsyncThunk(
    "university/approveRejectUniversity",
    async ({ id, approved_status }: { id: number | string; approved_status: number }, { rejectWithValue }) => {
        try {
            await approveRejectUniversityApi(id, { approved_status });
            return { id, approved_status };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || "Failed to update approval status");
        }
    }
);

const universitySlice = createSlice({
    name: 'university',
    initialState,
    reducers: {
        setPage(state, action: PayloadAction<number | string>) {
            state.page = Number(action.payload);
        },
        removeUniversity(state, action: PayloadAction<number | string>) {
            state.data = state.data.filter((item) => item.id !== action.payload);
        },
        statusUniversity(state, action: PayloadAction<number | string>) {
            state.data = state.data.map((item) => item.id === action.payload ? { ...item, status: !item.status } : item);
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getUniversities.pending, (state) => {
                state.loading = true;
            })
            .addCase(getUniversities.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload && action.payload.data) {
                    state.data = action.payload.data;
                    state.pagination = action.payload.pagination;
                } else {
                    state.data = action.payload as any;
                }
            })
            .addCase(getUniversities.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(updateUniversityStatus.fulfilled, (state, action) => {
                const index = state.data.findIndex((item) => item.id === action.payload.id);
                if (index !== -1) {
                    state.data[index].status = !!action.payload.status;
                }
            })
            .addCase(approveRejectUniversity.fulfilled, (state, action) => {
                const index = state.data.findIndex((item) => item.id === action.payload.id);
                if (index !== -1) {
                    state.data[index].approved_status = action.payload.approved_status;
                }
            });
    }
})

export const { setPage, removeUniversity, statusUniversity } = universitySlice.actions;
export default universitySlice.reducer;
