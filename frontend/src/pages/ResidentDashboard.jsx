import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Receipt, Wallet, Bell, ArrowRight, IndianRupee, Calendar, MapPin, Check, X, HelpCircle } from 'lucide-react';
import api from '../api';
import { motion } from 'framer-motion';

const ResidentDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [bills, setBills] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadDashboard = async () => {
        try {
            const [profRes, billRes, noteRes, meetRes] = await Promise.all([
                api.get('/resident/profile'),
                api.get('/resident/bills'),
                api.get('/resident/notifications'),
                api.get('/resident/meetings')
            ]);
            setProfile(profRes.data);
            setBills(billRes.data);
            setNotifications(noteRes.data.slice(0, 5));
            setMeetings(meetRes.data);
        } catch (err) {
            console.error("Dashboard load failed", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const handleRSVP = async (meetingId, status) => {
        try {
            await api.post(`/resident/meetings/${meetingId}/rsvp`, { status });
            // Refresh meetings to update UI
            const res = await api.get('/resident/meetings');
            setMeetings(res.data);
        } catch (err) {
            console.error("RSVP failed", err);
            alert("Failed to update RSVP");
        }
    };

    const unpaidBills = bills.filter(b => b.status === 'UNPAID');
    const totalDue = unpaidBills.reduce((acc, b) => acc + b.totalAmount, 0);

    if (loading) return <div className="flex items-center justify-center min-h-[400px]">Loading Dashboard...</div>;

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black gradient-text pb-2">Welcome Back, {profile?.firstName}</h1>
                    <p className="text-text-muted">Member ID: <span className="text-primary font-mono font-bold tracking-widest">{profile?.memberId || 'N/A'}</span></p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold text-muted uppercase tracking-widest">{profile?.societyName}</p>
                    <p className="text-sm font-bold text-primary">{profile?.address}</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="glass-card bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 p-8 cursor-pointer group"
                >
                    <div className="flex flex-col gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary"><IndianRupee size={24} /></div>
                        <div>
                            <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">Total Outstanding</p>
                            <h2 className="text-4xl font-black text-rose-600">₹{totalDue.toLocaleString()}</h2>
                        </div>
                        <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest group-hover:gap-4 transition-all pt-2">
                            View Bills <ArrowRight size={14} />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} delay={0.1}
                    className="glass-card p-8 border border-success/20"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center text-success"><Receipt size={24} /></div>
                        <div>
                            <h3 className="text-xl font-bold">Latest Bill</h3>
                            <p className="text-xs text-muted">Status: <span className="text-success font-black uppercase">Paid</span></p>
                        </div>
                    </div>
                    {bills.length > 0 ? (
                        <div className="space-y-2">
                            <p className="text-lg font-black">₹{bills[0].totalAmount.toLocaleString()}</p>
                            <p className="text-xs text-muted font-mono uppercase">{bills[0].invoiceNo}</p>
                        </div>
                    ) : <p className="text-sm text-muted">No bills generated yet.</p>}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} delay={0.2}
                    className="glass-card p-8 border border-secondary/20"
                >
                    <h3 className="text-xl font-bold flex items-center gap-2 mb-6"><Bell size={20} className="text-secondary" /> Recent Alerts</h3>
                    <div className="space-y-4">
                        {notifications.length > 0 ? notifications.map(n => (
                            <div key={n.id} className="border-l-2 border-secondary/30 pl-3">
                                <p className="text-xs font-bold truncate">{n.title}</p>
                                <p className="text-[10px] text-muted line-clamp-1">{n.message}</p>
                            </div>
                        )) : <p className="text-sm text-muted">No new notifications.</p>}
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card">
                        <h3 className="text-xl font-black mb-6 flex items-center gap-2 uppercase tracking-widest"><Wallet size={20} className="text-primary" /> Maintenance Bills</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-muted text-[10px] uppercase font-black border-b border-glass-border tracking-tighter">
                                        <th className="pb-4 px-4">Bill No</th>
                                        <th className="pb-4">Due Date</th>
                                        <th className="pb-4 text-right">Amount (₹)</th>
                                        <th className="pb-4 text-center">Status</th>
                                        <th className="pb-4 text-right px-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {unpaidBills.length > 0 ? unpaidBills.map(b => (
                                        <tr key={b.id} className="border-b border-glass-border/30 hover:bg-glass/30 transition-colors">
                                            <td className="py-4 px-4 font-mono font-bold text-xs text-primary">{b.invoiceNo}</td>
                                            <td className="py-4 text-xs font-bold text-rose-600">{b.dueDate}</td>
                                            <td className="py-4 text-right font-black">₹{b.totalAmount.toLocaleString()}</td>
                                            <td className="py-4 text-center">
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-warning/20 text-warning font-bold uppercase">Unpaid</span>
                                            </td>
                                            <td className="py-4 text-right px-4">
                                                <button className="btn btn-primary btn-sm px-4 h-auto uppercase text-[10px] font-black tracking-widest">Pay Now</button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="py-20 text-center text-muted italic">All clear! No pending bills.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass-card border border-primary/20">
                        <h3 className="text-xl font-black mb-6 flex items-center gap-2 uppercase tracking-widest text-primary"><Calendar size={20} /> Society Meetings</h3>
                        <div className="space-y-4">
                            {meetings.length > 0 ? meetings.map(m => (
                                <div key={m.id} className="p-4 bg-glass border border-glass-border/30 rounded-2xl hover:border-primary/50 transition-all group">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${m.type === 'AGM' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'}`}>
                                            {m.type}
                                        </div>
                                        <div className="text-[9px] font-bold text-muted italic flex items-center gap-1">
                                            <Calendar size={10} /> {m.date}
                                        </div>
                                    </div>
                                    <h4 className="font-black text-sm mb-1 group-hover:text-primary transition-colors">{m.title}</h4>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted mt-2">
                                        <MapPin size={10} className="text-primary" /> {m.venue || 'Club House'}
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-glass-border flex flex-col gap-3">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Will you attend?</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleRSVP(m.id, 'CONFIRMED')}
                                                className={`flex-1 py-2 px-1 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 transition-all ${m.myRsvpStatus === 'CONFIRMED' ? 'bg-success text-white shadow-lg shadow-success/30' : 'bg-success/10 text-success hover:bg-success/20'}`}
                                            >
                                                <Check size={12} /> Yes
                                            </button>
                                            <button
                                                onClick={() => handleRSVP(m.id, 'DECLINED')}
                                                className={`flex-1 py-2 px-1 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 transition-all ${m.myRsvpStatus === 'DECLINED' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'}`}
                                            >
                                                <X size={12} /> No
                                            </button>
                                            <button
                                                onClick={() => handleRSVP(m.id, 'TENTATIVE')}
                                                className={`flex-1 py-2 px-1 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 transition-all ${m.myRsvpStatus === 'TENTATIVE' ? 'bg-warning text-white shadow-lg shadow-warning/30' : 'bg-warning/10 text-warning hover:bg-warning/20'}`}
                                            >
                                                <HelpCircle size={12} /> Maybe
                                            </button>
                                        </div>
                                        {(m.confirmedCount > 0) && (
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex -space-x-2">
                                                    {[...Array(Math.min(3, m.confirmedCount))].map((_, i) => (
                                                        <div key={i} className="w-5 h-5 rounded-full border-2 border-surface bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary">
                                                            {i === 2 ? '+' : 'U'}
                                                        </div>
                                                    ))}
                                                </div>
                                                <span className="text-[9px] font-bold text-muted">{m.confirmedCount} members attending</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <div className="py-10 text-center text-muted italic bg-glass/20 rounded-2xl border border-dotted border-glass-border text-xs">
                                    No meetings scheduled.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResidentDashboard;
