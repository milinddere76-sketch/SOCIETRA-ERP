import React, { useState, useEffect } from 'react';
import {
    Building2, Calendar, Save, Plus, Check, RefreshCw, X,
    Lock, IndianRupee, FileText, Phone, Mail, MapPin, Hash,
    Unlock, ChevronDown, Settings, UserMinus, PlusCircle, Trash2, Users,
    QrCode, ShieldCheck, Shield, Home, Activity
} from 'lucide-react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = [
    { id: 'profile', label: 'Society Profile', icon: <Building2 size={18} /> },
    { id: 'committee', label: 'Management Committee', icon: <Users size={18} /> },
    { id: 'billing', label: 'Billing Config', icon: <IndianRupee size={18} /> },
    { id: 'financial-years', label: 'Financial Years', icon: <Calendar size={18} /> },
    { id: 'opening-balance', label: 'Opening Balance', icon: <PlusCircle size={18} /> },
    { id: 'units', label: 'Society Units', icon: <Building2 size={18} /> },
    { id: 'bank', label: 'Bank Details', icon: <IndianRupee size={18} /> },
];

const SocietySettings = () => {
    const role = (localStorage.getItem('role') || '').replace('ROLE_', '');
    const isSuperAdmin = role === 'SUPER_ADMIN';

    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    const [allSocieties, setAllSocieties] = useState([]);
    const [selectedSocietyId, setSelectedSocietyId] = useState('');

    const [society, setSociety] = useState(null);
    const [billing, setBilling] = useState({
        monthlyMaintenanceAmount: '', shareCertificateFee: '', nocCharges: '',
        unitUtilityUsageRate: '', culturalProgrammeFee: '', otherCharges: '',
        recurringBillingEnabled: false, recurringBillingDay: 1,
    });
    const [years, setYears] = useState([]);
    const [committee, setCommittee] = useState([]);
    const [bankDetails, setBankDetails] = useState({
        bankName: '',
        accountNumber: '',
        accountType: 'SAVINGS',
        ifscCode: '',
        qrCodeUrl: ''
    });
    const [units, setUnits] = useState([]);
    const [wings, setWings] = useState([]);
    const [ledgers, setLedgers] = useState([]);
    const [showYearModal, setShowYearModal] = useState(false);
    const [newYear, setNewYear] = useState({ yearName: '', startDate: '', endDate: '', active: false });
    const [showCommitteeModal, setShowCommitteeModal] = useState(false);
    const [newMember, setNewMember] = useState({ name: '', designation: 'MEMBER', mobile: '', email: '', unitNumber: '' });
    const [showUnitModal, setShowUnitModal] = useState(false);
    const [newUnit, setNewUnit] = useState({
        unitNumber: '',
        unitType: '2BHK',
        areaSqft: '',
        ownerName: '',
        occupied: true,
        wingId: ''
    });

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    useEffect(() => {
        if (isSuperAdmin) {
            setLoading(true);
            api.get('/superadmin/societies').then(res => {
                const societies = Array.isArray(res.data) ? res.data : [];
                setAllSocieties(societies);
                if (societies.length > 0 && !selectedSocietyId) {
                    setSelectedSocietyId(societies[0].id);
                }
            }).catch(err => console.warn('Could not load societies:', err))
                .finally(() => setLoading(false));
        } else {
            fetchData();
        }
    }, [isSuperAdmin]);

    useEffect(() => {
        if (isSuperAdmin && !selectedSocietyId) return;
        fetchData();
    }, [activeTab, selectedSocietyId]);

    const getBaseUrl = (base) => {
        if (!isSuperAdmin || !selectedSocietyId) return base;
        const separator = base.includes('?') ? '&' : '?';
        return `${base}${separator}societyId=${selectedSocietyId}`;
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const yearsRes = await api.get(getBaseUrl('/accounting/setup/years'));
            setYears(Array.isArray(yearsRes.data) ? yearsRes.data : []);

            if (activeTab === 'profile' || activeTab === 'billing') {
                const url = isSuperAdmin && selectedSocietyId ? `/society/settings/${selectedSocietyId}` : '/society/settings';
                const res = await api.get(url);
                if (res.data) {
                    setSociety(res.data);
                    setBilling({
                        monthlyMaintenanceAmount: res.data.monthlyMaintenanceAmount || '',
                        shareCertificateFee: res.data.shareCertificateFee || '',
                        nocCharges: res.data.nocCharges || '',
                        unitUtilityUsageRate: res.data.unitUtilityUsageRate || '',
                        culturalProgrammeFee: res.data.culturalProgrammeFee || '',
                        otherCharges: res.data.otherCharges || '',
                        recurringBillingEnabled: res.data.recurringBillingEnabled || false,
                        recurringBillingDay: res.data.recurringBillingDay || 1,
                    });
                }
            }
            if (activeTab === 'committee') {
                const res = await api.get(getBaseUrl('/accounting/setup/committee'));
                setCommittee(Array.isArray(res.data) ? res.data : []);
            }
            if (activeTab === 'opening-balance' || activeTab === 'units') {
                const unitRes = await api.get(getBaseUrl('/accounting/setup/units'));
                const ledgerRes = await api.get(getBaseUrl('/accounting/setup/ledgers'));
                setUnits(Array.isArray(unitRes.data) ? unitRes.data : []);
                setLedgers(Array.isArray(ledgerRes.data) ? ledgerRes.data : []);

                if (activeTab === 'units') {
                    const wingRes = await api.get(getBaseUrl('/units/wings'));
                    setWings(Array.isArray(wingRes.data) ? wingRes.data : []);
                }
            }
            if (activeTab === 'bank') {
                const res = await api.get(getBaseUrl('/accounting/reconcile/bank'));
                if (res.data) setBankDetails(res.data);
            }
        } catch (err) {
            console.error('Settings fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBilling = async () => {
        setSaving(true);
        try {
            const url = isSuperAdmin && selectedSocietyId
                ? `/society/settings/${selectedSocietyId}`
                : '/society/settings';
            await api.put(url, billing);
            showToast('Billing configuration saved!');
        } catch (err) {
            showToast('Failed to save billing settings.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const url = isSuperAdmin && selectedSocietyId
                ? `/society/settings/${selectedSocietyId}`
                : '/society/settings';
            await api.put(url, society);
            showToast('Society profile updated!');
        } catch (err) {
            showToast('Failed to update profile.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleCreateYear = async (e) => {
        e.preventDefault();
        try {
            await api.post(getBaseUrl('/accounting/setup/years'), newYear);
            setShowYearModal(false);
            setNewYear({ yearName: '', startDate: '', endDate: '', active: false });
            fetchData();
            showToast('Financial year created!');
        } catch (err) {
            showToast('Failed to create financial year.', 'error');
        }
    };

    const handleActivateYear = async (id) => {
        try {
            await api.post(getBaseUrl(`/accounting/setup/years/${id}/activate`));
            showToast('Financial year activated!');
            fetchData();
        } catch (err) {
            const msg = err.response?.data;
            showToast(typeof msg === 'string' ? msg : 'Failed to activate.', 'error');
        }
    };

    const handleCloseYear = async (id, yearName) => {
        if (!window.confirm(`Close & LOCK "${yearName}"? This cannot be undone.`)) return;
        try {
            await api.post(getBaseUrl(`/accounting/setup/years/${id}/close`));
            showToast(`${yearName} closed and locked.`);
            fetchData();
        } catch (err) {
            showToast('Failed to close financial year.', 'error');
        }
    };

    const handleUpdateOpeningBalances = async (type) => {
        setSaving(true);
        try {
            const data = type === 'units'
                ? units.map(u => ({ id: u.id, balance: u.openingBalance || 0, date: u.openingBalanceDate }))
                : ledgers.map(l => ({ id: l.id, balance: l.openingBalance || 0, date: l.openingBalanceDate }));

            const endpoint = getBaseUrl(type === 'units' ? '/accounting/setup/units/opening-balances' : '/accounting/setup/ledgers/opening-balances');
            await api.patch(endpoint, data);
            showToast('Opening balances updated successfully!');
        } catch (err) {
            showToast('Failed to update balances.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleAddCommitteeMember = async (e) => {
        e.preventDefault();
        try {
            await api.post(getBaseUrl('/accounting/setup/committee'), newMember);
            setShowCommitteeModal(false);
            setNewMember({ name: '', designation: 'MEMBER', mobile: '', email: '', unitNumber: '' });
            fetchData();
            showToast('Committee member added!');
        } catch (err) {
            showToast('Failed to add member.', 'error');
        }
    };

    const handleRemoveCommitteeMember = async (id) => {
        if (!window.confirm("Remove this committee member?")) return;
        try {
            await api.delete(getBaseUrl(`/accounting/setup/committee/${id}`));
            fetchData();
            showToast('Member removed.');
        } catch (err) {
            showToast('Failed to remove.', 'error');
        }
    };

    const activeYear = years.find(y => y.active || y.isActive);

    return (
        <div className="space-y-6">
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-6 right-6 z-[100] px-6 py-4 rounded-2xl shadow-2xl font-bold text-sm flex items-center gap-3 ${toast.type === 'error' ? 'bg-error text-white' : 'bg-success text-white'}`}
                    >
                        {toast.type === 'error' ? <X size={18} /> : <Check size={18} />}
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            <header className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-3xl font-black gradient-text pb-2 uppercase tracking-tighter">Society Settings</h1>
                    <p className="text-text-muted italic">Configure society profile, billing rates, and financial years.</p>
                </div>
                <div className="flex items-center gap-3">
                    {activeYear ? (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-success/10 border border-success/30 text-success text-xs font-black uppercase">
                            <Calendar size={14} /> Active FY: {activeYear.yearName}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-warning/10 border border-warning/30 text-warning text-xs font-black uppercase">
                            <X size={14} /> No Active FY
                        </div>
                    )}
                    <button onClick={fetchData} className="btn btn-secondary flex items-center gap-2">
                        <RefreshCw size={16} /> Refresh
                    </button>
                </div>
            </header>

            {isSuperAdmin && (
                <div className="glass-card p-4 border-t-4 border-primary mb-6">
                    <div className="flex items-center gap-3 flex-wrap">
                        <Settings size={18} className="text-primary shrink-0" />
                        <span className="text-xs font-black text-primary uppercase tracking-widest whitespace-nowrap">Managing Society:</span>
                        <select
                            value={selectedSocietyId}
                            onChange={e => setSelectedSocietyId(e.target.value)}
                            className="flex-1 max-w-xs px-4 py-2 rounded-xl bg-surface-light border border-glass-border text-sm font-bold focus:outline-none focus:border-primary transition-all cursor-pointer"
                        >
                            <option value="">— Select a Society —</option>
                            {allSocieties.map(soc => (
                                <option key={soc.id} value={soc.id}>
                                    {soc.name} {soc.city ? `(${soc.city})` : ''}
                                </option>
                            ))}
                        </select>
                        {allSocieties.length === 0 && (
                            <span className="text-xs text-warning font-bold">No societies found — create one first in Admin → Societies</span>
                        )}
                        <span className="text-[10px] text-muted font-bold hidden sm:block">Super Admin Mode</span>
                    </div>
                </div>
            )}

            <div className="flex gap-2 bg-glass p-1 rounded-2xl border border-glass-border w-fit mb-6">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-text-muted hover:bg-glass hover:text-text'}`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <>
                    <AnimatePresence mode="wait">
                        {activeTab === 'profile' && (
                            <motion.div key="profile" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                                {!society ? (
                                    <div className="glass-card p-16 text-center border-2 border-dashed border-glass-border">
                                        <Building2 size={48} className="mx-auto mb-4 text-muted opacity-40" />
                                        <h3 className="text-xl font-black text-muted">
                                            {isSuperAdmin ? 'Select a society above to view its profile' : 'Society profile not available'}
                                        </h3>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-sm font-black uppercase tracking-widest text-primary">Edit Society Details</h3>
                                            <button onClick={handleSaveProfile} disabled={saving} className="btn btn-primary btn-sm flex items-center gap-2">
                                                {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                                                {saving ? 'Saving...' : 'Update Profile'}
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <div className="glass-card p-8 border-t-4 border-primary space-y-4">
                                                <div>
                                                    <label className="label">Society Name</label>
                                                    <input type="text" value={society.name || ''} onChange={e => setSociety({ ...society, name: e.target.value })} className="input font-bold" />
                                                </div>
                                                <div>
                                                    <label className="label">Registration Number</label>
                                                    <input type="text" value={society.registrationNumber || ''} onChange={e => setSociety({ ...society, registrationNumber: e.target.value })} className="input" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="label">Admin Email</label>
                                                        <input type="email" value={society.adminEmail || ''} onChange={e => setSociety({ ...society, adminEmail: e.target.value })} className="input text-xs" />
                                                    </div>
                                                    <div>
                                                        <label className="label">Admin Mobile</label>
                                                        <input type="text" value={society.adminMobile || ''} onChange={e => setSociety({ ...society, adminMobile: e.target.value })} className="input text-xs" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="glass-card p-8 border-t-4 border-secondary space-y-4">
                                                <div>
                                                    <label className="label">Full Address</label>
                                                    <textarea value={society.address || ''} onChange={e => setSociety({ ...society, address: e.target.value })} className="input min-h-[80px]" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="label">City</label>
                                                        <input type="text" value={society.city || ''} onChange={e => setSociety({ ...society, city: e.target.value })} className="input" />
                                                    </div>
                                                    <div>
                                                        <label className="label">State</label>
                                                        <input type="text" value={society.state || ''} onChange={e => setSociety({ ...society, state: e.target.value })} className="input" />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="label">Pincode</label>
                                                        <input type="text" value={society.pincode || ''} onChange={e => setSociety({ ...society, pincode: e.target.value })} className="input" />
                                                    </div>
                                                    <div>
                                                        <label className="label">Country</label>
                                                        <input type="text" value={society.country || 'India'} disabled className="input bg-surface-light" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'billing' && (
                            <motion.div key="billing" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                                <div className="glass-card p-8">
                                    <div className="flex justify-between items-center mb-8">
                                        <div>
                                            <h2 className="text-xl font-black uppercase tracking-tighter">Maintenance & Charge Rates</h2>
                                            <p className="text-xs text-muted font-bold uppercase mt-1">Used for auto-billing generation</p>
                                        </div>
                                        <button onClick={handleSaveBilling} disabled={saving} className="btn btn-primary flex items-center gap-2 px-8 shadow-lg shadow-primary/30">
                                            {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                                            {saving ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {[
                                            { key: 'monthlyMaintenanceAmount', label: 'Monthly Maintenance (₹)', placeholder: '2500' },
                                            { key: 'shareCertificateFee', label: 'Share Certificate Fee (₹)', placeholder: '500' },
                                            { key: 'nocCharges', label: 'NOC Charges (₹)', placeholder: '1000' },
                                            { key: 'unitUtilityUsageRate', label: 'Utility Rate (₹/unit)', placeholder: '5' },
                                            { key: 'culturalProgrammeFee', label: 'Cultural Programme Fee (₹)', placeholder: '200' },
                                            { key: 'otherCharges', label: 'Other Charges (₹)', placeholder: '0' },
                                        ].map(field => (
                                            <div key={field.key}>
                                                <label className="label">{field.label}</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted font-bold text-sm">₹</span>
                                                    <input type="number" step="0.01" value={billing[field.key]} onChange={e => setBilling({ ...billing, [field.key]: e.target.value })} placeholder={field.placeholder} className="input pl-7 font-black" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'committee' && (
                            <motion.div key="committee" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-black uppercase tracking-widest text-primary">Management Committee</h2>
                                    <button onClick={() => setShowCommitteeModal(true)} className="btn btn-primary flex items-center gap-2">
                                        <PlusCircle size={18} /> Add Member
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {committee.map(member => (
                                        <div key={member.id} className="glass-card p-6 border-t-4 border-secondary group relative">
                                            <button onClick={() => handleRemoveCommitteeMember(member.id)} className="absolute top-4 right-4 text-error opacity-0 group-hover:opacity-100 transition-all">
                                                <Trash2 size={16} />
                                            </button>
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-black">{member.name.charAt(0)}</div>
                                                <div>
                                                    <h3 className="font-black text-lg leading-tight">{member.name}</h3>
                                                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-secondary/10 text-secondary">{member.designation}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-1 text-xs text-muted font-bold uppercase tracking-wider">
                                                <p>Unit: {member.unitNumber || 'N/A'}</p>
                                                <p>Mob: {member.mobile || 'N/A'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'financial-years' && (
                            <motion.div key="years" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-black uppercase tracking-widest text-primary">Financial Periods</h2>
                                    <button onClick={() => setShowYearModal(true)} className="btn btn-primary flex items-center gap-2"><Plus size={18} /> New Year</button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {years.map(year => (
                                        <div key={year.id} className={`glass-card p-6 border-2 transition-all ${year.active ? 'border-primary bg-primary/5' : 'border-glass-border'}`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <Calendar size={24} className="text-primary" />
                                                {year.active ? <span className="badge bg-success/20 text-success">Active</span> : <button onClick={() => handleActivateYear(year.id)} className="btn btn-sm btn-secondary">Activate</button>}
                                            </div>
                                            <h3 className="text-xl font-black">{year.yearName}</h3>
                                            <p className="text-xs text-muted font-bold">{year.startDate} - {year.endDate}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'opening-balance' && (
                            <motion.div key="opening" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-8">
                                <div className="glass-card overflow-hidden">
                                    <div className="p-6 border-b border-glass-border flex justify-between items-center bg-primary/5">
                                        <h2 className="text-xl font-black uppercase tracking-widest text-primary">Opening Balances</h2>
                                        <button onClick={() => handleUpdateOpeningBalances('units')} disabled={saving} className="btn btn-primary btn-sm">Save Balances</button>
                                    </div>
                                    <div className="max-h-[400px] overflow-y-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-surface-light border-b border-glass-border text-[10px] font-black uppercase">
                                                <tr><th className="p-4">Unit</th><th className="p-4">Owner</th><th className="p-4">Balance (₹)</th></tr>
                                            </thead>
                                            <tbody>
                                                {units.map((unit, idx) => (
                                                    <tr key={unit.id} className="border-b border-glass-border last:border-0">
                                                        <td className="p-4 font-bold">{unit.unitNumber}</td>
                                                        <td className="p-4">{unit.ownerName}</td>
                                                        <td className="p-4"><input type="number" value={unit.openingBalance || ''} onChange={e => { const u = [...units]; u[idx].openingBalance = e.target.value; setUnits(u); }} className="input-sm w-32" /></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'units' && (
                            <motion.div key="units" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                                <div className="glass-card overflow-hidden border-t-4 border-primary">
                                    <div className="p-6 border-b border-glass-border flex justify-between items-center bg-primary/5">
                                        <div>
                                            <h2 className="text-xl font-black uppercase tracking-widest text-primary flex items-center gap-2"><Building2 size={24} /> Society Architecture</h2>
                                            <p className="text-[10px] font-bold text-text-muted mt-1 uppercase">Manage wings, blocks and housing units</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <button onClick={async () => {
                                                const n = prompt("Wing Name (A, B, Block 1):");
                                                if (n) {
                                                    try {
                                                        await api.post(getBaseUrl('/units/wings'), { name: n });
                                                        showToast('Wing created successfully!');
                                                        fetchData();
                                                    } catch (err) { showToast('Failed to create wing.', 'error'); }
                                                }
                                            }} className="btn btn-secondary btn-sm flex items-center gap-2">
                                                <Plus size={16} /> Add Wing
                                            </button>
                                            <button onClick={() => {
                                                if (wings.length === 0) {
                                                    showToast("Create a wing first!", "error");
                                                    return;
                                                }
                                                setNewUnit({ ...newUnit, wingId: wings[0].id });
                                                setShowUnitModal(true);
                                            }} className="btn btn-primary btn-sm flex items-center gap-2 shadow-lg shadow-primary/20">
                                                <PlusCircle size={16} /> Add Unit
                                            </button>
                                        </div>
                                    </div>
                                    <div className="max-h-[600px] overflow-y-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-surface-light border-b border-glass-border text-[10px] font-black uppercase">
                                                <tr>
                                                    <th className="p-4 text-center">Wing</th>
                                                    <th className="p-4">Unit Identity</th>
                                                    <th className="p-4">Owner / Member</th>
                                                    <th className="p-4">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {units.length === 0 ? (
                                                    <tr><td colSpan="4" className="p-12 text-center text-text-muted font-bold italic">No units registered yet.</td></tr>
                                                ) : units.map(u => (
                                                    <tr key={u.id} className="border-b border-glass-border last:border-0 hover:bg-primary/[0.02] transition-colors">
                                                        <td className="p-4">
                                                            <div className="w-8 h-8 mx-auto rounded-lg bg-surface border border-glass-border flex items-center justify-center font-black text-[10px] text-primary shadow-sm uppercase">
                                                                {u.wingName || '---'}
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex flex-col">
                                                                <span className="font-black text-sm text-text uppercase flex items-center gap-2"><Home size={12} className="text-primary" /> {u.unitNumber}</span>
                                                                <span className="text-[10px] text-text-muted font-bold">{u.unitType || '2BHK'} • {u.areaSqft || '0'} SqFt</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <p className="font-bold text-sm">{u.ownerName || <span className="text-warning italic uppercase text-[10px]">Unassigned Member</span>}</p>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${u.occupied ? 'bg-success/10 text-success border border-success/20' : 'bg-warning/10 text-warning border border-warning/20'}`}>
                                                                {u.occupied ? 'Occupied' : 'Vacant'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'bank' && (
                            <motion.div key="bank" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                                <div className="glass-card p-8 border-t-4 border-primary">
                                    <div className="flex justify-between items-center mb-10">
                                        <div>
                                            <h2 className="text-2xl font-black uppercase tracking-tighter text-primary">Settlement Bank</h2>
                                            <p className="text-xs font-bold text-text-muted">Configure where society maintenance & utility payments will be deposited.</p>
                                        </div>
                                        <button onClick={async () => {
                                            try {
                                                await api.post(getBaseUrl('/accounting/reconcile/bank'), bankDetails);
                                                showToast('Bank details updated!');
                                            } catch (err) { showToast('Failed to save bank details.', 'error'); }
                                        }} className="btn btn-primary px-8 shadow-xl shadow-primary/30 flex items-center gap-2">
                                            <Save size={18} /> Save Changes
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Bank Institution</label>
                                            <input type="text" value={bankDetails.bankName} onChange={e => setBankDetails({ ...bankDetails, bankName: e.target.value })} className="w-full bg-surface-light border border-glass-border rounded-2xl py-3.5 px-5 focus:border-primary outline-none font-bold text-sm" placeholder="e.g. HDFC Bank" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Account Number</label>
                                            <input type="text" value={bankDetails.accountNumber} onChange={e => setBankDetails({ ...bankDetails, accountNumber: e.target.value })} className="w-full bg-surface-light border border-glass-border rounded-2xl py-3.5 px-5 focus:border-primary outline-none font-black text-sm tracking-widest" placeholder="0000 0000 0000" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Account Type</label>
                                            <select value={bankDetails.accountType} onChange={e => setBankDetails({ ...bankDetails, accountType: e.target.value })} className="w-full bg-surface-light border border-glass-border rounded-2xl py-3.5 px-5 focus:border-primary outline-none font-bold text-sm">
                                                <option value="SAVINGS">SAVINGS ACCOUNT</option>
                                                <option value="CURRENT">CURRENT ACCOUNT</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">IFSC Routing Code</label>
                                            <input type="text" value={bankDetails.ifscCode} onChange={e => setBankDetails({ ...bankDetails, ifscCode: e.target.value.toUpperCase() })} className="w-full bg-surface-light border border-glass-border rounded-2xl py-3.5 px-5 focus:border-primary outline-none font-black text-sm uppercase" placeholder="HDFC0001234" />
                                        </div>
                                    </div>

                                    <div className="mt-12 pt-10 border-t border-glass-border grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-secondary"><QrCode size={18} /> Digital Payment Gateway</h3>
                                            <p className="text-xs font-bold text-text-muted leading-relaxed">
                                                Upload your UPI QR Code (Google Pay, PhonePe, Paytm). This QR will be displayed to residents during maintenance payment.
                                            </p>
                                            <div className="w-56 h-56 rounded-3xl border-2 border-dashed border-glass-border-hover flex flex-col items-center justify-center bg-surface-light cursor-pointer hover:border-secondary hover:bg-secondary/5 transition-all group overflow-hidden relative">
                                                {bankDetails.qrCodeUrl ? (
                                                    <img src={bankDetails.qrCodeUrl} className="w-full h-full object-contain" />
                                                ) : (
                                                    <>
                                                        <Plus size={40} className="text-text-muted group-hover:text-secondary group-hover:scale-110 transition-transform" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted mt-2">Upload QR Code</span>
                                                    </>
                                                )}
                                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => {
                                                    const file = e.target.files[0];
                                                    if (file) setBankDetails({ ...bankDetails, qrCodeUrl: URL.createObjectURL(file) });
                                                }} />
                                            </div>
                                        </div>
                                        <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10 flex flex-col justify-center">
                                            <div className="flex items-center gap-3 mb-4">
                                                <ShieldCheck className="text-primary" size={24} />
                                                <h4 className="font-black uppercase tracking-tighter text-lg">Secure Settlements</h4>
                                            </div>
                                            <p className="text-xs font-bold text-text-muted leading-relaxed">
                                                SOCIETRA uses end-to-end encrypted routing for bank data. Payments made by residents via QR code are deposited directly into the society's account without any platform commission.
                                            </p>
                                            <div className="mt-6 flex gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm"><IndianRupee size={16} className="text-primary" /></div>
                                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm"><Activity size={16} className="text-secondary" /></div>
                                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm"><Shield size={16} className="text-success" /></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {showYearModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card w-full max-w-md">
                                <form onSubmit={handleCreateYear} className="p-8 space-y-4">
                                    <h2 className="text-xl font-black uppercase text-primary">New Financial Year</h2>
                                    <input type="text" placeholder="e.g. 2024-25" className="input" value={newYear.yearName} onChange={e => setNewYear({ ...newYear, yearName: e.target.value })} required />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input type="date" className="input" value={newYear.startDate} onChange={e => setNewYear({ ...newYear, startDate: e.target.value })} required />
                                        <input type="date" className="input" value={newYear.endDate} onChange={e => setNewYear({ ...newYear, endDate: e.target.value })} required />
                                    </div>
                                    <div className="flex gap-4"><button type="button" onClick={() => setShowYearModal(false)} className="btn btn-secondary flex-1">Cancel</button><button type="submit" className="btn btn-primary flex-1">Create</button></div>
                                </form>
                            </motion.div>
                        </div>
                    )}

                    {showCommitteeModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card w-full max-w-md">
                                <form onSubmit={handleAddCommitteeMember} className="p-8 space-y-4">
                                    <h2 className="text-xl font-black uppercase text-secondary">Add Committee Member</h2>
                                    <input type="text" placeholder="Full Name" className="input" value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} required />
                                    <select className="input" value={newMember.designation} onChange={e => setNewMember({ ...newMember, designation: e.target.value })}><option value="MEMBER">MEMBER</option><option value="CHAIRMAN">CHAIRMAN</option><option value="SECRETARY">SECRETARY</option><option value="TREASURER">TREASURER</option></select>
                                    <div className="grid grid-cols-2 gap-4"><input type="text" placeholder="Mobile" className="input" value={newMember.mobile} onChange={e => setNewMember({ ...newMember, mobile: e.target.value })} /><input type="text" placeholder="Unit No." className="input" value={newMember.unitNumber} onChange={e => setNewMember({ ...newMember, unitNumber: e.target.value })} /></div>
                                    <div className="flex gap-4"><button type="button" onClick={() => setShowCommitteeModal(false)} className="btn btn-secondary flex-1">Cancel</button><button type="submit" className="btn btn-primary flex-1">Add</button></div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                    {showUnitModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card w-full max-w-md shadow-2xl relative">
                                <button onClick={() => setShowUnitModal(false)} className="absolute right-4 top-4 p-2 hover:bg-surface-light rounded-full text-text-muted transition-colors"><X size={20} /></button>
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    try {
                                        await api.post(getBaseUrl('/units'), newUnit);
                                        setShowUnitModal(false);
                                        fetchData();
                                        showToast('Unit registered successfully!');
                                    } catch (err) { showToast('Failed to register unit.', 'error'); }
                                }} className="p-8 space-y-5">
                                    <h2 className="text-xl font-black uppercase text-primary mb-6 flex items-center gap-2"><Home size={24} /> New Unit Asset</h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase text-text-muted ml-0.5">Wing/Block</label>
                                            <select className="w-full bg-surface-light border border-glass-border rounded-xl py-3 px-4 font-bold text-sm outline-none focus:border-primary" value={newUnit.wingId} onChange={e => setNewUnit({ ...newUnit, wingId: e.target.value })} required>
                                                {wings.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase text-text-muted ml-0.5">Unit No.</label>
                                            <input type="text" placeholder="e.g. A-101" className="w-full bg-surface-light border border-glass-border rounded-xl py-3 px-4 font-bold text-sm outline-none focus:border-primary" value={newUnit.unitNumber} onChange={e => setNewUnit({ ...newUnit, unitNumber: e.target.value.toUpperCase() })} required />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase text-text-muted ml-0.5">Unit Configuration</label>
                                            <select className="w-full bg-surface-light border border-glass-border rounded-xl py-3 px-4 font-bold text-sm outline-none focus:border-primary" value={newUnit.unitType} onChange={e => setNewUnit({ ...newUnit, unitType: e.target.value })}>
                                                <option value="1BHK">1 BHK</option>
                                                <option value="2BHK">2 BHK</option>
                                                <option value="3BHK">3 BHK</option>
                                                <option value="Penthouse">PENTHOUSE</option>
                                                <option value="Shop">COMMERCIAL SHOP</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase text-text-muted ml-0.5">Area (SqFt)</label>
                                            <input type="number" placeholder="750" className="w-full bg-surface-light border border-glass-border rounded-xl py-3 px-4 font-bold text-sm outline-none focus:border-primary" value={newUnit.areaSqft} onChange={e => setNewUnit({ ...newUnit, areaSqft: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-text-muted ml-0.5">Primary Member / Owner Name</label>
                                        <input type="text" placeholder="Enter Full Name" className="w-full bg-surface-light border border-glass-border rounded-xl py-3 px-4 font-bold text-sm outline-none focus:border-primary" value={newUnit.ownerName} onChange={e => setNewUnit({ ...newUnit, ownerName: e.target.value })} />
                                    </div>
                                    <button type="submit" className="btn btn-primary w-full py-4 rounded-xl font-black uppercase tracking-widest shadow-xl shadow-primary/30 mt-4">Register Asset</button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default SocietySettings;
