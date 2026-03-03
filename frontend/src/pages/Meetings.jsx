import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Download, Users, Plus, X, Calendar, Clock,
    Search, ChevronRight, FileBadge, CheckCircle2, Check,
    Bell, MapPin, Send, BookOpen
} from 'lucide-react';
import api from '../api';

const Meetings = () => {
    const [meetings, setMeetings] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState(null); // 'schedule' | 'minutes' | null
    const [search, setSearch] = useState('');

    // Shared form defaults
    const defaultForm = {
        title: '', type: 'COMMITTEE', date: '', notes: '', venue: '',
        notifyMembers: true, attendanceIds: []
    };
    const [formData, setFormData] = useState(defaultForm);

    useEffect(() => {
        fetchMeetings();
        fetchMembers();
    }, []);

    const fetchMeetings = async () => {
        try {
            setLoading(true);
            const res = await api.get('/meetings');
            setMeetings(res.data || []);
        } catch (err) {
            console.error('Failed to fetch meetings', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMembers = async () => {
        try {
            const res = await api.get('/society/users');
            setMembers(res.data || []);
        } catch (err) {
            console.error('Failed to fetch members', err);
        }
    };

    const toggleAttendee = (id) => {
        setFormData(prev => ({
            ...prev,
            attendanceIds: prev.attendanceIds.includes(id)
                ? prev.attendanceIds.filter(aid => aid !== id)
                : [...prev.attendanceIds, id]
        }));
    };

    const openModal = (type) => {
        setFormData({ ...defaultForm, type: type === 'schedule' ? 'COMMITTEE' : 'AGM' });
        setModal(type);
    };

    const closeModal = () => { setModal(null); setFormData(defaultForm); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                // For schedule: status = UPCOMING, for minutes: PUBLISHED
                status: modal === 'schedule' ? 'UPCOMING' : 'PUBLISHED'
            };
            const res = await api.post('/meetings', payload);
            setMeetings([res.data, ...meetings]);
            closeModal();
        } catch (err) {
            console.error('Failed to save', err);
            alert('Failed to save. Please try again.');
        }
    };

    const filtered = meetings.filter(m =>
        m.title?.toLowerCase().includes(search.toLowerCase()) ||
        m.venue?.toLowerCase().includes(search.toLowerCase())
    );

    const stats = [
        { label: 'Total Meetings', val: meetings.length, icon: <Calendar size={20} />, color: 'text-primary' },
        { label: 'Scheduled', val: meetings.filter(m => m.status === 'UPCOMING').length, icon: <Clock size={20} />, color: 'text-warning' },
        { label: 'Published', val: meetings.filter(m => m.status === 'PUBLISHED').length, icon: <FileBadge size={20} />, color: 'text-success' },
        { label: 'Total RSVPs', val: meetings.reduce((s, m) => s + (m.confirmedCount || 0), 0), icon: <Users size={20} />, color: 'text-secondary' }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <header className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-black gradient-text pb-1">Meeting Manager</h1>
                    <p className="text-muted text-sm">Schedule upcoming meetings & record statutory proceedings</p>
                </div>
                <div className="flex gap-3">
                    <motion.button
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={() => openModal('schedule')}
                        className="btn btn-primary flex items-center gap-2 shadow-lg shadow-primary/20"
                    >
                        <Calendar size={16} /> Schedule Meeting
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={() => openModal('minutes')}
                        className="btn btn-secondary flex items-center gap-2"
                    >
                        <BookOpen size={16} /> Record Minutes
                    </motion.button>
                </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                    <motion.div
                        key={i} initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="glass-card p-5"
                    >
                        <div className={`mb-2 ${s.color}`}>{s.icon}</div>
                        <p className="text-[10px] font-bold text-muted uppercase tracking-widest">{s.label}</p>
                        <h3 className="text-3xl font-black mt-1">{s.val}</h3>
                    </motion.div>
                ))}
            </div>

            {/* Meeting List */}
            <div className="glass-card">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-lg uppercase tracking-widest">All Meetings</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="bg-glass border border-glass-border rounded-xl py-2 pl-9 pr-4 text-sm w-56 outline-none focus:border-primary transition-colors"
                            placeholder="Search meetings..."
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    {loading && <p className="text-center py-10 text-muted italic text-sm">Loading…</p>}
                    {!loading && filtered.length === 0 && (
                        <p className="text-center py-16 text-muted italic text-sm">No meetings found.</p>
                    )}
                    {filtered.map((m) => (
                        <div key={m.id} className="p-4 hover:bg-glass/50 rounded-2xl border border-glass-border/30 hover:border-primary/30 transition-all group">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-sm ${m.type === 'AGM' ? 'bg-primary/20 text-primary' :
                                        m.type === 'EMERGENCY' ? 'bg-rose-500/20 text-rose-400' :
                                            'bg-secondary/20 text-secondary'}`}>
                                        {m.type ? m.type.substring(0, 3) : 'MTG'}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm group-hover:text-primary transition-colors">{m.title}</h4>
                                        <div className="flex flex-wrap gap-3 text-[10px] text-muted mt-1.5">
                                            <span className="flex items-center gap-1"><Calendar size={10} /> {m.date}</span>
                                            <span className="flex items-center gap-1"><Clock size={10} /> {m.time || 'TBD'}</span>
                                            {m.venue && <span className="flex items-center gap-1"><MapPin size={10} /> {m.venue}</span>}
                                            <span className="flex items-center gap-1"><Users size={10} /> {m.attendees || 0} present</span>
                                            {m.confirmedCount > 0 && (
                                                <span className="flex items-center gap-1 text-success font-bold">
                                                    <Check size={10} /> {m.confirmedCount} RSVPs
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wider ${m.status === 'PUBLISHED' ? 'bg-success/20 text-success' :
                                        m.status === 'UPCOMING' ? 'bg-primary/20 text-primary' :
                                            'bg-warning/20 text-warning'}`}>
                                        {m.status || 'DRAFT'}
                                    </span>
                                    <button className="p-2 hover:bg-glass rounded-xl text-muted hover:text-primary transition-colors">
                                        <Download size={16} />
                                    </button>
                                    <button className="p-2 hover:bg-glass rounded-xl text-muted hover:text-primary transition-colors">
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {modal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
                        onClick={e => e.target === e.currentTarget && closeModal()}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }} transition={{ type: 'spring', damping: 25 }}
                            className="glass-card no-hover-lift w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto"
                        >
                            <button
                                onClick={closeModal}
                                className="absolute right-4 top-4 p-2 hover:bg-surface-light rounded-full text-muted z-10"
                            >
                                <X size={18} />
                            </button>

                            {/* Modal Header */}
                            <div className={`flex items-center gap-3 mb-6 pb-4 border-b border-glass-border`}>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${modal === 'schedule' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'}`}>
                                    {modal === 'schedule' ? <Calendar size={20} /> : <BookOpen size={20} />}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black gradient-text">
                                        {modal === 'schedule' ? 'Schedule a Meeting' : 'Record Meeting Minutes'}
                                    </h2>
                                    <p className="text-[11px] text-muted">
                                        {modal === 'schedule'
                                            ? 'Notify all members via Dashboard, Email & WhatsApp'
                                            : 'Document proceedings and publish to society records'}
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="field-label">Meeting Title *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        placeholder={modal === 'schedule' ? 'e.g. Monthly Committee Meeting – March 2025' : 'e.g. AGM 2024–25'}
                                        className="field-input"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="field-label">Type</label>
                                        <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="field-input">
                                            <option value="AGM">Annual General Meeting</option>
                                            <option value="COMMITTEE">Committee Meeting</option>
                                            <option value="EMERGENCY">Emergency Meeting</option>
                                            <option value="SPECIAL">Special Meeting</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="field-label">Date {modal === 'schedule' ? '& Time' : ''} *</label>
                                        <input
                                            type={modal === 'schedule' ? 'datetime-local' : 'date'}
                                            value={formData.date}
                                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                                            className="field-input"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="field-label">Venue / Location *</label>
                                    <input
                                        type="text"
                                        value={formData.venue}
                                        onChange={e => setFormData({ ...formData, venue: e.target.value })}
                                        placeholder="e.g. Society Club House, Ground Floor"
                                        className="field-input"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="field-label">
                                        {modal === 'schedule' ? 'Agenda / Topics' : 'Proceedings & Resolutions *'}
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder={modal === 'schedule'
                                            ? 'e.g. 1. Budget review\n2. Maintenance discussion\n3. AOB'
                                            : 'Enter detailed minutes, resolutions passed, and action items...'}
                                        rows="4"
                                        className="field-input resize-none"
                                        required={modal === 'minutes'}
                                    />
                                </div>

                                {/* Notify Members Toggle */}
                                <label className="flex items-start gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl cursor-pointer hover:bg-primary/10 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={formData.notifyMembers}
                                        onChange={e => setFormData({ ...formData, notifyMembers: e.target.checked })}
                                        className="mt-0.5"
                                    />
                                    <div>
                                        <p className="text-xs font-bold">Notify all members via Dashboard, WhatsApp & Email</p>
                                        <p className="text-[10px] text-muted mt-0.5">
                                            Messages will be sent from the society admin's registered contact details.
                                        </p>
                                    </div>
                                </label>

                                {/* Attendance (only for minutes) */}
                                {modal === 'minutes' && (
                                    <div>
                                        <label className="field-label">Attendance Sheet ({formData.attendanceIds.length} Present)</label>
                                        <div className="max-h-40 overflow-y-auto space-y-1 border border-glass-border/30 rounded-xl p-2 bg-black/10">
                                            {members.length === 0
                                                ? <p className="text-[10px] text-muted p-2 italic">No members found.</p>
                                                : members.map(member => (
                                                    <div
                                                        key={member.id}
                                                        onClick={() => toggleAttendee(member.id)}
                                                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-xs ${formData.attendanceIds.includes(member.id) ? 'bg-primary/20 border border-primary/20' : 'hover:bg-glass'}`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-surface-light flex items-center justify-center text-[10px] font-bold">
                                                                {member.firstName?.[0] || 'U'}
                                                            </div>
                                                            {member.firstName} {member.lastName}
                                                        </div>
                                                        {formData.attendanceIds.includes(member.id) && <CheckCircle2 size={14} className="text-primary" />}
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className={`w-full btn py-4 mt-2 flex items-center justify-center gap-2 font-black shadow-lg ${modal === 'schedule' ? 'btn-primary shadow-primary/20' : 'btn-secondary shadow-secondary/20'}`}
                                >
                                    {modal === 'schedule'
                                        ? <><Send size={16} /> Schedule & Notify Members</>
                                        : <><FileText size={16} /> Publish Meeting Minutes</>}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Meetings;
