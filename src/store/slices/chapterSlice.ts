import type { Chapter, Pagination } from "../../utils/types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface chapterState extends Pagination<Chapter> { };

const initialState: chapterState = {
    data: [],
    next: null,
    previous: null,
    pagination: {
        total_results: null,
        total_pages: null,
        current_page: null,
        next_page: null,
        page_size: null,
        previous_page: null,
    },
    page: 1,
    loading: false,
    error: null,
}




const chapterSlice = createSlice({
    name: "Course",
    initialState,
    reducers: {
        setPage(state, action) {
            state.page = action.payload;
        },
        removeChapter(state, action) {
            state.data = state.data.filter((item) => item.id != action.payload);
        },
        statusChapter(state, action) {
            state.data = state.data.map((item) => item.id.toString() === action.payload.toString() ? { ...item, status: !item.status } : item);
        }
    },


});

export const { setPage, removeChapter, statusChapter } = chapterSlice.actions;
export default chapterSlice.reducer;