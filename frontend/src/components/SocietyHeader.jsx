import React, { useState, useEffect } from 'react';
import api from '../api';
import { Building2, MapPin, Phone, FileText, Calendar } from 'lucide-react';

const SocietyHeader = () => {
    const [profile, setProfile] = useState(null);
    const role = localStorage.getItem('role');

    useEffect(() => {
        if (role === 'SOCIETY_ADMIN') {
            const fetchProfile = async () => {
                try {
                    const res = await api.get('/auth/me');
                    setProfile(res.data);
                } catch (err) {
                    console.error("Failed to load society profile for header", err);
                }
            };
            fetchProfile();
        }
    }, [role]);

    if (role !== 'SOCIETY_ADMIN' || !profile?.society) return null;

    const soc = profile.society;

    return (
        <div className="society-header-container mb-8 print-header">
            <div className="glass-card bg-gradient-to-r from-primary/5 via-surface to-primary/5 border-primary/20 p-6 text-center shadow-xl">
                <div className="flex flex-col items-center gap-2">
                    <div className="p-3 rounded-full bg-primary/10 text-primary mb-2">
                        <Building2 size={32} />
                    </div>

                    <h1 className="text-3xl font-black tracking-tight text-primary uppercase">{soc.name}</h1>

                    <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 mt-2 text-sm font-semibold text-text">
                        <p className="flex items-center gap-1.5 bg-surface-light px-3 py-1 rounded-full border border-glass-border">
                            <MapPin size={14} className="text-primary" /> {soc.address}, {soc.city} - {soc.pincode}
                        </p>
                        <p className="flex items-center gap-1.5 bg-surface-light px-3 py-1 rounded-full border border-glass-border">
                            <FileText size={14} className="text-primary" /> Reg No: {soc.registrationNumber || 'Pending'}
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 mt-1 text-xs font-bold text-muted uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                            <Phone size={12} /> {soc.adminMobile || 'N/A'}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Calendar size={12} /> Reg Date: {soc.registrationDate ? new Date(soc.registrationDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : (soc.createdAt ? new Date(soc.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A')}
                        </span>
                        <span className="text-primary/70">{soc.state}, {soc.country}</span>
                    </div>
                </div>
            </div>

            {/* Horizontal Divider with Logo Mark */}
            <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-glass-border"></div>
                <span className="flex-shrink mx-4 text-primary opacity-20"><Building2 size={16} /></span>
                <div className="flex-grow border-t border-glass-border"></div>
            </div>
        </div>
    );
};

export default SocietyHeader;
