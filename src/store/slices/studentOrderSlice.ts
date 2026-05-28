import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Pagination, student,} from "../../utils/types";

interface studentOrders extends Pagination<student>{}

const initialState:studentOrders ={
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
}

import { fetchStudentOrdersApi } from "../../services/apiServices";

export const getStudentOrders=createAsyncThunk<
  Pagination<student>,{ page?: number; search?: string; first_name?: string; last_name?: string; email?: string; ordering?: string; status?: string; startDate?: string; endDate?: string
  }
>(
  "studentOrder/getStudentOrders",
  async (
    { page = 1, search = "", first_name = "",last_name = "", email = "", ordering = "", status = "", startDate = "", endDate = "" },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetchStudentOrdersApi(page,search,first_name,last_name,email,ordering,status,startDate,endDate);
      return response as Pagination<student>;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Something went wrong");
    }
  }
)
export const studentOrderSlice=createSlice({
    name:"studentOrder",
    initialState,
    reducers:{
        setPage(state, action) {
            state.page = action.payload;
        },
        removeStudentOrder: (state, action: PayloadAction<number | string>) => {
            state.data = state.data.filter((item) => item.id !== action.payload);
        },
    },
    extraReducers:(builder)=>{
        builder
        .addCase(getStudentOrders.pending,(state)=>{
            state.loading=true
        })
        .addCase(getStudentOrders.fulfilled,(state,action)=>{
            state.loading=false
            state.data=action.payload.data
            state.pagination=action.payload.pagination
        })
        .addCase(getStudentOrders.rejected,(state,action)=>{
            state.loading=false
            state.error=action.payload as string
        })
    }
})


export const { setPage, removeStudentOrder } = studentOrderSlice.actions;
export default studentOrderSlice.reducer;
