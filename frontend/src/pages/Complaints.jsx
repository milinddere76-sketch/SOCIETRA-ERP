import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    Plus,
    Search,
    Clock,
    CheckCircle2,
    AlertCircle,
    Filter,
    MoreVertical,
    Paperclip
} from 'lucide-react';

const Complaints = () => {
    const [activeFilter, setActiveFilter] = useState('ALL');

    const tickets = [
        { id: 'TKT-1024', subject: 'Water Leakage in Bathroom', member: 'Rahul Sharma (A-201)', date: '01 Mar 2026', status: 'OPEN', priority: 'High', category: 'Plumbing' },
        { id: 'TKT-1025', subject: 'CCTV Camera 4 Not Working', member: 'Secretary', date: '28 Feb 2026', status: 'IN_PROGRESS', priority: 'Medium', category: 'Security' },
        { id: 'TKT-1020', subject: 'Late Fee Incorrectly Charged', member: 'Amit Patel (B-1102)', date: '25 Feb 2026', status: 'RESOLVED', priority: 'Low', category: 'Billing' },
    ];

    const getStatusStyle = (status) => {
        switch (status) {
            case 'OPEN': return 'bg-error/20 text-error border-error/20';
            case 'IN_PROGRESS': return 'bg-warning/20 text-warning border-warning/20';
            case 'RESOLVED': return 'bg-success/20 text-success border-success/20';
            default: return 'bg-glass text-muted border-glass-border';
        }
    };

    return (
        <div className="helpdesk-page">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <MessageSquare className="text-primary" /> Helpdesk & Complaints
                    </h1>
                    <p className="text-muted">Raising and tracking member grievances & service requests</p>
                </div>
                <button className="btn btn-primary rounded-xl">
                    <Plus size={18} /> Raise Ticket
                </button>
            </header>

            <div className="grid grid-cols-3 gap-6 mb-8">
                {[
                    { label: 'Active Tickets', val: '14', color: 'text-error', icon: <AlertCircle /> },
                    { label: 'In Resolution', val: '08', color: 'text-warning', icon: <Clock /> },
                    { label: 'Resolved (7d)', val: '42', color: 'text-success', icon: <CheckCircle2 /> },
                ].map((stat, i) => (
                    <div key={i} className="glass-card flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-surface border border-glass-border ${stat.color}`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-xs text-muted uppercase font-bold tracking-wider">{stat.label}</p>
                            <h3 className="text-2xl font-bold">{stat.val}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="glass-card">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex gap-2">
                        {['ALL', 'OPEN', 'PENDING', 'RESOLVED'].map(filter => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeFilter === filter ? 'bg-primary text-white' : 'text-muted hover:text-white hover:bg-glass'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                            <input
                                type="text"
                                className="bg-glass border border-glass-border rounded-lg py-2 pl-10 pr-4 text-sm"
                                placeholder="Search ticket number or subject..."
                            />
                        </div>
                        <button className="p-2 glass border border-glass-border rounded-lg text-muted">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {tickets.map((t) => (
                        <motion.div
                            key={t.id}
                            whileHover={{ x: 5 }}
                            className="p-5 glass border border-glass-border rounded-2xl flex items-center justify-between hover:border-primary/50 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center border border-glass-border group-hover:border-primary/50 transition-colors">
                                    <MessageSquare size={20} className="text-muted group-hover:text-primary transition-colors" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-[10px] font-mono text-muted">{t.id}</span>
                                        <h4 className="font-bold group-hover:text-primary transition-colors">{t.subject}</h4>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getStatusStyle(t.status)}`}>
                                            {t.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="flex gap-4 text-xs text-muted">
                                        <span>Raised by: <span className="text-text/70">{t.member}</span></span>
                                        <span>• {t.date}</span>
                                        <span className="flex items-center gap-1"><Paperclip size={10} /> 1 Attachment</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-[10px] uppercase text-muted font-bold">Category</p>
                                    <p className="text-sm font-medium">{t.category}</p>
                                </div>
                                <div className="h-8 w-px bg-glass-border" />
                                <div className="text-right mr-4">
                                    <p className="text-[10px] uppercase text-muted font-bold">Priority</p>
                                    <p className={`text-sm font-bold ${t.priority === 'High' ? 'text-error' : 'text-primary'}`}>
                                        {t.priority}
                                    </p>
                                </div>
                                <button className="p-2 hover:bg-glass rounded-lg text-muted">
                                    <MoreVertical size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Complaints;
