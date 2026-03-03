import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, ShieldCheck, Camera, Check, UserCircle } from 'lucide-react';
import api from '../api';
import { motion } from 'framer-motion';

const ResidentProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/resident/profile');
                setProfile(res.data);
            } catch (err) {
                console.error("Profile load failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return <div className="flex items-center justify-center min-h-[400px]">Loading Profile...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom duration-500">
            <header className="text-center space-y-4">
                <div className="relative inline-block group">
                    <div className="w-32 h-32 rounded-[32px] bg-primary/10 border-4 border-primary/20 p-1 overflow-hidden shadow-2xl transition-transform group-hover:scale-105 duration-300">
                        {profile?.profilePhoto ? (
                            <img src={profile.profilePhoto} alt="Resident Profile" className="w-full h-full object-cover rounded-[28px]" />
                        ) : (
                            <UserCircle size={120} className="text-primary/30 -ml-1.5 -mt-1.5" />
                        )}
                    </div>
                </div>
                <div>
                    <h1 className="text-4xl font-black gradient-text uppercase tracking-widest leading-tight">{profile?.firstName} {profile?.lastName}</h1>
                    <p className="text-xs font-bold font-mono text-primary uppercase tracking-widest">{profile?.memberId || 'MEM/ID/N-A'}</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-card p-8 border-t-8 border-primary/30 space-y-8">
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted border-b border-glass-border pb-4 flex items-center gap-2">
                        <ShieldCheck size={18} className="text-primary" /> Personal Information
                    </h3>
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-surface-light flex items-center justify-center text-muted shrink-0"><Mail size={18} /></div>
                            <div>
                                <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Email Address</p>
                                <p className="text-md font-bold text-text">{profile?.email}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-surface-light flex items-center justify-center text-muted shrink-0"><Phone size={18} /></div>
                            <div>
                                <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Verified Contact No</p>
                                <p className="text-md font-bold text-text">{profile?.phone || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-8 border-t-8 border-secondary/30 space-y-8">
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted border-b border-glass-border pb-4 flex items-center gap-2">
                        <MapPin size={18} className="text-secondary" /> Property Linkage
                    </h3>
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-surface-light flex items-center justify-center text-muted shrink-0"><ShieldCheck size={18} /></div>
                            <div>
                                <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Associated Society</p>
                                <p className="text-md font-bold text-text">{profile?.societyName || 'SOCIETRA Member'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-surface-light flex items-center justify-center text-muted shrink-0"><MapPin size={18} /></div>
                            <div>
                                <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Unit / Address</p>
                                <p className="text-md font-bold text-text">{profile?.address || 'Property Not Linked'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-card p-8 border-t-8 border-warning/30 space-y-8">
                <h3 className="text-sm font-black uppercase tracking-widest text-muted border-b border-glass-border pb-4 flex items-center gap-2">
                    <ShieldCheck size={18} className="text-warning" /> Security & Access
                </h3>
                <form
                    onSubmit={async (e) => {
                        e.preventDefault();
                        const current = e.target.currentPassword.value;
                        const newPass = e.target.newPassword.value;
                        try {
                            await api.post('/resident/change-password', { currentPassword: current, newPassword: newPass });
                            alert("Password updated successfully!");
                            e.target.reset();
                        } catch (err) {
                            alert("Failed to update password. Check current password.");
                        }
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Current Password</p>
                            <input
                                type="password"
                                name="currentPassword"
                                className="w-full bg-surface-light border border-glass-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                                required
                            />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">New Secure Password</p>
                            <input
                                type="password"
                                name="newPassword"
                                className="w-full bg-surface-light border border-glass-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex flex-col justify-end pb-1">
                        <button
                            type="submit"
                            className="btn btn-primary w-full md:w-auto px-10 py-4 h-auto font-black uppercase tracking-tighter"
                        >
                            Update Credentials
                        </button>
                        <p className="text-[10px] text-muted mt-3 italic text-center md:text-left">Use a mix of letters, numbers, and symbols for maximum security.</p>
                    </div>
                </form>
            </div>

            <div className="glass-card p-12 text-center bg-gradient-to-tr from-primary/5 to-transparent">
                <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center text-success mx-auto mb-6"><Check size={32} /></div>
                <h3 className="text-2xl font-black uppercase tracking-widest mb-2">Statutory Profile Verified</h3>
                <p className="text-sm text-text-muted max-w-sm mx-auto leading-relaxed">Your profile information is verified and maintained as per society records. Contact society admin to update any information.</p>
            </div>
        </div>
    );
};

export default ResidentProfile;
