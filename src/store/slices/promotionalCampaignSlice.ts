import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { Pagination, promotionalCampaign } from "../../utils/types";
import { fetchPromoCamp, createPromoCamp, updatePromoCampApi, updatePromoCampStatusApi } from "../../services/apiServices";

interface PromoCampState extends Pagination<promotionalCampaign> { }

const initialState: PromoCampState = {
    data: [],
    next: null,
    previous: null,
    pagination: {
        total_results: null,
        total_pages: null,
        current_page: null,
        next_page: null,
        page_size: null,
        previous_page: null,
    },
    page: 1,
    loading: false,
    error: null,
};

export const getPromoCamp = createAsyncThunk<Pagination<promotionalCampaign>, { page?: number; search?: string; title?: string; ordering?: string; status?: string; startDate?: string; endDate?: string }>(
    "promotionalCampaign/getPromoCamp",
    async ({ page = 1, search = "", title = "", ordering = "", status = "", startDate = "", endDate = "" }, { rejectWithValue }) => {
        try {
            return await fetchPromoCamp(page, search, title, ordering, status, startDate, endDate);
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to fetch promotional campaigns");
        }
    }
);

export const addPromoCamp = createAsyncThunk<promotionalCampaign, any, { rejectValue: string }>(
    "promotionalCampaign/addPromoCamp",
    async (promoData, { rejectWithValue }) => {
        try {
            const data = await createPromoCamp(promoData);
            return data?.data ? data.data : data;
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to create promotional campaign");
        }
    }
);

export const editPromoCamp = createAsyncThunk<promotionalCampaign, any, { rejectValue: string }>(
    "promotionalCampaign/editPromoCamp",
    async ({ id, promoData }, { rejectWithValue }) => {
        try {
            const data = await updatePromoCampApi(id, promoData);
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to edit promotional campaign");
        }
    }
);

export const updatePromoCampStatus = createAsyncThunk<promotionalCampaign, any, { rejectValue: string }>(
    "promotionalCampaign/updatePromoCampStatus",
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const data = await updatePromoCampStatusApi(id, { status });
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to update promotional campaign status");
        }
    }
);

const promotionalCampaignSlice = createSlice({
    name: "promotional_campaign",
    initialState,
    reducers: {
        setPage(state, action: PayloadAction<number>) {
            state.page = action.payload;
        },
        removeCampaign(state, action: PayloadAction<number | string>) {
            state.data = state.data.filter((item) => item.id.toString() !== action.payload.toString());
        },
        statusCampaign(state, action: PayloadAction<number | string>) {
            state.data = state.data.map((item) =>
                item.id.toString() === action.payload.toString()
                    ? { ...item, status: !item.status }
                    : item
            );
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getPromoCamp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getPromoCamp.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(getPromoCamp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(addPromoCamp.fulfilled, (state, action) => {
                state.loading = false;
                state.data.unshift(action.payload);
            })
            .addCase(editPromoCamp.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.map(item => item.id.toString() === action.payload.id.toString() ? action.payload : item);
            })
            .addCase(updatePromoCampStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.map(item => item.id.toString() === action.payload.id.toString() ? action.payload : item);
            });
    }
});

export const { setPage, removeCampaign, statusCampaign } = promotionalCampaignSlice.actions;
export default promotionalCampaignSlice.reducer;