import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Edit, Trash2, Mail, Phone, Camera, ShieldCheck, MapPin, Search, X, Check, Home } from 'lucide-react';
import api from '../api';

const Members = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        memberId: '',
        email: '',
        phone: '',
        address: '',
        profilePhoto: '',
        password: '',
        isActive: true
    });

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/society/users');
            setMembers(res.data);
        } catch (err) {
            console.error("Failed to fetch members", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingMember) {
                await api.put(`/society/users/${editingMember.id}`, formData);
            } else {
                await api.post('/society/users', formData);
            }
            setShowModal(false);
            setEditingMember(null);
            fetchMembers();
            resetForm();
        } catch (err) {
            console.error("Failed to save member details", err);
            const errorMsg = err.response?.data?.message || err.response?.data?.error || "Error saving member details. Please check if email already exists.";
            alert(errorMsg);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this member?")) {
            try {
                await api.delete(`/society/users/${id}`);
                fetchMembers();
            } catch (err) {
                alert("Error deleting member.");
            }
        }
    };

    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            memberId: '',
            email: '',
            phone: '',
            address: '',
            profilePhoto: '',
            password: '',
            isActive: true
        });
    };

    const filteredMembers = members.filter(m =>
        m.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.memberId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold gradient-text pb-2">Member Management</h1>
                    <p className="text-text-muted">Manage resident records, statutory details, and society directory.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setEditingMember(null); setShowModal(true); }}
                    className="btn btn-primary shadow-lg shadow-primary/30 flex items-center gap-2"
                >
                    <UserPlus size={20} /> Add New Member
                </button>
            </header>

            <div className="glass-card mb-8">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or Member ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-surface border border-glass-border rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-primary transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMembers.map((member) => (
                    <div key={member.id} className="glass-card group overflow-hidden relative border-t-4 border-primary/20">
                        <div className="flex gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 overflow-hidden shrink-0">
                                {member.profilePhoto ? (
                                    <img src={member.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <Users size={30} />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg truncate">{member.firstName} {member.lastName}</h3>
                                <p className="text-xs font-mono font-bold text-primary mb-2 uppercase tracking-widest">{member.memberId || 'NO ID'}</p>
                                <div className="space-y-1">
                                    <p className="flex items-center gap-2 text-xs text-muted truncate"><Mail size={12} /> {member.email}</p>
                                    <p className="flex items-center gap-2 text-xs text-muted"><Phone size={12} /> {member.phone || 'N/A'}</p>
                                    <p className="flex items-center gap-2 text-xs text-muted truncate"><MapPin size={12} /> {member.address || 'Address not set'}</p>
                                </div>
                                {member.ownedUnits && member.ownedUnits.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-1">
                                        {member.ownedUnits.map((u, i) => (
                                            <span key={i} className="px-2 py-1 bg-secondary/10 text-secondary text-[10px] font-bold rounded-md flex items-center gap-1 border border-secondary/20 shadow-sm">
                                                <Home size={10} /> {u}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-glass-border flex justify-between items-center">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${member.isActive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                                {member.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => { setEditingMember(member); setFormData({ ...member, password: '' }); setShowModal(true); }}
                                    className="p-2 hover:bg-primary/20 hover:text-primary rounded-lg transition-colors text-muted"
                                >
                                    <Edit size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(member.id)}
                                    className="p-2 hover:bg-error/20 hover:text-error rounded-lg transition-colors text-muted"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Member Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                    <div className="glass-card w-full max-w-2xl shadow-2xl relative animate-in zoom-in duration-200">
                        <button onClick={() => setShowModal(false)} className="absolute right-4 top-4 p-2 hover:bg-surface-light rounded-full transition-colors text-muted"><X size={20} /></button>
                        <h2 className="text-2xl font-bold mb-6 gradient-text">{editingMember ? 'Edit Member Profile' : 'Register New Member'}</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">First Name</label>
                                    <input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="w-full p-3 rounded-xl bg-surface border border-glass-border focus:border-primary outline-none" required />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Last Name</label>
                                    <input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="w-full p-3 rounded-xl bg-surface border border-glass-border focus:border-primary outline-none" required />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Member ID (Statutory)</label>
                                    <input type="text" value={formData.memberId} onChange={(e) => setFormData({ ...formData, memberId: e.target.value })} placeholder="e.g. SOC/MEM/001" className="w-full p-3 rounded-xl bg-surface border border-glass-border focus:border-primary outline-none" required />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Phone Number</label>
                                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full p-3 rounded-xl bg-surface border border-glass-border focus:border-primary outline-none" />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Email / Username</label>
                                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full p-3 rounded-xl bg-surface border border-glass-border focus:border-primary outline-none" required />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">{editingMember ? 'Change Password (Leave blank to keep current)' : 'Account Password'}</label>
                                    <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder={editingMember ? '••••••••' : 'Welcome@123'} className="w-full p-3 rounded-xl bg-surface border border-glass-border focus:border-primary outline-none" required={!editingMember} />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Residential Address / Flat No.</label>
                                    <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full p-3 rounded-xl bg-surface border border-glass-border focus:border-primary outline-none h-24 resize-none" />
                                </div>
                                <div className="col-span-2 flex items-center gap-2">
                                    <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} className="w-4 h-4 rounded border-glass-border accent-primary" />
                                    <label htmlFor="isActive" className="text-xs font-bold text-muted uppercase tracking-wider cursor-pointer">Account is Active</label>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="w-full btn btn-outline py-4 font-bold uppercase tracking-widest">
                                    Cancel
                                </button>
                                <button type="submit" className="w-full btn btn-primary py-4 shadow-xl shadow-primary/20 font-bold uppercase tracking-widest">
                                    {editingMember ? 'Update Member Profile' : 'Register Member'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Members;
