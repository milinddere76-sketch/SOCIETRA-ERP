import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, Clock, Info, MessageSquare } from 'lucide-react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';

const ResidentNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const res = await api.get('/resident/notifications');
                setNotifications(res.data);
            } catch (err) {
                console.error("Notifications fetch failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchNotes();
    }, []);

    const markRead = async (id) => {
        try {
            // Simulated read logic
            setNotifications(notifications.filter(n => n.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="flex items-center justify-center min-vh-100">Loading Alerts...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom duration-500">
            <header className="flex justify-between items-end mb-12">
                <div>
                    <h1 className="text-3xl font-black gradient-text pb-2 uppercase tracking-widest leading-tight">Alert Center</h1>
                    <p className="text-sm font-bold font-mono text-muted uppercase tracking-widest">Stay informed on your society and financial dues.</p>
                </div>
                <div className="flex items-center gap-2 text-primary font-black text-[10px] bg-primary/10 px-4 py-2 rounded-xl transition-all"><Bell size={14} /> {notifications.length} Active Alerts</div>
            </header>

            <div className="space-y-4">
                <AnimatePresence>
                    {notifications.length > 0 ? notifications.map((n, idx) => (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: idx * 0.05 }}
                            className="glass-card group hover:border-primary/30 transition-all border-l-4 border-primary/20 p-6 flex items-start gap-6 cursor-pointer"
                            onClick={() => markRead(n.id)}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${n.type === 'BILL' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                                {n.type === 'BILL' ? <Clock size={24} /> : (n.type === 'PAYMENT' ? <CheckCircle size={24} /> : <Info size={24} />)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-black text-lg mb-1">{n.title}</h3>
                                <p className="text-sm text-text-muted leading-relaxed line-clamp-2">{n.message}</p>
                                <p className="text-[10px] text-muted font-bold mt-4 uppercase tracking-widest">{new Date(n.createdAt).toLocaleString()}</p>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 hover:bg-glass rounded-lg text-primary text-xs font-black uppercase">Dismiss</button>
                            </div>
                        </motion.div>
                    )) : (
                        <div className="text-center py-20 glass-card">
                            <div className="w-20 h-20 rounded-full bg-surface-light flex items-center justify-center text-muted mx-auto mb-6"><Bell size={40} /></div>
                            <h3 className="text-xl font-black uppercase tracking-widest">All caught up!</h3>
                            <p className="text-sm text-muted">You have no new notifications.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ResidentNotifications;
