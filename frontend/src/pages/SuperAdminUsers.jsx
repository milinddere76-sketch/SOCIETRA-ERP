import React, { useState, useEffect } from 'react';
import { Users, Plus, RefreshCw, Shield, Edit2, Trash2, X, Save } from 'lucide-react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';

const SuperAdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', roles: [] });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/superadmin/users');
            setUsers(response.data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            roles: user.roles || []
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/superadmin/users/${editingUser.id}`, formData);
            alert("User updated successfully!");
            setEditingUser(null);
            fetchUsers();
        } catch (error) {
            console.error("Failed to update user", error);
            alert("Update failed.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await api.delete(`/superadmin/users/${id}`);
                fetchUsers();
            } catch (error) {
                console.error("Delete failed", error);
            }
        }
    };

    if (loading && users.length === 0) {
        return <div className="flex items-center justify-center min-h-[50vh]"><RefreshCw className="animate-spin text-primary" size={32} /></div>;
    }

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-black gradient-text pb-2 uppercase tracking-tighter">Global Audit: Users</h1>
                    <p className="text-text-muted text-sm italic">Master oversight of all platform users. Manage permissions and security profiles globally.</p>
                </div>
                <button onClick={fetchUsers} className="btn btn-secondary flex items-center gap-2"><RefreshCw size={18} /> Refresh</button>
            </header>

            <AnimatePresence>
                {editingUser && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="glass-card border-t-4 border-primary mb-8 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-black uppercase text-primary">Edit User Profile</h2>
                            <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-error/10 text-error rounded-lg"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder="First Name" className="input" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} required />
                            <input type="text" placeholder="Last Name" className="input" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} required />
                            <input type="email" placeholder="Email" className="input" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                            <div className="flex gap-2">
                                <button type="submit" className="btn btn-primary flex-1 flex items-center justify-center gap-2"><Save size={18} /> Update</button>
                                <button type="button" onClick={() => setEditingUser(null)} className="btn btn-secondary flex-1">Cancel</button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="glass-card p-0 overflow-hidden border-t-4 border-warning">
                <table className="w-full text-left">
                    <thead className="bg-surface-light border-b border-glass-border">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">User Identity</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Society Scope</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Assigned Roles</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Engineering Bench</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-glass-border">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-warning/[0.02] transition-colors">
                                <td className="px-6 py-4">
                                    <p className="font-black text-text uppercase">{u.firstName} {u.lastName}</p>
                                    <p className="text-xs font-bold text-text-muted">{u.email}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="bg-surface-light border border-glass-border px-3 py-1 rounded-lg text-[10px] font-black text-text-muted uppercase tracking-tight">
                                        {u.societyName || 'SYSTEM WIDE'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-1.5 flex-wrap max-w-xs">
                                        {(u.roles || []).map((r, i) => (
                                            <span key={i} className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${r === 'ROLE_SUPER_ADMIN' ? 'bg-primary/10 text-primary border-primary/20' :
                                                r === 'ROLE_SOCIETY_ADMIN' ? 'bg-warning/10 text-warning border-warning/20' : 'bg-surface-light text-text-muted border-glass-border'
                                                }`}>
                                                {r.replace('ROLE_', '').replace('_', ' ')}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleEdit(u)} className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors border-0"><Edit2 size={14} /></button>
                                        <button onClick={() => handleDelete(u.id)} className="p-2 hover:bg-error/10 text-error rounded-lg transition-colors border-0"><Trash2 size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SuperAdminUsers;
