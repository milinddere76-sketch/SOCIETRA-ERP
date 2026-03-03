import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Car,
    Package,
    Phone,
    Clock,
    CheckCircle2,
    XCircle,
    Plus,
    X,
    Shield,
    UserPlus,
    Search,
    MapPin,
    LogOut
} from 'lucide-react';
import api from '../api';

const Security = () => {
    const [activeTab, setActiveTab] = useState('current');
    const [showModal, setShowModal] = useState(false);

    const [visitors, setVisitors] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchVisitors();
    }, []);

    const fetchVisitors = async () => {
        try {
            setLoading(true);
            const res = await api.get('/security/visitors');
            setVisitors(res.data);
        } catch (err) {
            console.error('Failed to fetch visitors', err);
        } finally {
            setLoading(false);
        }
    };

    const [formData, setFormData] = useState({ name: '', phone: '', type: 'GUEST', unit: '' });

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/security/visitors', {
                name: formData.name,
                phone: formData.phone,
                unit: formData.unit,
                type: formData.type
            });
            setVisitors([res.data, ...visitors]);
            setShowModal(false);
            setFormData({ name: '', phone: '', type: 'GUEST', unit: '' });
        } catch (err) {
            console.error('Failed to add visitor', err);
            alert('Failed to logging entry');
        }
    };

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
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <UserPlus size={18} /> New Entry
                </button>
            </header>

            <div className="grid grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Inside Society', val: '00', color: 'text-success' },
                    { label: 'Expected Today', val: '00', color: 'text-primary' },
                    { label: 'Delivery/Service', val: '00', color: 'text-secondary' },
                    { label: 'Staff Present', val: '00', color: 'text-accent' },
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

            {/* Sub-window modal for Security Entry */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-lg shadow-2xl relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute right-4 top-4 p-2 hover:bg-surface-light rounded-full transition-colors text-muted"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-2xl font-bold mb-6 gradient-text">New Visitor Entry</h2>

                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Visitor Name</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Rahul Sharma" className="w-full p-3 rounded-xl bg-surface border border-glass-border focus:border-primary outline-none text-sm" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Phone No</label>
                                    <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+91" className="w-full p-3 rounded-xl bg-surface border border-glass-border focus:border-primary outline-none text-sm" required />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Visitor Type</label>
                                    <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full p-3 rounded-xl bg-surface border border-glass-border focus:border-primary outline-none text-sm">
                                        <option value="GUEST">Guest</option>
                                        <option value="DELIVERY">Delivery</option>
                                        <option value="CAB">Cab / Taxi</option>
                                        <option value="STAFF">Service Staff</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Unit / Destination</label>
                                <input type="text" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} placeholder="e.g. A-102" className="w-full p-3 rounded-xl bg-surface border border-glass-border focus:border-primary outline-none text-sm" required />
                            </div>
                            <button type="submit" className="w-full btn btn-primary py-4 mt-4 shadow-lg shadow-primary/20">
                                Log Entry
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Security;
