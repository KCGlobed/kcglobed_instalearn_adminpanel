import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Pagination, SalesUsers, SalesUserDetail } from "../../utils/types";
import { fetchSalesUsers, createSalesUserApi, updateSalesUserApi, updateSalesUserStatusApi, viewSalesUserDetailApi } from "../../services/apiServices";

interface salesUserState extends Pagination<SalesUsers> {
    selectedSalesUser: SalesUserDetail | null;
    selectedSalesUserLoading: boolean;
    selectedSalesUserError: string | null;
}

const initialState: salesUserState = {
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
    selectedSalesUser: null,
    selectedSalesUserLoading: false,
    selectedSalesUserError: null,
};

export const getSalesUsers = createAsyncThunk<Pagination<SalesUsers>, { page?: number; search?: string; first_name?: string; last_name?: string; ordering?: string; is_active?: string; startDate?: string; endDate?: string; email?: string; status?: string; }>
( "salesUser/getSalesUsers", async ({ page = 1, search = "", first_name = "", last_name = "", ordering = "", is_active = "", startDate = "", endDate = "", email = "", status="" }, { rejectWithValue }) => {
    try {
        return await fetchSalesUsers(page, search, first_name, last_name, ordering, is_active, startDate, endDate, email, status);
    } catch (err: any) {
        return rejectWithValue(err?.message || "Failed to fetch sales users");
    }
})

export const getSalesUserDetail = createAsyncThunk<SalesUserDetail, string | number>(
    "salesUser/getSalesUserDetail",
    async (id, { rejectWithValue }) => {
        try {
            const response = await viewSalesUserDetailApi(id);
            return response?.data?.data || response?.data || response;
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to fetch sales user detail");
        }
    }
)

export const createSalesUser = createAsyncThunk<any, any>(
    "salesUser/createSalesUser",
    async (payload, { rejectWithValue }) => {
        try {
            return await createSalesUserApi(payload);
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to create sales user");
        }
    }
)

export const updateSalesUser = createAsyncThunk<any, { id: string | number; salesUserData: any }>(
    "salesUser/updateSalesUser",
    async ({ id, salesUserData }, { rejectWithValue }) => {
        try {
            return await updateSalesUserApi(id, salesUserData);
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to update sales user");
        }
    }
)

export const updateSalesUserStatus = createAsyncThunk<any, { id: string | number; status: boolean }>(   
    "salesUser/updateSalesUserStatus",
    async ({ id, status }, { rejectWithValue }) => {
        try {
            return await updateSalesUserStatusApi(id, { status });
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to update sales user status");
        }
    }
)

export const salesUserSlice = createSlice({
    name: "salesUser",
    initialState,
    reducers: {
        setPage(state, action) { 
            state.page = action.payload;
        },
        removeSalesUser: (state, action: PayloadAction<number | string>) => {
            state.data = state.data.filter((item) => item.id !== action.payload);
        },
        StatusSalesUser: (state, action: PayloadAction<number | string>) => {
            state.data = state.data.map((item) =>
                item.id.toString() === action.payload.toString()
                    ? { ...item, is_active: !item.is_active, status: !item.status }
                    : item
            );
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getSalesUsers.pending, (state) => {
                state.loading = true;
            })
            .addCase(getSalesUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(createSalesUser.fulfilled, (state, action) => {
                state.loading = false;
                const now = new Date().toISOString();
                if(action.payload?.data) {
                    state.data.unshift({ ...action.payload.data, created_at: action.payload.data.created_at || now, updated_at: action.payload.data.updated_at || now });
                } else if (action.payload) {
                    state.data.unshift({ ...action.payload, created_at: action.payload.created_at || now, updated_at: action.payload.updated_at || now });
                }
            })
            .addCase(updateSalesUser.fulfilled, (state, action) => {
                state.loading = false;
                const payloadData = action.payload?.data || action.payload;
                if(payloadData) {
                    state.data = state.data.map(item => item.id == payloadData.id ? { ...item, ...payloadData, updated_at: payloadData.updated_at || new Date().toISOString() } : item);
                }
            })
            .addCase(getSalesUsers.rejected, (state, action) => {
                state.loading = false;
                state.error= action.payload as string;
            })
            .addCase(updateSalesUserStatus.fulfilled, (state, action) => {
                const { id, status } = action.meta.arg;
                state.data = state.data.map((item) =>
                    item.id.toString() === id.toString()
                        ? { ...item, is_active: status, status: status, updated_at: new Date().toISOString() }
                        : item
                );
                if (state.selectedSalesUser && state.selectedSalesUser.id.toString() === id.toString()) {
                    state.selectedSalesUser.is_active = status;
                    state.selectedSalesUser.status = status;
                }
            })
            .addCase(getSalesUserDetail.pending, (state) => {
                state.selectedSalesUserLoading = true;
                state.selectedSalesUserError = null;
            })
            .addCase(getSalesUserDetail.fulfilled, (state, action) => {
                state.selectedSalesUserLoading = false;
                state.selectedSalesUser = action.payload;
            })
            .addCase(getSalesUserDetail.rejected, (state, action) => {
                state.selectedSalesUserLoading = false;
                state.selectedSalesUserError = action.payload as string;
            });
    },
});

export const { setPage, removeSalesUser, StatusSalesUser } = salesUserSlice.actions;

export default salesUserSlice.reducer;
