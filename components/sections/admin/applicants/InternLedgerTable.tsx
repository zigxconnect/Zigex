"use client";

import { useState, useMemo, useCallback } from "react";
import { Applicant, PaymentRecord } from "@/lib/types/applicants";
import { 
  Trash2, DollarSign, Download, CheckCircle2, 
  User, Calendar, TrendingUp, Search, Briefcase,
  CreditCard, Wallet, PiggyBank,
  ArrowUpRight, Loader2, Info
} from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import html2pdf from "html2pdf.js";

interface InternLedgerTableProps {
  applicants: Applicant[];
  onUpdatePayment: (id: string, ledger: PaymentRecord[]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const InternLedgerTable = ({
  applicants,
  onUpdatePayment,
  onDelete,
}: InternLedgerTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [updatingPayments, setUpdatingPayments] = useState<Record<string, boolean>>({});

  const getMonthsCount = (duration: string = "1") => {
    const match = duration.match(/\d+/);
    return match ? parseInt(match[0]) : 1;
  };

  const getFinancials = useCallback((applicant: Applicant) => {
    const months = getMonthsCount(applicant.duration || "3");
    const rate = applicant.monthlyRate || 0;
    const totalDue = months * rate;
    const ledger = applicant.paymentLedger || [];
    const totalPaid = ledger.reduce((sum, p) => sum + (p.status === 'paid' ? (p.amount || rate) : 0), 0);
    const balance = totalDue - totalPaid;
    return { months, rate, totalDue, totalPaid, balance, ledger };
  }, []);

  const filteredData = useMemo(() => {
    return applicants.filter(app => 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.internshipTitle || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [applicants, searchQuery]);

  const handleToggleMonth = useCallback(async (applicant: Applicant, monthIndex: number, shouldBePaid: boolean) => {
    const paymentKey = `${applicant.id}-${monthIndex}`;
    if (updatingPayments[paymentKey]) return;
    
    setUpdatingPayments(prev => ({ ...prev, [paymentKey]: true }));
    
    try {
      const { ledger, rate } = getFinancials(applicant);
      const newLedger: PaymentRecord[] = [...ledger];
      const existingIndex = newLedger.findIndex(p => p.month === monthIndex + 1);
      
      if (existingIndex > -1) {
        newLedger[existingIndex] = { 
          ...newLedger[existingIndex], 
          status: shouldBePaid ? 'paid' : 'unpaid',
          date: shouldBePaid ? new Date().toISOString() : undefined
        };
      } else {
        newLedger.push({
          month: monthIndex + 1,
          status: shouldBePaid ? 'paid' : 'unpaid',
          amount: rate || 0,
          date: shouldBePaid ? new Date().toISOString() : undefined
        });
      }

      await onUpdatePayment(applicant.id, newLedger);
      toast.success(shouldBePaid ? `Month ${monthIndex + 1} marked as paid` : `Month ${monthIndex + 1} marked as unpaid`);
    } catch (err) {
      toast.error("Failed to update payment");
    } finally {
      setUpdatingPayments(prev => ({ ...prev, [paymentKey]: false }));
    }
  }, [getFinancials, onUpdatePayment, updatingPayments]);

  const handleExportPDF = () => {
    setIsExporting(true);
    const element = document.getElementById('ledger-table-container');
    if (!element) return;

    const opt = {
      margin: 10,
      filename: `Intern_Ledger_${format(new Date(), 'yyyy-MM-dd')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().from(element).set(opt).save().then(() => {
      setIsExporting(false);
      toast.success("Ledger exported as PDF");
    }).catch(() => setIsExporting(false));
  };

  const totals = useMemo(() => {
    const outstanding = filteredData.reduce((sum, app) => sum + getFinancials(app).balance, 0);
    const totalDue = filteredData.reduce((sum, app) => sum + getFinancials(app).totalDue, 0);
    const totalPaid = filteredData.reduce((sum, app) => sum + getFinancials(app).totalPaid, 0);
    return { outstanding, totalPaid, collectionRate: totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0 };
  }, [filteredData, getFinancials]);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-5 rounded-3xl border border-blue-100 shadow-xl shadow-blue-500/5">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search financial records..." 
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={handleExportPDF} disabled={isExporting} variant="outline" className="rounded-2xl h-12 border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white gap-2 px-6">
            {isExporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
            <span className="font-bold text-xs uppercase tracking-widest">Export Ledger</span>
          </Button>
        </div>

        <div id="ledger-table-container" className="w-full overflow-hidden rounded-[2.5rem] border border-blue-100 bg-white shadow-2xl shadow-blue-500/10">
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-blue-50/50">
                  <th className="px-6 py-6 text-left text-[10px] font-black text-blue-900/40 uppercase tracking-[0.2em] border-b border-blue-50">Intern Details</th>
                  <th className="px-6 py-6 text-left text-[10px] font-black text-blue-900/40 uppercase tracking-[0.2em] border-b border-blue-50">Opportunity</th>
                  <th className="px-6 py-6 text-left text-[10px] font-black text-blue-900/40 uppercase tracking-[0.2em] border-b border-blue-50">Payment Breakdown</th>
                  <th className="px-6 py-6 text-right text-[10px] font-black text-blue-900/40 uppercase tracking-[0.2em] border-b border-blue-50">Financials</th>
                  <th className="px-6 py-6 border-b border-blue-50 w-[80px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {filteredData.map((app) => {
                  const { months, rate, totalPaid, balance, ledger } = getFinancials(app);
                  return (
                    <tr key={app.id} className="group hover:bg-blue-50/20 transition-colors">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-lg shadow-blue-200">
                            {app.avatarUrl && app.avatarUrl !== '/default-avatar.svg' ? (
                              <Image src={app.avatarUrl} alt={app.name} width={44} height={44} className="rounded-[14px] object-cover h-full w-full" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white font-black text-sm">{app.name.charAt(0)}</div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 leading-none mb-1">{app.name}</p>
                            <p className="text-[11px] text-slate-400 font-medium">{app.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none text-[10px] font-black uppercase px-2 py-0.5">{app.internshipTitle || "Intern"}</Badge>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1"><Clock size={10}/> {months} Months</p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-2">
                          {Array.from({ length: months }).map((_, i) => {
                            const isPaid = ledger.some(p => p.month === i + 1 && p.status === 'paid');
                            const key = `${app.id}-${i}`;
                            const loading = updatingPayments[key];
                            return (
                              <Tooltip key={i}>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => handleToggleMonth(app, i, !isPaid)}
                                    disabled={loading}
                                    className={cn(
                                      "flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 transition-all group/btn",
                                      isPaid ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-50 border-slate-200 text-slate-400 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                                    )}
                                  >
                                    <span className={cn("text-[10px] font-black", isPaid ? "text-emerald-500" : "text-slate-300 group-hover/btn:text-blue-500")}>M{i + 1}</span>
                                    {loading ? <Loader2 size={12} className="animate-spin" /> : isPaid ? <CheckCircle2 size={14} /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-200 group-hover/btn:border-blue-200" />}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent className="text-[10px] font-bold">Month {i+1}: {isPaid ? 'PAID' : 'DUE'}</TooltipContent>
                              </Tooltip>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right whitespace-nowrap">
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Collected</p>
                              <p className="text-sm font-black text-emerald-600">{totalPaid.toLocaleString()} <span className="text-[10px]">XAF</span></p>
                            </div>
                            <div className="w-px h-6 bg-slate-100" />
                            <div className="text-right">
                              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Total Due</p>
                              <p className={cn("text-sm font-black", balance > 0 ? "text-rose-500" : "text-slate-900")}>
                                {rate === 0 ? <span className="text-amber-500">SET RATE</span> : balance === 0 ? "PAID" : `${balance.toLocaleString()} XAF`}
                              </p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-rose-500 hover:bg-rose-50" onClick={() => confirm(`Delete ledger for ${app.name}?`) && onDelete(app.id)}><Trash2 size={16} /></Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-800 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center"><PiggyBank size={24}/></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Total Outstanding</p>
                <p className="text-4xl font-black tabular-nums">{totals.outstanding.toLocaleString()}</p>
                <p className="text-xs font-bold opacity-40 uppercase mt-1">Pending Collection</p>
              </div>
            </div>
            <DollarSign className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-700" size={200} />
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-blue-100 shadow-xl shadow-blue-500/5 relative overflow-hidden group">
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600"><TrendingUp size={24}/></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Collection Rate</p>
                <p className="text-4xl font-black text-slate-900 tabular-nums">{totals.collectionRate}%</p>
                <div className="w-full h-2 bg-slate-100 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full" style={{ width: `${totals.collectionRate}%` }} />
                </div>
              </div>
            </div>
            <ArrowUpRight className="absolute -right-4 -top-4 opacity-[0.03] group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-700" size={150} />
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-blue-100 shadow-xl shadow-blue-500/5 relative overflow-hidden group">
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600"><Wallet size={24}/></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Active Contracts</p>
                <p className="text-4xl font-black text-slate-900 tabular-nums">{filteredData.length}</p>
                <p className="text-xs font-bold text-slate-400 uppercase mt-1">Hired Candidates</p>
              </div>
            </div>
            <Briefcase className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700" size={180} />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
