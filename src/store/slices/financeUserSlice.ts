import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Pagination, FinanceUser } from "../../utils/types";
import { fetchFinanceUsers, createFinanceUserApi, updateFinanceUserApi, updateFinanceUserStatusApi } from "../../services/apiServices";

interface FinanceUserState extends Pagination<FinanceUser> {
    selectedUser: FinanceUser | null;
    selectedUserLoading: boolean;
    selectedUserError: string | null;
}

const initialState: FinanceUserState = {
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
    selectedUser: null,
    selectedUserLoading: false,
    selectedUserError: null,
};

export const getFinanceUsers = createAsyncThunk<Pagination<FinanceUser>, { page?: number; search?: string; first_name?: string; last_name?: string; ordering?: string; is_active?: string; startDate?: string; endDate?: string; email?: string; status?: string; }>(
    "financeUser/getFinanceUsers",
    async ({ page = 1, search = "", first_name = "", last_name = "", ordering = "", is_active = "", startDate = "", endDate = "", email = "", status = "" }, { rejectWithValue }) => {
        try {
            return await fetchFinanceUsers(page, search, first_name, last_name, ordering, is_active, startDate, endDate, email, status);
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to fetch finance users");
        }
    }
)

export const createFinanceUser = createAsyncThunk<any, any>(
    "financeUser/createFinanceUser",
    async (payload, { rejectWithValue }) => {
        try {
            return await createFinanceUserApi(payload);
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to create finance user");
        }
    }
)

export const updateFinanceUser = createAsyncThunk<any, { id: string | number; userData: any }>(
    "financeUser/updateFinanceUser",
    async ({ id, userData }, { rejectWithValue }) => {
        try {
            return await updateFinanceUserApi(id, userData);
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to update finance user");
        }
    }
)

export const updateFinanceUserStatus = createAsyncThunk<any, { id: string | number; status: boolean }>(
    "financeUser/updateFinanceUserStatus",
    async ({ id, status }, { rejectWithValue }) => {
        try {
            return await updateFinanceUserStatusApi(id, { status });
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to update status");
        }
    }
)

export const financeUserSlice = createSlice({
    name: "financeUser",
    initialState,
    reducers: {
        setPage(state, action) {
            state.page = action.payload;
        },
        removeFinanceUser: (state, action: PayloadAction<number | string>) => {
            state.data = state.data.filter((item) => item.id !== action.payload);
        },
        StatusFinanceUser: (state, action: PayloadAction<number | string>) => {
            state.data = state.data.map((item) =>
                item.id.toString() === action.payload.toString()
                    ? { ...item, is_active: !item.is_active }
                    : item
            );
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getFinanceUsers.pending, (state) => {
                state.loading = true;
            })
            .addCase(getFinanceUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(createFinanceUser.fulfilled, (state, action) => {
                state.loading = false;
                const now = new Date().toISOString();
                if(action.payload?.data) {
                    state.data.unshift({ ...action.payload.data, created_at: action.payload.data.created_at || now, updated_at: action.payload.data.updated_at || now });
                } else if (action.payload) {
                    state.data.unshift({ ...action.payload, created_at: action.payload.created_at || now, updated_at: action.payload.updated_at || now });
                }
            })
            .addCase(updateFinanceUser.fulfilled, (state, action) => {
                state.loading = false;
                const payloadData = action.payload?.data || action.payload;
                if(payloadData) {
                    state.data = state.data.map(item => item.id == payloadData.id ? { ...item, ...payloadData, updated_at: payloadData.updated_at || new Date().toISOString() } : item);
                }
            })
            .addCase(getFinanceUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(updateFinanceUserStatus.fulfilled, (state, action) => {
                const { id, status } = action.meta.arg;
                state.data = state.data.map((item) =>
                    item.id.toString() === id.toString()
                        ? { ...item, is_active: status, updated_at: new Date().toISOString() }
                        : item
                );
            });
    },
});

export const { setPage, removeFinanceUser, StatusFinanceUser } = financeUserSlice.actions;

export default financeUserSlice.reducer;
