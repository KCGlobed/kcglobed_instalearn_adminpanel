import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { contact, Pagination } from "../../utils/types";
import { fetchContactApi } from "../../services/apiServices";


interface Contact extends Pagination<contact>{};

const initialState:Contact={
    data:[],
    pagination:{
        total_results: null,
        total_pages: null,
        current_page: null,
        next_page: null,
        page_size: null,
        previous_page: null,
    },
    next: null,
    previous: null,
    page: 1,
    loading: false,
    error: null,

}

export const getContact = createAsyncThunk<Pagination<contact>, { page?: number; search?: string; first_name?: string; last_name?: string; email?: string; ordering?: string; status?: string; startDate?: string; endDate?: string; }>( "Contact/getContact",
    async({ page=1, search="", first_name="", last_name="", email="", ordering="", status="", startDate="", endDate="" }, { rejectWithValue } )=>{
      try{
         return await fetchContactApi(page,search,first_name,last_name,email,ordering,status,startDate,endDate);
      }catch(error:any){
         return rejectWithValue(error.message)
      }
    })

const contactSlice=createSlice({
  name:"Contact",
  initialState,
  reducers:{
     setPage(state, action) {
            state.page = action.payload;
        },
        removeContact: (state, action: PayloadAction<Number | string>) => {
            state.data = state.data.filter((item) => item.id !== action.payload);
        },
        statusContact: (state, action: PayloadAction<number | string>) => {
            state.data = state.data.map((item) =>
                item.id.toString() === action.payload.toString()
                    ? { ...item, status: !item.status }
                    : item
            );
        }
  },
  extraReducers:(builder)=>{
    builder.addCase(getContact.pending,(state)=>{
      state.loading=true;
    })
    builder.addCase(getContact.fulfilled,(state,action)=>{
      state.loading=false;
      state.data=action.payload.data;
      state.pagination=action.payload.pagination;
    })
    builder.addCase(getContact.rejected,(state,action)=>{
      state.loading=false;
      state.error=action.payload as string;
    })
  }
})

export default contactSlice.reducer;