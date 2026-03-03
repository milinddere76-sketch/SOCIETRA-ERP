import React from 'react';
import { IndianRupee } from 'lucide-react';

const BillPrint = ({ bill, society }) => {
    if (!bill || !society) return null;

    return (
        <div id={`bill-${bill.id}`} className="relative p-8 bg-white text-black border shadow-sm max-w-4xl mx-auto my-4 print:m-0 print:shadow-none print:border-none overflow-hidden">
            {bill.status === 'PAID' && (
                <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-15 pointer-events-none transform -rotate-[35deg] text-[10rem] font-black text-green-600 z-0 border-[1.5rem] border-green-600 px-12 py-4 rounded-[4rem] tracking-widest">
                    PAID
                </div>
            )}
            {/* Header */}
            <div className="text-center mb-6 border-b-2 border-primary pb-4">
                <h1 className="text-3xl font-black uppercase text-primary">{society.name}</h1>
                <p className="text-xs font-bold uppercase mt-1">Reg No: {society.registrationNumber}</p>
                <p className="text-xs">{society.address}, {society.city} - {society.pincode}</p>
                <p className="text-xs">Contact: {society.adminMobile} | ID: {society.adminEmail}</p>
            </div>

            <h2 className="relative z-10 text-center text-xl font-black bg-gray-100 py-2 mb-6 border-y border-black uppercase tracking-widest">{bill.status === 'PAID' ? 'Maintenance Receipt' : 'Maintenance Bill'}</h2>

            <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="space-y-1">
                    <p className="text-sm font-bold">To,</p>
                    <p className="text-lg font-black">{bill.memberHouseName || 'Member / Resident'}</p>
                    <p className="text-md font-bold text-primary">Unit No: {bill.unit || 'N/A'}</p>
                </div>
                <div className="text-right space-y-1">
                    <p className="text-sm"><span className="font-bold">Bill No:</span> {bill.invoiceNo}</p>
                    <p className="text-sm"><span className="font-bold">Bill Date:</span> {bill.date || '---'}</p>
                    <p className="text-sm font-black text-rose-600"><span className="font-bold">Due Date:</span> {bill.dueDate || '---'}</p>
                </div>
            </div>

            {/* Bill Details Table */}
            <table className="w-full border-collapse border border-black mb-8">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-black px-4 py-2 text-left">Sr.</th>
                        <th className="border border-black px-4 py-2 text-left">Description of Charges</th>
                        <th className="border border-black px-4 py-2 text-right">Amount (₹)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border-x border-black px-4 py-1.5 text-center">1</td>
                        <td className="border-x border-black px-4 py-1.5 font-bold">Repairs and Maintenance</td>
                        <td className="border-x border-black px-4 py-1.5 text-right font-mono font-bold">{bill.repairsAndMaintenance?.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td className="border-x border-black px-4 py-1.5 text-center">2</td>
                        <td className="border-x border-black px-4 py-1.5 font-bold">Sinking Fund Contribution</td>
                        <td className="border-x border-black px-4 py-1.5 text-right font-mono">{bill.sinkingFund?.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td className="border-x border-black px-4 py-1.5 text-center">3</td>
                        <td className="border-x border-black px-4 py-1.5">Service Charges (fixed)</td>
                        <td className="border-x border-black px-4 py-1.5 text-right font-mono">{bill.serviceCharges?.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td className="border-x border-black px-4 py-1.5 text-center">4</td>
                        <td className="border-x border-black px-4 py-1.5">Common Utility Charges</td>
                        <td className="border-x border-black px-4 py-1.5 text-right font-mono">{bill.commonUtilityCharges?.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td className="border-x border-black px-4 py-1.5 text-center">5</td>
                        <td className="border-x border-black px-4 py-1.5">Statutory Fees / Taxes</td>
                        <td className="border-x border-black px-4 py-1.5 text-right font-mono">{bill.statutoryFees?.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td className="border-x border-black px-4 py-1.5 text-center">6</td>
                        <td className="border-x border-black px-4 py-1.5">Parking Charges</td>
                        <td className="border-x border-black px-4 py-1.5 text-right font-mono">{bill.parkingCharges?.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td className="border-x border-black px-4 py-1.5 text-center">7</td>
                        <td className="border-x border-black px-4 py-1.5">Miscellaneous / Other Charges</td>
                        <td className="border-x border-black px-4 py-1.5 text-right font-mono">{(bill.miscellaneousCharges + bill.otherCharges)?.toFixed(2)}</td>
                    </tr>
                    <tr className="bg-gray-50 italic">
                        <td className="border border-black px-4 py-2 text-center" colSpan="2">Previous Dues (Outstanding Payment)</td>
                        <td className="border border-black px-4 py-2 text-right font-mono">{bill.previousDues?.toFixed(2)}</td>
                    </tr>
                    {bill.interestAmount > 0 && (
                        <tr className="bg-gray-50 italic">
                            <td className="border border-black px-4 py-2 text-center" colSpan="2">Interest on Dues</td>
                            <td className="border border-black px-4 py-2 text-right font-mono">{bill.interestAmount?.toFixed(2)}</td>
                        </tr>
                    )}
                    <tr className="bg-black text-white">
                        <td className="border border-black px-4 py-3 text-center font-black text-lg" colSpan="2">TOTAL PAYABLE AMOUNT</td>
                        <td className="border border-black px-4 py-3 text-right font-mono font-black text-xl">₹{bill.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                </tbody>
            </table>

            <div className="grid grid-cols-2 gap-8 mt-12 items-end">
                <div className="text-[10px] space-y-1">
                    <p className="font-bold uppercase">* IMPORTANT NOTICE *</p>
                    <p>1. Please pay by due date to avoid interest @ 21% p.a.</p>
                    <p>2. Cheques to be drawn in favor of "{society.name}"</p>
                    <p>3. This is a computer generated invoice and does not require a seal.</p>
                </div>
                <div className="flex flex-col items-center justify-center space-y-2 text-center col-span-2 md:col-span-1 mx-auto mt-4 border-t border-black pt-4">
                    {society.paymentQrCode ? (
                        <>
                            <p className="text-[10px] font-black uppercase">Scan to Pay Maintenance</p>
                            <img src={society.paymentQrCode} alt="Society Payment QR" className="w-24 h-24 object-contain border border-gray-300 p-1 rounded-lg" />
                            {society.paymentUpiId && <p className="text-[9px] font-mono">{society.paymentUpiId}</p>}
                        </>
                    ) : (
                        <p className="text-[9px] text-gray-500 italic px-8">Society has not configured online payment QR code.</p>
                    )}
                </div>

                <div className="text-center col-span-2 mt-4 pt-4">
                    <div className="w-40 h-1 border-b border-black mx-auto mb-2"></div>
                    <p className="text-xs font-black uppercase">Honorary Treasurer / Secretary</p>
                    <p className="text-[9px] text-gray-500">{society.name}</p>
                </div>
            </div>
        </div>
    );
};

export default BillPrint;
