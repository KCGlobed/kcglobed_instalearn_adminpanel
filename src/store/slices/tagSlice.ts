import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Pagination, Tag } from "../../utils/types";
import { createTag, fetchTags, deleteTag, updateTagApi, updateTagStatusApi } from "../../services/apiServices";

interface tagState extends Pagination<Tag> { }

const initialState: tagState = {
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

export const getTags = createAsyncThunk<Pagination<Tag>, { page?: number; search?: string; ordering?: string; status?: string; startDate?: string; endDate?: string }>(
    "tags/getTags",
    async ({ page = 1, search = "", ordering = "", status = "", startDate = "", endDate = "" }, { rejectWithValue }) => {
        try {
            return await fetchTags(page, search, ordering, status, startDate, endDate);

        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to fecth the tags ");
        }
    }
);

export const addTag = createAsyncThunk<Tag, any, { rejectValue: string }>(
    "tags/addTags",
    async (tagData, { rejectWithValue }) => {
        try {
            const data = await createTag(tagData);
            // the API response might be direct object or wrapped in `data`
            return data?.data ? data.data : data;

        } catch (err: any) {
            return rejectWithValue(err.message || "Failed to create tag");
        }
    }
);

export const deleteTags = createAsyncThunk<number | string, any, { rejectValue: string }>(
    "tags/deleteTags",
    async (id, { rejectWithValue }) => {
        try {
            await deleteTag(id);
            return id;
        } catch (err: any) {
            return rejectWithValue(err.message || "Failed to delete tag");
        }
    }
)
export const editTag = createAsyncThunk<Tag, { id: number | string; tagData: any }, { rejectValue: string }>(
    "tags/updateTags",
    async ({ id, tagData }, { rejectWithValue }) => {
        try {
            const response = await updateTagApi(id, tagData);
            return response?.data ? response.data : response;
        } catch (err: any) {
            return rejectWithValue(err.message || "Failed to update tag");
        }
    }
)

export const editTagStatus = createAsyncThunk<Tag, { id: number | string; tagData: any }, { rejectValue: string }>(
    "tags/updateTagStatus",
    async ({ id, tagData }, { rejectWithValue }) => {
        try {
            const response = await updateTagStatusApi(id, tagData);
            return response?.data ? response.data : response;
        } catch (err: any) {
            return rejectWithValue(err.message || "Failed to update tag status");
        }
    }
)

const tagsSlice = createSlice({
    name: "tags",
    initialState,
    reducers: {
        setPage(state, action) {
            state.page = action.payload;
        },
        removeTags: (state, action: PayloadAction<Number | string>) => {
            state.data = state.data.filter((item) => item.id !== action.payload);
        },
        StatusTags: (state, action: PayloadAction<number | string>) => {
            state.data = state.data.map((item) =>
                item.id.toString() === action.payload.toString()
                    ? { ...item, status: !item.status }
                    : item
            );
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getTags.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getTags.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(getTags.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string
            })
            .addCase(addTag.fulfilled, (state, action) => {
                state.loading = false;
                state.data.unshift(action.payload);
            })
            .addCase(deleteTags.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.filter((item) => item.id !== action.payload);
            })
            .addCase(editTag.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.data.findIndex((item) => item.id === action.payload.id);
                if (index !== -1) {
                    state.data[index] = action.payload;
                }
            })
            .addCase(editTagStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.map(item => item.id == action.payload.id ? action.payload : item);
            })

    }
}
)

export const { setPage, removeTags, StatusTags } = tagsSlice.actions;

export default tagsSlice.reducer