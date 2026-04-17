import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Instructor, Pagination } from "../../utils/types";
import { createInstructor, deleteInstructorApi, fetchInstructor, updateInstructorApi, updateInstructorStatusApi } from "../../services/apiServices";

interface instructorState extends Pagination<Instructor> { }

const initialState: instructorState = {
    data: [],
    next: null,
    pagination: {
        "total_results": null,
        "total_pages": null,
        "current_page": null,
        "next_page": null,
        "previous_page": null,
        "page_size": null
    },
    previous: null,
    page: 1,
    loading: false,
    error: null,
}

export const getInstructor = createAsyncThunk<Pagination<Instructor>, { page?: number; search?: string; first_name?: string; last_name?: string; ordering?: string; status?: string; startDate?: string; endDate?: string }>(
    "instructor/getInstructor", async ({ page = 1, search = "", first_name = "", last_name = "", ordering = "", status = "", startDate = "", endDate = "" }, { rejectWithValue }) => {
        try {
            return await fetchInstructor(page, search, first_name, last_name, ordering, status, startDate, endDate);
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to fetch instructors");
        }
    }
)

export const addInstructor = createAsyncThunk<Instructor, any, { rejectValue: string }>(
    "instructor/addInstructor",
    async (instructorData, { rejectWithValue }) => {
        try {
            const data = await createInstructor(instructorData);
            return data?.data ? data.data : data;
        } catch (error: any) {
            return rejectWithValue(error?.message || "Failed to add instructor");
        }
    }
)

export const updateInstructor = createAsyncThunk<Instructor, any, { rejectValue: string }>(
    "instructor/updateInstructor",
    async ({ id, instructorData }, { rejectWithValue }) => {
        try {
            const data = await updateInstructorApi(id, instructorData);
            return data?.data ? data.data : data;
        } catch (error: any) {
            return rejectWithValue(error?.message || "Failed to edit instructor");
        }
    }
)

export const updateInstructorStatus = createAsyncThunk<Instructor, any, { rejectValue: string }>(
    "instructor/updateInstructorStatus",
    async ({ id, instructorData }, { rejectWithValue }) => {
        try {
            const data = await updateInstructorStatusApi(id, instructorData);
            return data?.data ? data.data : data;
        } catch (error: any) {
            return rejectWithValue(error?.message || "Failed to update instructor status");
        }
    }
)

export const deleteInstructor = createAsyncThunk<number | string, any, { rejectValue: string }>(
    "tags/deleteTags",
    async (id, { rejectWithValue }) => {
        try {
            await deleteInstructorApi(id);
            return id;
        } catch (err: any) {
            return rejectWithValue(err.message || "Failed to delete tag");
        }
    }
)

const instructorSlice = createSlice({
    name: "instructor",
    initialState,
    reducers: {
        setPage: (state, action) => {
            state.page = action.payload;
        },
        removeInstructor: (state, action: PayloadAction<Number | string>) => {
            state.data = state.data.filter((item) => item.id != action.payload);
        },
        StatusInstructor: (state, action: PayloadAction<Number | string>) => {
             state.data = state.data.map((item) =>
                item.id.toString() === action.payload.toString()
                    ? { ...item, status: !item.status }
                    : item
            );
        }
    }, extraReducers: (builder) => {
        builder
            .addCase(getInstructor.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getInstructor.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(getInstructor.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(addInstructor.fulfilled, (state, action) => {
                state.loading = false;
                state.data.unshift(action.payload);
            })
            .addCase(updateInstructor.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.map(item => item.id == action.payload.id ? action.payload : item);
            })
            .addCase(updateInstructorStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.map(item => item.id == action.payload.id ? action.payload : item);
            });

    }
})

export const { setPage, removeInstructor, StatusInstructor } = instructorSlice.actions;

export default instructorSlice.reducer;