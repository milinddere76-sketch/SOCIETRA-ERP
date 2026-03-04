import React, { useState, useEffect } from 'react';
import { Receipt, FileText, Download, IndianRupee, X, Settings, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';

const Billing = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        try {
            setLoading(true);
            const res = await api.get('/billing');
            setInvoices(res.data);
        } catch (err) {
            console.error('Failed to fetch bills', err);
        } finally {
            setLoading(false);
        }
    };

    const [formData, setFormData] = useState({ billingMonth: '', generationDate: '', dueDate: '' });

    const handleGenerate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/billing/generate', formData);
            alert("Billing cycle completed! Invoices generated successfully.");
            setShowModal(false);
            fetchBills();
        } catch (err) {
            console.error('Failed to generate bills', err);
            alert("Failed to generate bills.");
        }
    };

    const handleDelete = async (billId) => {
        if (!window.confirm("Are you sure you want to delete this bill? This action cannot be undone.")) {
            return;
        }
        try {
            await api.delete(`/billing/${billId}`);
            alert("Bill deleted successfully.");
            fetchBills(); // Refresh the list
        } catch (err) {
            console.error('Failed to delete bill', err);
            alert("Failed to delete bill.");
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold gradient-text pb-2">Maintenance Billing</h1>
                    <p className="text-text-muted">Generate, view, and track maintenance invoices for all units.</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        to="/maintenance-structure"
                        className="btn btn-outline flex items-center gap-2"
                    >
                        <Settings size={20} /> Recurring Bills
                    </Link>
                    <button
                        onClick={() => setShowModal(true)}
                        className="btn btn-primary shadow-lg shadow-primary/30 flex items-center gap-2"
                    >
                        <Receipt size={20} /> Generate Bills
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                    { title: "Total Collection", amount: "₹4.2L", trend: "+12%" },
                    { title: "Pending Dues", amount: "₹85K", trend: "-5%", warning: true },
                    { title: "Invoices Generated", amount: "245", trend: "0%" }
                ].map((stat, idx) => (
                    <div key={idx} className="glass-card">
                        <p className="text-sm font-bold text-muted uppercase tracking-wider mb-2">{stat.title}</p>
                        <h2 className={`text-3xl font-bold ${stat.warning ? 'text-error' : 'text-text'}`}>{stat.amount}</h2>
                    </div>
                ))}
            </div>

            <div className="glass-card p-0 overflow-hidden">
                <div className="p-4 border-b border-glass-border flex justify-between items-center bg-surface-light/50">
                    <h3 className="font-bold flex items-center gap-2">
                        <FileText size={18} className="text-primary" /> Recent Invoices
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-surface border-b border-glass-border text-muted text-sm uppercase">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Invoice No.</th>
                                <th className="px-6 py-4 font-semibold">Unit</th>
                                <th className="px-6 py-4 font-semibold">Date</th>
                                <th className="px-6 py-4 font-semibold">Amount</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-glass-border">
                            {invoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-surface-light/30 transition-colors">
                                    <td className="px-6 py-4 font-medium">{inv.invoiceNo}</td>
                                    <td className="px-6 py-4 font-bold text-primary">{inv.unit}</td>
                                    <td className="px-6 py-4 text-muted shrink-0 w-32">{inv.billingMonth}</td>
                                    <td className="px-6 py-4 font-semibold flex items-center">
                                        <IndianRupee size={14} className="mr-1 text-muted" /> {inv.amount}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${inv.status === 'Paid' ? 'bg-success/10 text-success' :
                                            inv.status === 'Pending' ? 'bg-warning/10 text-warning' :
                                                'bg-error/10 text-error'
                                            }`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button className="text-primary hover:text-primary-hover border border-primary/20 bg-primary/5 p-2 rounded-lg transition-colors">
                                                <Download size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(inv.id)}
                                                className="text-error hover:bg-error/10 border border-error/20 bg-error/5 p-2 rounded-lg transition-colors"
                                                title="Delete Bill"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Generate Bills Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute right-4 top-4 p-2 hover:bg-surface-light rounded-full transition-colors text-muted"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-2xl font-bold mb-6 gradient-text">Generate Maintenance Bills</h2>

                        <form onSubmit={handleGenerate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-muted mb-1">Billing Month</label>
                                <input
                                    type="month"
                                    required
                                    value={formData.billingMonth}
                                    onChange={(e) => setFormData({ ...formData, billingMonth: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-background border border-glass-border rounded-xl focus:border-primary outline-none transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-muted mb-1">Generation Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.generationDate}
                                    onChange={(e) => setFormData({ ...formData, generationDate: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-background border border-glass-border rounded-xl focus:border-primary outline-none transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-muted mb-1">Due Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-background border border-glass-border rounded-xl focus:border-primary outline-none transition-colors"
                                />
                            </div>

                            <button type="submit" className="w-full btn btn-primary mt-6">
                                Generate for All Active Units
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Billing;
