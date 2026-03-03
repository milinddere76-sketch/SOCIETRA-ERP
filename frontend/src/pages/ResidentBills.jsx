import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Receipt, Wallet, Bell, ArrowRight, IndianRupee, Download, CheckCircle, Clock } from 'lucide-react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import BillPrint from '../components/BillPrint';

const ResidentBills = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [printingId, setPrintingId] = useState(null);
    const [profile, setProfile] = useState(null);
    const [activeTab, setActiveTab] = useState('ALL');

    useEffect(() => {
        const fetchBills = async () => {
            try {
                const [profRes, billRes] = await Promise.all([
                    api.get('/resident/profile'),
                    api.get('/resident/bills')
                ]);
                setProfile(profRes.data);
                setBills(billRes.data);
            } catch (err) {
                console.error("Bills fetch failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBills();
    }, []);

    const handlePrint = (id) => {
        setPrintingId(id);
        setTimeout(() => {
            window.print();
            setPrintingId(null);
        }, 100);
    };

    const handlePay = async (id) => {
        if (window.confirm("Proceed to simulate payment for this bill?")) {
            try {
                await api.post(`/resident/pay/${id}`);
                alert("Payment Successful! Bill status has been updated.");
                const res = await api.get('/resident/bills');
                setBills(res.data);
            } catch (err) {
                alert("Payment simulation failed.");
            }
        }
    };

    const filteredBills = activeTab === 'ALL' ? bills : bills.filter(b => b.status === activeTab);

    if (loading) return <div className="flex items-center justify-center min-vh-100">Loading Bills...</div>;

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-end mb-8 no-print">
                <div>
                    <h1 className="text-3xl font-black gradient-text pb-2 uppercase tracking-widest">My Maintenance Ledger</h1>
                    <p className="text-text-muted">History of maintenance bills, receipts, and statutory dues for <span className="text-primary font-bold">{profile?.address}</span></p>
                </div>
            </header>

            <div className="flex gap-4 mb-8 no-print bg-glass p-1 rounded-2xl border border-glass-border w-fit">
                {['ALL', 'UNPAID', 'PAID'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-8 py-2.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${activeTab === tab ? 'bg-primary text-white shadow-lg' : 'text-muted hover:text-white hover:bg-glass'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 no-print">
                <AnimatePresence>
                    {filteredBills.map(b => (
                        <motion.div
                            key={b.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`glass-card group border-l-8 ${b.status === 'PAID' ? 'border-success/30' : 'border-error/30 animate-in fade-in slide-in-from-left duration-300'}`}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-lg font-black uppercase tracking-widest mb-1">Bill Reference</h3>
                                    <p className="text-xs font-mono font-bold text-primary">{b.invoiceNo}</p>
                                </div>
                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center gap-2 ${b.status === 'PAID' ? 'bg-success/20 text-success' : 'bg-error/20 text-error animate-pulse'}`}>
                                    {b.status === 'PAID' ? <><CheckCircle size={14} /> Fully Paid</> : <><Clock size={14} /> Pending Payment</>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-surface-light p-4 rounded-xl">
                                    <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Total Amount Payable</p>
                                    <p className="text-2xl font-black text-primary">₹{b.totalAmount.toLocaleString()}</p>
                                </div>
                                <div className="bg-surface-light p-4 rounded-xl">
                                    <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Due Date</p>
                                    <p className="text-lg font-black text-rose-600">{b.dueDate || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => handlePrint(b.id)}
                                    className="btn btn-outline flex-1 border-primary/20 text-primary hover:bg-primary/5 flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all"
                                >
                                    <Download size={14} /> {b.status === 'PAID' ? 'Download Receipt' : 'Download Bill'}
                                </button>
                                {b.status !== 'PAID' && (
                                    <button
                                        onClick={() => handlePay(b.id)}
                                        className="btn btn-primary flex-1 shadow-lg shadow-primary/30 flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all"
                                    >
                                        <IndianRupee size={14} /> Secure Payment
                                    </button>
                                )}
                            </div>

                            {/* Actual Hidden Print Area */}
                            {printingId === b.id && (
                                <div className="hidden print:block fixed inset-0 z-[9999] bg-white text-black p-0">
                                    <BillPrint bill={b} society={profile?.society} />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ResidentBills;
