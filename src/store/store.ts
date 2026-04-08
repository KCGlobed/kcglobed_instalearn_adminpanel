import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import categoryReducer from "./slices/categorySlice";
import subcategoryReducer from "./slices/subcategorySlice";

import tagReducer from "./slices/tagSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    category: categoryReducer,
    subcategory: subcategoryReducer,
    tags:tagReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
