import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    Plus,
    Calendar,
    Download,
    Users,
    Clock,
    Search,
    ChevronRight,
    FileBadge
} from 'lucide-react';

const Meetings = () => {
    const [showModal, setShowModal] = useState(false);

    const meetings = [
        {
            id: 1,
            title: 'Annual General Meeting (AGM) 2024',
            type: 'AGM',
            date: '15 Aug 2024',
            time: '10:30 AM',
            attendees: 142,
            status: 'PUBLISHED'
        },
        {
            id: 2,
            title: 'Emergency Meeting - Lift Maintenance',
            type: 'EMERGENCY',
            date: '02 Sep 2024',
            time: '07:00 PM',
            attendees: 12,
            status: 'PUBLISHED'
        },
        {
            id: 3,
            title: 'Monthly Committee Meeting - Oct',
            type: 'COMMITTEE',
            date: '05 Oct 2024',
            time: '08:30 PM',
            attendees: 9,
            status: 'DRAFT'
        }
    ];

    return (
        <div className="meetings-page">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Meeting Minutes</h1>
                    <p className="text-muted">Statutory record of society proceedings and resolutions</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary">
                    <Plus size={18} /> Record Minutes
                </button>
            </header>

            <div className="grid grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Total Meetings', val: '24', icon: <Calendar /> },
                    { label: 'Resolutions', val: '156', icon: <FileBadge /> },
                    { label: 'Avg Attendance', val: '86%', icon: <Users /> },
                    { label: 'Unpublished', val: '01', icon: <Clock /> }
                ].map((s, i) => (
                    <div key={i} className="glass-card">
                        <div className="text-primary mb-2">{s.icon}</div>
                        <p className="text-xs text-muted uppercase font-bold">{s.label}</p>
                        <h3 className="text-2xl font-bold">{s.val}</h3>
                    </div>
                ))}
            </div>

            <div className="glass-card">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold">Recent Proceedings</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                        <input
                            type="text"
                            className="bg-glass border border-glass-border rounded-lg py-2 pl-10 pr-4 text-sm"
                            placeholder="Search meetings..."
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    {meetings.map((m) => (
                        <div key={m.id} className="p-4 hover:bg-glass rounded-xl border border-glass-border/30 transition-all group">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${m.type === 'AGM' ? 'bg-primary/20 text-primary' : m.type === 'EMERGENCY' ? 'bg-error/20 text-error' : 'bg-secondary/20 text-secondary'
                                        }`}>
                                        {m.type[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg group-hover:text-primary transition-colors cursor-pointer">{m.title}</h4>
                                        <div className="flex gap-4 text-xs text-muted mt-1">
                                            <span className="flex items-center gap-1"><Calendar size={12} /> {m.date}</span>
                                            <span className="flex items-center gap-1"><Clock size={12} /> {m.time}</span>
                                            <span className="flex items-center gap-1"><Users size={12} /> {m.attendees} Members</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${m.status === 'PUBLISHED' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                                        }`}>
                                        {m.status}
                                    </span>
                                    <button className="p-2 hover:bg-glass rounded-lg text-muted">
                                        <Download size={18} />
                                    </button>
                                    <button className="p-2 hover:bg-glass rounded-lg text-primary">
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Meetings;
