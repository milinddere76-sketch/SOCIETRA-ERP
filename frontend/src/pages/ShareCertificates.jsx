import React, { useState, useEffect } from 'react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Award,
    Download,
    Plus,
    Search,
    History,
    X,
    Printer,
    FileCheck,
    Edit,
    Trash2,
    Home, FileText, Building2, User, Hash, DollarSign, PenTool, MoreVertical
} from 'lucide-react';

const ShareCertificates = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedCert, setSelectedCert] = useState(null);
    const [formData, setFormData] = useState({
        unitId: '',
        memberName: '',
        shares: 10,
        startNo: 1,
        shareValue: 100,
        chairmanName: '',
        secretaryName: ''
    });

    const [certificates, setCertificates] = useState([]);
    const [units, setUnits] = useState([]);
    const [editingCertificate, setEditingCertificate] = useState(null);
    const [society, setSociety] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const selectedSocietyId = localStorage.getItem('selectedSocietyId');
            const role = (localStorage.getItem('role') || '').replace('ROLE_', '');
            const isSuperAdmin = role === 'SUPER_ADMIN';

            console.log("Fetching data...", { role, isSuperAdmin, selectedSocietyId });

            // Fetch certificates
            try {
                const certUrl = isSuperAdmin && selectedSocietyId ? `/ certificates / society / ${selectedSocietyId} ` : '/certificates/society';
                const certRes = await api.get(certUrl);
                console.log("Certificates fetched:", certRes.data?.length);
                setCertificates(certRes.data || []);
            } catch (err) {
                console.error('Failed to fetch certificates:', err);
                setCertificates([]);
            }

            // Fetch units
            try {
                const unitUrl = isSuperAdmin && selectedSocietyId ? `/ units ? societyId = ${selectedSocietyId} ` : '/units';
                const unitRes = await api.get(unitUrl);
                console.log("Units fetched:", unitRes.data?.length);
                setUnits(unitRes.data || []);
            } catch (err) {
                console.error('Failed to fetch units:', err);
                setUnits([]);
            }

            // Fetch society details
            try {
                const societyUrl = isSuperAdmin && selectedSocietyId ? `/ society / settings / ${selectedSocietyId} ` : '/society/settings';
                const societyRes = await api.get(societyUrl);
                console.log("Society fetched:", societyRes.data?.name);
                setSociety(societyRes.data);
            } catch (err) {
                console.error('Failed to fetch society details:', err);
                setSociety(null);
            }
        } catch (err) {
            console.error('Data fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const totalCertificates = certificates.length;
    const totalShares = certificates.reduce((sum, cert) => sum + (cert.totalShares || cert.shares || 0), 0);
    const lastIssued = certificates.length > 0
        ? new Date(Math.max(...certificates.map(c => new Date(c.issueDate || c.date || 0)))).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : '---';

    const handleDownload = async (certId) => {
        try {
            const response = await api.get(`/ certificates / ${certId}/download`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `share_certificate_${certId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Download failed:', err);
            alert('Failed to download certificate.');
        }
    };

    const CertificatePreview = ({ cert, societyData }) => (
        <div className="relative w-full max-w-3xl bg-[#fffcf0] border-[16px] border-[#b8860b] p-4 text-[#3d2b1f] shadow-2xl rounded-sm font-serif overflow-hidden">
            {/* Inner Border Frame */}
            <div className="border-[2px] border-[#b8860b] p-10 relative bg-[#fffcf0]/50 h-full">
                {/* Subtle Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none overflow-hidden">
                    <h1 className="text-9xl font-bold rotate-[-35deg] tracking-widest uppercase">SOCIETRA</h1>
                </div>

                <header className="text-center mb-10">
                    <h2 className="text-2xl font-serif italic text-[#b8860b] mb-1 font-bold">Share Certificate</h2>
                    <p className="text-[9px] uppercase tracking-widest text-[#8b6b23] mb-6 font-sans font-bold">(Issued under the Cooperative Societies Act, 1960)</p>

                    <h1 className="text-4xl font-bold mb-1 uppercase font-serif tracking-tight text-black">{societyData?.name || "SOCIETRA GARDENS CHS LTD."}</h1>
                    <p className="text-[10px] font-sans font-bold text-muted-foreground italic mb-2">Regd. No. {societyData?.registrationNumber || "BOM/HSG/1234 OF 2024"}</p>
                    {societyData?.address && (
                        <p className="text-[9px] opacity-70 uppercase tracking-widest font-sans font-semibold max-w-lg mx-auto leading-relaxed">
                            {[societyData.address, societyData.city, societyData.state, societyData.pincode].filter(Boolean).join(', ')}
                        </p>
                    )}
                </header>

                <div className="grid grid-cols-4 gap-4 mb-10 pb-4 border-b border-[#b8860b]/30">
                    <div className="text-center">
                        <p className="text-[9px] uppercase font-sans font-bold text-[#b8860b] mb-1">Cert No.</p>
                        <p className="text-base font-bold">{cert.certNo}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[9px] uppercase font-sans font-bold text-[#b8860b] mb-1">Shares</p>
                        <p className="text-base font-bold">{cert.shares}</p>
                    </div>
                    <div className="text-center border-x border-[#b8860b]/10">
                        <p className="text-[9px] uppercase font-sans font-bold text-[#b8860b] mb-1">Distinctive Nos.</p>
                        <p className="text-base font-bold">{cert.range}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[9px] uppercase font-sans font-bold text-[#b8860b] mb-1">Share Value</p>
                        <p className="text-base font-bold">₹{cert.shareValue || 100}</p>
                    </div>
                </div>

                <div className="space-y-6 text-center mb-12 py-4">
                    <p className="text-lg leading-relaxed">
                        This is to certify that <span className="text-2xl font-bold underline decoration-[#b8860b] underline-offset-8 px-2">{cert.member}</span>
                    </p>
                    <p className="text-lg px-8">
                        is the Registered Holder of <span className="font-bold">{cert.shares}</span> shares in the above named Society, subject to the Bye-laws of the Society, attached to Unit:
                    </p>
                    <div className="bg-[#b8860b]/5 py-4 inline-block px-12 border border-[#b8860b]/20">
                        <p className="text-3xl font-bold tracking-widest uppercase">{cert.unit}</p>
                    </div>
                </div>

                <footer className="flex justify-between items-end mt-16 px-4">
                    <div className="text-center flex flex-col items-center">
                        <div className="w-40 h-[1.5px] bg-[#3d2b1f] mb-2" />
                        <p className="text-[10px] uppercase font-sans font-bold text-black">Chairman</p>
                        {cert.chairmanName && <p className="text-xs font-serif italic mt-1 text-[#3d2b1f]/80">({cert.chairmanName})</p>}
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="w-24 h-24 border-2 border-dotted border-[#b8860b]/30 rounded-full flex items-center justify-center -mb-4">
                            <p className="text-[7px] uppercase font-sans font-bold opacity-30 text-center leading-tight">Society<br />Common<br />Seal</p>
                        </div>
                    </div>

                    <div className="text-center flex flex-col items-center">
                        <div className="w-40 h-[1.5px] bg-[#3d2b1f] mb-2" />
                        <p className="text-[10px] uppercase font-sans font-bold text-black">Secretary / Treasurer</p>
                        {cert.secretaryName && <p className="text-xs font-serif italic mt-1 text-[#3d2b1f]/80">({cert.secretaryName})</p>}
                    </div>
                </footer>
            </div>
        </div>
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCertificate) {
                await api.put(`/certificates/${editingCertificate.id}`, null, {
                    params: {
                        unitId: formData.unitId,
                        memberName: formData.memberName,
                        startNo: formData.startNo,
                        count: formData.shares,
                        shareValue: formData.shareValue,
                        chairmanName: formData.chairmanName,
                        secretaryName: formData.secretaryName
                    }
                });
                alert("Share Certificate updated successfully!");
            } else {
                await api.post(`/certificates/generate`, null, {
                    params: {
                        unitId: formData.unitId,
                        memberName: formData.memberName,
                        startNo: formData.startNo,
                        count: formData.shares,
                        shareValue: formData.shareValue,
                        chairmanName: formData.chairmanName,
                        secretaryName: formData.secretaryName
                    }
                });
                alert("Share Certificate generated successfully!");
            }
            setShowModal(false);
            setEditingCertificate(null);
            fetchData();
        } catch (err) {
            console.error('Failed to save certificate:', err);
            const errorMsg = err.response?.data?.message || err.message || "Unknown error";
            alert(`Failed to save certificate: ${errorMsg}`);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this share certificate? This action cannot be undone.")) return;
        try {
            await api.delete(`/certificates/${id}`);
            fetchData();
            alert("Share Certificate deleted successfully!");
        } catch (err) {
            console.error('Failed to delete certificate:', err);
            const errorMsg = err.response?.data?.message || err.message || "Unknown error";
            alert(`Failed to delete certificate: ${errorMsg}`);
        }
    };

    const filteredCertificates = certificates.filter(cert =>
        (cert.unit?.unitNumber || cert.unit || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cert.memberName || cert.member || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cert.certificateNumber || cert.certNo || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="certificates-page">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Share Certificates</h1>
                    <p className="text-muted">Manage and issue statutory share certificates</p>
                </div>
                <button onClick={() => {
                    setEditingCertificate(null);
                    setFormData({
                        unitId: units.length > 0 ? units[0].id : '',
                        memberName: '',
                        shares: 10,
                        startNo: 1,
                        shareValue: 100,
                        chairmanName: '',
                        secretaryName: ''
                    });
                    setShowModal(true);
                }} className="btn btn-primary">
                    <Plus size={18} /> Issue Certificate
                </button>
            </header>

            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="glass-card flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary"><Award /></div>
                    <div>
                        <p className="text-sm text-muted">Total Certificates</p>
                        <h3 className="text-xl font-bold">{totalCertificates.toLocaleString()}</h3>
                    </div>
                </div>
                <div className="glass-card flex items-center gap-4">
                    <div className="p-3 bg-success/10 rounded-xl text-success"><FileCheck /></div>
                    <div>
                        <p className="text-sm text-muted">Shares Distributed</p>
                        <h3 className="text-xl font-bold">{totalShares.toLocaleString()}</h3>
                    </div>
                </div>
                <div className="glass-card flex items-center gap-4">
                    <div className="p-3 bg-secondary/10 rounded-xl text-secondary"><History /></div>
                    <div>
                        <p className="text-sm text-muted">Last Issued</p>
                        <h3 className="text-xl font-bold">{lastIssued}</h3>
                    </div>
                </div>
            </div>

            <div className="glass-card">
                <div className="flex justify-between items-center mb-6 px-2">
                    <h3 className="font-bold">Issued Certificates</h3>
                    <div className="flex gap-4">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                            <input
                                type="text"
                                placeholder="Search certificates..."
                                className="bg-glass border border-glass-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <table className="w-full text-left">
                    <thead>
                        <tr className="text-text-muted text-sm border-b border-glass-border">
                            <th className="pb-4 font-medium px-4">Unit</th>
                            <th className="pb-4 font-medium">Member Name</th>
                            <th className="pb-4 font-medium">Certificate No.</th>
                            <th className="pb-4 font-medium">Shares</th>
                            <th className="pb-4 font-medium">Share Value</th>
                            <th className="pb-4 font-medium">Total Value</th>
                            <th className="pb-4 font-medium text-right px-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCertificates.map((cert) => (
                            <tr key={cert.id} className="border-b border-glass-border/50 hover:bg-glass/50 transition-colors">
                                <td className="py-4 font-bold px-4">{cert.unit?.unitNumber || cert.unit}</td>
                                <td className="py-4 text-sm">{cert.memberName || cert.member}</td>
                                <td className="py-4 text-sm font-mono text-primary">{cert.certificateNumber || cert.certNo}</td>
                                <td className="py-4 text-sm">{cert.totalShares || cert.shares}</td>
                                <td className="py-4 text-sm">₹{cert.shareValue || 100}</td>
                                <td className="py-4 text-sm font-black text-primary">₹{((cert.totalShares || cert.shares) * (cert.shareValue || 100)).toLocaleString()}</td>
                                <td className="py-4 text-right px-4">
                                    <div className="flex justify-end items-center gap-2">
                                        <button
                                            onClick={() => handleDownload(cert.id)}
                                            className="p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors flex items-center gap-2 text-[10px] font-black uppercase whitespace-nowrap" title="Download PDF"
                                        >
                                            <Download size={14} /> View
                                        </button>
                                        <div className="relative group">
                                            <button className="p-2 hover:bg-surface-light text-muted rounded-lg transition-colors">
                                                <MoreVertical size={16} />
                                            </button>
                                            <div className="absolute right-0 top-full mt-1 w-40 bg-surface border border-glass-border rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 flex flex-col py-1 overflow-hidden">
                                                <button
                                                    onClick={() => setSelectedCert(cert)}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-surface-light flex items-center gap-3 text-muted hover:text-secondary transition-colors"
                                                >
                                                    <Award size={14} /> Preview
                                                </button>
                                                <button onClick={() => {
                                                    setEditingCertificate(cert);
                                                    setFormData({
                                                        unitId: cert.unit?.id || (units.length > 0 ? units[0].id : ''),
                                                        memberName: cert.memberName || '',
                                                        shares: cert.totalShares || 1,
                                                        startNo: cert.sharesFrom || 1,
                                                        shareValue: cert.shareValue || 100,
                                                        chairmanName: cert.chairmanName || '',
                                                        secretaryName: cert.secretaryName || ''
                                                    });
                                                    setShowModal(true);
                                                }} className="w-full px-4 py-2 text-left text-sm hover:bg-surface-light flex items-center gap-3 text-muted hover:text-primary transition-colors">
                                                    <Edit size={14} /> Edit
                                                </button>
                                                <div className="h-px bg-glass-border my-1"></div>
                                                <button onClick={() => handleDelete(cert.id)} className="w-full px-4 py-2 text-left text-sm hover:bg-error/10 flex items-center gap-3 text-error transition-colors">
                                                    <Trash2 size={14} /> Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Preview Modal */}
            <AnimatePresence>
                {selectedCert && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedCert(null)}
                            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative z-10 max-h-full overflow-y-auto"
                        >
                            <button
                                onClick={() => setSelectedCert(null)}
                                className="absolute -top-12 right-0 text-white hover:text-primary transition-colors flex items-center gap-2"
                            >
                                <X /> Close Preview
                            </button>
                            <CertificatePreview
                                cert={{
                                    certNo: selectedCert.certificateNumber || selectedCert.certNo,
                                    shares: selectedCert.totalShares || selectedCert.shares,
                                    range: (selectedCert.sharesFrom !== undefined && selectedCert.sharesTo !== undefined) ? `${selectedCert.sharesFrom}-${selectedCert.sharesTo}` : selectedCert.range,
                                    member: selectedCert.memberName || selectedCert.member,
                                    unit: selectedCert.unit?.unitNumber || selectedCert.unit,
                                    shareValue: selectedCert.shareValue || 100,
                                    chairmanName: selectedCert.chairmanName,
                                    secretaryName: selectedCert.secretaryName
                                }}
                                societyData={society}
                            />
                            <div className="mt-6 flex justify-center gap-4">
                                <button
                                    onClick={() => handleDownload(selectedCert.id)}
                                    className="btn btn-primary px-8"
                                >
                                    <Download size={18} /> Confirm & Download
                                </button>
                                <button onClick={() => window.print()} className="btn btn-outline bg-white/5">
                                    <Printer size={18} /> Print Directly
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Issue Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="glass-card w-full max-w-lg relative z-10"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">{editingCertificate ? 'Edit Share Certificate' : 'Issue New Share Certificate'}</h3>
                                <X className="cursor-pointer text-muted hover:text-white" onClick={() => setShowModal(false)} />
                            </div>
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div className="space-y-1">
                                    <label className="text-xs text-text-muted ml-1">Unit / Flat No.</label>
                                    <select
                                        className="w-full bg-glass border border-glass-border rounded-lg p-2 text-sm focus:outline-none focus:border-primary"
                                        value={formData.unitId}
                                        onChange={e => {
                                            const unit = units.find(u => u.id === e.target.value);
                                            setFormData({
                                                ...formData,
                                                unitId: e.target.value,
                                                memberName: unit ? unit.ownerName : ''
                                            });
                                        }}
                                        required
                                        disabled={loading}
                                    >
                                        <option value="">{loading ? 'Loading Units...' : 'Select Unit'}</option>
                                        {units.map(u => (
                                            <option key={u.id} value={u.id}>{u.unitNumber} - {u.ownerName || 'No Owner'}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-text-muted ml-1">Full Member Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-glass border border-glass-border rounded-lg p-2 text-sm focus:outline-none focus:border-primary"
                                        value={formData.memberName}
                                        onChange={e => setFormData({ ...formData, memberName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs text-text-muted ml-1">Shares</label>
                                        <input
                                            type="number"
                                            className="w-full bg-glass border border-glass-border rounded-lg p-2 text-sm focus:outline-none focus:border-primary"
                                            value={formData.shares}
                                            onChange={e => setFormData({ ...formData, shares: parseInt(e.target.value) })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-text-muted ml-1">Start No.</label>
                                        <input
                                            type="number"
                                            className="w-full bg-glass border border-glass-border rounded-lg p-2 text-sm focus:outline-none focus:border-primary"
                                            value={formData.startNo}
                                            onChange={e => setFormData({ ...formData, startNo: parseInt(e.target.value) })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-text-muted ml-1">Value per Share</label>
                                    <input
                                        type="number"
                                        className="w-full bg-glass border border-glass-border rounded-lg p-2 text-sm focus:outline-none focus:border-primary"
                                        value={formData.shareValue}
                                        onChange={e => setFormData({ ...formData, shareValue: parseFloat(e.target.value) })}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs text-text-muted ml-1">Chairman Name</label>
                                        <input
                                            type="text"
                                            className="w-full bg-glass border border-glass-border rounded-lg p-2 text-sm focus:outline-none focus:border-primary"
                                            value={formData.chairmanName}
                                            onChange={e => setFormData({ ...formData, chairmanName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-text-muted ml-1">Secretary Name</label>
                                        <input
                                            type="text"
                                            className="w-full bg-glass border border-glass-border rounded-lg p-2 text-sm focus:outline-none focus:border-primary"
                                            value={formData.secretaryName}
                                            onChange={e => setFormData({ ...formData, secretaryName: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <button type="submit" className="w-full btn btn-primary py-4 mt-8 shadow-lg shadow-primary/20">
                                        {editingCertificate ? 'Update Certificate' : 'Generate Certificate'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ShareCertificates;
