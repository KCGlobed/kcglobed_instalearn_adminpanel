// src/store/slices/subcategorySlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { Subcategory, Pagination } from "../../utils/types";
import { createSubCategory, fetchSubcategory, updateCategoryStatusApi, updateSubCategoryApi, updateSubCategoryStatusApi } from "../../services/apiServices";

interface SubcategoryState extends Pagination<Subcategory> { }

const initialState: SubcategoryState = {
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

// Async thunk to fetch paginated subcategory data
export const getSubcategory = createAsyncThunk<
    Pagination<Subcategory>,
    { page?: number; search?: string; name?: string; description?: string; ordering?: string; status?: string; startDate?: string; endDate?: string }
>(
    "subcategory/getSubcategory",
    async ({ page = 1, search = "", name = "", description = "", ordering = "", status = "", startDate = "", endDate = "" }, { rejectWithValue }) => {
        try {
            return await fetchSubcategory(page, search, name, description, ordering, status, startDate, endDate);
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to fetch subcategories");
        }
    }
);

export const addSubcategory = createAsyncThunk<Subcategory, any, { rejectValue: string }>(
    "subcategory/addSubcategory",
    async (subcategoryData, { rejectWithValue }) => {
        try {
            const data = await createSubCategory(subcategoryData);
            // the API response might be direct object or wrapped in `data`
            return data?.data ? data.data : data;
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to create subcategory");
        }
    }
);

export const editSubcategory = createAsyncThunk<Subcategory, { id: string | number; subcategoryData: any }, { rejectValue: string }>(
    "subcategory/editSubcategory",
    async ({ id, subcategoryData }, { rejectWithValue }) => {
        try {
            const data = await updateSubCategoryApi(id, subcategoryData);
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to update subcategory");
        }
    }
);



export const updateSubCategoryStatus = createAsyncThunk<Subcategory, any, { rejectValue: string }>
    ("subcategory/updateSubCategoryStatus",
        async ({ id, status }, { rejectWithValue }) => {
            try {
                const data = await updateSubCategoryStatusApi(id, { status });
                return data.data;
            } catch (error: any) {
                return rejectWithValue(error.message || "Failed to update category status");
            }
        }
    );


const subcategorySlice = createSlice({
    name: "subcategory",
    initialState,
    reducers: {
        setPage(state, action: PayloadAction<number>) {
            state.page = action.payload;
        },
        removeSubcategory: (state, action: PayloadAction<number | string>) => {
            state.data = state.data.filter((item) => item.id !== action.payload);
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getSubcategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getSubcategory.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination;
                state.next = action.payload.next;
                state.previous = action.payload.previous;
            })
            .addCase(getSubcategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(addSubcategory.fulfilled, (state, action) => {
                state.loading = false;
                state.data.unshift(action.payload);
            })
            .addCase(editSubcategory.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.map(item => item.id === action.payload.id ? action.payload : item);
            })

            .addCase(updateSubCategoryStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.map(item => item.id === action.payload.id ? action.payload : item);
            });
    },
});

export const { setPage, removeSubcategory } = subcategorySlice.actions;

export default subcategorySlice.reducer;
