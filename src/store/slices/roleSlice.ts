import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchRolesListingApi, fetchRolePermissionsApi, updateRolePermissionApi } from '../../services/apiServices';

import type { Pagination, Role } from '../../utils/types';

interface RoleState extends Pagination<Role> {
    rolePermissions: any[];
    permissionsLoading: boolean;
    updatingPermission: string | null;
}

const initialState: RoleState = {
    data: [],
    rolePermissions: [],
    loading: false,
    permissionsLoading: false,
    error: null,
    updatingPermission: null,
    pagination: {
        total_results: null,
        total_pages: null,
        current_page: null,
        next_page: null,
        page_size: null,
        previous_page: null,
    },
    next: null,
    previous: null,
    page: 1
};

export const fetchRoles = createAsyncThunk<any, { page: number; search?: string; ordering?: string }>(
    'roles/fetchRoles',
    async (
        { page, search, ordering },
        { rejectWithValue }
    ) => {
        try {
            const response = await fetchRolesListingApi(page, search, ordering);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch roles');
        }
    }
);

export const getRolePermissions = createAsyncThunk(
    'roles/getRolePermissions',
    async (roleName: string, { rejectWithValue }) => {
        try {
            const response = await fetchRolePermissionsApi(roleName);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch permissions');
        }
    }
);

export const updateRolePermission = createAsyncThunk(
    'roles/updateRolePermission',
    async (payload: { role_name: string; code: string; status: boolean }, { rejectWithValue }) => {
        try {
            const response = await updateRolePermissionApi(payload);
            return { ...payload, response }; // Return payload so we can update local state
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to update permission');
        }
    }
);

const roleSlice = createSlice({
    name: 'roles',
    initialState,
    reducers: {
        clearPermissions: (state) => {
            state.rolePermissions = [];
        },
        setRolesPage: (state, action) => {
            state.page = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRoles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRoles.fulfilled, (state, action) => {
                state.loading = false;
                const payload = action.payload;

                // Extract data: try data, then results, then treat as array
                state.data = payload?.data || payload?.results || (Array.isArray(payload) ? payload : []);

                // Extract pagination: use pagination object if available, otherwise build from count
                if (payload?.pagination) {
                    state.pagination = payload.pagination;
                } else {
                    const totalCount = payload?.count ?? state.data.length;
                    const pageSize = payload?.page_size ?? 20;
                    state.pagination = {
                        total_results: totalCount,
                        total_pages: Math.ceil(totalCount / pageSize),
                        current_page: state.page,
                        next_page: payload?.next ? state.page + 1 : null,
                        previous_page: payload?.previous ? state.page - 1 : null,
                        page_size: pageSize,
                    };
                }
            })
            .addCase(fetchRoles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(getRolePermissions.pending, (state) => {
                state.permissionsLoading = true;
            })
            .addCase(getRolePermissions.fulfilled, (state, action) => {
                state.permissionsLoading = false;
                state.rolePermissions = Array.isArray(action.payload) ? action.payload : (action.payload?.data || []);
            })
            .addCase(getRolePermissions.rejected, (state, action) => {
                state.permissionsLoading = false;
                state.error = action.payload as string;
            })
            .addCase(updateRolePermission.pending, (state, action) => {
                state.updatingPermission = action.meta.arg.code;
            })
            .addCase(updateRolePermission.fulfilled, (state, action) => {
                state.updatingPermission = null;
                // Update the local permission status immediately
                const permission = state.rolePermissions.find(p => p.code === action.payload.code);
                if (permission) {
                    permission.status = action.payload.status;
                }
            })
            .addCase(updateRolePermission.rejected, (state) => {
                state.updatingPermission = null;
            });
    },
});

export const { clearPermissions, setRolesPage } = roleSlice.actions;
export default roleSlice.reducer;
