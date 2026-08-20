import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { blogComment, Pagination } from "../../utils/types";
import { getBlogCommentsApi, updateBlogCommentStatusApi, deleteBlogCommentApi } from "../../services/apiServices";


interface BlogCommentState extends Pagination<blogComment>{};

const initialState: BlogCommentState={
    data:[],
    next:null,
    previous:null,
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


export const getBlogComments=createAsyncThunk<
    Pagination<blogComment>,
    { page?: number;search?: string;first_name?: string;last_name?: string;email?: string;ordering?: string;status?: string;startDate?: string;endDate?: string;}
>(
    "blogComment/getBlogComments",
    async({page = 1, search="", first_name = "", last_name = "", email = "", ordering = "", status = "", startDate="", endDate=""}, { rejectWithValue }
    )=>{
        try{
            return await getBlogCommentsApi(page, search, first_name, last_name, email, ordering, status, startDate, endDate);
        } catch(error:any){
            return rejectWithValue(error.message);
        }
    }
)


export const updateBlogCommentStatus = createAsyncThunk<
    { id: string | number; status: number },
    { id: string | number; status: number },
    { rejectValue: string }
>(
    "blogComment/updateStatus",
    async ({ id, status }, { rejectWithValue }) => {
        try {
            await updateBlogCommentStatusApi(id, { status });
            return { id, status };
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);


export const deleteBlogComment = createAsyncThunk<
    string | number,
    string | number,
    { rejectValue: string }
>(
    "blogComment/delete",
    async (id, { rejectWithValue }) => {
        try {
            await deleteBlogCommentApi(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);


const blogCommentSlice = createSlice({
    name:"blogComment",
    initialState,
    reducers: {
        setPage(state, action: PayloadAction<number>) {
            state.page = action.payload;
        },
        removeBlogComment(state, action: PayloadAction<Number | string>) {
            state.data = state.data.filter((item) => item.id !== action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
        .addCase(getBlogComments.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(getBlogComments.fulfilled, (state, action) => {
            state.loading = false;
            state.data = action.payload.data;
            state.pagination = action.payload.pagination;
        })
        .addCase(getBlogComments.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })
        .addCase(updateBlogCommentStatus.fulfilled, (state, action) => {
            state.data = state.data.map((item) =>
                item.id.toString() === action.payload.id.toString()
                    ? { ...item, status: action.payload.status }
                    : item
            );
        })
        .addCase(deleteBlogComment.fulfilled, (state, action) => {
            state.data = state.data.filter((item) => item.id.toString() !== action.payload.toString());
        })
    }
})


export const { setPage, removeBlogComment } = blogCommentSlice.actions
export default blogCommentSlice.reducer