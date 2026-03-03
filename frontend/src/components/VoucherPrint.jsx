import React from 'react';
import { IndianRupee, Printer } from 'lucide-react';

const VoucherPrint = ({ transaction, society }) => {
    if (!transaction || !society) return null;

    const isCredit = transaction.type === 'Credit';
    const title = isCredit ? 'RECEIPT' : 'PAYMENT VOUCHER';

    return (
        <div id={`voucher-${transaction.id}`} className="print-only-voucher p-12 bg-white text-black border-2 border-dashed border-gray-400 max-w-4xl mx-auto my-8 hidden print:block">
            {/* Header */}
            <div className="text-center mb-10 border-b-2 border-black pb-6">
                <h1 className="text-4xl font-black uppercase tracking-widest">{society.name}</h1>
                <p className="text-sm font-bold uppercase mt-1 tracking-wider">{society.address}, {society.city} - {society.pincode}</p>
                <p className="text-xs font-bold mt-1">Reg No: {society.registrationNumber} | Email: {society.adminEmail}</p>
            </div>

            <div className="flex justify-between items-center mb-8">
                <div className="bg-black text-white px-6 py-2 font-black text-xl tracking-tighter">
                    {title}
                </div>
                <div className="text-right">
                    <p className="font-bold">No: <span className="font-mono">{transaction.voucherNumber}</span></p>
                    <p className="font-bold">Date: <span>{transaction.date}</span></p>
                </div>
            </div>

            {/* Body */}
            <div className="grid grid-cols-12 gap-y-6 text-lg">
                <div className="col-span-3 font-bold uppercase text-sm self-center">Received From / Paid To:</div>
                <div className="col-span-9 border-b border-black pb-1 font-bold text-xl">
                    {transaction.payeePayerName || 'N/A'}
                    {transaction.unitName && <span className="text-sm font-normal ml-3"> (Unit: {transaction.unitName})</span>}
                </div>

                <div className="col-span-3 font-bold uppercase text-sm self-center">For / Purpose:</div>
                <div className="col-span-9 border-b border-black pb-1 italic">{transaction.description}</div>

                <div className="col-span-3 font-bold uppercase text-sm self-center">The Sum of Rupees:</div>
                <div className="col-span-9 border-b border-black pb-1 font-bold">{transaction.amount.toLocaleString('en-IN')} Only</div>
            </div>

            <div className="mt-12 flex justify-between items-end">
                <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-gray-100 p-4 border-2 border-black rounded">
                        <span className="font-black text-2xl"><IndianRupee size={24} /></span>
                        <span className="font-black text-3xl">{transaction.amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="text-xs font-bold uppercase space-y-1">
                        <p>Mode: {transaction.paymentMode || 'Cash'}</p>
                        {transaction.transactionReference && <p>Ref: {transaction.transactionReference}</p>}
                    </div>
                </div>

                <div className="text-center border-t-2 border-black pt-2 w-48">
                    <p className="text-sm font-black uppercase tracking-widest">Authorized Signatory</p>
                    <p className="text-[10px] font-bold text-gray-500 mt-1">Society Management System</p>
                </div>
            </div>

            <div className="mt-16 text-center text-[10px] font-bold text-gray-400 italic">
                This is a computer-generated {title.toLowerCase()}. No signature required for validation.
            </div>
        </div>
    );
};

export default VoucherPrint;
