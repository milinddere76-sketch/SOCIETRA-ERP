import React, { useState, useEffect } from 'react';
import { ShieldAlert, Plus, CheckCircle2, ShieldCheck, Users, Edit3, Trash2, X, Save, RefreshCw, Key, Shield } from 'lucide-react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';

const AdminControl = () => {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [categoryGroups, setCategoryGroups] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('roles'); // roles, permissions

    const [isCreatingRole, setIsCreatingRole] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [newRole, setNewRole] = useState({ name: '', description: '', permissions: new Set() });

    useEffect(() => {
        fetchRolesAndPermissions();
    }, []);

    const fetchRolesAndPermissions = async () => {
        setLoading(true);
        try {
            const [roleRes, permRes] = await Promise.all([
                api.get('/roles'),
                api.get('/roles/permissions')
            ]);

            setRoles(roleRes.data);
            setPermissions(permRes.data);

            const groups = {};
            permRes.data.forEach(p => {
                if (!groups[p.category]) groups[p.category] = [];
                groups[p.category].push(p);
            });
            setCategoryGroups(groups);
        } catch (error) {
            console.error("Error fetching roles and permissions", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePermission = (name) => {
        const updated = new Set(newRole.permissions);
        if (updated.has(name)) {
            updated.delete(name);
        } else {
            updated.add(name);
        }
        setNewRole({ ...newRole, permissions: updated });
    };

    const handleSaveRole = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: newRole.name,
                description: newRole.description,
                permissions: Array.from(newRole.permissions)
            };
            if (editingRole) {
                await api.put(`/roles/${editingRole.id}`, payload);
            } else {
                await api.post('/roles', payload);
            }
            setIsCreatingRole(false);
            setEditingRole(null);
            setNewRole({ name: '', description: '', permissions: new Set() });
            fetchRolesAndPermissions();
        } catch (error) {
            alert("Failed to save role. Check console for details.");
        }
    };

    const startEdit = (role) => {
        setEditingRole(role);
        setNewRole({
            name: role.name,
            description: role.description,
            permissions: new Set(role.permissions || [])
        });
        setIsCreatingRole(true);
    };

    const deleteRole = async (id) => {
        if (!window.confirm("Delete this role permanently?")) return;
        try {
            await api.delete(`/roles/${id}`);
            fetchRolesAndPermissions();
        } catch (error) {
            alert("Failed to delete role.");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <RefreshCw className="animate-spin text-primary" size={40} />
                <p className="font-bold text-text-muted uppercase tracking-widest text-xs">Loading Control Center...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-black gradient-text pb-2 uppercase tracking-tighter">Admin Control Center</h1>
                    <p className="text-text-muted text-sm italic">Define system-wide roles, access levels, and security guardrails.</p>
                </div>
                {!isCreatingRole && (
                    <button onClick={() => setIsCreatingRole(true)} className="btn btn-primary flex items-center gap-2 shadow-lg shadow-primary/30">
                        <Plus size={20} /> Create Role
                    </button>
                )}
            </header>

            <div className="flex gap-2 bg-glass p-1 rounded-2xl border border-glass-border w-fit mb-6">
                <button onClick={() => setActiveTab('roles')} className={`px-6 py-2.5 rounded-xl font-bold transition-all text-xs uppercase tracking-widest ${activeTab === 'roles' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-text-muted hover:bg-glass hover:text-text'}`}>System Roles</button>
                <button onClick={() => setActiveTab('permissions')} className={`px-6 py-2.5 rounded-xl font-bold transition-all text-xs uppercase tracking-widest ${activeTab === 'permissions' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-text-muted hover:bg-glass hover:text-text'}`}>Permission Library</button>
            </div>

            <AnimatePresence mode="wait">
                {isCreatingRole ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="glass-card border-t-4 border-primary">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black uppercase flex items-center gap-2 text-primary">
                                <Shield size={24} /> {editingRole ? 'Edit Role Authority' : 'Generate New Role'}
                            </h2>
                            <button onClick={() => { setIsCreatingRole(false); setEditingRole(null); }} className="p-2 hover:bg-error/10 text-error rounded-lg transition-colors"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSaveRole} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-black uppercase text-text-muted mb-2 block">Role Label</label>
                                    <input type="text" required value={newRole.name} onChange={(e) => setNewRole({ ...newRole, name: e.target.value.toUpperCase().replace(/\s/g, '_') })} placeholder="e.g. AUDITOR" className="input font-bold" />
                                </div>
                                <div>
                                    <label className="text-xs font-black uppercase text-text-muted mb-2 block">Description</label>
                                    <input type="text" required value={newRole.description} onChange={(e) => setNewRole({ ...newRole, description: e.target.value })} placeholder="What defines this role?" className="input" />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-black uppercase text-primary mb-4 flex items-center gap-2"><Key size={14} /> Authority Matrix</h3>
                                <div className="space-y-6">
                                    {Object.entries(categoryGroups).map(([category, perms]) => (
                                        <div key={category} className="glass-card bg-surface-light border border-glass-border">
                                            <h4 className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-4 border-b border-glass-border pb-2 px-2">{category} MODULE ACCESS</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
                                                {perms.map(p => (
                                                    <div key={p.id} onClick={() => handleTogglePermission(p.name)} className={`flex items-start gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${newRole.permissions.has(p.name) ? 'border-primary bg-primary/5 shadow-inner' : 'border-glass-border hover:border-glass-border-hover'}`}>
                                                        <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${newRole.permissions.has(p.name) ? 'bg-primary border-primary text-white' : 'border-glass-border-hover'}`}>
                                                            {newRole.permissions.has(p.name) && <CheckCircle2 size={12} />}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-xs uppercase tracking-tight leading-none mb-1">{p.name.replace(/_/g, ' ')}</p>
                                                            <p className="text-[10px] text-text-muted font-bold leading-tight">{p.description}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-6 border-t border-glass-border">
                                <button type="button" onClick={() => { setIsCreatingRole(false); setEditingRole(null); }} className="btn btn-secondary px-8">Discard</button>
                                <button type="submit" className="btn btn-primary px-10 shadow-lg shadow-primary/30 flex items-center gap-2"><Save size={18} /> {editingRole ? 'Update Role' : 'Deploy Role'}</button>
                            </div>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        {activeTab === 'roles' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {roles.map(role => (
                                    <div key={role.id} className="glass-card hover:bg-surface-light transition-all border-t-4 border-secondary group">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h3 className="font-black text-xl text-primary leading-none mb-2">{role.name.replace('ROLE_', '')}</h3>
                                                <p className="text-xs text-text-muted font-bold italic leading-tight">{role.description}</p>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => startEdit(role)} className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"><Edit3 size={16} /></button>
                                                {!['ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_MEMBER'].includes(role.name) && (
                                                    <button onClick={() => deleteRole(role.id)} className="p-2 hover:bg-error/10 text-error rounded-lg transition-colors"><Trash2 size={16} /></button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 min-h-[40px]">
                                            {role.permissions?.slice(0, 4).map(p => (
                                                <span key={p} className="text-[9px] font-black uppercase bg-secondary/5 text-secondary px-2 py-1 rounded-md border border-secondary/10">{p.replace(/_/g, ' ')}</span>
                                            ))}
                                            {role.permissions?.length > 4 && (
                                                <span className="text-[9px] font-black uppercase text-text-muted bg-surface-light px-2 py-1 rounded-md">+{role.permissions.length - 4} Authority Keys</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="glass-card overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-surface-light border-b border-glass-border">
                                        <tr>
                                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Permission Key</th>
                                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Category</th>
                                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Authority Description</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {permissions.map((p, idx) => (
                                            <tr key={p.id} className={`border-b border-glass-border last:border-0 ${idx % 2 === 0 ? 'bg-surface/30' : ''}`}>
                                                <td className="p-4"><span className="text-xs font-black font-mono text-primary">{p.name}</span></td>
                                                <td className="p-4"><span className="text-[10px] font-black uppercase px-2 py-1 rounded bg-secondary/10 text-secondary">{p.category}</span></td>
                                                <td className="p-4 text-xs font-bold text-text-muted">{p.description}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminControl;
