import React, { useState, useEffect } from 'react';
import {
    Download,
    Filter,
    Plus,
    X,
    Wallet, ArrowUpRight, ArrowDownRight, IndianRupee, Settings, Edit, Trash2, Check, Ban, Save,
    User, FileText, PieChart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';

const Accounting = () => {
    const navigate = useNavigate();
    const currentUserEmail = localStorage.getItem('email');
    const [showModal, setShowModal] = useState(false);
    const [showAuditModal, setShowAuditModal] = useState(false);
    const [auditReport, setAuditReport] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const [formData, setFormData] = useState({
        description: '',
        type: 'Debit',
        amount: '',
        category: '',
        payeePayerName: '',
        paymentMode: 'Cash'
    });

    const [activeTab, setActiveTab] = useState('transactions'); // 'transactions', 'reconcile', 'receipts', 'expenses', 'reports'
    const [bankDetails, setBankDetails] = useState({ bankName: '', accountNumber: '', ifscCode: '', accountType: 'Savings', qrCodeUrl: '' });
    const [statementEntries, setStatementEntries] = useState([]);
    const [isSavingBank, setIsSavingBank] = useState(false);

    const [receipts, setReceipts] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [members, setMembers] = useState([]);
    const [unpaidBills, setUnpaidBills] = useState([]);
    const [ledgers, setLedgers] = useState([]);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);

    const [receiptForm, setReceiptForm] = useState({ memberId: '', billId: '', amount: '', paymentMode: 'Cash', reference: '', narration: '' });
    const [expenseForm, setExpenseForm] = useState({ ledgerId: '', amount: '', payee: '', description: '', paymentMode: 'Cash', reference: '' });

    useEffect(() => {
        if (activeTab === 'reconcile') fetchBankData();
        else if (activeTab === 'transactions') fetchTransactions();
        else if (activeTab === 'receipts') fetchReceiptData();
        else if (activeTab === 'expenses') fetchExpenseData();
        else if (activeTab === 'reports') fetchTransactions(); // Reuse for now
    }, [activeTab]);

    const fetchReceiptData = async () => {
        try {
            setLoading(true);
            const [recRes, memRes, billRes] = await Promise.all([
                api.get('/accounting/receipts'),
                api.get('/members'),
                api.get('/billing')
            ]);
            setReceipts(recRes.data);
            setMembers(memRes.data);
            setUnpaidBills(billRes.data.filter(b => b.status === 'UNPAID'));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchExpenseData = async () => {
        try {
            setLoading(true);
            const [expRes, ledRes] = await Promise.all([
                api.get('/accounting/expenses'),
                api.get('/accounting/setup/ledgers')
            ]);
            setExpenses(expRes.data);
            setLedgers(ledRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleReceiptSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/accounting/receipts', receiptForm);
            setShowReceiptModal(false);
            fetchReceiptData();
        } catch (err) {
            alert("Failed to save receipt");
        }
    };

    const handleExpenseSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/accounting/expenses', expenseForm);
            setShowExpenseModal(false);
            fetchExpenseData();
        } catch (err) {
            alert("Failed to save expense");
        }
    };

    const downloadReceipt = (id) => {
        window.open(`${api.defaults.baseURL}/accounting/receipts/${id}/pdf`, '_blank');
    };

    const downloadVoucher = (id) => {
        window.open(`${api.defaults.baseURL}/accounting/expenses/${id}/pdf`, '_blank');
    };

    const fetchBankData = async () => {
        try {
            setLoading(true);
            const [bankRes, entriesRes] = await Promise.all([
                api.get('/accounting/reconcile/bank'),
                api.get('/accounting/reconcile/entries')
            ]);
            if (bankRes.data && bankRes.data.bankName) setBankDetails(bankRes.data);
            setStatementEntries(entriesRes.data || []);
        } catch (err) {
            console.error("Failed to fetch bank data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleBankDetailSave = async (e) => {
        e.preventDefault();
        try {
            setIsSavingBank(true);
            await api.post('/accounting/reconcile/bank', bankDetails);
            alert("Bank details saved successfully");
        } catch (err) {
            alert("Failed to save bank details");
        } finally {
            setIsSavingBank(false);
        }
    };

    const handleMatch = async (entryId, transactionId) => {
        try {
            await api.post(`/accounting/reconcile/match/${entryId}`, { transactionId });
            fetchBankData();
        } catch (err) {
            alert("Matching failed");
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target.result;
            const lines = text.split('\n').filter(l => l.trim());
            const entries = lines.slice(1).map(line => {
                const parts = line.split(',');
                return {
                    transactionDate: parts[0]?.trim(),
                    description: parts[1]?.trim(),
                    referenceNumber: parts[2]?.trim(),
                    amount: parseFloat(parts[3] || '0'),
                    transactionType: parts[4]?.toUpperCase().includes('CR') ? 'CR' : 'DR'
                };
            });

            try {
                await api.post('/accounting/reconcile/upload', entries);
                fetchBankData();
                alert("Statement uploaded successfully");
            } catch (err) {
                alert("Upload failed");
            }
        };
        reader.readAsText(file);
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchAuditReport = async () => {
        try {
            const societies = await api.get('/societies');
            const sid = societies.data[0]?.id;
            if (!sid) return;

            const res = await api.get(`/accounting/audit-report?societyId=${sid}`);
            setAuditReport(res.data);
            setShowAuditModal(true);
        } catch (err) {
            console.error(err);
            alert("Failed to generate audit report");
        }
    };

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const res = await api.get('/accounting/transactions');
            setTransactions(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                amount: parseFloat(formData.amount)
            };
            if (editMode) {
                await api.put(`/accounting/transactions/${selectedId}`, payload);
            } else {
                await api.post('/accounting/transactions', payload);
            }
            fetchTransactions();
            closeModal();
        } catch (err) {
            alert('Failed to save transaction: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this pending transaction?")) return;
        try {
            await api.delete(`/accounting/transactions/${id}`);
            fetchTransactions();
        } catch (err) {
            alert("Delete failed");
        }
    };

    const handleApprove = async (id) => {
        try {
            await api.post(`/accounting/transactions/${id}/approve`);
            fetchTransactions();
        } catch (err) {
            alert("Approval failed");
        }
    };

    const handleReject = async (id) => {
        const reason = window.prompt("Reason for rejection:");
        if (!reason) return;
        try {
            await api.post(`/accounting/transactions/${id}/reject`, { reason });
            fetchTransactions();
        } catch (err) {
            alert("Rejection failed");
        }
    };

    const openModal = (txn = null) => {
        if (txn) {
            setEditMode(true);
            setSelectedId(txn.id);
            setFormData({
                description: txn.description,
                type: txn.type,
                amount: txn.amount,
                category: txn.category,
                payeePayerName: txn.payeePayerName || '',
                paymentMode: txn.paymentMode || 'Cash'
            });
        } else {
            setEditMode(false);
            setFormData({ description: '', type: 'Debit', amount: '', category: '', payeePayerName: '', paymentMode: 'Cash' });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditMode(false);
        setSelectedId(null);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED': return 'text-success bg-success/10 border-success/20';
            case 'REJECTED': return 'text-error bg-error/10 border-error/20';
            default: return 'text-warning bg-warning/10 border-warning/20';
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-black gradient-text pb-2 uppercase tracking-tighter">Society Treasury</h1>
                    <div className="flex gap-1 mt-1">
                        <button
                            onClick={() => setActiveTab('transactions')}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'transactions' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted hover:bg-surface-light'}`}
                        >
                            Audit Trail
                        </button>
                        <button
                            onClick={() => setActiveTab('reconcile')}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'reconcile' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted hover:bg-surface-light'}`}
                        >
                            Bank Reconciliation
                        </button>
                        <button
                            onClick={() => setActiveTab('receipts')}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'receipts' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted hover:bg-surface-light'}`}
                        >
                            Receipts
                        </button>
                        <button
                            onClick={() => setActiveTab('expenses')}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'expenses' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted hover:bg-surface-light'}`}
                        >
                            Expenses
                        </button>
                        <button
                            onClick={() => setActiveTab('reports')}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'reports' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted hover:bg-surface-light'}`}
                        >
                            Financial Reports
                        </button>
                    </div>
                </div>
                <div className="flex gap-4">
                    {activeTab === 'transactions' && (
                        <>
                            <button className="btn border border-primary/30 text-primary hover:bg-primary/10 shadow-lg flex items-center gap-2" onClick={fetchAuditReport}>
                                <Check size={20} /> Compliance Audit
                            </button>
                            <button className="btn btn-primary shadow-lg shadow-primary/30 flex items-center gap-2" onClick={() => openModal()}>
                                <Plus size={20} /> New Entry
                            </button>
                        </>
                    )}
                    {activeTab === 'reconcile' && (
                        <div className="relative">
                            <input
                                type="file"
                                id="statement-upload"
                                className="hidden"
                                accept=".csv"
                                onChange={handleFileUpload}
                            />
                            <label
                                htmlFor="statement-upload"
                                className="btn btn-primary shadow-lg shadow-primary/30 flex items-center gap-2 cursor-pointer"
                            >
                                <Download size={20} /> Upload Statement
                            </label>
                        </div>
                    )}
                    {activeTab === 'receipts' && (
                        <button className="btn btn-primary shadow-lg shadow-primary/30 flex items-center gap-2" onClick={() => setShowReceiptModal(true)}>
                            <Plus size={20} /> Record Receipt
                        </button>
                    )}
                    {activeTab === 'expenses' && (
                        <button className="btn btn-primary shadow-lg shadow-primary/30 flex items-center gap-2" onClick={() => setShowExpenseModal(true)}>
                            <Plus size={20} /> Record Expense
                        </button>
                    )}
                </div>
            </header>
            {activeTab === 'transactions' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="glass-card border-l-4 border-primary p-6">
                            <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Total Society Balance</p>
                            <h2 className="text-3xl font-black text-primary">₹14.2L</h2>
                        </div>
                        <div className="glass-card border-l-4 border-warning p-6">
                            <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Pending Approval</p>
                            <h2 className="text-3xl font-black text-warning">{transactions.filter(t => t.status === 'PENDING').length} Entries</h2>
                        </div>
                        <div className="glass-card border-l-4 border-success p-6">
                            <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Monthly Inflow</p>
                            <h2 className="text-3xl font-black text-success">₹3.8L</h2>
                        </div>
                        <div className="glass-card border-l-4 border-error p-6">
                            <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Monthly Outflow</p>
                            <h2 className="text-3xl font-black text-error">₹2.1L</h2>
                        </div>
                    </div>

                    <div className="glass-card overflow-hidden">
                        <div className="p-4 border-b border-glass-border bg-surface-light/30">
                            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                <Wallet size={18} className="text-primary" /> Verified Audit Trail
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-surface-light text-[10px] font-black text-muted uppercase border-b border-glass-border tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Transaction Details</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Verification Status</th>
                                        <th className="px-6 py-4">Compliance By</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-glass-border">
                                    {transactions.map((t) => (
                                        <tr key={t.id} className="hover:bg-primary/5 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-sm">{t.description}</div>
                                                <div className="flex items-center gap-2 text-[10px] text-muted italic">
                                                    <span>{t.date}</span> • <span>{t.category}</span> • <span className="text-primary font-bold uppercase">{t.voucherNumber}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 shrink-0">
                                                <div className={`font-black flex items-center gap-1 ${t.type === 'Credit' ? 'text-success' : 'text-error'}`}>
                                                    {t.type === 'Credit' ? '+' : '-'} ₹{t.amount.toLocaleString()}
                                                </div>
                                                <p className="text-[9px] text-muted uppercase font-bold">{t.paymentMode}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${getStatusColor(t.status)}`}>
                                                    {t.status}
                                                </span>
                                                {t.status === 'REJECTED' && t.rejectionReason && (
                                                    <p className="text-[9px] text-error mt-1 italic">Note: {t.rejectionReason}</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs font-bold">{t.createdBy}</div>
                                                {t.status === 'APPROVED' && (
                                                    <div className="text-[9px] text-success font-black uppercase mt-1">
                                                        By: {t.approvedBy || 'Secretary'} • {t.approvalDate}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {t.status === 'PENDING' && (
                                                        <>
                                                            <button onClick={() => openModal(t)} className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors" title="Edit Entry"><Edit size={16} /></button>
                                                            <button onClick={() => handleDelete(t.id)} className="p-2 hover:bg-error/10 text-error rounded-lg transition-colors" title="Delete Entry"><Trash2 size={16} /></button>
                                                            <button onClick={() => handleApprove(t.id)} className="p-2 hover:bg-success/10 text-success rounded-lg transition-colors" title="Approve Entry"><Check size={16} /></button>
                                                            <button onClick={() => handleReject(t.id)} className="p-2 hover:bg-error/10 text-error rounded-lg transition-colors" title="Reject Entry"><Ban size={16} /></button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {
                activeTab === 'receipts' && (
                    <div className="glass-card overflow-hidden">
                        <div className="p-4 border-b border-glass-border bg-surface-light/30">
                            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                <User size={18} className="text-primary" /> Member Maintenance Receipts
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left font-sans">
                                <thead className="bg-surface-light text-[10px] font-black text-muted uppercase border-b border-glass-border tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Receipt Details</th>
                                        <th className="px-6 py-4">Received From</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Mode</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-glass-border">
                                    {receipts.length === 0 ? (
                                        <tr><td colSpan="5" className="px-6 py-12 text-center text-muted italic font-bold">No receipts recorded yet.</td></tr>
                                    ) : (
                                        receipts.map(r => (
                                            <tr key={r.id} className="hover:bg-primary/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-sm text-primary">{r.receiptNumber}</div>
                                                    <div className="text-[10px] text-muted italic">{r.date}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-sm">{r.member?.firstName} {r.member?.lastName}</div>
                                                    <div className="text-[10px] text-muted uppercase font-black">{r.member?.unitNumber}</div>
                                                </td>
                                                <td className="px-6 py-4 font-black text-success">₹{r.amount.toLocaleString()}</td>
                                                <td className="px-6 py-4">
                                                    <div className="text-xs font-bold">{r.paymentMode}</div>
                                                    <div className="text-[9px] text-muted uppercase">{r.transactionReference}</div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => downloadReceipt(r.id)} className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors border border-primary/20 flex items-center gap-2 text-[10px] font-black uppercase ml-auto">
                                                        <Download size={14} /> PDF
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            }

            {
                activeTab === 'expenses' && (
                    <div className="glass-card overflow-hidden">
                        <div className="p-4 border-b border-glass-border bg-surface-light/30">
                            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                <FileText size={18} className="text-error" /> Society Expense Vouchers
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left font-sans">
                                <thead className="bg-surface-light text-[10px] font-black text-muted uppercase border-b border-glass-border tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Voucher No</th>
                                        <th className="px-6 py-4">Payee</th>
                                        <th className="px-6 py-4">Category</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-glass-border">
                                    {expenses.length === 0 ? (
                                        <tr><td colSpan="5" className="px-6 py-12 text-center text-muted italic font-bold">No expenses recorded yet.</td></tr>
                                    ) : (
                                        expenses.map(e => (
                                            <tr key={e.id} className="hover:bg-error/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-sm text-error">{e.voucherNumber}</div>
                                                    <div className="text-[10px] text-muted italic">{e.date}</div>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-sm">{e.payee}</td>
                                                <td className="px-6 py-4">
                                                    <div className="text-xs font-bold">{e.ledger?.name}</div>
                                                    <div className="text-[9px] text-muted italic">{e.description}</div>
                                                </td>
                                                <td className="px-6 py-4 font-black text-error">₹{e.amount.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => downloadVoucher(e.id)} className="p-2 hover:bg-error/10 text-error rounded-lg transition-colors border border-error/20 flex items-center gap-2 text-[10px] font-black uppercase ml-auto">
                                                        <Download size={14} /> PDF
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            }

            {
                activeTab === 'reports' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="glass-card p-6 flex flex-col justify-between group hover:border-primary transition-all">
                            <div>
                                <PieChart size={32} className="text-primary mb-4" />
                                <h3 className="text-lg font-black uppercase tracking-tighter mb-2">Balance Sheet</h3>
                                <p className="text-xs text-muted font-bold mb-6">Real-time Assets vs Liabilities statement.</p>
                            </div>
                            <button className="btn btn-primary w-full uppercase font-black text-[10px] tracking-widest" onClick={() => navigate('/accounting/reports/balance-sheet')}>Generate Report</button>
                        </div>
                        <div className="glass-card p-6 flex flex-col justify-between group hover:border-success transition-all">
                            <div>
                                <Wallet size={32} className="text-success mb-4" />
                                <h3 className="text-lg font-black uppercase tracking-tighter mb-2">Profit & Loss</h3>
                                <p className="text-xs text-muted font-bold mb-6">Summary of Society Income and Expenditure.</p>
                            </div>
                            <button className="btn btn-primary w-full uppercase font-black text-[10px] tracking-widest bg-success border-success" onClick={() => navigate('/accounting/reports/pl')}>Generate Report</button>
                        </div>
                        <div className="glass-card p-6 flex flex-col justify-between group hover:border-warning transition-all">
                            <div>
                                <FileText size={32} className="text-warning mb-4" />
                                <h3 className="text-lg font-black uppercase tracking-tighter mb-2">Day Book</h3>
                                <p className="text-xs text-muted font-bold mb-6">Daily transaction log for verified entries.</p>
                            </div>
                            <button className="btn btn-primary w-full uppercase font-black text-[10px] tracking-widest bg-warning border-warning" onClick={() => navigate('/accounting/reports/daybook')}>Generate Report</button>
                        </div>
                    </div>
                )
            }

            {/* Bank Reconcile View (Moved from main conditional) */}
            {
                activeTab === 'reconcile' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 space-y-6">
                            <div className="glass-card p-6">
                                <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2 text-primary">
                                    <Settings size={18} /> Bank Settings
                                </h3>
                                <form onSubmit={handleBankDetailSave} className="space-y-4">
                                    <div>
                                        <label className="label">Bank Name</label>
                                        <input
                                            type="text"
                                            className="input"
                                            value={bankDetails.bankName}
                                            onChange={e => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                                            placeholder="e.g. HDFC Bank"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Account Number</label>
                                        <input
                                            type="text"
                                            className="input"
                                            value={bankDetails.accountNumber}
                                            onChange={e => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                                            placeholder="XXXX XXXX XXXX"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="label">IFSC Code</label>
                                            <input
                                                type="text"
                                                className="input uppercase"
                                                value={bankDetails.ifscCode}
                                                onChange={e => setBankDetails({ ...bankDetails, ifscCode: e.target.value })}
                                                placeholder="HDFC0001234"
                                            />
                                        </div>
                                        <div>
                                            <label className="label">Type</label>
                                            <select
                                                className="input"
                                                value={bankDetails.accountType}
                                                onChange={e => setBankDetails({ ...bankDetails, accountType: e.target.value })}
                                            >
                                                <option value="Savings">Savings</option>
                                                <option value="Current">Current</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSavingBank}
                                        className="w-full btn btn-primary py-3 uppercase font-black text-[10px] tracking-widest mt-2"
                                    >
                                        {isSavingBank ? 'Saving...' : 'Update Bank Profile'}
                                    </button>
                                </form>
                            </div>

                            <div className="glass-card p-6 bg-primary/5 border-primary/20">
                                <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Filter size={18} className="text-primary" /> Reconciliation Tips
                                </h3>
                                <ul className="text-[10px] space-y-3 font-bold text-text-muted italic">
                                    <li>• Ensure the Statement Date matches your Financial Year.</li>
                                    <li>• Match transactions with external Reference Numbers first.</li>
                                    <li>• All reconciled entries are locked for further editing.</li>
                                </ul>
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <div className="glass-card overflow-hidden h-full flex flex-col">
                                <div className="p-4 border-b border-glass-border bg-surface-light/30 flex justify-between items-center">
                                    <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                        <Check size={18} className="text-success" /> Statement Matching Engine
                                    </h3>
                                    <span className="text-[10px] font-black px-3 py-1 bg-warning/10 text-warning rounded-full border border-warning/20 uppercase">
                                        {statementEntries.filter(e => !e.reconciled).length} Unmatched
                                    </span>
                                </div>
                                <div className="overflow-x-auto flex-1">
                                    <table className="w-full text-left">
                                        <thead className="bg-surface-light text-[10px] font-black text-muted uppercase border-b border-glass-border tracking-widest">
                                            <tr>
                                                <th className="px-6 py-4">Bank Record</th>
                                                <th className="px-6 py-4">Amount</th>
                                                <th className="px-6 py-4">Matching Status</th>
                                                <th className="px-6 py-4 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-glass-border">
                                            {statementEntries.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-12 text-center text-muted italic font-bold">
                                                        No statement entries found. Upload a CSV to start reconciling.
                                                    </td>
                                                </tr>
                                            ) : (
                                                statementEntries.map(entry => (
                                                    <tr key={entry.id} className="hover:bg-primary/5 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-sm">{entry.description}</div>
                                                            <div className="text-[10px] text-muted italic">
                                                                {entry.transactionDate} • Ref: {entry.referenceNumber || 'N/A'}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 font-black">
                                                            <span className={entry.transactionType === 'CR' ? 'text-success' : 'text-error'}>
                                                                {entry.transactionType === 'CR' ? '+' : '-'} ₹{entry.amount.toLocaleString()}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {entry.reconciled ? (
                                                                <span className="text-[10px] font-black px-3 py-1 bg-success/10 text-success rounded-full border border-success/20 uppercase flex items-center gap-1 w-fit">
                                                                    <Check size={10} /> Reconciled
                                                                </span>
                                                            ) : (
                                                                <span className="text-[10px] font-black px-3 py-1 bg-warning/10 text-warning rounded-full border border-warning/20 uppercase flex items-center gap-1 w-fit">
                                                                    <ArrowUpRight size={10} /> Pending Match
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            {!entry.reconciled && (
                                                                <select
                                                                    className="text-[10px] font-black uppercase bg-surface-light border border-glass-border rounded-lg px-2 py-1 outline-none text-primary max-w-[150px]"
                                                                    onChange={(e) => handleMatch(entry.id, e.target.value)}
                                                                    defaultValue=""
                                                                >
                                                                    <option value="" disabled>Select Txn...</option>
                                                                    {transactions.filter(t => t.status === 'APPROVED' && Math.abs(t.amount - entry.amount) < 1).map(t => (
                                                                        <option key={t.id} value={t.id}>{t.voucherNumber} - {t.description}</option>
                                                                    ))}
                                                                </select>
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
                    </div>
                )
            }

            {/* Record Receipt Modal */}
            <AnimatePresence>
                {showReceiptModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-card w-full max-w-lg shadow-2xl relative border-t-8 border-success">
                            <button onClick={() => setShowReceiptModal(false)} className="absolute right-4 top-4 p-2 hover:bg-surface-light rounded-full text-muted"><X size={20} /></button>
                            <div className="p-8">
                                <h2 className="text-2xl font-black mb-1 text-success uppercase tracking-tighter">Record Member Receipt</h2>
                                <p className="text-xs text-muted mb-8 font-bold uppercase tracking-widest">Link payment to member and maintenance bill.</p>

                                <form onSubmit={handleReceiptSubmit} className="space-y-4">
                                    <div>
                                        <label className="label">Select Member</label>
                                        <select className="input" value={receiptForm.memberId} onChange={e => setReceiptForm({ ...receiptForm, memberId: e.target.value })} required>
                                            <option value="">Select Member...</option>
                                            {members.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName} ({m.unitNumber})</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label">Link Maintenance Bill (Optional)</label>
                                        <select className="input" value={receiptForm.billId} onChange={e => setReceiptForm({ ...receiptForm, billId: e.target.value })}>
                                            <option value="">No Bill / Advance Payment</option>
                                            {unpaidBills.filter(b => b.unit.includes(members.find(m => m.id === receiptForm.memberId)?.unitNumber)).map(b => (
                                                <option key={b.id} value={b.id}>{b.invoiceNo} - ₹{b.amount}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="label">Amount (₹)</label>
                                            <input type="number" step="0.01" className="input font-black" value={receiptForm.amount} onChange={e => setReceiptForm({ ...receiptForm, amount: e.target.value })} required />
                                        </div>
                                        <div>
                                            <label className="label">Payment Mode</label>
                                            <select className="input" value={receiptForm.paymentMode} onChange={e => setReceiptForm({ ...receiptForm, paymentMode: e.target.value })}>
                                                <option value="Cash">Cash</option>
                                                <option value="Cheque">Cheque</option>
                                                <option value="NEFT">NEFT</option>
                                                <option value="UPI">UPI</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="label">Ref No / Narration</label>
                                        <input type="text" className="input" value={receiptForm.narration} onChange={e => setReceiptForm({ ...receiptForm, narration: e.target.value, reference: e.target.value })} placeholder="Transaction ID, Cheque No, etc." />
                                    </div>
                                    <button type="submit" className="w-full btn btn-primary bg-success border-success py-4 mt-4 uppercase font-black tracking-widest">
                                        Generate Receipt
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Record Expense Modal */}
            <AnimatePresence>
                {showExpenseModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-card w-full max-w-lg shadow-2xl relative border-t-8 border-error">
                            <button onClick={() => setShowExpenseModal(false)} className="absolute right-4 top-4 p-2 hover:bg-surface-light rounded-full text-muted"><X size={20} /></button>
                            <div className="p-8">
                                <h2 className="text-2xl font-black mb-1 text-error uppercase tracking-tighter">Record Society Expense</h2>
                                <p className="text-xs text-muted mb-8 font-bold uppercase tracking-widest">Issue a payment voucher for society expenditure.</p>

                                <form onSubmit={handleExpenseSubmit} className="space-y-4">
                                    <div>
                                        <label className="label">Expense Category (Ledger)</label>
                                        <select className="input" value={expenseForm.ledgerId} onChange={e => setExpenseForm({ ...expenseForm, ledgerId: e.target.value })} required>
                                            <option value="">Select Ledger...</option>
                                            {ledgers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label">Paid To (Payee)</label>
                                        <input type="text" className="input" value={expenseForm.payee} onChange={e => setExpenseForm({ ...expenseForm, payee: e.target.value })} placeholder="Vendor Name, Staff Name, etc." required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="label">Amount (₹)</label>
                                            <input type="number" step="0.01" className="input font-black" value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} required />
                                        </div>
                                        <div>
                                            <label className="label">Payment Mode</label>
                                            <select className="input" value={expenseForm.paymentMode} onChange={e => setExpenseForm({ ...expenseForm, paymentMode: e.target.value })}>
                                                <option value="Cash">Cash</option>
                                                <option value="Bank">Bank Transfer</option>
                                                <option value="Cheque">Cheque</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="label">Expense Description</label>
                                        <textarea className="input min-h-[80px]" value={expenseForm.description} onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })} required />
                                    </div>
                                    <button type="submit" className="w-full btn btn-primary bg-error border-error py-4 mt-4 uppercase font-black tracking-widest">
                                        Generate Payment Voucher
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default Accounting;
