import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Pagination, Quiz } from "../../utils/types";
import { fetchQuiz, createQuiz, updateQuizApi, updateQuizStatusApi, deleteQuizApi, viewQuizApi } from "../../services/apiServices";

interface QuizState extends Pagination<Quiz>{
  currentQuiz?: any;
  currentQuizLoading?: boolean;
}
  
const initialState:QuizState = {
  data:[],
  count:0,
  pagination:{
    total_results:null,
    total_pages:null,
    current_page:null,
    next_page:null,
    page_size:null,
    previous_page:null
  },
  next:null,
  previous:null,
  page:1,
  loading:false,
  error:null,
  currentQuiz: null,
  currentQuizLoading: false,
}

export const getQuiz = createAsyncThunk<Pagination<Quiz>, { page?: number; search?: string; id_number?: string; ordering?: string; status?: string; startDate?: string; endDate?: string; name?: string; description?: string }>(
    "quiz/getQuiz",
    async ({ page = 1, search = "", id_number = "", ordering = "", status = "", startDate = "", endDate = "", name = "", description = "" }, { rejectWithValue }) => {
        try {
            return await fetchQuiz(page, search, id_number, ordering, status, startDate, endDate, name, description);
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to fetch Quizzes");
        }
    }
);

export const addQuiz = createAsyncThunk<any, any>(
    "quiz/addQuiz",
    async (quizData, { rejectWithValue }) => {
        try {
            return await createQuiz(quizData);
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to create Quiz");
        }
    }
);

export const editQuiz = createAsyncThunk<any, { id: number | string; data: any }>(
    "quiz/editQuiz",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            return await updateQuizApi(id, data);
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to edit Quiz");
        }
    }
);

export const updateQuizStatus = createAsyncThunk<any, { id: number | string; status: boolean }>(
    "quiz/updateQuizStatus",
    async ({ id, status }, { rejectWithValue, dispatch }) => {
        try {
            const res = await updateQuizStatusApi(id, { status });
            dispatch(StatusQuiz(id));
            return res;
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to update Quiz status");
        }
    }
);

export const deleteQuiz = createAsyncThunk<any, number | string>(
    "quiz/deleteQuiz",
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const res = await deleteQuizApi(id);
            dispatch(removeQuiz(id));
            return res;
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to delete Quiz");
        }
    }
);

export const viewQuiz = createAsyncThunk<any, number | string>(
    "quiz/viewQuiz",
    async (id, { rejectWithValue }) => {
        try {
            const res = await viewQuizApi(id);
           
            return res.data || res;
        } catch (err: any) {
            return rejectWithValue(err?.message || "Failed to view Quiz");
        }
    }
);

export const quizSlice = createSlice({
    name: "quiz",
    initialState,
    reducers: {
        setPage(state, action: PayloadAction<number>) {
            state.page = action.payload;
        },
        removeQuiz: (state, action: PayloadAction<Number | string>) => {
            state.data = state.data.filter((item) => item.id != action.payload);
        },
        StatusQuiz: (state, action: PayloadAction<Number | string>) => {
             state.data = state.data.map((item) =>
                item.id.toString() === action.payload.toString()
                    ? { ...item, status: !item.status, is_active: !item.status }
                    : item
            );
        }
    },
    extraReducers:(builder)=>{
        builder.
        addCase(getQuiz.pending,(state)=>{
            state.loading=true;
            state.error=null;
        })
        .addCase(getQuiz.fulfilled,(state,action)=>{
            state.loading=false;
            state.data=(action.payload.data || []).map((item:any)=>({
                ...item,
                is_active: item.is_active !== undefined ? item.is_active : item.status,
                status: item.status !== undefined ? item.status : item.status
            }));
            state.pagination = action.payload.pagination;
        })
        .addCase(getQuiz.rejected,(state,action)=>{
            state.loading=false;
            state.error=action.payload as string;
        })
        .addCase(viewQuiz.pending, (state) => {
            state.currentQuizLoading = true;
            state.error = null;
        })
        .addCase(viewQuiz.fulfilled, (state, action) => {
            state.currentQuizLoading = false;
            state.currentQuiz = action.payload;
        })
        .addCase(viewQuiz.rejected, (state, action) => {
            state.currentQuizLoading = false;
            state.error = action.payload as string;
        })

    }


})

export const {setPage,removeQuiz,StatusQuiz} = quizSlice.actions

export default quizSlice.reducer