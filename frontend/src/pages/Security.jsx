import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    UserPlus,
    Clock,
    MapPin,
    Phone,
    Search,
    Filter,
    Package,
    Car,
    Users,
    LogOut
} from 'lucide-react';

const Security = () => {
    const [activeTab, setActiveTab] = useState('current');

    const visitors = [
        { id: 1, name: 'Vikram Mehta', phone: '+91 98200 12345', unit: 'A-402', type: 'GUEST', time: '10:15 AM', status: 'IN' },
        { id: 2, name: 'Zomato Delivery', phone: '+91 90000 55555', unit: 'B-1102', type: 'DELIVERY', time: '10:45 AM', status: 'IN' },
        { id: 3, name: 'Regular Staff', phone: '+91 98888 77777', unit: 'General', type: 'STAFF', time: '08:00 AM', status: 'IN' },
        { id: 4, name: 'Amit Kumar', phone: '+91 97777 66666', unit: 'C-201', type: 'CAB', time: '09:30 AM', status: 'OUT', exitTime: '10:05 AM' },
    ];

    const getTypeIcon = (type) => {
        switch (type) {
            case 'DELIVERY': return <Package size={16} />;
            case 'CAB': return <Car size={16} />;
            case 'STAFF': return <Users size={16} />;
            default: return <Users size={16} />;
        }
    };

    return (
        <div className="security-page">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Shield className="text-primary" /> Security Console
                    </h1>
                    <p className="text-muted">Real-time visitor tracking and gate management</p>
                </div>
                <button className="btn btn-primary">
                    <UserPlus size={18} /> New Entry
                </button>
            </header>

            <div className="grid grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Inside Society', val: '12', color: 'text-success' },
                    { label: 'Expected Today', val: '45', color: 'text-primary' },
                    { label: 'Delivery/Service', val: '08', color: 'text-secondary' },
                    { label: 'Staff Present', val: '22', color: 'text-accent' },
                ].map((stat, i) => (
                    <div key={i} className="glass-card">
                        <p className="text-xs text-muted font-bold uppercase">{stat.label}</p>
                        <h2 className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.val}</h2>
                    </div>
                ))}
            </div>

            <div className="glass-card">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('current')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'current' ? 'bg-primary text-white' : 'hover:bg-glass text-muted'}`}
                        >
                            Inside Now
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-primary text-white' : 'hover:bg-glass text-muted'}`}
                        >
                            Recent History
                        </button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                        <input
                            type="text"
                            className="bg-glass border border-glass-border rounded-lg py-2 pl-10 pr-4 text-sm"
                            placeholder="Search Visitor / Unit..."
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <AnimatePresence mode="wait">
                        {visitors
                            .filter(v => activeTab === 'current' ? v.status === 'IN' : v.status === 'OUT')
                            .map((v) => (
                                <motion.div
                                    key={v.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="p-4 glass rounded-xl border border-glass-border hover:border-primary/50 transition-all flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-full border-2 border-glass-border flex items-center justify-center bg-surface relative">
                                            <div className="text-primary">{getTypeIcon(v.type)}</div>
                                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-surface ${v.status === 'IN' ? 'bg-success' : 'bg-muted'}`} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold flex items-center gap-2">
                                                {v.name}
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-glass text-muted">{v.type}</span>
                                            </h4>
                                            <div className="flex gap-4 text-xs text-muted mt-1">
                                                <span className="flex items-center gap-1"><Phone size={12} /> {v.phone}</span>
                                                <span className="flex items-center gap-1 font-bold text-text"><MapPin size={12} /> {v.unit}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="text-center">
                                            <p className="text-[10px] uppercase text-muted font-bold">Check-In</p>
                                            <p className="text-sm font-mono text-primary">{v.time}</p>
                                        </div>
                                        {v.exitTime && (
                                            <div className="text-center">
                                                <p className="text-[10px] uppercase text-muted font-bold">Check-Out</p>
                                                <p className="text-sm font-mono text-muted">{v.exitTime}</p>
                                            </div>
                                        )}
                                        {v.status === 'IN' && (
                                            <button className="btn btn-outline btn-sm hover:bg-error/10 hover:text-error hover:border-error group">
                                                Check Out <LogOut size={14} className="group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Security;
