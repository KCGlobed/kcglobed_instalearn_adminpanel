import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Pagination, CustomerSupportUser } from "../../utils/types";
import { fetchCustomerSupportUsers, createCustomerSupportUserApi, updateCustomerSupportUserApi, updateCustomerSupportUserStatusApi } from "../../services/apiServices";

interface CustomerSupportUserState extends Pagination<CustomerSupportUser> {
    selectedCustomerSupportUser: CustomerSupportUser | null;
    selectedCustomerSupportUserLoading: boolean;
    selectedCustomerSupportUserError: string | null;
}

const initialState: CustomerSupportUserState = {
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
    selectedCustomerSupportUser: null,
    selectedCustomerSupportUserLoading: false,
    selectedCustomerSupportUserError: null,
};

export const getCustomerSupportUsers = createAsyncThunk<Pagination<CustomerSupportUser>, { page?: number; search?: string; first_name?: string; last_name?: string; ordering?: string; is_active?: string; startDate?: string; endDate?: string; email?: string; status?: string; }>
( "customerSupportUser/getCustomerSupportUsers", async ({ page = 1, search = "", first_name = "", last_name = "", ordering = "", is_active = "", startDate = "", endDate = "", email = "", status="" }, { rejectWithValue }) => {
    try {
        return await fetchCustomerSupportUsers(page, search, first_name, last_name, ordering, is_active, startDate, endDate, email, status);
    } catch (err: any) {
        return rejectWithValue(err?.message || "Failed to fetch customer support users");
    }
})

export const createCustomerSupportUser = createAsyncThunk<any, any>(
    "customerSupportUser/createCustomerSupportUser",
    async (payload, { rejectWithValue }) => {
        try {
            return await createCustomerSupportUserApi(payload);
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to create customer support user");
        }
    }
)

export const updateCustomerSupportUser = createAsyncThunk<any, { id: string | number; customerSupportUserData: any }>(
    "customerSupportUser/updateCustomerSupportUser",
    async ({ id, customerSupportUserData }, { rejectWithValue }) => {
        try {
            return await updateCustomerSupportUserApi(id, customerSupportUserData);
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to update customer support user");
        }
    }
)

export const updateCustomerSupportUserStatus = createAsyncThunk<any, { id: string | number; status: boolean }>(   
    "customerSupportUser/updateCustomerSupportUserStatus",
    async ({ id, status }, { rejectWithValue }) => {
        try {
            return await updateCustomerSupportUserStatusApi(id, { status });
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to update customer support user status");
        }
    }
)

export const customerSupportUserSlice = createSlice({
    name: "customerSupportUser",
    initialState,
    reducers: {
        setPage(state, action) { 
            state.page = action.payload;
        },
        removeCustomerSupportUser: (state, action: PayloadAction<number | string>) => {
            state.data = state.data.filter((item) => item.id !== action.payload);
        },
        StatusCustomerSupportUser: (state, action: PayloadAction<number | string>) => {
            state.data = state.data.map((item) =>
                item.id.toString() === action.payload.toString()
                    ? { ...item, is_active: !item.is_active }
                    : item
            );
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getCustomerSupportUsers.pending, (state) => {
                state.loading = true;
            })
            .addCase(getCustomerSupportUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(getCustomerSupportUsers.rejected, (state, action) => {
                state.loading = false;
                state.error= action.payload as string;
            })
            .addCase(createCustomerSupportUser.fulfilled, (state, action) => {
                const now = new Date().toISOString();
                if (action.payload) {
                    const rawData = action.payload.data || action.payload;
                    state.data.unshift({ ...rawData, created_at: rawData.created_at || now, updated_at: rawData.updated_at || now });
                }
            })
            .addCase(updateCustomerSupportUser.fulfilled, (state, action) => {
                if (action.payload) {
                    const updatedData = action.payload.data || action.payload;
                    state.data = state.data.map((item) =>
                        item.id.toString() === updatedData.id?.toString() ? { ...item, ...updatedData, updated_at: updatedData.updated_at || new Date().toISOString() } : item
                    );
                }
            })
            .addCase(updateCustomerSupportUserStatus.fulfilled, (state, action) => {
                const { id, status } = action.meta.arg;
                state.data = state.data.map((item) =>
                    item.id.toString() === id.toString()
                        ? { ...item, is_active: status, updated_at: new Date().toISOString() }
                        : item
                );
                if (state.selectedCustomerSupportUser && state.selectedCustomerSupportUser.id.toString() === id.toString()) {
                    state.selectedCustomerSupportUser.is_active = status;
                }
            })
    },
});

export const { setPage, removeCustomerSupportUser, StatusCustomerSupportUser } = customerSupportUserSlice.actions;

export default customerSupportUserSlice.reducer;
