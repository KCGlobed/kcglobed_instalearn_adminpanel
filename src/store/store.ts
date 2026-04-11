import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import categoryReducer from "./slices/categorySlice";
import subcategoryReducer from "./slices/subcategorySlice";
import videoReducer from "./slices/videoSlice";

import tagReducer from "./slices/tagSlice"
import ebookReducer from "./slices/ebookSlice";
import instructorReducer from "./slices/instructorSlice";
import faqReducer from "./slices/faqSlice"
export const store = configureStore({
  reducer: {
    auth: authReducer,
    category: categoryReducer,
    subcategory: subcategoryReducer,
    video: videoReducer,
    tags: tagReducer,
    ebook: ebookReducer,
    instructor: instructorReducer,
    faq: faqReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
