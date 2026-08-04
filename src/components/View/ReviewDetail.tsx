import { MessageSquare } from "lucide-react";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { useAppSelector } from "../../hooks/useRedux";
import moment from "moment";
import { toggleApproveReview } from "../../store/slices/courseReview";
import toast from "react-hot-toast";

const ReviewDetailModal: React.FC<{ reviewId: number; onClose: () => void; renderStars: (rating: number) => React.ReactNode }> = ({ reviewId, onClose, renderStars }) => {
    const dispatch = useAppDispatch();
    const review = useAppSelector((state) =>
        state.ReviewCourse.data.find((item) => item.id === reviewId)
    );

    if (!review) return null;

    return (
        <div className="flex flex-col gap-6 p-5">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100">
                    <MessageSquare size={24} />
                </div>
                <div className="flex flex-col gap-1">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Course Name</h4>
                    <p className="text-base font-bold text-slate-900">{review.course?.name || '-'}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reviewer</span>
                    <span className="text-sm font-semibold text-slate-800 truncate" title={review.user ? `${review.user.first_name} ${review.user.last_name}` : '-'}>
                        {review.user ? `${review.user.first_name} ${review.user.last_name}` : '-'}
                    </span>
                    <span className="text-xs text-slate-500 truncate" title={review.user?.email || ''}>{review.user?.email || ''}</span>
                </div>
                <div className="flex flex-col gap-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rating & Date</span>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold text-slate-900">{review.rating || 0} / 5</span>
                        {renderStars(review.rating || 0)}
                    </div>
                    <span className="text-xs text-slate-500 mt-1">
                        {review.created_at ? moment(review.created_at).format('MMM DD, YYYY') : '-'}
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-2 bg-indigo-50/30 p-5 rounded-2xl border border-indigo-100/50">
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Review Comment</span>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{review.review || '-'}</p>
            </div>
        </div>
    );
};
export default ReviewDetailModal;