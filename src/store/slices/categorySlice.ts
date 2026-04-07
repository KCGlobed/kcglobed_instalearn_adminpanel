// src/redux/slices/essaySlice.ts
import { createSlice, createAsyncThunk, type PayloadAction, } from "@reduxjs/toolkit";
import type { Category, Pagination } from "../../utils/types";
import { createCategory, fetchCategory, updateCategoryApi } from "../../services/apiServices";

interface CatgoryState extends Pagination<Category> { }

const initialState: CatgoryState = {
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

// Async thunk to fetch paginated student data
export const getCategory = createAsyncThunk<Pagination<Category>, { page?: number; search?: string; name?: string; description?: string; ordering?: string; status?: string; startDate?: string; endDate?: string }>(
    "category/getCategory",
    async ({ page = 1, search = "", name = "", description = "", ordering = "", status = "", startDate = "", endDate = "" }, { rejectWithValue }) => {
        try {
            return await fetchCategory(page, search, name, description, ordering, status, startDate, endDate);
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to fetch categories");
        }
    }
);

export const addCategory = createAsyncThunk<Category, any, { rejectValue: string }>(
    "category/addCategory",
    async (categoryData, { rejectWithValue }) => {
        try {
            const data = await createCategory(categoryData);
            // the API response might be direct object or wrapped in `data`
            return data?.data ? data.data : data;

        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to create category");
        }
    }
);

export const editCategory = createAsyncThunk<Category, any, { rejectValue: string }>(
    "category/editCategory",
    async ({ id, categoryData }, { rejectWithValue }) => {
        try {
            const data = await updateCategoryApi(id, categoryData);
            return data.data;

        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to fetch blogs");
        }
    }
);



const categorySlice = createSlice({
    name: "category",
    initialState,
    reducers: {
        setPage(state, action) {
            state.page = action.payload;
        },
        removeCategory: (state, action: PayloadAction<Number | string>) => {
            state.data = state.data.filter((item) => item.id !== action.payload);
        },
        StatusCategory: (state, action: PayloadAction<number | string>) => {
            state.data = state.data.map((item) =>
                item.id.toString() === action.payload.toString()
                    ? { ...item, status: !item.status }
                    : item
            );
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination
            })
            .addCase(getCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(addCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.data.unshift(action.payload);
            })
            .addCase(editCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.map(item => item.id == action.payload.id ? action.payload : item);
            })
    },
});

export const { setPage, removeCategory, StatusCategory } = categorySlice.actions;

export default categorySlice.reducer;