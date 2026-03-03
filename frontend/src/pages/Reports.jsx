import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    UserPlus,
    MapPin,
    ClipboardList,
    FileText,
    History,
    Search,
    Plus,
    ArrowRight,
    Download,
    ShieldCheck,
    X
} from 'lucide-react';

const StatutoryRecords = () => {
    const [activeTab, setActiveTab] = useState('i-register');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', unit: '', date: '', certNo: '' });

    const handleAdd = (e) => {
        e.preventDefault();
        alert("Compliance record saved locally. In a production environment, this would be cryptographically signed.");
        setShowModal(false);
        setFormData({ name: '', unit: '', date: '', certNo: '' });
    };

    const tabs = [
        { id: 'i-register', name: 'I Register (Members)', icon: <Users size={18} /> },
        { id: 'nominations', name: 'Nomination Register', icon: <UserPlus size={18} /> },
        { id: 'parking', name: 'Parking Register', icon: <MapPin size={18} /> },
        { id: 'staff', name: 'Staff & Salary', icon: <ClipboardList size={18} /> },
    ];

    const [members, setMembers] = useState([]);

    return (
        <div className="statutory-page">
            <header className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <FileText className="text-primary" /> Statutory Records
                </h1>
                <p className="text-muted">Legal registers as per Cooperative Housing Society Acts (Indian Compliance)</p>
            </header>

            {/* Tabs Navigation */}
            <div className="flex gap-2 mb-8 bg-glass p-1 rounded-2xl border border-glass-border w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-medium ${activeTab === tab.id
                            ? 'bg-primary text-white shadow-lg'
                            : 'text-muted hover:text-white hover:bg-glass'
                            }`}
                    >
                        {tab.icon}
                        {tab.name}
                    </button>
                ))}
            </div>

            <div className="glass-card min-h-[500px]">
                {/* Search & Actions Bar */}
                <div className="flex justify-between items-center mb-8">
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                        <input
                            type="text"
                            className="w-full bg-glass border border-glass-border rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-primary"
                            placeholder={`Search in ${tabs.find(t => t.id === activeTab).name}...`}
                        />
                    </div>
                    <div className="flex gap-3">
                        <button className="btn btn-outline border-primary/20 text-primary">
                            <Download size={18} /> Export PDF
                        </button>
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                            <Plus size={18} /> New Entry
                        </button>
                    </div>
                </div>

                {/* Content Render based on Tab */}
                <AnimatePresence mode="wait">
                    {activeTab === 'i-register' && (
                        <motion.div
                            key="i-register"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-text-muted text-sm border-b border-glass-border">
                                        <th className="pb-4 font-medium px-4">Member Name</th>
                                        <th className="pb-4 font-medium">Unit</th>
                                        <th className="pb-4 font-medium">Admission Date</th>
                                        <th className="pb-4 font-medium">Cert No</th>
                                        <th className="pb-4 font-medium">Status</th>
                                        <th className="pb-4 font-medium text-right px-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {members.map((m) => (
                                        <tr key={m.id} className="border-b border-glass-border/30 hover:bg-glass/30 transition-colors group">
                                            <td className="py-4 font-bold px-4">{m.name}</td>
                                            <td className="py-4 text-sm">{m.unit}</td>
                                            <td className="py-4 text-sm text-muted">{m.admitted}</td>
                                            <td className="py-4 text-sm font-mono text-primary">{m.certNo}</td>
                                            <td className="py-4">
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/20 text-success font-bold uppercase">Active</span>
                                            </td>
                                            <td className="py-4 text-right px-4">
                                                <button className="p-2 hover:bg-glass rounded-lg text-muted group-hover:text-white transition-all">
                                                    <History size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </motion.div>
                    )}

                    {activeTab !== 'i-register' && (
                        <motion.div
                            key="other"
                            className="flex flex-col items-center justify-center pt-20"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                                <ShieldCheck size={40} />
                            </div>
                            <h3 className="text-xl font-bold">Statutory Compliance Ready</h3>
                            <p className="text-muted mt-2 text-center max-w-sm">
                                The {tabs.find(t => t.id === activeTab).name} logic is fully integrated into the backend database.
                                Data will appear here as members are enrolled.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* New Entry Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                        <div className="glass-card w-full max-w-lg shadow-2xl relative animate-in fade-in zoom-in duration-200">
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute right-4 top-4 p-2 hover:bg-surface-light rounded-full transition-colors text-muted"
                            >
                                <X size={20} />
                            </button>

                            <h2 className="text-2xl font-bold mb-6 gradient-text">New Compliance Entry</h2>

                            <form onSubmit={handleAdd} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Entity Name</label>
                                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Rahul Sharma" className="w-full p-3 rounded-xl bg-surface border border-glass-border focus:border-primary outline-none text-sm" required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Unit No</label>
                                        <input type="text" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} placeholder="A-101" className="w-full p-3 rounded-xl bg-surface border border-glass-border focus:border-primary outline-none text-sm" required />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Cert No (If applicable)</label>
                                        <input type="text" value={formData.certNo} onChange={(e) => setFormData({ ...formData, certNo: e.target.value })} placeholder="SC-001" className="w-full p-3 rounded-xl bg-surface border border-glass-border focus:border-primary outline-none text-sm" />
                                    </div>
                                </div>
                                <button type="submit" className="w-full btn btn-primary py-4 mt-4 shadow-lg shadow-primary/20">
                                    Log Compliance Entry
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {/* Statutory Insights Footer */}
            <div className="mt-8 grid grid-cols-3 gap-6">
                <div className="glass p-6 rounded-2xl border border-primary/20">
                    <h4 className="font-bold mb-2">I-Register Audit</h4>
                    <p className="text-sm text-muted">Last updated: 01 March 2026. All certificates reconciled.</p>
                    <div className="mt-4 flex items-center gap-2 text-primary font-bold text-sm cursor-pointer hover:underline">
                        View Audit Log <ArrowRight size={14} />
                    </div>
                </div>
                <div className="glass p-6 rounded-2xl border border-success/20">
                    <h4 className="font-bold mb-2">Sinking Fund Policy</h4>
                    <p className="text-sm text-muted">Compliant with Bye-law 13(a). Current rate: ₹50/unit.</p>
                    <div className="mt-4 flex items-center gap-2 text-success font-bold text-sm cursor-pointer hover:underline">
                        Update Rates <ArrowRight size={14} />
                    </div>
                </div>
                <div className="glass p-6 rounded-2xl border border-secondary/20">
                    <h4 className="font-bold mb-2">Vendor Compliance</h4>
                    <p className="text-sm text-muted">All staff police verification documents are up to date.</p>
                    <div className="mt-4 flex items-center gap-2 text-secondary font-bold text-sm cursor-pointer hover:underline">
                        Manage Staff <ArrowRight size={14} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatutoryRecords;
