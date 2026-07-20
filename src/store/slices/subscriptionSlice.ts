import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { Subscription, Pagination } from "../../utils/types";
import { fetchSubscription, createSubscription, editSubscriptionApi, updateSubscriptionStatusApi, deleteSubscriptionApi } from "../../services/apiServices";

interface SubscriptionState extends Pagination<Subscription> {}

const initialState: SubscriptionState = {
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
};

export const getSubscription = createAsyncThunk<Pagination<Subscription>, { page?: number; search?: string; plan_name?: string; ordering?: string; status?: string; startDate?: string; endDate?: string }>(
    "subscription/getSubscription",
    async ({ page = 1, search = "", plan_name = "", ordering = "", status = "", startDate = "", endDate = "" }, { rejectWithValue }) => {
        try {
            return await fetchSubscription(page, search, plan_name, ordering, status, startDate, endDate);
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to fetch subscriptions");
        }
    }
);

export const addSubscription = createAsyncThunk<Subscription, any>(
    "subscription/addSubscription",
    async (subscriptionData, { rejectWithValue }) => {
        try {
            const res = await createSubscription(subscriptionData);
            return res?.data ? res.data : res;
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to create subscription");
        }
    }
);

export const editSubscription = createAsyncThunk<Subscription, { id: number | string, payload: any }>(
    "subscription/editSubscription",
    async ({ id, payload }, { rejectWithValue }) => {
        try {
            const res = await editSubscriptionApi(id, payload);
            return res?.data ? res.data : res;
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to edit subscription");
        }
    }
);

export const updateSubscriptionStatus = createAsyncThunk<Subscription, { id: number | string, status: boolean }>(
    "subscription/updateSubscriptionStatus",
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const res = await updateSubscriptionStatusApi(id, { status });
            return res?.data ? res.data : res;
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to update subscription status");
        }
    }
);

const subscriptionSlice = createSlice({
    name: "subscription",
    initialState,
    reducers: {
        setPage(state, action: PayloadAction<number>) {
            state.page = action.payload;
        },
        removeSubscription: (state, action: PayloadAction<number | string>) => {
            state.data = state.data.filter((item) => item.id !== action.payload);
        },
        statusSubscription: (state, action: PayloadAction<number | string>) => {
            state.data = state.data.map((item) =>
                item.id.toString() === action.payload.toString()
                    ? { ...item, status: !item.status }
                    : item
            );
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getSubscription.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getSubscription.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(getSubscription.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(addSubscription.fulfilled, (state, action) => {
                state.loading = false;
                state.data.unshift(action.payload);
            })
            .addCase(editSubscription.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.map(item => item.id === action.payload.id ? action.payload : item);
            })
            .addCase(updateSubscriptionStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.map(item => item.id === action.payload.id ? action.payload : item);
            });
    },
});

export const { setPage, removeSubscription,statusSubscription } = subscriptionSlice.actions;

export default subscriptionSlice.reducer;
