import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { storeToken, storeRefreshToken, getToken, clearToken, storeUserID } from "../../utils/tokenStorage"; // utils to persist tokens
import { apiRequest } from "../../services/apiRequest";
import type { AuthState, LoginCred, Role } from "../../utils/types";



const initialState: AuthState = {
  isAuthenticated: !!getToken(),
  token: getToken(),
  role: {
    data: []
  },
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    credentials: LoginCred,
    { rejectWithValue }
   ) => {
    try {
      const response = await apiRequest<{
        data: any; token: string }>(
        "user/login/",
        "POST",
        credentials
      );
      const { access, refresh}:any = response.data.token;

      storeToken(access);
      storeRefreshToken(refresh);
      storeUserID(response.data.user_role);
      return access;
    } catch (error: any) {
      return rejectWithValue(error?.message || "Login failed");
    }
  }
);

export const getRoles = createAsyncThunk<Role,void, { rejectValue: string }>(
  "auth/getRoles",
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiRequest<Role>(
        "user/get-roles/",
        "GET"
      );
      return data;
     
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch blogs");
    }
  }
);
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      clearToken();
    },
    restoreAuth: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
       .addCase(getRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.role.data =action.payload.data
        console.log("Roles fetched successfully:", action.payload);
      })
      .addCase(getRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
