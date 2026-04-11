import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { FaqTopics, Pagination } from "../../utils/types";
import {addFaqTopicApi, deleteFaqTopicApi, fetchFaqTopicsApi, updateFaqTopicApi, updateFaqTopicStatusApi} from '../../services/apiServices'

interface FaqTopic extends Pagination<FaqTopics> { };

const initialState: FaqTopic = {
    data: [],
    next: null,
    pagination: {
        total_results: null,
        total_pages: null,
        current_page: null,
        next_page: null,
        page_size: null,
        previous_page: null,
    },
    previous: null,
    page: 1,
    loading: false,
    error: null
}


export const getFaqTopics = createAsyncThunk<Pagination<FaqTopics>,{page?:number,search?:string,title?:string,description?:string,ordering?:string,start_date?:string,end_date?:string,status?:string}>(
    "faq/getFaq",
    async({page=1,search="",title="",description="",ordering="",start_date="",end_date="",status=""},{rejectWithValue})=>{
        try {
            return await fetchFaqTopicsApi(page,search,title,description,ordering,start_date,end_date,status);
            
        } catch (err:any) {
            return rejectWithValue(err?.message || "Failed to fetch the Faq");
        }
    }
)

export const addFaqTopic = createAsyncThunk<FaqTopics, any, { rejectValue: string }>(
    "faq/addFaq",
    async (faqData, { rejectWithValue }) => {
        try {
            const data = await addFaqTopicApi(faqData);
            return data?.data ? data.data : data;
        } catch (error: any) {
            return rejectWithValue(error?.message || "Failed to add the Faq");
        }
    }
)

export const updateFaqTopic = createAsyncThunk<FaqTopics, { id: number | string, payload: any }, { rejectValue: string }>(
    "faq/updateFaq",
    async ({ id, payload }, { rejectWithValue }) => {
        try {
            const data = await updateFaqTopicApi(id, payload);
            return data?.data ? data.data : data;
        } catch (error: any) {
            return rejectWithValue(error?.message || "Failed to update the Faq");
        }
    }
)

export const deleteFaqTopic = createAsyncThunk<number | string, number | string, { rejectValue: string }>(
    "faq/deleteFaq",
    async (id, { rejectWithValue }) => {
        try {
            await deleteFaqTopicApi(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error?.message || "Failed to delete the Faq");
        }
    }
)

export const updateFaqTopicStatus = createAsyncThunk<{ id: number | string, status: boolean }, { id: number | string, status: boolean }, { rejectValue: string }>(
    "faq/updateFaqStatus",
    async ({ id, status }, { rejectWithValue }) => {
        try {
            await updateFaqTopicStatusApi(id, { status });
            return { id, status };
        } catch (error: any) {
            return rejectWithValue(error?.message || "Failed to update status");
        }
    }
)


const faqSlice= createSlice({
    name:"Faq",
    initialState,
    reducers:{
        setPage(state,action:PayloadAction<number>){
            state.page=action.payload;
        },
        removeFaq(state,action: PayloadAction<Number | string>){
            state.data=state.data.filter((item)=>item.id !==action.payload)
        },
        statusFaq: (state, action: PayloadAction<number | string>) => {
            state.data = state.data.map((item) =>
                item.id.toString() === action.payload.toString()
                    ? { ...item, status: !item.status }
                    : item
            );
        }
    },
    extraReducers:(builder)=>{
        builder
        .addCase(getFaqTopics.pending,(state)=>{
            state.loading=true;
            state.error=null;
        })
        .addCase(getFaqTopics.fulfilled,(state,action)=>{
            state.loading=false;
            state.data=action.payload.data;
            state.pagination=action.payload.pagination;
        })
       .addCase(getFaqTopics.rejected, (state, action) => {
         state.loading = false;
         state.error = action.payload as string;
        })
        .addCase(addFaqTopic.fulfilled,(state,action)=>{
            state.loading=false;
            state.data.unshift(action.payload);
        })
        .addCase(updateFaqTopic.fulfilled, (state, action) => {
            state.loading = false;
            state.data = state.data.map((item) =>
                item.id === action.payload.id ? action.payload : item
            );
        })
        .addCase(deleteFaqTopic.fulfilled, (state, action) => {
            state.loading = false;
            state.data = state.data.filter((item) => item.id !== action.payload);
        })
        .addCase(updateFaqTopicStatus.fulfilled, (state, action) => {
            state.data = state.data.map((item) =>
                item.id.toString() === action.payload.id.toString()
                    ? { ...item, status: action.payload.status }
                    : item
            );
        })
    }

})


export const { setPage, removeFaq, statusFaq } = faqSlice.actions;
export default faqSlice.reducer;
