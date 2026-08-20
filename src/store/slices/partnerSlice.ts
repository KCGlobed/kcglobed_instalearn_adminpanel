import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Pagination, partner } from "../../utils/types";
import { getPartnerApi } from "../../services/apiServices";

interface partnerState extends Pagination<partner>{}

const initialState: partnerState = {
    data: [],
    next: null,
    previous: null,
    page: 1,
    pagination: {
        total_results: null,
        total_pages: null,
        current_page: null,
        next_page: null,
        page_size: null,
        previous_page: null,
    },
    loading: false,
    error: null
}

export const getPartner = createAsyncThunk<Pagination<partner>, { page?: number; search?: string; ordering?: string; start_date?: string; end_date?: string; first_name?: string; last_name?: string; email?: string; mobile?: string; partner_type?: string }>(
    "partner/getPartner",
    async ({
        page = 1,
        search = "",
        ordering = "",
        start_date = "",
        end_date = "",
        first_name = "",
        last_name = "",
        email = "",
        mobile = "",
        partner_type = "",
    }, { rejectWithValue }) => {
        try {
            return await getPartnerApi(page, search, ordering, start_date, end_date, first_name, last_name, email, mobile, partner_type);
        } catch (error: any) {
            return rejectWithValue(error?.message || "Failed to fetch partner requests");
        }
    }
)

const partnerSlice = createSlice({
    name: "partner",
    initialState,
    reducers: {
        setPage(state, action: PayloadAction<number>) {
            state.page = action.payload;
        },
        removePartner(state, action: PayloadAction<string|number>) {
            state.data = state.data.filter((item) => item.id != action.payload) 
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getPartner.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getPartner.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(getPartner.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
    }
})

export const { setPage, removePartner } = partnerSlice.actions;
export default partnerSlice.reducer;