import React from 'react';
import moment from 'moment';
import {
    Calendar,
    BookOpen,
    Clock,
    ShieldCheck,
    Mail,
    Phone,
    CreditCard,
    ShoppingCart
} from 'lucide-react';

interface StudentOrderViewProps {
    order: any;
}

const StudentOrderView: React.FC<StudentOrderViewProps> = ({ order }) => {
    const getSubscriptionStatus = (status: any) => {
        if (status === true || status === 'true') {
            return 'Active';
        }
        if (status === false || status === 'false') {
            return 'Expired';
        }
        const statuses: { [key: string]: string } = {
            '1': 'Initiate',
            '2': 'Active',
            '3': 'Expired',
            '4': 'Paused',
            '5': 'Cancelled'
        };
        return statuses[String(status)] || 'Unknown';
    };

    if (!order) {
        return null;
    }

    return (
        <div className="flex flex-col w-full max-h-[85vh] overflow-y-auto bg-gray-50/30 custom-scrollbar relative animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Gradient Banner */}
            <div className="relative w-full h-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 shrink-0 overflow-hidden rounded-2xl">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>

                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl text-white shadow-sm border border-white/20">
                            <ShoppingCart size={22} className="text-white" />
                        </div>
                        <span className="text-white/90 text-xs font-bold uppercase tracking-widest">Student Order Details</span>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="flex flex-col gap-6 px-6 py-8 -mt-6 relative z-10">
                {/* Student Info & Status */}
                <div className="flex flex-col gap-4 bg-white p-6 rounded-2xl shadow-xl shadow-indigo-100/20 border border-gray-200">
                    <div className="flex items-start justify-between gap-4">
                        <h1 className="text-xl font-black text-gray-900 leading-tight">
                            {order.first_name} {order.last_name}
                        </h1>
                        <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border ${
                            order.subscription_status === 2 || order.subscription_status === true || order.subscription_status === 'true' ? 'bg-green-50 text-green-700 border-green-200' :
                            order.subscription_status === 3 || order.subscription_status === 5 || order.subscription_status === false || order.subscription_status === 'false' ? 'bg-red-50 text-red-700 border-red-200' :
                            order.subscription_status === 1 ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            order.subscription_status === 4 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-gray-50 text-gray-700 border-gray-200'
                        }`}>
                            {getSubscriptionStatus(order.subscription_status)}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-2">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Mail size={14} className="text-indigo-500" />
                            <span className="font-semibold text-gray-800">{order.email || '-'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Phone size={14} className="text-purple-500" />
                            <span className="font-medium text-gray-800">{order.phone || '-'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Calendar size={14} className="text-orange-400" />
                            <span className="font-medium">Created: {order.created_at ? moment(order.created_at).format('MMM DD, YYYY') : '-'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Clock size={14} className="text-blue-400" />
                            <span className="font-medium">{order.created_at ? moment(order.created_at).format('hh:mm A') : ''}</span>
                        </div>
                    </div>
                </div>

                {/* Subscription Schedule / Timeline */}
                <div className="flex flex-col gap-2 bg-white p-5 rounded-2xl shadow-xl shadow-indigo-100/20 border border-gray-200">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Subscription & Timeline</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100/80">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start Date</span>
                            <span className="text-sm font-semibold text-slate-800">
                                {order.start_date ? moment(order.start_date).format('MMMM DD, YYYY') : '-'}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100/80">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">End Date</span>
                            <span className="text-sm font-semibold text-slate-800">
                                {order.end_date ? moment(order.end_date).format('MMMM DD, YYYY') : '-'}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100/80">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Next Due Date</span>
                            <span className="text-sm font-semibold text-indigo-600 font-bold">
                                {order.next_due ? moment(order.next_due).format('MMMM DD, YYYY') : '-'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Details Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Payment Info */}
                    <div className="flex flex-col gap-2">
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2">Payment Details</h2>
                        <div className="flex items-center justify-between bg-gradient-to-br from-indigo-50/80 to-purple-50/50 p-5 rounded-2xl border border-indigo-100/50 shadow-sm transition-all hover:shadow-md group h-full">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white rounded-xl text-indigo-600 shadow-sm border border-indigo-100 flex items-center justify-center">
                                    <CreditCard size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Amount Paid</span>
                                    <span className="font-extrabold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors">
                                        ₹{Number(order.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Subscription Info */}
                    <div className="flex flex-col gap-2">
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2">Subscription Mode</h2>
                        <div className="flex items-center justify-between bg-gradient-to-br from-purple-50/80 to-indigo-50/50 p-5 rounded-2xl border border-purple-100/50 shadow-sm transition-all hover:shadow-md group h-full">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white rounded-xl text-purple-600 shadow-sm border border-purple-100 flex items-center justify-center">
                                    <ShieldCheck size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subscription Status</span>
                                    <span className="font-bold text-gray-900 text-sm group-hover:text-purple-600 transition-colors">
                                        {getSubscriptionStatus(order.subscription_status)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ordered Courses Section */}
                <div className="flex flex-col gap-3 mt-2">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2">
                        Ordered Courses ({order.ordered_courses?.length || 0})
                    </h2>
                    <div className="flex flex-col gap-3">
                        {order.ordered_courses && order.ordered_courses.length > 0 ? (
                            order.ordered_courses.map((course: any, index: number) => (
                                <div key={index} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
                                    <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg shrink-0 border border-indigo-100 shadow-sm">
                                        <BookOpen size={20} />
                                    </div>
                                    <div className="flex flex-col gap-0.5 w-full">
                                        <span className="font-bold text-gray-900 text-sm">
                                            {course.name}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-semibold tracking-wide">
                                            Course ID: {course.id || '-'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-gray-200 text-center gap-2">
                                <BookOpen size={24} className="text-gray-300 animate-pulse" />
                                <span className="text-sm font-medium text-gray-400">No courses listed in this order.</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentOrderView;
