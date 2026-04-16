import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import categoryReducer from "./slices/categorySlice";
import subcategoryReducer from "./slices/subcategorySlice";
import videoReducer from "./slices/videoSlice";

import tagReducer from "./slices/tagSlice"
import ebookReducer from "./slices/ebookSlice";
import mcqReducer from "./slices/mcqSlice";

import instructorReducer from "./slices/instructorSlice";
import faqTopicReducer from "./slices/faqTopicSlice";
import faqReducer from "./slices/faqSlice";
import courseReducer from "./slices/courceSlice";
import chapterReducer from "./slices/chapterSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    category: categoryReducer,
    subcategory: subcategoryReducer,
    video: videoReducer,
    tags: tagReducer,
    ebook: ebookReducer,
    mcq: mcqReducer,
    instructor: instructorReducer,
    faqTopic: faqTopicReducer,
    faq: faqReducer,
    course: courseReducer,
    chapter:chapterReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
