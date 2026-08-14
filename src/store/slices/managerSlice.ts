import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Pagination, ManagerDetail, Managers } from "../../utils/types";
import { fetchManagers, createManagerApi, updateManagerApi, updateManagerStatusApi } from "../../services/apiServices";

interface managerState extends Pagination<Managers> {
    selectedManager: ManagerDetail | null;
    selectedManagerLoading: boolean;
    selectedManagerError: string | null;
}

const initialState: managerState = {
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
    selectedManager: null,
    selectedManagerLoading: false,
    selectedManagerError: null,
};

export const getManagers = createAsyncThunk<Pagination<Managers>, { page?: number; search?: string; first_name?: string; last_name?: string; ordering?: string; is_active?: string; startDate?: string; endDate?: string; email?: string; status?: string; }>
( "manager/getManagers", async ({ page = 1, search = "", first_name = "", last_name = "", ordering = "", is_active = "", startDate = "", endDate = "", email = "", status="" }, { rejectWithValue }) => {
    try {
        return await fetchManagers(page, search, first_name, last_name, ordering, is_active, startDate, endDate, email, status);
    } catch (err: any) {
        return rejectWithValue(err?.message || "Failed to fetch managers");
    }
})

export const createManager = createAsyncThunk<any, any>(
    "manager/createManager",
    async (payload, { rejectWithValue }) => {
        try {
            return await createManagerApi(payload);
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to create manager");
        }
    }
)

export const updateManager = createAsyncThunk<any, { id: string | number; managerData: any }>(
    "manager/updateManager",
    async ({ id, managerData }, { rejectWithValue }) => {
        try {
            return await updateManagerApi(id, managerData);
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to update manager");
        }
    }
)

export const updateManagerStatus = createAsyncThunk<any, { id: string | number; status: boolean }>(   
    "manager/updateManagerStatus",
    async ({ id, status }, { rejectWithValue }) => {
        try {
            return await updateManagerStatusApi(id, { status });
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to update manager status");
        }
    }
)

export const managerSlice = createSlice({
    name: "manager",
    initialState,
    reducers: {
        setPage(state, action) {
            state.page = action.payload;
        },
        removeManager: (state, action: PayloadAction<number | string>) => {
            state.data = state.data.filter((item) => item.id !== action.payload);
        },
        StatusManager: (state, action: PayloadAction<number | string>) => {
            state.data = state.data.map((item) =>
                item.id.toString() === action.payload.toString()
                    ? { ...item, is_active: !item.is_active, status: !item.status }
                    : item
            );
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getManagers.pending, (state) => {
                state.loading = true;
            })
            .addCase(getManagers.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(createManager.fulfilled, (state, action) => {
                state.loading = false;
                const now = new Date().toISOString();
                if(action.payload?.data) {
                    state.data.unshift({ ...action.payload.data, created_at: action.payload.data.created_at || now, updated_at: action.payload.data.updated_at || now });
                } else if (action.payload) {
                    state.data.unshift({ ...action.payload, created_at: action.payload.created_at || now, updated_at: action.payload.updated_at || now });
                }
            })
            .addCase(updateManager.fulfilled, (state, action) => {
                state.loading = false;
                const payloadData = action.payload?.data || action.payload;
                if(payloadData) {
                    state.data = state.data.map(item => item.id == payloadData.id ? { ...item, ...payloadData, updated_at: payloadData.updated_at || new Date().toISOString() } : item);
                }
            })
            .addCase(getManagers.rejected, (state, action) => {
                state.loading = false;
                state.error= action.payload as string;
            })
            .addCase(updateManagerStatus.fulfilled, (state, action) => {
                const { id, status } = action.meta.arg;
                state.data = state.data.map((item) =>
                    item.id.toString() === id.toString()
                        ? { ...item, is_active: status, status: status, updated_at: new Date().toISOString() }
                        : item
                );
                if (state.selectedManager && state.selectedManager.id.toString() === id.toString()) {
                    state.selectedManager.is_active = status;
                    state.selectedManager.status = status;
                }
            });
    },
});

export const { setPage, removeManager, StatusManager } = managerSlice.actions;

export default managerSlice.reducer;
