import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { supportSubTopic, Pagination } from "../../utils/types";
import { createSupportSubTopic, fetchSupportSubTopic, updateSupportSubTopicApi, updateSupportSubTopicStatusApi } from "../../services/apiServices";

interface SupportSubTopicState extends Pagination<supportSubTopic> { }

const initialState: SupportSubTopicState = {
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

// Async thunk to fetch paginated support subtopic data
export const getSupportSubTopic = createAsyncThunk<Pagination<supportSubTopic>, { page?: number; search?: string; title?: string; ordering?: string; status?: string; startDate?: string; endDate?: string }>(
    "supportSubTopic/getSupportSubTopic",
    async ({ page = 1, search = "", title = "", ordering = "", status = "", startDate = "", endDate = "" }, { rejectWithValue }) => {
        try {
            return await fetchSupportSubTopic(page, search, title, ordering, status, startDate, endDate);
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to fetch support subtopics");
        }
    }
);

export const addSupportSubTopic = createAsyncThunk<supportSubTopic, any, { rejectValue: string }>(
    "supportSubTopic/addSupportSubTopic",
    async (topicData, { rejectWithValue }) => {
        try {
            const data = await createSupportSubTopic(topicData);
            return data?.data ? data.data : data;
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to create support subtopic");
        }
    }
);

export const editSupportSubTopic = createAsyncThunk<supportSubTopic, any, { rejectValue: string }>(
    "supportSubTopic/editSupportSubTopic",
    async ({ id, topicData }, { rejectWithValue }) => {
        try {
            const data = await updateSupportSubTopicApi(id, topicData);
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to update support subtopic");
        }
    }
);

export const updateSupportSubTopicStatus = createAsyncThunk<supportSubTopic, any, { rejectValue: string }>
    ("supportSubTopic/updateSupportSubTopicStatus",
        async ({ id, status }, { rejectWithValue }) => {
            try {
                const data = await updateSupportSubTopicStatusApi(id, { status });
                return data.data;
            } catch (error: any) {
                return rejectWithValue(error.message || "Failed to update support subtopic status");
            }
        }
    );

const supportSubTopicSlice = createSlice({
    name: "supportSubTopic",
    initialState,
    reducers: {
        setPage(state, action) {
            state.page = action.payload;
        },
        removeSupportSubTopic: (state, action: PayloadAction<Number | string>) => {
            state.data = state.data.filter((item) => item.id !== action.payload);
        },
        StatusSupportSubTopic: (state, action: PayloadAction<number | string>) => {
            state.data = state.data.map((item) =>
                item.id.toString() === action.payload.toString()
                    ? { ...item, status: !item.status }
                    : item
            );
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getSupportSubTopic.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getSupportSubTopic.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(getSupportSubTopic.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(addSupportSubTopic.fulfilled, (state, action) => {
                state.loading = false;
                state.data.unshift(action.payload);
            })
            .addCase(editSupportSubTopic.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.map(item => item.id == action.payload.id ? action.payload : item);
            })
            .addCase(updateSupportSubTopicStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.map(item => item.id == action.payload.id ? action.payload : item);
            });
    },
});

export const { setPage, removeSupportSubTopic, StatusSupportSubTopic } = supportSubTopicSlice.actions;

export default supportSubTopicSlice.reducer;
