import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Pagination, ContentManagement } from "../../utils/types";
import { fetchContentManagementUsers, createContentManagementUserApi, updateContentManagementUserApi, updateContentManagementUserStatusApi } from "../../services/apiServices";

interface ContentManagementState extends Pagination<ContentManagement> {
    selectedUser: ContentManagement | null;
    selectedUserLoading: boolean;
    selectedUserError: string | null;
}

const initialState: ContentManagementState = {
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
    selectedUser: null,
    selectedUserLoading: false,
    selectedUserError: null,
};

export const getContentManagementUsers = createAsyncThunk<Pagination<ContentManagement>, { page?: number; search?: string; first_name?: string; last_name?: string; ordering?: string; is_active?: string; startDate?: string; endDate?: string; email?: string; status?: string; }>(
    "contentManagement/getContentManagementUsers",
    async ({ page = 1, search = "", first_name = "", last_name = "", ordering = "", is_active = "", startDate = "", endDate = "", email = "", status = "" }, { rejectWithValue }) => {
        try {
            return await fetchContentManagementUsers(page, search, first_name, last_name, ordering, is_active, startDate, endDate, email, status);
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to fetch content management users");
        }
    }
)

export const createContentManagementUser = createAsyncThunk<any, any>(
    "contentManagement/createContentManagementUser",
    async (payload, { rejectWithValue }) => {
        try {
            return await createContentManagementUserApi(payload);
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to create content management user");
        }
    }
)

export const updateContentManagementUser = createAsyncThunk<any, { id: string | number; userData: any }>(
    "contentManagement/updateContentManagementUser",
    async ({ id, userData }, { rejectWithValue }) => {
        try {
            return await updateContentManagementUserApi(id, userData);
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to update content management user");
        }
    }
)

export const updateContentManagementUserStatus = createAsyncThunk<any, { id: string | number; status: boolean }>(
    "contentManagement/updateContentManagementUserStatus",
    async ({ id, status }, { rejectWithValue }) => {
        try {
            return await updateContentManagementUserStatusApi(id, { status });
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to update status");
        }
    }
)

export const contentManagementSlice = createSlice({
    name: "contentManagement",
    initialState,
    reducers: {
        setPage(state, action) {
            state.page = action.payload;
        },
        removeContentManagementUser: (state, action: PayloadAction<number | string>) => {
            state.data = state.data.filter((item) => item.id !== action.payload);
        },
        StatusContentManagementUser: (state, action: PayloadAction<number | string>) => {
            state.data = state.data.map((item) =>
                item.id.toString() === action.payload.toString()
                    ? { ...item, is_active: !item.is_active }
                    : item
            );
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getContentManagementUsers.pending, (state) => {
                state.loading = true;
            })
            .addCase(getContentManagementUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(createContentManagementUser.fulfilled, (state, action) => {
                state.loading = false;
                const now = new Date().toISOString();
                if(action.payload?.data) {
                    state.data.unshift({ ...action.payload.data, created_at: action.payload.data.created_at || now, updated_at: action.payload.data.updated_at || now });
                } else if (action.payload) {
                    state.data.unshift({ ...action.payload, created_at: action.payload.created_at || now, updated_at: action.payload.updated_at || now });
                }
            })
            .addCase(updateContentManagementUser.fulfilled, (state, action) => {
                state.loading = false;
                const payloadData = action.payload?.data || action.payload;
                if(payloadData) {
                    state.data = state.data.map(item => item.id == payloadData.id ? { ...item, ...payloadData, updated_at: payloadData.updated_at || new Date().toISOString() } : item);
                }
            })
            .addCase(getContentManagementUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(updateContentManagementUserStatus.fulfilled, (state, action) => {
                const { id, status } = action.meta.arg;
                state.data = state.data.map((item) =>
                    item.id.toString() === id.toString()
                        ? { ...item, is_active: status, updated_at: new Date().toISOString() }
                        : item
                );
            });
    },
});

export const { setPage, removeContentManagementUser, StatusContentManagementUser } = contentManagementSlice.actions;

export default contentManagementSlice.reducer;
