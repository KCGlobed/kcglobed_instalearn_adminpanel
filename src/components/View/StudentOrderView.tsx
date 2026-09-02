import React from 'react';
import moment from 'moment';
import {
    Calendar,
    BookOpen,
    Mail,
    Phone,
    CreditCard,
    ShoppingCart,
    User,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    PauseCircle,
} from 'lucide-react';

interface StudentOrderViewProps {
    order: any;
}

const StudentOrderView: React.FC<StudentOrderViewProps> = ({ order }) => {
    const getSubscriptionStatusInfo = (status: any) => {
        if (status === true || status === 'true' || status === 2 || status === '2') {
            return {
                label: 'Active',
                className: 'bg-green-100 text-green-700 border-green-200',
                icon: <CheckCircle size={14} />,
            };
        }
        if (status === false || status === 'false' || status === 3 || status === '3') {
            return {
                label: 'Expired',
                className: 'bg-red-100 text-red-700 border-red-200',
                icon: <XCircle size={14} />,
            };
        }
        if (status === 1 || status === '1') {
            return {
                label: 'Initiate',
                className: 'bg-blue-100 text-blue-700 border-blue-200',
                icon: <Clock size={14} />,
            };
        }
        if (status === 4 || status === '4') {
            return {
                label: 'Paused',
                className: 'bg-amber-100 text-amber-700 border-amber-200',
                icon: <PauseCircle size={14} />,
            };
        }
        if (status === 5 || status === '5') {
            return {
                label: 'Cancelled',
                className: 'bg-rose-100 text-rose-700 border-rose-200',
                icon: <AlertCircle size={14} />,
            };
        }
        return {
            label: 'Unknown',
            className: 'bg-gray-100 text-gray-700 border-gray-200',
            icon: <AlertCircle size={14} />,
        };
    };

    if (!order) {
        return (
            <div className="p-8 text-center text-gray-500 text-sm">
                No student order data found.
            </div>
        );
    }

    const statusInfo = getSubscriptionStatusInfo(order.subscription_status);
    const orderedCourses = order.ordered_courses || [];
    const studentFullName = `${order.first_name || ''} ${order.last_name || ''}`.trim() || 'N/A';

    return (
        <div className="flex flex-col gap-6">
            {/* Top Notice Card */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                <span className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <ShoppingCart size={18} />
                </span>
                <div>
                    <p className="text-sm font-semibold text-indigo-800">Student Order Details</p>
                    <p className="text-xs text-indigo-500 mt-0.5">
                        Viewing detailed order, subscription timeline, and course enrollment info.
                    </p>
                </div>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-1">
                {/* Full Name */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <User size={14} /> Student Name
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-semibold text-sm">
                        {studentFullName}
                    </div>
                </div>

                {/* Email */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Mail size={14} /> Email Address
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-medium text-sm truncate" title={order.email}>
                        {order.email || 'N/A'}
                    </div>
                </div>

                {/* Mobile */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Phone size={14} /> Mobile Number
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-medium text-sm">
                        {order.phone || 'N/A'}
                    </div>
                </div>

                {/* Status */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        Subscription Status
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2">
                        <span className={`flex items-center gap-1.5 font-semibold text-sm px-3 py-1 rounded-full border ${statusInfo.className}`}>
                            {statusInfo.icon} {statusInfo.label}
                        </span>
                    </div>
                </div>

                {/* Total Amount Paid */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <CreditCard size={14} /> Total Amount Paid
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-indigo-700 font-extrabold text-base">
                        ₹{Number(order.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                </div>

                {/* Order Created On */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Calendar size={14} /> Order Placed On
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm">
                        {order.created_at ? moment(order.created_at).format('MMM DD, YYYY hh:mm A') : 'N/A'}
                    </div>
                </div>

                {/* Subscription Timeline (Full Width) */}
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Clock size={14} /> Subscription Timeline
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex flex-col bg-white p-3.5 rounded-lg border border-gray-200/80">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Start Date</span>
                            <span className="text-sm font-semibold text-gray-800 mt-1">
                                {order.start_date ? moment(order.start_date).format('MMM DD, YYYY') : 'N/A'}
                            </span>
                        </div>
                        <div className="flex flex-col bg-white p-3.5 rounded-lg border border-gray-200/80">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">End Date</span>
                            <span className="text-sm font-semibold text-gray-800 mt-1">
                                {order.end_date ? moment(order.end_date).format('MMM DD, YYYY') : 'N/A'}
                            </span>
                        </div>
                        <div className="flex flex-col bg-white p-3.5 rounded-lg border border-gray-200/80">
                            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Next Due Date</span>
                            <span className="text-sm font-bold text-indigo-700 mt-1">
                                {order.next_due ? moment(order.next_due).format('MMM DD, YYYY') : 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Ordered Courses (Full Width) */}
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <BookOpen size={14} /> Ordered Courses ({orderedCourses.length})
                    </label>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-2.5">
                        {orderedCourses.length > 0 ? (
                            orderedCourses.map((course: any, index: number) => (
                                <div
                                    key={course.id || index}
                                    className="p-3.5 bg-white rounded-lg border border-gray-200/80 shadow-2xs flex items-center justify-between gap-3"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0 border border-indigo-100">
                                            <BookOpen size={15} />
                                        </div>
                                        <span className="font-semibold text-gray-800 text-sm truncate">
                                            {course.name || `Course #${course.id}`}
                                        </span>
                                    </div>
                                    {course.id && (
                                        <span className="text-[11px] font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-200 shrink-0">
                                            ID: #{course.id}
                                        </span>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="py-6 text-center text-gray-400 text-xs italic">
                                No courses attached to this order.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentOrderView;
