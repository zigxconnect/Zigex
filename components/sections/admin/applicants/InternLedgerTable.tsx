"use client";

import { useState, useMemo, useCallback } from "react";
import { Applicant, PaymentRecord } from "@/lib/types/applicants";
import { 
  Trash2, DollarSign, Download, CheckCircle2, 
  User, Calendar, TrendingUp, Search, Briefcase,
  CreditCard, Wallet, PiggyBank, FileSpreadsheet,
  ArrowUpRight, Loader2, Info, Clock, AlertCircle,
  FileJson, ChevronRight, X,
  ShieldCheck
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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
  
  // Custom Modal State
  const [isAmountModalOpen, setIsAmountModalOpen] = useState(false);
  const [modalContext, setModalContext] = useState<{ applicant: Applicant, monthIndex: number } | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("50000");

  // Helper to parse duration into months
  const getMonthsCount = (duration: string = "1") => {
    const match = duration.match(/\d+/);
    return match ? parseInt(match[0]) : 1;
  };

  const getFinancials = useCallback((applicant: Applicant) => {
    const months = getMonthsCount(applicant.duration || "3");
    const rate = applicant.monthlyRate || 0;
    const ledger = applicant.paymentLedger || [];
    
    // Total amount actually received (sum of individual month amounts)
    const totalPaid = ledger.reduce((sum, p) => sum + (p.status === 'paid' ? (p.amount ?? rate) : 0), 0);
    
    // Total Contract Value: Standard rate multiplied by months
    const totalContractValue = months * rate;
    
    // Balance is the difference between what they should pay total and what they have paid
    const balance = totalContractValue > 0 ? Math.max(0, totalContractValue - totalPaid) : 0;
    
    return { months, rate, totalDue: totalContractValue, totalPaid, balance, ledger };
  }, []);

  const filteredData = useMemo(() => {
    return applicants.filter(app => 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.internshipTitle || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [applicants, searchQuery]);

  // Refined toggle handler with custom modal support
  const handleToggleMonth = useCallback(async (applicant: Applicant, monthIndex: number, shouldBePaid: boolean) => {
    const paymentKey = `${applicant.id}-${monthIndex}`;
    if (updatingPayments[paymentKey]) return;
    
    const { rate } = getFinancials(applicant);

    // If rate is 0 and we are marking as paid, open the nice custom modal
    if (shouldBePaid && rate <= 0) {
      setModalContext({ applicant, monthIndex });
      setCustomAmount("50000"); // Standard default
      setIsAmountModalOpen(true);
      return;
    }

    // Direct toggle for existing rates or revocation
    performUpdate(applicant, monthIndex, shouldBePaid, rate);
  }, [getFinancials, updatingPayments]);

  const performUpdate = async (applicant: Applicant, monthIndex: number, shouldBePaid: boolean, amount: number) => {
    const paymentKey = `${applicant.id}-${monthIndex}`;
    setUpdatingPayments(prev => ({ ...prev, [paymentKey]: true }));
    
    try {
      const { ledger } = getFinancials(applicant);
      const newLedger: PaymentRecord[] = [...ledger];
      const existingIndex = newLedger.findIndex(p => p.month === monthIndex + 1);
      
      const newRecord: PaymentRecord = {
        month: monthIndex + 1,
        status: shouldBePaid ? 'paid' : 'unpaid',
        amount: amount,
        date: shouldBePaid ? new Date().toISOString() : undefined
      };

      if (existingIndex > -1) {
        newLedger[existingIndex] = newRecord;
      } else {
        newLedger.push(newRecord);
      }

      await onUpdatePayment(applicant.id, newLedger);
      
      toast.success(
        shouldBePaid 
          ? `Month ${monthIndex + 1} marked as PAID (${amount.toLocaleString()} XAF)` 
          : `Month ${monthIndex + 1} marked as UNPAID`,
        { 
          description: applicant.name,
          icon: shouldBePaid ? <CheckCircle2 className="text-blue-500" /> : <Clock className="text-slate-400" /> 
        }
      );
    } catch (err) {
      console.error("Payment update failed:", err);
      toast.error("Process Halted", { description: "Synchronization with server failed." });
    } finally {
      setUpdatingPayments(prev => ({ ...prev, [paymentKey]: false }));
    }
  };

  const handleModalSubmit = () => {
    if (!modalContext) return;
    const amount = parseInt(customAmount) || 0;
    performUpdate(modalContext.applicant, modalContext.monthIndex, true, amount);
    setIsAmountModalOpen(false);
    setModalContext(null);
  };

  const handleExportCSV = () => {
    const headers = ["Full Name", "Email", "Internship", "Months", "Monthly Rate", "Total Paid", "Balance", "Payment History"];
    const rows = filteredData.map(app => {
      const labs = getFinancials(app);
      const history = (app.paymentLedger || [])
        .map(p => `Month ${p.month}: ${p.amount} XAF (${p.status})`)
        .join(" | ");
      
      return [
        `"${app.name}"`,
        `"${app.email}"`,
        `"${app.internshipTitle}"`,
        labs.months,
        labs.rate,
        labs.totalPaid,
        labs.balance,
        `"${history}"`
      ];
    });

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Zigex_Financial_Ledger_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Ledger downloaded successfully");
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    const element = document.getElementById('ledger-table-container');
    if (!element) return;

    try {
      // @ts-ignore
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin: 10,
        filename: `Zigex_Intern_Ledger_${format(new Date(), 'yyyy-MM-dd')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      };
      await html2pdf().from(element).set(opt).save();
      setIsExporting(false);
      toast.success("PDF record generated");
    } catch (error) {
      setIsExporting(false);
      toast.error("Export failed");
    }
  };

  const totals = useMemo(() => {
    // Total amount actually received
    const totalCollected = filteredData.reduce((sum, app) => sum + getFinancials(app).totalPaid, 0);
    // Total amount expected (Projected)
    const totalExpected = filteredData.reduce((sum, app) => sum + getFinancials(app).totalDue, 0);
    // Net outstanding
    const outstanding = filteredData.reduce((sum, app) => sum + getFinancials(app).balance, 0);
    
    // Efficiency calculation (Projected Collection vs Actual)
    const collectionRate = totalExpected > 0 
      ? Math.round((totalCollected / totalExpected) * 100) 
      : (totalCollected > 0 ? 100 : 0);

    return { outstanding, totalCollected, totalExpected, collectionRate };
  }, [filteredData, getFinancials]);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Top Control Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-5 rounded-3xl border border-blue-100 shadow-xl shadow-blue-500/5">
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search by intern name or email..." 
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleExportCSV} variant="outline" className="rounded-2xl h-12 border-blue-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 gap-2 px-6 font-bold shadow-sm transition-all active:scale-95">
                <FileSpreadsheet size={18} />
                <span className="uppercase tracking-widest text-[10px]">CSV Export</span>
              </Button>
              <Button onClick={handleExportPDF} disabled={isExporting} className="rounded-2xl h-12 bg-blue-600 hover:bg-blue-700 text-white gap-2 px-6 font-bold shadow-sm transition-all active:scale-95">
                {isExporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                <span className="uppercase tracking-widest text-[10px]">PDF Summary</span>
              </Button>
            </div>
          </div>

        {/* Ledger Table Container */}
        <div id="ledger-table-container" className="w-full overflow-hidden rounded-[2.5rem] border border-blue-100 bg-white shadow-2xl shadow-blue-500/10">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-blue-50/30 backdrop-blur-sm">
                  <th className="px-6 py-6 text-left text-[10px] font-black text-blue-900/40 uppercase tracking-[0.2em] border-b border-blue-50">Intern Identification</th>
                  <th className="px-6 py-6 text-left text-[10px] font-black text-blue-900/40 uppercase tracking-[0.2em] border-b border-blue-50">Program Info</th>
                  <th className="px-6 py-6 text-center text-[10px] font-black text-blue-900/40 uppercase tracking-[0.2em] border-b border-blue-50">Monthly Payment Status</th>
                  <th className="px-6 py-6 text-right text-[10px] font-black text-blue-900/40 uppercase tracking-[0.2em] border-b border-blue-50">Balance Sheet</th>
                  <th className="px-6 py-6 border-b border-blue-50 w-[80px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                <AnimatePresence mode="popLayout">
                  {filteredData.map((app, appIdx) => {
                    const { months, rate, totalDue, totalPaid, balance, ledger } = getFinancials(app);
                    return (
                      <motion.tr 
                        key={app.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: appIdx * 0.05 }}
                        className="group hover:bg-blue-50/20 transition-colors"
                      >
                        {/* ID Column */}
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-0.5 shadow-lg shadow-blue-200">
                                {app.avatarUrl && app.avatarUrl !== '/default-avatar.svg' ? (
                                  <Image src={app.avatarUrl} alt={app.name} width={48} height={48} className="rounded-[14px] object-cover h-full w-full" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-white font-black text-base">{app.name.charAt(0)}</div>
                                )}
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg bg-white shadow-sm border border-blue-50 flex items-center justify-center">
                                <CheckCircle2 size={10} className={cn(balance === 0 ? "text-emerald-500" : "text-slate-300")} />
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900 leading-none mb-1 group-hover:text-blue-600 transition-colors">{app.name}</p>
                              <p className="text-[11px] text-slate-400 font-medium">{app.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Program Column */}
                        <td className="px-6 py-5">
                          <div className="space-y-1.5">
                            <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-none text-[10px] font-black uppercase px-2.5 py-1 rounded-lg">
                              {app.internshipTitle || "Professional Intern"}
                            </Badge>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                              <Calendar size={12} className="text-blue-400" />
                              {months} Months Engagement
                            </p>
                          </div>
                        </td>

                        {/* Toggles Column */}
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-center gap-3">
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
                                          "relative flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-full border-2 transition-all duration-300 group/toggle shadow-sm",
                                          isPaid 
                                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700 w-[84px]" 
                                            : "bg-slate-50 border-slate-200 text-slate-400 w-[84px] hover:border-blue-200 hover:bg-white"
                                        )}
                                      >
                                        <span className={cn(
                                          "text-[10px] font-black tracking-tighter transition-colors",
                                          isPaid ? "text-blue-600" : "text-slate-400 group-toggle-hover:text-blue-500"
                                        )}>M{i + 1}</span>
                                        
                                        <div className={cn(
                                          "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm",
                                          isPaid ? "bg-blue-600 text-white ml-auto" : "bg-white border-2 border-slate-200 text-slate-200 ml-auto"
                                        )}>
                                          {loading ? (
                                            <Loader2 size={12} className="animate-spin text-inherit" />
                                          ) : isPaid ? (
                                            <CheckCircle2 size={14} />
                                          ) : (
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                          )}
                                        </div>
                                      </button>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-slate-900 text-white border-none rounded-xl p-3 shadow-2xl">
                                    <div className="space-y-1">
                                      <p className="text-xs font-black uppercase text-blue-400">Month {i+1} Payment</p>
                                      <p className="text-sm font-bold">{isPaid ? 'Payment Confirmed' : 'Payment Outstanding'}</p>
                                      {rate > 0 && <p className="text-[10px] opacity-60">Expected: {rate.toLocaleString()} XAF</p>}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              );
                            })}
                          </div>
                        </td>

                        {/* Financials Column */}
                        <td className="px-6 py-5 text-right whitespace-nowrap">
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Received</p>
                                <div className="flex items-center gap-1.5 justify-end">
                                  <span className="text-sm font-black text-blue-600 tabular-nums">{totalPaid.toLocaleString()}</span>
                                  <span className="text-[9px] font-bold text-slate-400">XAF</span>
                                </div>
                              </div>
                              <div className="w-px h-8 bg-blue-50" />
                              <div className="text-right">
                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Balance</p>
                                <div className="flex items-center gap-1.5 justify-end">
                                  <span className={cn(
                                    "text-sm font-black tabular-nums",
                                    rate === 0 && totalPaid === 0 ? "text-amber-500" : balance > 0 ? "text-blue-500" : "text-blue-600"
                                  )}>
                                    {rate === 0 && totalPaid === 0 ? "NO RATE" : balance <= 0 ? "SETTLED" : `${balance.toLocaleString()}`}
                                  </span>
                                  {balance > 0 && <span className="text-[9px] font-bold text-slate-400">XAF</span>}
                                </div>
                              </div>
                            </div>
                            <div className="w-full max-w-[120px] h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-500" 
                                style={{ width: `${totalDue > 0 ? Math.min((totalPaid / totalDue) * 100, 100) : (totalPaid > 0 ? 100 : 0)}%` }} 
                              />
                            </div>
                          </div>
                        </td>

                        {/* Actions Column */}
                        <td className="px-6 py-5 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-10 w-10 p-0 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all active:scale-90" 
                            onClick={() => confirm(`Permanently remove ${app.name} from financial tracking?`) && onDelete(app.id)}
                          >
                            <Trash2 size={18} />
                          </Button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-indigo-700 to-blue-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden group"
          >
            <div className="relative z-10 space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-inner"><TrendingUp size={28}/></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100 mb-1">Actual Collections</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black tabular-nums">{totals.totalCollected.toLocaleString()}</span>
                  <span className="text-lg font-bold opacity-40">XAF</span>
                </div>
                <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-blue-100/60 uppercase">
                  <CheckCircle2 size={12} />
                  Net received to date
                </div>
              </div>
            </div>
            <ArrowUpRight className="absolute -right-8 -bottom-8 opacity-[0.05] group-hover:scale-110 transition-transform duration-1000" size={200} />
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-[2.5rem] border border-blue-100 shadow-xl shadow-blue-500/5 relative overflow-hidden group"
          >
            <div className="relative z-10 space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 shadow-inner"><PiggyBank size={28}/></div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Recovery Required</p>
                  <Tooltip>
                    <TooltipTrigger><Info size={12} className="text-slate-300" /></TooltipTrigger>
                    <TooltipContent className="bg-slate-900 text-white max-w-[200px] rounded-xl text-[10px] p-2">
                      Total outstanding debt based on contract values.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-rose-600 tabular-nums">{totals.outstanding.toLocaleString()}</span>
                  <span className="text-lg font-bold text-slate-400">XAF</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full mt-4 overflow-hidden shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${totals.collectionRate}%` }}
                    className="h-full bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full shadow-lg" 
                  />
                </div>
              </div>
            </div>
            <Clock className="absolute -right-4 -top-4 opacity-[0.03] group-hover:translate-x-3 group-hover:-translate-y-3 transition-transform duration-1000" size={150} />
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-[2.5rem] border border-blue-100 shadow-xl shadow-blue-500/5 relative overflow-hidden group"
          >
            <div className="relative z-10 space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner"><DollarSign size={28}/></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Projected Asset Value</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-slate-900 tabular-nums">{totals.totalExpected.toLocaleString()}</span>
                  <span className="text-lg font-bold text-slate-400 decoration-blue-500/30">XAF</span>
                </div>
                <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-slate-400 uppercase">
                  <TrendingUp size={12} className="text-blue-500" />
                  Total Contractual Worth
                </div>
              </div>
            </div>
            <ShieldCheck className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000" size={180} />
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-[2.5rem] border border-blue-100 shadow-xl shadow-blue-500/5 relative overflow-hidden group"
          >
            <div className="relative z-10 space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner"><Wallet size={28}/></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Workforce Load</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-slate-900 tabular-nums">{filteredData.length}</span>
                  <span className="text-lg font-bold text-slate-400 underline decoration-blue-500/30 decoration-4">Nodes</span>
                </div>
                <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-slate-400 uppercase">
                  <Briefcase size={12} className="text-blue-500" />
                  Active Billing Accounts
                </div>
              </div>
            </div>
            <Briefcase className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000" size={180} />
          </motion.div>
        </div>
      </div>
      
      {/* Set Amount Dialog */}
      <Dialog open={isAmountModalOpen} onOpenChange={setIsAmountModalOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 text-white relative">
            <div className="relative z-10">
              <DialogTitle className="text-xl font-black mb-1 text-white">Set Month Payment</DialogTitle>
              <DialogDescription className="text-blue-200 text-xs font-medium">Recording collection for {modalContext?.applicant.name}</DialogDescription>
            </div>
            <DollarSign className="absolute -right-4 -bottom-4 text-white/10" size={120} />
          </div>
          
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Amount (XAF)</Label>
              <div className="relative">
                <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <Input
                  id="amount"
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white text-lg font-black tabular-nums transition-all"
                  autoFocus
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="ghost" 
                onClick={() => setIsAmountModalOpen(false)}
                className="flex-1 h-14 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 uppercase text-[10px] tracking-widest"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleModalSubmit}
                className="flex-[2] h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-indigo-200"
              >
                Log Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};
