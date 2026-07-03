import { createSlice, createAsyncThunk, type PayloadAction, } from "@reduxjs/toolkit";
import type { SupportTopic, Pagination } from "../../utils/types";
import { createSupportTopic, fetchSupportTopic, updateSupportTopicApi, updateSupportTopicStatusApi,  } from "../../services/apiServices";

interface SupportTopicState extends Pagination<SupportTopic> { }

const initialState: SupportTopicState = {
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

// Async thunk to fetch paginated support topic data
export const getSupportTopic = createAsyncThunk<Pagination<SupportTopic>, { page?: number; search?: string; title?: string; description?: string; ordering?: string; status?: string; startDate?: string; endDate?: string }>(
    "supportTopic/getSupportTopic",
    async ({ page = 1, search = "", title = "", description = "", ordering = "", status = "", startDate = "", endDate = "" }, { rejectWithValue }) => {
        try {
            return await fetchSupportTopic(page, search, title, description, ordering, status, startDate, endDate);
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to fetch support topics");
        }
    }
);

export const addSupportTopic = createAsyncThunk<SupportTopic, any, { rejectValue: string }>(
    "supportTopic/addSupportTopic",
    async (topicData, { rejectWithValue }) => {
        try {
            const data = await createSupportTopic(topicData);
            return data?.data ? data.data : data;
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to create support topic");
        }
    }
);

export const editSupportTopic = createAsyncThunk<SupportTopic, any, { rejectValue: string }>(
    "supportTopic/editSupportTopic",
    async ({ id, topicData }, { rejectWithValue }) => {
        try {
            const data = await updateSupportTopicApi(id, topicData);
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to update support topic");
        }
    }
);

export const updateSupportTopicStatus = createAsyncThunk<SupportTopic, any, { rejectValue: string }>
    ("supportTopic/updateSupportTopicStatus",
        async ({ id, status }, { rejectWithValue }) => {
            try {
                const data = await updateSupportTopicStatusApi(id, { status });
                return data.data;
            } catch (error: any) {
                return rejectWithValue(error.message || "Failed to update support topic status");
            }
        }
    );

const supportTopicSlice = createSlice({
    name: "supportTopic",
    initialState,
    reducers: {
        setPage(state, action) {
            state.page = action.payload;
        },
        removeSupportTopic: (state, action: PayloadAction<Number | string>) => {
            state.data = state.data.filter((item) => item.id !== action.payload);
        },
        StatusSupportTopic: (state, action: PayloadAction<number | string>) => {
            state.data = state.data.map((item) =>
                item.id.toString() === action.payload.toString()
                    ? { ...item, status: !item.status }
                    : item
            );
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getSupportTopic.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getSupportTopic.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(getSupportTopic.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(addSupportTopic.fulfilled, (state, action) => {
                state.loading = false;
                state.data.unshift(action.payload);
            })
            .addCase(editSupportTopic.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.map(item => item.id == action.payload.id ? action.payload : item);
            })
            .addCase(updateSupportTopicStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.map(item => item.id == action.payload.id ? action.payload : item);
            });
    },
});

export const { setPage, removeSupportTopic, StatusSupportTopic } = supportTopicSlice.actions;

export default supportTopicSlice.reducer;