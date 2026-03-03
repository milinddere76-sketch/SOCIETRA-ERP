import React, { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, Building2, Calendar, FileText, Download } from 'lucide-react';
import api from '../api';
import { motion } from 'framer-motion';

const SuperAdminAccounting = () => {
    const [societies, setSocieties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/superadmin/societies');
                setSocieties(res.data);
            } catch (err) {
                console.error("Failed to fetch superadmin accounting data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const activeSocieties = societies.filter(s => s.status === 'ACTIVE');
    const pendingSocieties = societies.filter(s => s.status === 'PENDING');

    // Estimate SaaS MRR/ARR based on planName and active societies roughly
    // Assuming 'Yearly Premium' is 4999 (so ~416/mo) and 'Monthly Standard' is 499/mo
    let estimatedMonthlyRevenue = 0;
    activeSocieties.forEach(s => {
        if (s.planName === 'Yearly Premium') estimatedMonthlyRevenue += 4999 / 12;
        if (s.planName === 'Monthly Standard') estimatedMonthlyRevenue += 499;
    });

    let totalLifetimeRevenue = 0; // Simulated historical value for SaaS
    activeSocieties.forEach(s => {
        if (s.planName === 'Yearly Premium') totalLifetimeRevenue += 4999;
        if (s.planName === 'Monthly Standard') totalLifetimeRevenue += 499;
    });

    if (loading) return <div className="flex items-center justify-center min-vh-100">Loading SaaS Financials...</div>;

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-black gradient-text pb-2 uppercase tracking-widest">SaaS Financials</h1>
                    <p className="text-text-muted">Global revenue, subscriptions, and active society accounting.</p>
                </div>
                <button className="btn btn-outline border-primary/20 text-primary hover:bg-primary/5 shadow-sm">
                    <Download size={18} className="mr-2" /> Export Ledgers
                </button>
            </header>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card bg-gradient-to-br from-primary/10 to-transparent border-l-4 border-l-primary">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary"><IndianRupee size={24} /></div>
                        <span className="px-2 py-1 bg-success/10 text-success text-[10px] font-bold uppercase rounded-lg">Estimated</span>
                    </div>
                    <p className="text-xs text-muted font-bold uppercase tracking-widest mb-1">Monthly Recurring Rev</p>
                    <h3 className="text-3xl font-black text-text">₹{Math.round(estimatedMonthlyRevenue).toLocaleString()}</h3>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card bg-gradient-to-br from-secondary/10 to-transparent border-l-4 border-l-secondary">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-secondary/10 rounded-xl text-secondary"><TrendingUp size={24} /></div>
                        <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded-lg">YTD</span>
                    </div>
                    <p className="text-xs text-muted font-bold uppercase tracking-widest mb-1">Total Lifetime Rev</p>
                    <h3 className="text-3xl font-black text-text">₹{Math.round(totalLifetimeRevenue).toLocaleString()}</h3>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card bg-gradient-to-br from-success/10 to-transparent border-l-4 border-l-success">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-success/10 rounded-xl text-success"><Building2 size={24} /></div>
                    </div>
                    <p className="text-xs text-muted font-bold uppercase tracking-widest mb-1">Active Subscriptions</p>
                    <h3 className="text-3xl font-black text-text">{activeSocieties.length}</h3>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card bg-gradient-to-br from-warning/10 to-transparent border-l-4 border-l-warning">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-warning/10 rounded-xl text-warning"><Calendar size={24} /></div>
                    </div>
                    <p className="text-xs text-muted font-bold uppercase tracking-widest mb-1">Pending Activations</p>
                    <h3 className="text-3xl font-black text-text">{pendingSocieties.length}</h3>
                </motion.div>
            </div>

            {/* Subscription Ledger Table */}
            <div className="glass-card p-0 overflow-hidden">
                <div className="p-6 border-b border-glass-border flex justify-between items-center bg-surface-light/30">
                    <h3 className="text-lg font-bold flex items-center gap-2"><FileText className="text-primary" size={20} /> Latest Subscription Receipts</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-surface border-b border-glass-border text-muted text-[10px] uppercase font-black tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Society Client</th>
                                <th className="px-6 py-4">Subscription Plan</th>
                                <th className="px-6 py-4">Expected Value</th>
                                <th className="px-6 py-4">Expiry Date</th>
                                <th className="px-6 py-4">Payment Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-glass-border">
                            {societies.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-muted text-sm">No subscription data available.</td>
                                </tr>
                            ) : (
                                societies.map(soc => (
                                    <tr key={soc.id} className="hover:bg-surface-light/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-sm text-text">{soc.name}</div>
                                            <div className="text-[10px] text-muted font-mono">{soc.societyCode}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-primary text-sm">{soc.planName || 'Free Tier/Unknown'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm font-bold">
                                                {soc.planName === 'Yearly Premium' ? '₹4,999' : soc.planName === 'Monthly Standard' ? '₹499' : '₹0'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold text-muted">{soc.subscriptionExpiry || 'Lifetime/None'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {soc.status === 'ACTIVE' ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-success/10 text-success border border-success/20">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-success"></span> Verified
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-warning/10 text-warning border border-warning/20">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse"></span> Pending
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminAccounting;
