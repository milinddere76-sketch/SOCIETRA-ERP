import React, { useState, useEffect } from 'react';
import { Calendar, Wallet, Users, LayoutDashboard, Plus, Check, Settings, Save, ArrowLeft, RefreshCw } from 'lucide-react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';

const AccountingSetup = () => {
    const [activeTab, setActiveTab] = useState('years');
    const [years, setYears] = useState([]);
    const [units, setUnits] = useState([]);
    const [ledgers, setLedgers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showYearModal, setShowYearModal] = useState(false);
    const [newYear, setNewYear] = useState({ yearName: '', startDate: '', endDate: '', active: false });

    useEffect(() => {
        fetchInitialData();
    }, [activeTab]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'years') {
                const res = await api.get('/accounting/setup/years');
                setYears(res.data);
            } else if (activeTab === 'units') {
                const res = await api.get('/accounting/setup/units');
                setUnits(res.data);
            } else if (activeTab === 'ledgers') {
                const res = await api.get('/accounting/setup/ledgers');
                setLedgers(res.data);
            }
        } catch (err) {
            console.error("Failed to fetch setup data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateYear = async (e) => {
        e.preventDefault();
        try {
            await api.post('/accounting/setup/years', newYear);
            setShowYearModal(false);
            fetchInitialData();
            setNewYear({ yearName: '', startDate: '', endDate: '', active: false });
        } catch (err) {
            console.error("Failed to created year", err);
        }
    };

    const handleActivateYear = async (id) => {
        try {
            const res = await api.post(`/accounting/setup/years/${id}/activate`);
            alert(res.data);
            fetchInitialData();
        } catch (err) {
            console.error("Failed to activate year", err);
            alert(err.response?.data || "Failed to activate year");
        }
    };

    const handleCloseYear = async (id) => {
        if (!window.confirm("Are you sure? Once closed, you won't be able to record transactions in this period without re-activating (if allowed).")) return;
        try {
            await api.post(`/accounting/setup/years/${id}/close`);
            fetchInitialData();
        } catch (err) {
            console.error("Failed to close year", err);
        }
    };

    const handleSaveBalances = async (type) => {
        try {
            const data = type === 'units' ? units : ledgers;
            const updates = data.map(item => ({
                id: item.id,
                balance: item.openingBalance,
                date: item.openingBalanceDate
            }));
            await api.patch(`/accounting/setup/${type}/opening-balances`, updates);
            alert("Balances saved successfully!");
        } catch (err) {
            console.error("Failed to save balances", err);
        }
    };

    const renderTabs = () => (
        <div className="flex gap-4 mb-8 bg-glass p-1 rounded-2xl border border-glass-border w-fit">
            {[
                { id: 'years', label: 'Financial Years', icon: <Calendar size={18} /> },
                { id: 'units', label: 'Member Balances', icon: <Users size={18} /> },
                { id: 'ledgers', label: 'Ledger Balances', icon: <Wallet size={18} /> }
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-[1.02]' : 'text-text-muted hover:bg-glass hover:text-text'
                        }`}
                >
                    {tab.icon} {tab.label}
                </button>
            ))}
        </div>
    );

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-black gradient-text pb-2 uppercase tracking-tighter">Accounting Setup</h1>
                    <p className="text-text-muted">Configure financial years and set opening balances for migration.</p>
                </div>
                <div className="flex gap-4">
                    <button className="btn btn-secondary flex items-center gap-2" onClick={fetchInitialData}>
                        <RefreshCw size={18} /> Refresh
                    </button>
                    {activeTab !== 'years' && (
                        <button className="btn btn-primary flex items-center gap-2 bg-success hover:bg-success/80" onClick={() => handleSaveBalances(activeTab)}>
                            <Save size={18} /> Save All Balances
                        </button>
                    )}
                </div>
            </header>

            {renderTabs()}

            <AnimatePresence mode="wait">
                {activeTab === 'years' && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                    >
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-black uppercase tracking-widest text-primary">Managed Accounting Periods</h2>
                            <button className="btn btn-primary flex items-center gap-2" onClick={() => setShowYearModal(true)}>
                                <Plus size={20} /> Add Financial Year
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {years.map(year => (
                                <div key={year.id} className={`glass-card p-6 border-2 transition-all ${year.active ? 'border-primary bg-primary/5' : 'border-glass-border'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-surface-light flex items-center justify-center text-primary shadow-inner">
                                            <Calendar size={24} />
                                        </div>
                                        {year.active ? (
                                            <div className="flex flex-col gap-2">
                                                <span className="badge bg-success/20 text-success border border-success/30 px-3 py-1 text-[10px] font-black uppercase text-center">Active Now</span>
                                                <button onClick={() => handleCloseYear(year.id)} className="btn btn-sm border border-error/30 text-error hover:bg-error/10 text-[9px] uppercase">Close Year</button>
                                            </div>
                                        ) : year.closed ? (
                                            <span className="badge bg-error/10 text-error border border-error/20 px-3 py-1 text-[10px] font-black uppercase">Finalized</span>
                                        ) : (
                                            <button onClick={() => handleActivateYear(year.id)} className="btn btn-sm btn-secondary text-[10px] uppercase">Activate</button>
                                        )}
                                    </div>
                                    <h3 className="text-2xl font-black mb-1">{year.yearName}</h3>
                                    <p className="text-xs text-muted font-bold uppercase tracking-widest mb-4">Period: {year.startDate} to {year.endDate}</p>
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted">
                                        Status: <span className={year.closed ? 'text-error' : 'text-success'}>{year.closed ? 'Closed/Locked' : 'Open'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {(activeTab === 'units' || activeTab === 'ledgers') && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                        className="glass-card p-0 overflow-hidden"
                    >
                        <div className="p-6 border-b border-glass-border flex justify-between items-center bg-surface-light/30">
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tighter">Set Opening Balances</h2>
                                <p className="text-xs text-muted font-bold uppercase tracking-widest">Update existing dues and account balances as of migration date.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-bold text-muted">A positive value for members represents outstanding dues.</span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-surface-light/50 border-b border-glass-border">
                                    <tr className="text-[10px] font-black text-muted uppercase tracking-widest">
                                        <th className="px-6 py-4">Name / ID</th>
                                        <th className="px-6 py-4">Reference</th>
                                        <th className="px-6 py-4">Balance Date</th>
                                        <th className="px-6 py-4 text-right">Opening Balance (₹)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-glass-border">
                                    {(activeTab === 'units' ? units : ledgers).map((item, idx) => (
                                        <tr key={item.id} className="hover:bg-primary/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-sm">{activeTab === 'units' ? item.unitNumber : item.name}</div>
                                                <div className="text-[10px] text-muted font-mono">{activeTab === 'units' ? (item.wing?.name || 'Wing A') : (item.group?.name || 'General')}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs font-bold text-muted uppercase">{activeTab === 'units' ? (item.ownerName || 'UNALLOCATED') : item.code}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="date"
                                                    value={item.openingBalanceDate || ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (activeTab === 'units') {
                                                            const newUnits = [...units];
                                                            newUnits[idx].openingBalanceDate = val;
                                                            setUnits(newUnits);
                                                        } else {
                                                            const newLedgers = [...ledgers];
                                                            newLedgers[idx].openingBalanceDate = val;
                                                            setLedgers(newLedgers);
                                                        }
                                                    }}
                                                    className="bg-surface border border-glass-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary"
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className="text-xs font-bold text-muted">₹</span>
                                                    <input
                                                        type="number"
                                                        value={item.openingBalance || 0}
                                                        onChange={(e) => {
                                                            const val = parseFloat(e.target.value);
                                                            if (activeTab === 'units') {
                                                                const newUnits = [...units];
                                                                newUnits[idx].openingBalance = val;
                                                                setUnits(newUnits);
                                                            } else {
                                                                const newLedgers = [...ledgers];
                                                                newLedgers[idx].openingBalance = val;
                                                                setLedgers(newLedgers);
                                                            }
                                                        }}
                                                        className="bg-surface border border-glass-border rounded-lg px-3 py-1.5 text-right font-black text-sm outline-none focus:ring-2 focus:ring-primary w-32"
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Year Creation Modal */}
            {showYearModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-glass-border bg-primary/5">
                            <h2 className="text-xl font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                <Plus size={24} /> New Financial Period
                            </h2>
                        </div>
                        <form onSubmit={handleCreateYear} className="p-8 space-y-6">
                            <div>
                                <label className="label">Year Name (Standard Indian Format)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 2024-25"
                                    className="input"
                                    value={newYear.yearName}
                                    onChange={(e) => setNewYear({ ...newYear, yearName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Start Date</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={newYear.startDate}
                                        onChange={(e) => setNewYear({ ...newYear, startDate: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="label">End Date</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={newYear.endDate}
                                        onChange={(e) => setNewYear({ ...newYear, endDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-glass p-3 rounded-xl border border-glass-border">
                                <input
                                    type="checkbox"
                                    id="activeCheck"
                                    checked={newYear.active}
                                    onChange={(e) => setNewYear({ ...newYear, active: e.target.checked })}
                                    className="w-5 h-5 accent-primary"
                                />
                                <label htmlFor="activeCheck" className="text-sm font-bold text-primary select-none cursor-pointer uppercase tracking-widest">Set as Current Active Year</label>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" className="btn btn-secondary flex-1" onClick={() => setShowYearModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary flex-1 shadow-lg shadow-primary/30">Initialize Year</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default AccountingSetup;
