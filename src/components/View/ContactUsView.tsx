import React from 'react';
import { Mail, Phone, Calendar, User } from 'lucide-react';
import moment from 'moment';

interface ContactUsViewProps {
    contact: {
        id: string | number;
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
        message: string;
        created_at: string;
    };
}

const ContactUsView: React.FC<ContactUsViewProps> = ({ contact }) => {
    if (!contact) return null;

    return (
        <div className="flex flex-col gap-6 p-5">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100">
                    <User size={24} />
                </div>
                <div className="flex flex-col gap-1">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sender Name</h4>
                    <p className="text-lg font-bold text-slate-900">{contact.first_name} {contact.last_name}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Mail size={12} /> Email Address
                    </span>
                    <span className="text-sm font-semibold text-slate-800 break-all">
                        {contact.email || '-'}
                    </span>
                </div>
                
                <div className="flex flex-col gap-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Phone size={12} /> Phone Number
                    </span>
                    <span className="text-sm font-semibold text-slate-800">
                        {contact.phone || '-'}
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Calendar size={12} /> Submitted On
                </span>
                <span className="text-sm font-semibold text-slate-800 mt-1">
                    {contact.created_at ? moment(contact.created_at).format('MMMM DD, YYYY [at] hh:mm A') : '-'}
                </span>
            </div>

            <div className="flex flex-col gap-2 bg-indigo-50/30 p-5 rounded-2xl border border-indigo-100/50">
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Message Content</span>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{contact.message || '-'}</p>
            </div>
        </div>
    );
};

export default ContactUsView;
