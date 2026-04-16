import { createChapter, deleteChapterApi, getChapterApi, updateChapterApi, updateChapterStatusApi } from "../../services/apiServices";
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

export const getChapter= createAsyncThunk<Pagination<Chapter>,{page?:number,search?:string,name?:string,description?:string,ordering?:string,status?:string,start_date?:string,end_date?:string}>(
    "course/getChapter",
    async({page=1,search="",name="",description="",ordering="",status="",start_date="",end_date=""},{rejectWithValue})=>{
      try {
        return await getChapterApi(page,search,name,description,ordering,status,start_date,end_date);
      } catch (err:any) {
        return rejectWithValue(err.message);
      }
    }
)

export const addChapter=createAsyncThunk<Chapter,any,{rejectValue:string}>("course/addChapter",async(chapterData,{rejectWithValue})=>{
    try {
         const data = await createChapter(chapterData);
            return data?.data ? data.data : data;
    } catch (err:any) {
        return rejectWithValue(err.message);
    }
})

export const deleteChapter = createAsyncThunk<number, number, { rejectValue: string }>("course/deleteChapter", async (id, { rejectWithValue }) => {
    try {
        await deleteChapterApi(id);
        return id;
    } catch (err: any) {
        return rejectWithValue(err.message);
    }
})

export const updateChapter = createAsyncThunk<Chapter, any, { rejectValue: string }
>("course/updateChapter", async ({ id, chapterData }, { rejectWithValue }) => {
    try {
        const data = await updateChapterApi(id, chapterData);
        return data?.data ? data.data : data;
    } catch (err: any) {
        return rejectWithValue(err.message ||"failed to fecth chapter");
    }
})

export const updateChapterStatus = createAsyncThunk<Chapter,any, { rejectValue: string }
>("course/updateChapterStatus", async ({ id, status }, { rejectWithValue }) => {
    try {
       const data = await updateChapterStatusApi(id, { status });
        return data.data;
    } catch (err: any) {
        return rejectWithValue(err.message);
    }
})





const chapterSlice = createSlice({
    name: "Chapter",
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
    extraReducers: (builder) => {
        builder.addCase(getChapter.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(getChapter.fulfilled, (state, action) => {
            state.loading = false;
            state.data = action.payload.data;
            state.next = action.payload.next;
            state.previous = action.payload.previous;
            state.pagination = action.payload.pagination;
        })
        builder.addCase(getChapter.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })
        builder.addCase(addChapter.fulfilled, (state, action) => {
            state.loading = false,
                state.data.unshift(action.payload);
        })
        builder.addCase(updateChapter.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.map((item) => item.id === action.payload.id ? action.payload : item);
        })
        builder.addCase(deleteChapter.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.filter((item) => item.id !== action.payload);
        })
        builder.addCase(updateChapterStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.data = state.data.map((item) => item.id === action.payload.id ? action.payload: item);
        })
    }


});

export const { setPage, removeChapter, statusChapter } = chapterSlice.actions;
export default chapterSlice.reducer;