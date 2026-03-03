import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, Trash2, Shield, CheckCircle, XCircle, RefreshCw, IndianRupee } from 'lucide-react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';

const SuperAdminSocieties = () => {
    const [isCreating, setIsCreating] = useState(false);
    const [societies, setSocieties] = useState([]);
    const [loading, setLoading] = useState(true);

    const initialFormState = {
        name: '',
        registrationNumber: '',
        city: '',
        pincode: '',
        state: '',
        country: 'India',
        adminEmail: '',
        adminPassword: '',
        adminMobile: '',
        memberLimit: 50,
        subscriptionPlan: 'DEMO'
    };
    const [formData, setFormData] = useState(initialFormState);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchSocieties();
    }, []);

    const fetchSocieties = async () => {
        setLoading(true);
        try {
            const response = await api.get('/superadmin/societies');
            setSocieties(response.data);
        } catch (error) {
            console.error("Failed to fetch societies", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/superadmin/societies/${editingId}`, formData);
                alert("Society Successfully Updated!");
            } else {
                await api.post('/superadmin/societies', formData);
                alert("Society Successfully Created!");
            }
            setIsCreating(false);
            setEditingId(null);
            setFormData(initialFormState);
            fetchSocieties();
        } catch (error) {
            console.error("Failed to save society", error);
            alert("Error saving society.");
        }
    };

    const handleEdit = (soc) => {
        setFormData({
            name: soc.name || '',
            registrationNumber: soc.registrationNumber || '',
            city: soc.city || '',
            pincode: soc.pincode || '',
            state: soc.state || '',
            country: soc.country || 'India',
            address: soc.address || '',
            adminEmail: soc.adminEmail || '',
            adminMobile: soc.adminMobile || '',
            memberLimit: soc.memberLimit || 50,
            subscriptionPlan: soc.subscriptionPlan || 'DEMO',
            adminPassword: ''
        });
        setEditingId(soc.id);
        setIsCreating(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this society? This will wipe all its data!")) {
            try {
                await api.delete(`/superadmin/societies/${id}`);
                fetchSocieties();
            } catch (error) {
                console.error("Failed to delete society", error);
            }
        }
    };

    const handleApprove = async (id) => {
        if (!window.confirm("Approve this society? This will grant them full access.")) return;
        try {
            await api.post(`/superadmin/societies/${id}/approve`);
            fetchSocieties();
        } catch (error) {
            console.error("Approval failed", error);
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm("Reject this society registration?")) return;
        try {
            await api.post(`/superadmin/societies/${id}/reject`);
            fetchSocieties();
        } catch (error) {
            console.error("Rejection failed", error);
        }
    };

    if (loading && societies.length === 0) {
        return <div className="flex items-center justify-center min-h-[50vh]"><RefreshCw className="animate-spin text-primary" size={32} /></div>;
    }

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-black gradient-text pb-2 uppercase tracking-tighter">Global Societies</h1>
                    <p className="text-text-muted text-sm italic">Master control of all registered societies across the platform.</p>
                </div>
                {!isCreating && (
                    <div className="flex gap-3">
                        <button onClick={fetchSocieties} className="btn btn-secondary border-glass-border">
                            <RefreshCw size={20} />
                        </button>
                        <button onClick={() => { setIsCreating(true); setEditingId(null); setFormData(initialFormState); }} className="btn btn-primary shadow-lg shadow-primary/30">
                            <Plus size={20} /> Register New Society
                        </button>
                    </div>
                )}
            </header>

            {isCreating ? (
                <div className="glass-card border-t-4 border-primary p-8">
                    <h2 className="text-xl font-black mb-6 uppercase flex items-center gap-2 text-primary">
                        <Building2 size={24} /> {editingId ? 'Edit Management Parameters' : 'Onboard New Society'}
                    </h2>
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Society Name *</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required className="input font-bold" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Registration ID</label>
                                <input type="text" value={formData.registrationNumber} onChange={e => setFormData({ ...formData, registrationNumber: e.target.value })} required className="input" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Admin Email *</label>
                                <input type="email" value={formData.adminEmail} onChange={e => setFormData({ ...formData, adminEmail: e.target.value })} required className="input" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">{editingId ? 'New Admin Password (Optional)' : 'Admin Password *'}</label>
                                <input type="password" value={formData.adminPassword} onChange={e => setFormData({ ...formData, adminPassword: e.target.value })} required={!editingId} className="input" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">City *</label>
                                <input type="text" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} required className="input" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Pincode *</label>
                                <input type="text" value={formData.pincode} onChange={e => setFormData({ ...formData, pincode: e.target.value })} required className="input" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Member Limit</label>
                                <input type="number" value={formData.memberLimit} onChange={e => setFormData({ ...formData, memberLimit: parseInt(e.target.value) || 0 })} required className="input font-bold" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Subscription Plan</label>
                                <select value={formData.subscriptionPlan} onChange={e => setFormData({ ...formData, subscriptionPlan: e.target.value })} className="input font-bold">
                                    <option value="DEMO">DEMO ACCOUNT</option>
                                    <option value="MONTHLY">MONTHLY PLAN (499)</option>
                                    <option value="YEARLY">YEARLY PLAN (4999)</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-6 border-t border-glass-border">
                            <button type="button" onClick={() => { setIsCreating(false); setEditingId(null); }} className="btn btn-secondary px-8">Cancel</button>
                            <button type="submit" className="btn btn-primary px-10 shadow-lg shadow-primary/30 font-bold">{editingId ? 'Update Society' : 'Deploy Society'}</button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="glass-card p-0 overflow-hidden border-t-4 border-primary">
                    <table className="w-full text-left">
                        <thead className="bg-surface-light border-b border-glass-border">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Society & Code</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Location</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Users</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Billing</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Engineering Bench</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-glass-border">
                            {societies.map(soc => (
                                <tr key={soc.id} className="hover:bg-primary/[0.02] transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-black text-primary uppercase">{soc.name}</p>
                                        <p className="text-[10px] font-bold font-mono text-text-muted mt-1">{soc.societyCode}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-bold uppercase">{soc.city}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black">{soc.memberLimit} Max</span>
                                            <span className="text-[9px] text-text-muted font-bold">Quota: Active</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md border ${soc.subscriptionPlan === 'DEMO' ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                                            {soc.subscriptionPlan || 'DEMO'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[9px] font-black tracking-widest ${soc.status === 'ACTIVE' ? 'bg-success/20 text-success' :
                                                soc.status === 'PENDING' ? 'bg-warning/20 text-warning' : 'bg-error/20 text-error'
                                            }`}>
                                            {soc.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 flex justify-end gap-2">
                                        {soc.status === 'PENDING' ? (
                                            <>
                                                <button onClick={() => handleApprove(soc.id)} className="p-2 bg-success/10 text-success hover:bg-success hover:text-white rounded-lg transition-colors border-0"><CheckCircle size={14} /></button>
                                                <button onClick={() => handleReject(soc.id)} className="p-2 bg-error/10 text-error hover:bg-error hover:text-white rounded-lg transition-colors border-0"><XCircle size={14} /></button>
                                            </>
                                        ) : (
                                            <div className="p-2 bg-success/10 text-success rounded-lg border-0"><Shield size={14} /></div>
                                        )}
                                        <button onClick={() => handleEdit(soc)} className="p-2 bg-surface-light text-muted hover:text-primary rounded-lg border border-glass-border transition-all"><Edit2 size={14} /></button>
                                        <button onClick={() => handleDelete(soc.id)} className="p-2 bg-surface-light text-muted hover:text-error rounded-lg border border-glass-border transition-all"><Trash2 size={14} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default SuperAdminSocieties;
