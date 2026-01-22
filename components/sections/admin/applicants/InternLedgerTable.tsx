"use client";

import { useState, useMemo } from "react";
import { Applicant, PaymentRecord } from "@/lib/types/applicants";
import { 
  Trash2, CreditCard, DollarSign, Download, ChevronDown, 
  ChevronUp, CheckCircle2, XCircle, AlertCircle, FileText,
  User, Calendar, TrendingUp, Filter, Search, Printer
} from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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

  // Helper to parse duration into months
  const getMonthsCount = (duration: string = "1") => {
    const match = duration.match(/\d+/);
    return match ? parseInt(match[0]) : 1;
  };

  // Financial calculations for an applicant
  const getFinancials = (applicant: Applicant) => {
    const months = getMonthsCount(applicant.duration || "1");
    const rate = applicant.monthlyRate || 0; // Fallback to 0
    const totalDue = months * rate;
    
    // Ensure ledger matches months count
    const ledger = applicant.paymentLedger || [];
    const totalPaid = ledger.reduce((sum, p) => sum + (p.status === 'paid' ? (p.amount || rate) : 0), 0);
    const balance = totalDue - totalPaid;
    
    return { months, rate, totalDue, totalPaid, balance, ledger };
  };

  const filteredData = useMemo(() => {
    return applicants.filter(app => 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.internshipTitle || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [applicants, searchQuery]);

  const handleToggleMonth = async (applicant: Applicant, monthIndex: number, isPaid: boolean) => {
    const { ledger, rate } = getFinancials(applicant);
    const newLedger = [...ledger];
    
    // Find or create record for this month
    const existingIndex = newLedger.findIndex(p => p.month === monthIndex + 1);
    if (existingIndex > -1) {
      newLedger[existingIndex] = { 
        ...newLedger[existingIndex], 
        status: isPaid ? 'paid' : 'unpaid',
        date: isPaid ? new Date().toISOString() : undefined
      };
    } else {
      newLedger.push({
        month: monthIndex + 1,
        status: isPaid ? 'paid' : 'unpaid',
        amount: rate,
        date: isPaid ? new Date().toISOString() : undefined
      });
    }

    try {
      await onUpdatePayment(applicant.id, newLedger);
      toast.success(`Payment updated for Month ${monthIndex + 1}`);
    } catch (err) {
      toast.error("Failed to update ledger");
    }
  };

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
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/50 backdrop-blur-xl p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search ledger..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="rounded-2xl gap-2 h-11 border-slate-100 hover:bg-primary/5"
            onClick={handleExportPDF}
            disabled={isExporting}
          >
            {isExporting ? <TrendingUp className="animate-spin" size={18} /> : <Download size={18} />}
            {isExporting ? "Exporting..." : "Export Ledger"}
          </Button>
        </div>
      </div>

      {/* Ledger Table Container */}
      <div 
        id="ledger-table-container"
        className="w-full overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white/80 backdrop-blur-sm shadow-xl"
      >
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Intern Details</th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Opportunity</th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Payment Breakdown</th>
                <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Financial Ledger</th>
                <th className="px-6 py-5 border-b border-slate-100 w-[80px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map((app) => {
                const { months, rate, totalDue, totalPaid, balance, ledger } = getFinancials(app);
                
                return (
                  <tr key={app.id} className="group hover:bg-slate-50/50 transition-colors">
                    {/* Intern Detail */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-indigo-100 flex items-center justify-center border border-primary/10">
                          {app.avatarUrl && app.avatarUrl !== '/default-avatar.svg' ? (
                            <Image src={app.avatarUrl} alt={app.name} width={40} height={40} className="rounded-xl object-cover" />
                          ) : (
                            <User size={18} className="text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 leading-none mb-1">{app.name}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{app.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Opportunity */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="secondary" className="bg-violet-50 text-violet-600 border-none text-[10px] uppercase tracking-tighter px-1.5">
                            {app.internshipTitle || "Internship"}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Calendar size={10} /> {months} Month(s) Duration
                        </p>
                      </div>
                    </td>

                    {/* Payment Toggles */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2 items-center">
                        {Array.from({ length: months }).map((_, i) => {
                          const isPaid = ledger.some(p => p.month === i + 1 && p.status === 'paid');
                          return (
                            <TooltipProvider key={i}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className={cn(
                                    "flex items-center gap-2 px-2 py-1.5 rounded-xl border transition-all",
                                    isPaid ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-100"
                                  )}>
                                    <span className={cn(
                                      "text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-lg",
                                      isPaid ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                                    )}>M{i + 1}</span>
                                    <Switch 
                                      checked={isPaid} 
                                      onCheckedChange={(checked) => handleToggleMonth(app, i, checked)}
                                      className="data-[state=checked]:bg-emerald-500 scale-75 h-5 w-9"
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>Month {i + 1} Payment Status</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          );
                        })}
                      </div>
                    </td>

                    {/* Financial Ledger */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-end gap-1 text-right">
                        <div className="flex items-center gap-4 w-full justify-end">
                          <div className="space-y-0.5">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Paid</p>
                            <p className="text-sm font-black text-emerald-600">{totalPaid.toLocaleString()} XAF</p>
                          </div>
                          <div className="w-px h-6 bg-slate-100" />
                          <div className="space-y-0.5">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Balance</p>
                            <p className={cn(
                              "text-sm font-black",
                              balance > 0 ? "text-rose-500" : "text-slate-400"
                            )}>
                              {rate === 0 ? (
                                <span className="text-amber-500 text-[10px] animate-pulse">NO FEE SET</span>
                              ) : balance === 0 ? (
                                "CLEAR"
                              ) : (
                                `${balance.toLocaleString()} XAF`
                              )}
                            </p>
                          </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-1 bg-slate-100 rounded-full mt-2 overflow-hidden max-w-[150px]">
                          <div 
                            className="h-full bg-emerald-500 transition-all duration-1000"
                            style={{ width: `${totalDue > 0 ? Math.min((totalPaid / totalDue) * 100, 100) : 0}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          onClick={() => {
                            if(confirm(`Really delete ${app.name}? This removes their ledger permanently.`)) {
                              onDelete(app.id);
                            }
                          }}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredData.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
              <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-200">
                <Search size={40} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">No Ledger Data</h3>
                <p className="text-sm text-slate-400">Try adjusting your filters or search query.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-[2.5rem] text-white shadow-xl">
          <div className="flex items-center gap-3 mb-4 opacity-70">
            <DollarSign size={20} />
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Total Outstanding</h4>
          </div>
          <p className="text-3xl font-black">
            {filteredData.reduce((sum, app) => sum + getFinancials(app).balance, 0).toLocaleString()} <span className="text-sm font-medium opacity-50">XAF</span>
          </p>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-emerald-600">
            <CheckCircle2 size={20} />
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Collection Rate</h4>
          </div>
          <p className="text-3xl font-black text-slate-900">
            {(() => {
              const total = filteredData.reduce((sum, app) => sum + getFinancials(app).totalDue, 0);
              const paid = filteredData.reduce((sum, app) => sum + getFinancials(app).totalPaid, 0);
              return total > 0 ? Math.round((paid / total) * 100) : 0;
            })()}% 
            <span className="text-sm font-medium text-slate-400 ml-2 italic">of projected revenue</span>
          </p>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-primary">
            <TrendingUp size={20} />
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Active Contracts</h4>
          </div>
          <p className="text-3xl font-black text-slate-900">{filteredData.length}</p>
        </div>
      </div>
    </div>
  );
};
