import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Award,
    Download,
    Plus,
    Search,
    History,
    X,
    Printer,
    FileCheck
} from 'lucide-react';

const ShareCertificates = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedCert, setSelectedCert] = useState(null);

    const certificates = [
        { id: 1, unit: 'A-201', member: 'Rahul Sharma', certNo: 'SOCIETRA/SC/001', shares: 10, range: '01-10', date: '12 Jan 2024' },
        { id: 2, unit: 'C-504', member: 'Priya Verma', certNo: 'SOCIETRA/SC/002', shares: 10, range: '11-20', date: '14 Jan 2024' },
        { id: 3, unit: 'B-1102', member: 'Amit Patel', certNo: 'SOCIETRA/SC/003', shares: 10, range: '21-30', date: '20 Jan 2024' },
    ];

    const CertificatePreview = ({ cert }) => (
        <div className="relative w-full max-w-2xl bg-[#fffcf0] border-[12px] border-[#d4af37] p-10 text-[#3d2b1f] shadow-2xl rounded-sm font-serif overflow-hidden">
            {/* Ornate Background Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#d4af37 1px, transparent 0)', backgroundSize: '20px 20px' }} />

            <div className="border-2 border-[#d4af37] p-8 relative">
                <header className="text-center mb-8">
                    <h4 className="text-xs tracking-[0.2em] uppercase text-[#8b6b23] mb-2 font-sans font-bold">Co-operative Housing Society Ltd.</h4>
                    <h2 className="text-4xl font-bold mb-1">SOCIETRA GARDENS CHS</h2>
                    <p className="text-[10px] italic">Regd. No. BOM/HSG/1234 OF 2024</p>
                </header>

                <div className="flex justify-between items-center mb-10 pb-4 border-b border-[#d4af37]/30">
                    <div>
                        <p className="text-[10px] uppercase font-sans font-bold text-[#8b6b23]">Certificate No.</p>
                        <p className="text-lg font-bold">{cert.certNo}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] uppercase font-sans font-bold text-[#8b6b23]">Shares</p>
                        <p className="text-lg font-bold">{cert.shares}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] uppercase font-sans font-bold text-[#8b6b23]">Distinctive Nos.</p>
                        <p className="text-lg font-bold">{cert.range}</p>
                    </div>
                </div>

                <div className="space-y-6 text-center mb-10">
                    <p className="text-lg">This is to certify that</p>
                    <h3 className="text-3xl font-bold border-b-2 border-dotted border-[#3d2b1f] inline-block px-4 pb-1">{cert.member}</h3>
                    <p className="text-lg mt-4">is the Registered Holder of shares in the above named Society, subject to the Bye-laws of the Society, attached to Unit:</p>
                    <p className="text-2xl font-bold underline">{cert.unit}</p>
                </div>

                <footer className="flex justify-between items-end mt-16 pt-10">
                    <div className="text-center">
                        <div className="w-24 h-0.5 bg-[#3d2b1f] mb-2" />
                        <p className="text-[10px] uppercase font-sans font-bold">Chairman</p>
                    </div>
                    <div className="text-center">
                        <div className="w-32 h-32 border-4 border-[#8b6b23]/20 rounded-full flex items-center justify-center mb-[-20px]">
                            <p className="text-[8px] uppercase font-sans font-bold opacity-30 text-center">Society<br />Common Seal</p>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="w-24 h-0.5 bg-[#3d2b1f] mb-2" />
                        <p className="text-[10px] uppercase font-sans font-bold">Secretary / Treasurer</p>
                    </div>
                </footer>
            </div>
        </div>
    );

    return (
        <div className="certificates-page">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Share Certificates</h1>
                    <p className="text-muted">Manage and issue statutory share certificates</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn btn-primary">
                    <Plus size={18} /> Issue Certificate
                </button>
            </header>

            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="glass-card flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary"><Award /></div>
                    <div>
                        <p className="text-sm text-muted">Total Certificates</p>
                        <h3 className="text-xl font-bold">184</h3>
                    </div>
                </div>
                <div className="glass-card flex items-center gap-4">
                    <div className="p-3 bg-success/10 rounded-xl text-success"><FileCheck /></div>
                    <div>
                        <p className="text-sm text-muted">Shares Distributed</p>
                        <h3 className="text-xl font-bold">1,840</h3>
                    </div>
                </div>
                <div className="glass-card flex items-center gap-4">
                    <div className="p-3 bg-secondary/10 rounded-xl text-secondary"><History /></div>
                    <div>
                        <p className="text-sm text-muted">Last Issued</p>
                        <h3 className="text-xl font-bold">20 Jan 2024</h3>
                    </div>
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="flex justify-between items-center mb-6 px-2">
                    <h3 className="font-bold">Issued Certificates</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                        <input
                            type="text"
                            className="bg-glass border border-glass-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary"
                            placeholder="Search by Unit or Name..."
                        />
                    </div>
                </div>

                <table className="w-full text-left">
                    <thead>
                        <tr className="text-text-muted text-sm border-b border-glass-border">
                            <th className="pb-4 font-medium px-4">Unit</th>
                            <th className="pb-4 font-medium">Member Name</th>
                            <th className="pb-4 font-medium">Certificate No.</th>
                            <th className="pb-4 font-medium">Shares</th>
                            <th className="pb-4 font-medium text-right px-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {certificates.map((cert) => (
                            <tr key={cert.id} className="border-b border-glass-border/50 hover:bg-glass/50 transition-colors">
                                <td className="py-4 font-bold px-4">{cert.unit}</td>
                                <td className="py-4 text-sm">{cert.member}</td>
                                <td className="py-4 text-sm font-mono text-primary">{cert.certNo}</td>
                                <td className="py-4 text-sm">{cert.shares} (Range: {cert.range})</td>
                                <td className="py-4 text-right px-4">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => setSelectedCert(cert)}
                                            className="p-2 hover:bg-glass rounded-lg text-muted hover:text-white transition-colors"
                                            title="Preview Certificate"
                                        >
                                            <Award size={18} />
                                        </button>
                                        <button className="p-2 hover:bg-glass rounded-lg text-muted hover:text-white transition-colors" title="Download PDF">
                                            <Download size={18} />
                                        </button>
                                        <button className="p-2 hover:bg-glass rounded-lg text-muted hover:text-white transition-colors" title="Print">
                                            <Printer size={18} />
                                        </button>
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
                            <CertificatePreview cert={selectedCert} />
                            <div className="mt-6 flex justify-center gap-4">
                                <button className="btn btn-primary px-8">
                                    <Download size={18} /> Confirm & Download
                                </button>
                                <button className="btn btn-outline bg-white/5">
                                    <Printer size={18} /> Print Directly
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Issue Modal Placeholder */}
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
                                <h3 className="text-xl font-bold">Issue New Share Certificate</h3>
                                <X className="cursor-pointer text-muted hover:text-white" onClick={() => setShowModal(false)} />
                            </div>
                            <form className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs text-text-muted ml-1">Wing/Building</label>
                                        <select className="w-full bg-glass border border-glass-border rounded-lg p-2 text-sm focus:outline-none focus:border-primary">
                                            <option>Select Wing</option>
                                            <option>Wing A</option>
                                            <option>Wing B</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-text-muted ml-1">Unit / Flat No.</label>
                                        <select className="w-full bg-glass border border-glass-border rounded-lg p-2 text-sm focus:outline-none focus:border-primary">
                                            <option>Select Unit</option>
                                            <option>201</option>
                                            <option>504</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-text-muted ml-1">Full Member Name (As per Sale Deed)</label>
                                    <input type="text" className="w-full bg-glass border border-glass-border rounded-lg p-2 text-sm focus:outline-none focus:border-primary" placeholder="Enter Full Name" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs text-text-muted ml-1">Number of Shares</label>
                                        <input type="number" defaultValue={10} className="w-full bg-glass border border-glass-border rounded-lg p-2 text-sm focus:outline-none focus:border-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-text-muted ml-1">Starting Distinctive No.</label>
                                        <input type="number" className="w-full bg-glass border border-glass-border rounded-lg p-2 text-sm focus:outline-none focus:border-primary" placeholder="e.g. 101" />
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <button type="submit" className="btn btn-primary w-full py-3">
                                        Generate Statutory Certificate
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
