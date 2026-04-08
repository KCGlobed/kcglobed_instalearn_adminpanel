import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import categoryReducer from "./slices/categorySlice";
<<<<<<< Updated upstream
import subcategoryReducer from "./slices/subcategorySlice";

=======
import tagReducer from "./slices/tagSlice"
>>>>>>> Stashed changes

export const store = configureStore({
  reducer: {
    auth: authReducer,
    category: categoryReducer,
<<<<<<< Updated upstream
    subcategory: subcategoryReducer,
=======
    tags:tagReducer
>>>>>>> Stashed changes
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
