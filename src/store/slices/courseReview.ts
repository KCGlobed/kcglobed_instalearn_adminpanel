import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Pagination, Review } from "../../utils/types";
import { getCourseReviewApi, approveRejectCourseReviewApi } from "../../services/apiServices";


interface CourseReviwState extends Pagination<Review>{};

const initialState: CourseReviwState={
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


export const getCourseReview=createAsyncThunk<
    Pagination<Review>,
    {
        page?: number;
        first_name?: string;
        last_name?: string;
        name?: string;
        chapter?: string;
        ordering?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
        approved?: string;
    }
>(
    "CourseReview/getReview",
    async({page = 1, name="", first_name = "", last_name = "", chapter = "", ordering = "", status = "", startDate="", endDate="", approved = ""}, { rejectWithValue }
    )=>{
        try{
            return await getCourseReviewApi(page, first_name, last_name, name, chapter, ordering, status, startDate, endDate, approved);
        } catch(error:any){
            return rejectWithValue(error.message);
        }
    }
)

export const toggleApproveReview = createAsyncThunk<
    { id: string | number; approved: number },
    { id: string | number; approved: number },
    { rejectValue: string }
>(
    "CourseReview/toggleApprove",
    async ({ id, approved }, { rejectWithValue }) => {
        try {
            const response = await approveRejectCourseReviewApi(id, { approved });
            const approvedVal = typeof response?.approved === 'number' ? response.approved : approved;
            return { id, approved: approvedVal };
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);


const courseReviewSlice = createSlice({
    name:"courseReview",
    initialState,
    reducers: {
        setPage(state, action: PayloadAction<number>) {
            state.page = action.payload;
        },
        removeCourseReview(state, action: PayloadAction<Number | string>) {
            state.data = state.data.filter((item) => item.id !== action.payload);
        },
        statusCourseReview(state, action: PayloadAction<Number | string>) {
            state.data = state.data.map((item) => item.id.toString() === action.payload.toString() ? { ...item, status: !item.status } : item)
        },
    },
    extraReducers: (builder) => {
        builder
        .addCase(getCourseReview.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(getCourseReview.fulfilled, (state, action) => {
            state.loading = false;
            state.data = action.payload.data;
            state.pagination = action.payload.pagination;
        })
        .addCase(getCourseReview.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })
        .addCase(toggleApproveReview.fulfilled, (state, action) => {
            state.data = state.data.map((item) =>
                item.id.toString() === action.payload.id.toString()
                    ? { ...item, approved: action.payload.approved }
                    : item
            );
        })
    }
})


export const { setPage, removeCourseReview, statusCourseReview } = courseReviewSlice.actions
export default courseReviewSlice.reducer