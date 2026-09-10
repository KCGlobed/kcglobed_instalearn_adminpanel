import { useEffect, useState } from 'react';
import { Heart, Info, BookOpen } from 'lucide-react';
import { getStudentWishlistListingApi } from '../../services/apiServices';

const StudentWishlistView = ({ studentId }: { studentId: number }) => {
    const [wishlist, setWishlist] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWishlist = async () => {
            if (!studentId) return;
            try {
                setLoading(true);
                setError(null);
                const response = await getStudentWishlistListingApi(studentId);
                // Based on standard API responses, we try different possible locations for data array
                if (response?.results) {
                    setWishlist(response.results);
                } else if (response?.data?.data) {
                    setWishlist(response.data.data);
                } else if (response?.data && Array.isArray(response.data)) {
                    setWishlist(response.data);
                } else if (Array.isArray(response)) {
                    setWishlist(response);
                } else {
                    setWishlist([]);
                }
            } catch (err: any) {
                setError(err.message || "Failed to load wishlist");
            } finally {
                setLoading(false);
            }
        };
        fetchWishlist();
    }, [studentId]);

    return (
        <div className="flex flex-col gap-6 p-1 min-h-[600px] h-[75vh]">
            <div className="w-full bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden shadow-sm relative flex flex-col h-full">
                <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Heart size={18} className="text-pink-500" fill="currentColor" /> Student Wishlist
                    </h3>
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {wishlist.length} Courses
                    </span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-3"></div>
                            <p className="text-gray-500 font-medium">Loading wishlist...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-red-500 py-10">
                            <Info size={40} className="mb-3 opacity-30" />
                            <p className="font-bold text-sm">{error}</p>
                        </div>
                    ) : wishlist && wishlist.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {wishlist.map((item: any, index: number) => {
                                const course = item.course_info;
                                if (!course) return null;
                                return (
                                    <div key={index} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full">
                                        <div className="h-40 w-full bg-gray-100 relative">
                                            {course.image ? (
                                                <img src={course.image} alt={course.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <BookOpen size={32} />
                                                </div>
                                            )}
                                            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm text-pink-500">
                                                <Heart size={16} fill="currentColor" />
                                            </div>
                                        </div>
                                        <div className="p-4 flex flex-col flex-1">
                                            <h4 className="font-bold text-gray-900 text-sm line-clamp-2 mb-2" title={course.name}>
                                                {course.name}
                                            </h4>
                                            <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-gray-500 font-bold uppercase">Price</span>
                                                    <span className="font-bold text-indigo-600 text-sm">₹{course.price}</span>
                                                </div>
                                                {course.discount > 0 && (
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[10px] text-green-500 font-bold uppercase bg-green-50 px-1.5 py-0.5 rounded">{course.discount}% OFF</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 py-10">
                            <Heart size={40} className="mb-3 opacity-30" />
                            <p className="font-bold text-sm">No courses in wishlist</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentWishlistView;
