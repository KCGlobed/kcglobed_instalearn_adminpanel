import { createSlice, createAsyncThunk, type PayloadAction, } from "@reduxjs/toolkit";
import type { coupons, Pagination } from "../../utils/types";
import { fetchCoupons, createCoupon, updateCouponApi, updateCouponStatusApi } from "../../services/apiServices";

interface CouponState extends Pagination<coupons> { }

const initialState: CouponState = {
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

// Async thunk to fetch paginated coupon data
export const getCoupons = createAsyncThunk<Pagination<coupons>, { page?: number; search?: string; code?: string; discount_type?: string; ordering?: string; status?: string; startDate?: string; endDate?: string }>(
    "coupon/getCoupons",
    async ({ page = 1, search = "", code = "", discount_type = "", ordering = "", status = "", startDate = "", endDate = "" }, { rejectWithValue }) => {
        try {
            return await fetchCoupons(page, search, code, discount_type, ordering, status, startDate, endDate);
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to fetch coupons");
        }
    }
);

export const addCoupon = createAsyncThunk<coupons, any, { rejectValue: string }>(
    "coupon/addCoupon",
    async (couponData, { rejectWithValue }) => {
        try {
            const data = await createCoupon(couponData);
            return data?.data ? data.data : data;

        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to create coupon");
        }
    }
);

export const editCoupon = createAsyncThunk<coupons, any, { rejectValue: string }>(
    "coupon/editCoupon",
    async ({ id, couponData }, { rejectWithValue }) => {
        try {
            const data = await updateCouponApi(id, couponData);
            return data.data;

        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to edit coupon");
        }
    }
);

export const updateCouponStatus = createAsyncThunk<coupons, any, { rejectValue: string }>
    ("coupon/updateCouponStatus",
        async ({ id, status }, { rejectWithValue }) => {
            try {
                const data = await updateCouponStatusApi(id, { status });
                return data.data;
            } catch (error: any) {
                return rejectWithValue(error.message || "Failed to update coupon status");
            }
        }
    );



const couponSlice = createSlice({
    name: "coupon",
    initialState,
    reducers: {
        setPage(state, action) {
            state.page = action.payload;
        },
        removeCoupon: (state, action: PayloadAction<Number | string>) => {
            state.data = state.data.filter((item) => item.id !== action.payload);
        },
        StatusCoupon: (state, action: PayloadAction<number | string>) => {
            state.data = state.data.map((item) =>
                item.id.toString() === action.payload.toString()
                    ? { ...item, status: !item.status }
                    : item
            );
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getCoupons.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getCoupons.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(getCoupons.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(addCoupon.fulfilled, (state, action) => {
                state.loading = false;
                state.data.unshift(action.payload);
            })
            .addCase(editCoupon.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.map(item => item.id == action.payload.id ? action.payload : item);
            })
            .addCase(updateCouponStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.map(item => item.id == action.payload.id ? action.payload : item);
            })
    },
});

export const { setPage, removeCoupon, StatusCoupon } = couponSlice.actions;

export default couponSlice.reducer;
