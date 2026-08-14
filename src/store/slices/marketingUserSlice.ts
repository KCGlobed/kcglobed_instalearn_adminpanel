import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Pagination, MarketingUser } from "../../utils/types";
import { fetchMarketingUsers, createMarketingUserApi, updateMarketingUserApi, updateMarketingUserStatusApi } from "../../services/apiServices";

interface MarketingUserState extends Pagination<MarketingUser> {
    selectedMarketingUser: MarketingUser | null;
    selectedMarketingUserLoading: boolean;
    selectedMarketingUserError: string | null;
}

const initialState: MarketingUserState = {
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
    selectedMarketingUser: null,
    selectedMarketingUserLoading: false,
    selectedMarketingUserError: null,
};

export const getMarketingUsers = createAsyncThunk<Pagination<MarketingUser>, { page?: number; search?: string; first_name?: string; last_name?: string; ordering?: string; is_active?: string; startDate?: string; endDate?: string; email?: string; status?: string; }>
( "marketingUser/getMarketingUsers", async ({ page = 1, search = "", first_name = "", last_name = "", ordering = "", is_active = "", startDate = "", endDate = "", email = "", status="" }, { rejectWithValue }) => {
    try {
        return await fetchMarketingUsers(page, search, first_name, last_name, ordering, is_active, startDate, endDate, email, status);
    } catch (err: any) {
        return rejectWithValue(err?.message || "Failed to fetch marketing users");
    }
})

export const createMarketingUser = createAsyncThunk<any, any>(
    "marketingUser/createMarketingUser",
    async (payload, { rejectWithValue }) => {
        try {
            return await createMarketingUserApi(payload);
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to create marketing user");
        }
    }
)

export const updateMarketingUser = createAsyncThunk<any, { id: string | number; marketingUserData: any }>(
    "marketingUser/updateMarketingUser",
    async ({ id, marketingUserData }, { rejectWithValue }) => {
        try {
            return await updateMarketingUserApi(id, marketingUserData);
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to update marketing user");
        }
    }
)

export const updateMarketingUserStatus = createAsyncThunk<any, { id: string | number; status: boolean }>(   
    "marketingUser/updateMarketingUserStatus",
    async ({ id, status }, { rejectWithValue }) => {
        try {
            return await updateMarketingUserStatusApi(id, { status });
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to update marketing user status");
        }
    }
)

export const marketingUserSlice = createSlice({
    name: "marketingUser",
    initialState,
    reducers: {
        setPage(state, action) { 
            state.page = action.payload;
        },
        removeMarketingUser: (state, action: PayloadAction<number | string>) => {
            state.data = state.data.filter((item) => item.id !== action.payload);
        },
        StatusMarketingUser: (state, action: PayloadAction<number | string>) => {
            state.data = state.data.map((item) =>
                item.id.toString() === action.payload.toString()
                    ? { ...item, is_active: !item.is_active }
                    : item
            );
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getMarketingUsers.pending, (state) => {
                state.loading = true;
            })
            .addCase(getMarketingUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(getMarketingUsers.rejected, (state, action) => {
                state.loading = false;
                state.error= action.payload as string;
            })
            .addCase(createMarketingUser.fulfilled, (state, action) => {
                const now = new Date().toISOString();
                if (action.payload) {
                    const rawData = action.payload.data || action.payload;
                    state.data.unshift({ ...rawData, created_at: rawData.created_at || now, updated_at: rawData.updated_at || now });
                }
            })
            .addCase(updateMarketingUser.fulfilled, (state, action) => {
                if (action.payload) {
                    const updatedData = action.payload.data || action.payload;
                    state.data = state.data.map((item) =>
                        item.id.toString() === updatedData.id?.toString() ? { ...item, ...updatedData, updated_at: updatedData.updated_at || new Date().toISOString() } : item
                    );
                }
            })
            .addCase(updateMarketingUserStatus.fulfilled, (state, action) => {
                const { id, status } = action.meta.arg;
                state.data = state.data.map((item) =>
                    item.id.toString() === id.toString()
                        ? { ...item, is_active: status, updated_at: new Date().toISOString() }
                        : item
                );
                if (state.selectedMarketingUser && state.selectedMarketingUser.id.toString() === id.toString()) {
                    state.selectedMarketingUser.is_active = status;
                }
            })
    },
});

export const { setPage, removeMarketingUser, StatusMarketingUser } = marketingUserSlice.actions;

export default marketingUserSlice.reducer;
