import React, { useState } from 'react';
import { Building2, Save, MapPin, User, Phone, Mail, Hash, CheckCircle, Copy, RefreshCw, Lock, IndianRupee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

const CreateSociety = () => {
    const [formData, setFormData] = useState({
        name: '',
        registrationNumber: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        adminEmail: '',
        adminMobile: '',
        adminPassword: '',
        memberLimit: 50,
        subscriptionPlan: 'DEMO',
    });

    const [loading, setLoading] = useState(false);
    const [created, setCreated] = useState(null);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/superadmin/societies', formData);
            setCreated(res.data);
            setFormData({
                name: '', registrationNumber: '', address: '', city: '', state: '',
                pincode: '', country: 'India', adminEmail: '', adminMobile: '',
                adminPassword: '', memberLimit: 50, subscriptionPlan: 'DEMO'
            });
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data || 'Failed to create society.');
        } finally {
            setLoading(false);
        }
    };

    const copyCode = () => {
        if (created?.societyCode) {
            navigator.clipboard.writeText(created.societyCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const inputClass = "w-full px-4 py-2.5 bg-surface-light border border-glass-border rounded-xl focus:border-primary outline-none transition-colors font-medium text-sm";
    const labelClass = "block text-xs font-black uppercase tracking-widest text-text-muted mb-1.5";

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-20">
            <header className="mb-8">
                <h1 className="text-3xl font-black gradient-text pb-2 uppercase tracking-tighter">Create New Society</h1>
                <p className="text-text-muted text-sm">Register and configure a new cooperative housing society.</p>
            </header>

            <AnimatePresence>
                {created && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="glass-card border-t-4 border-success p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="text-success" size={24} />
                            <div>
                                <p className="font-black text-success text-lg uppercase">Society Created Successfully!</p>
                                <p className="text-sm text-text-muted">Share the Society Code and admin credentials.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-surface-light rounded-xl p-4 border border-glass-border"><p className="text-xs font-black uppercase text-text-muted mb-1">Society Name</p><p className="font-bold">{created.name}</p></div>
                            <div className="bg-surface-light rounded-xl p-4 border border-primary/30 relative group cursor-pointer" onClick={copyCode}>
                                <p className="text-xs font-black uppercase text-text-muted mb-1">Society Code</p>
                                <div className="flex items-center gap-2"><p className="font-black text-primary font-mono tracking-widest">{created.societyCode}</p>{copied ? <CheckCircle size={14} className="text-success" /> : <Copy size={14} className="text-text-muted" />}</div>
                            </div>
                            <div className="bg-surface-light rounded-xl p-4 border border-glass-border"><p className="text-xs font-black uppercase text-text-muted mb-1">Admin Login</p><p className="font-bold text-sm">{created.adminEmail}</p></div>
                        </div>
                        <button onClick={() => setCreated(null)} className="btn btn-secondary btn-sm flex items-center gap-2"><RefreshCw size={14} /> Create Another</button>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>{error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card border-t-4 border-error p-4 text-error font-bold text-sm">⚠ {error}</motion.div>}</AnimatePresence>

            {!created && (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="glass-card p-6 space-y-5">
                        <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-primary mb-4"><Building2 size={16} /> Society Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div><label className={labelClass}>Society Name *</label><input type="text" name="name" required value={formData.name} onChange={handleChange} className={inputClass} placeholder="e.g. Shyama Residency CHS" /></div>
                            <div><label className={labelClass}>Registration Number</label><input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} className={inputClass} placeholder="e.g. CHS/MUM/1234/2023" /></div>
                        </div>
                    </div>

                    <div className="glass-card p-6 space-y-5">
                        <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-primary mb-4"><IndianRupee size={16} /> Subscription Plan</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { id: 'DEMO', label: 'Demo Account', price: '₹ 0', duration: '7 Days', color: 'border-secondary' },
                                { id: 'MONTHLY', label: 'Monthly Plan', price: '₹ 499', duration: 'Per Month', color: 'border-primary' },
                                { id: 'YEARLY', label: 'Yearly Plan', price: '₹ 4,999', duration: 'Per Year', color: 'border-warning' },
                            ].map(plan => (
                                <div key={plan.id} onClick={() => setFormData({ ...formData, subscriptionPlan: plan.id })}
                                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all ${formData.subscriptionPlan === plan.id ? `${plan.color} bg-glass shadow-lg scale-[1.02]` : 'border-glass-border hover:border-glass-border-hover'}`}>
                                    <div className="flex justify-between items-start mb-2"><p className="text-[10px] font-black uppercase tracking-widest text-text-muted">{plan.label}</p>{formData.subscriptionPlan === plan.id && <CheckCircle size={14} className="text-primary" />}</div>
                                    <p className="text-2xl font-black">{plan.price}</p><p className="text-[10px] font-bold text-text-muted uppercase">{plan.duration}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card p-6 space-y-5">
                        <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-secondary mb-4"><MapPin size={16} /> Address</h2>
                        <div><label className={labelClass}>Full Address</label><input type="text" name="address" value={formData.address} onChange={handleChange} className={inputClass} placeholder="Building/Wing, Street, Area" /></div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-2"><label className={labelClass}>City</label><input type="text" name="city" value={formData.city} onChange={handleChange} className={inputClass} placeholder="Mumbai" /></div>
                            <div><label className={labelClass}>State</label><input type="text" name="state" value={formData.state} onChange={handleChange} className={inputClass} placeholder="Maharashtra" /></div>
                            <div><label className={labelClass}>Pincode</label><input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className={inputClass} placeholder="400001" maxLength={6} /></div>
                        </div>
                    </div>

                    <div className="glass-card p-6 space-y-5">
                        <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-warning mb-4"><User size={16} /> Admin Account</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div><label className={labelClass}>Admin Email</label><input type="email" name="adminEmail" value={formData.adminEmail} onChange={handleChange} className={inputClass} placeholder="admin@society.com" /></div>
                            <div><label className={labelClass}>Admin Mobile</label><input type="tel" name="adminMobile" value={formData.adminMobile} onChange={handleChange} className={inputClass} placeholder="+91 9876543210" /></div>
                            <div className="md:col-span-2"><label className={labelClass}>Password (default: Temp@123)</label><input type="password" name="adminPassword" value={formData.adminPassword} onChange={handleChange} className={inputClass} placeholder="Temp@123" /></div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button type="submit" disabled={loading} className="btn btn-primary flex items-center gap-2 px-8 shadow-lg shadow-primary/30">
                            {loading ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                            {loading ? 'Registering...' : 'Register Society'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default CreateSociety;
