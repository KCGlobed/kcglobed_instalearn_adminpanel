import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { UserProfile, ProfileState, UpdateUserProfilePayload } from "../../utils/types";
import {
  getUserProfileApi,
  updateUserProfileApi,
  updateUserProfileImageApi,
  updateUserBannerImageApi,
  removeUserProfileImageApi,
} from "../../services/apiServices";

const initialState: ProfileState = {
  data: null,
  loading: false,
  error: null,
  updateLoading: false,
  imageLoading: false,
  bannerLoading: false,
};

export const getProfile = createAsyncThunk<UserProfile, void, { rejectValue: string }>(
  "profile/getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUserProfileApi();
      return response?.data || response;
    } catch (err: any) {
      return rejectWithValue(err?.message || "Failed to fetch profile");
    }
  }
);

export const updateProfile = createAsyncThunk<UserProfile, UpdateUserProfilePayload, { rejectValue: string }>(
  "profile/updateProfile",
  async (payload, { rejectWithValue }) => {
    try {
      const cleanPayload = {
        first_name: payload.first_name || "",
        last_name: payload.last_name || "",
        phone_1: payload.phone_1 || payload.phone1 || "",
        phone_2: payload.phone_2 || payload.phone2 || "",
        address: payload.address || "",
        city: payload.city || "",
        state: payload.state || "",
        country: payload.country || "",
        pincode: payload.pincode || ""
      };
      const response = await updateUserProfileApi(cleanPayload);
      return response?.data || response;
    } catch (err: any) {
      return rejectWithValue(err?.message || "Failed to update profile");
    }
  }
);

export const updateProfileImage = createAsyncThunk<any, FormData, { rejectValue: string }>(
  "profile/updateProfileImage",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await updateUserProfileImageApi(formData);
      return response?.data || response;
    } catch (err: any) {
      return rejectWithValue(err?.message || "Failed to update profile image");
    }
  }
);

export const updateBannerImage = createAsyncThunk<any, FormData, { rejectValue: string }>(
  "profile/updateBannerImage",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await updateUserBannerImageApi(formData);
      return response?.data || response;
    } catch (err: any) {
      return rejectWithValue(err?.message || "Failed to update banner image");
    }
  }
);

export const removeProfileImage = createAsyncThunk<any, void, { rejectValue: string }>(
  "profile/removeProfileImage",
  async (_, { rejectWithValue }) => {
    try {
      const response = await removeUserProfileImageApi();
      return response?.data || response;
    } catch (err: any) {
      return rejectWithValue(err?.message || "Failed to remove profile image");
    }
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfileData(state, action: PayloadAction<UserProfile>) {
      state.data = action.payload;
    },
    clearProfileError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getProfile
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch profile";
      })

      // updateProfile
      .addCase(updateProfile.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updateLoading = false;
        if (state.data) {
          state.data = { ...state.data, ...(action.payload || {}) };
        } else {
          state.data = action.payload;
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload || "Failed to update profile";
      })

      // updateProfileImage
      .addCase(updateProfileImage.pending, (state) => {
        state.imageLoading = true;
      })
      .addCase(updateProfileImage.fulfilled, (state, action) => {
        state.imageLoading = false;
        const newImage = action.payload?.image || action.payload?.profile_image || action.payload?.image_url;
        if (state.data && newImage) {
          state.data.image = newImage;
        }
      })
      .addCase(updateProfileImage.rejected, (state) => {
        state.imageLoading = false;
      })

      // updateBannerImage
      .addCase(updateBannerImage.pending, (state) => {
        state.bannerLoading = true;
      })
      .addCase(updateBannerImage.fulfilled, (state, action) => {
        state.bannerLoading = false;
        const newBanner = action.payload?.banner_image || action.payload?.banner || action.payload?.image;
        if (state.data && newBanner) {
          state.data.banner_image = newBanner;
        }
      })
      .addCase(updateBannerImage.rejected, (state) => {
        state.bannerLoading = false;
      })

      // removeProfileImage
      .addCase(removeProfileImage.pending, (state) => {
        state.imageLoading = true;
      })
      .addCase(removeProfileImage.fulfilled, (state) => {
        state.imageLoading = false;
        if (state.data) {
          state.data.image = null;
        }
      })
      .addCase(removeProfileImage.rejected, (state) => {
        state.imageLoading = false;
      });
  },
});

export const { setProfileData, clearProfileError } = profileSlice.actions;
export default profileSlice.reducer;
