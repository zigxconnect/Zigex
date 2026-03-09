"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Applicant, PaymentRecord } from "@/lib/types/applicants";
import {
  Trash2, DollarSign, Download, CheckCircle2,
  User, Calendar, TrendingUp, Search, Briefcase,
  CreditCard, Wallet, PiggyBank, FileSpreadsheet,
  ArrowUpRight, Loader2, Info, Clock, AlertCircle,
  FileJson, ChevronRight, X,
  ShieldCheck, Sparkles, Target, Landmark, Building2,
  Receipt, ArrowDownLeft, KeyRound, History, Tag,
  ArrowUpDown, Pencil, ArrowUp, ArrowDown,
  Eye, EyeOff
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface ExpenseRecord {
  id: string;
  amount: number;
  reason: string;
  created_at: string;
}

interface InternLedgerTableProps {
  applicants: Applicant[];
  onUpdatePayment: (id: string, ledger: PaymentRecord[]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  companyId?: string;
}

export const InternLedgerTable = ({
  applicants,
  onUpdatePayment,
  onDelete,
  companyId
}: InternLedgerTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingPayments, setUpdatingPayments] = useState<Record<string, boolean>>({});

  // Expenses & Withdrawals State
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isExpensesAuditOpen, setIsExpensesAuditOpen] = useState(false);
  const [withdrawData, setWithdrawData] = useState({ id: "", amount: "", reason: "", pin: "" });
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "last_payment" | "debt">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Payment Modal State
  const [isAmountModalOpen, setIsAmountModalOpen] = useState(false);
  const [modalContext, setModalContext] = useState<{ applicant: Applicant, monthIndex: number } | null>(null);
  const [paymentType, setPaymentType] = useState<'completed' | 'advance'>('completed');
  const [customAmount, setCustomAmount] = useState<string>("50000");

  // Fetch Expenses Audit
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const resp = await fetch('/api/admin/finance/withdraw');
        if (resp.ok) {
          const data = await resp.json();
          setExpenses(data.expenses || []);
        }
      } catch (err) {
        console.error("Failed to fetch expenses", err);
      }
    };
    fetchExpenses();
  }, []);

  /**
   * Financial Intelligence Engine
   */
  const getFinancials = useCallback((applicant: Applicant) => {
    const match = (applicant.duration || "3").match(/\d+/);
    const months = match ? parseInt(match[0]) : 3;
    const rate = applicant.monthlyRate || 0;
    const ledger = applicant.paymentLedger || [];

    // 1. Realized Revenue
    const totalPaid = ledger.reduce((sum, p) => sum + (p.status === 'paid' ? (p.amount ?? rate) : 0), 0);

    // 2. Maximum Contract Value (Projected)
    const totalContractValue = months * rate;

    // 3. Time Accrual
    const startDate = new Date(applicant.appliedDate);
    const today = new Date();
    const monthsElapsed = Math.min(
      months,
      Math.max(1, (today.getFullYear() - startDate.getFullYear()) * 12 + (today.getMonth() - startDate.getMonth()) + 1)
    );

    // 4. Expected Revenue to Date (Accrued)
    const accruedDue = monthsElapsed * rate;

    // 5. Arrears & Balance
    const debt = Math.max(0, accruedDue - totalPaid);
    const remainingBalance = Math.max(0, totalContractValue - totalPaid);

    return {
      months,
      rate,
      totalDue: totalContractValue,
      totalPaid,
      accruedDue,
      debt,
      remainingBalance,
      ledger,
      remainingBalance,
      ledger,
      isOverdue: debt > 0,
      monthsElapsed
    };
  }, []);

  const sortedData = useMemo(() => {
    let base = applicants.filter(app =>
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.school || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.domain || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    return base.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === "last_payment") {
        const getLastDate = (app: Applicant) => {
          const payments = (app.paymentLedger || []).filter(p => p.status === 'paid' && p.date);
          if (payments.length === 0) return 0;
          return Math.max(...payments.map(p => new Date(p.date!).getTime()));
        };
        comparison = getLastDate(a) - getLastDate(b);
      } else if (sortBy === "debt") {
        comparison = getFinancials(a).debt - getFinancials(b).debt;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [applicants, searchQuery, sortBy, sortOrder, getFinancials]);

  // High-Level Aggregate Stats
  const totals = useMemo(() => {
    const records = sortedData.map(app => getFinancials(app));

    const totalCollected = records.reduce((sum, r) => sum + r.totalPaid, 0);
    // Calculated Expected Income based on number of students (20,000 per month)
    const expectedIncome = records.reduce((sum, r) => sum + (r.months * 20000), 0);
    const totalArrears = records.reduce((sum, r) => sum + r.debt, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Current Liquid Balance = Income - Expenses
    const currentBalance = totalCollected - totalExpenses;

    const collectionEfficiency = expectedIncome > 0
      ? Math.round((totalCollected / expectedIncome) * 100)
      : 100;

    return {
      totalCollected,
      expectedIncome,
      totalArrears,
      totalExpenses,
      currentBalance,
      collectionEfficiency,
      count: sortedData.length,
      paidCount: records.filter(r => r.debt === 0 && r.totalPaid > 0).length,
      departmentStats: Array.from(new Set(applicants.map(a => a.domain || "Other"))).map(dept => {
        const deptApps = sortedData.filter(a => (a.domain || "Other") === dept);
        const deptRecords = deptApps.map(a => getFinancials(a));
        return {
          name: dept,
          total: deptApps.length,
          paid: deptRecords.filter(r => r.debt === 0 && r.totalPaid > 0).length
        };
      })
    };
  }, [sortedData, getFinancials, expenses, applicants]);

  const performUpdate = async (applicant: Applicant, monthIndex: number, shouldMarkPaid: boolean, amount: number, type: 'completed' | 'advance') => {
    const paymentKey = `${applicant.id}-${monthIndex}`;
    setUpdatingPayments(prev => ({ ...prev, [paymentKey]: true }));

    try {
      const { ledger } = getFinancials(applicant);
      const newLedger: PaymentRecord[] = [...ledger];
      const existingIndex = newLedger.findIndex(p => p.month === monthIndex + 1);

      const newRecord: PaymentRecord = {
        month: monthIndex + 1,
        status: shouldMarkPaid ? 'paid' : 'unpaid',
        type: type,
        amount: amount,
        date: shouldMarkPaid ? new Date().toISOString() : undefined
      };

      if (existingIndex > -1) {
        newLedger[existingIndex] = newRecord;
      } else {
        newLedger.push(newRecord);
      }

      await onUpdatePayment(applicant.id, newLedger);

      toast.success(
        shouldMarkPaid
          ? `Month ${monthIndex + 1} logged as ${type.toUpperCase()} (${amount.toLocaleString()} XAF)`
          : `Entry Revoked for Month ${monthIndex + 1}`,
        {
          description: applicant.name,
          icon: shouldMarkPaid ? <ShieldCheck className="text-emerald-500" /> : <Clock className="text-slate-400" />
        }
      );
    } catch (err) {
      toast.error("Process Halted", { description: "Synchronization with server failed." });
    } finally {
      setUpdatingPayments(prev => ({ ...prev, [paymentKey]: false }));
    }
  };

  const handleWithdrawal = async () => {
    if (!withdrawData.amount || !withdrawData.reason || !withdrawData.pin) {
      toast.error("Audit Incomplete", { description: "Please fill all fields." });
      return;
    }

    setIsWithdrawing(true);
    const isEditing = !!withdrawData.id && !isDeleting;
    try {
      const resp = await fetch('/api/admin/finance/withdraw', {
        method: isDeleting ? "DELETE" : (isEditing ? "PATCH" : "POST"),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(withdrawData)
      });

      const result = await resp.json();

      if (!resp.ok) throw new Error(result.error || "Authorization failure");

      // Update local state
      if (isDeleting) {
        setExpenses(prev => prev.filter(e => e.id !== withdrawData.id));
      } else if (isEditing) {
        setExpenses(prev => prev.map(e => e.id === withdrawData.id ? result.expense : e));
      } else {
        setExpenses(prev => [result.expense, ...prev]);
      }

      setIsWithdrawModalOpen(false);
      setWithdrawData({ id: "", amount: "", reason: "", pin: "" });
      toast.success(isDeleting ? "Record Deleted" : (isEditing ? "Record Updated" : "Withdrawal Authorized"), {
        description: isDeleting ? "Financial discrepancy cleared." : `${parseInt(withdrawData.amount).toLocaleString()} XAF registered.`
      });
    } catch (err: any) {
      toast.error("Access Denied", { description: err.message });
    } finally {
      setIsWithdrawing(false);
      setIsDeleting(false);
    }
  };

  const openEditExpense = (expense: ExpenseRecord) => {
    setIsDeleting(false);
    setWithdrawData({
      id: expense.id,
      amount: String(expense.amount),
      reason: expense.reason,
      pin: ""
    });
    setIsWithdrawModalOpen(true);
  };

  const openDeleteExpense = (expense: ExpenseRecord) => {
    setIsDeleting(true);
    setWithdrawData({
      id: expense.id,
      amount: String(expense.amount),
      reason: expense.reason,
      pin: ""
    });
    setIsWithdrawModalOpen(true);
  };

  const handleModalSubmit = () => {
    if (!modalContext) return;
    const amount = parseInt(customAmount) || 0;
    performUpdate(modalContext.applicant, modalContext.monthIndex, true, amount, paymentType);
    setIsAmountModalOpen(false);
    setModalContext(null);
  };

  // Modern Export Handler
  const handleExportAudit = () => {
    const headers = ["ID", "Name", "Institution", "Field", "Duration", "Contract Value", "Paid", "Owed", "Pending Balance", "Payment Audit"];
    const rows = sortedData.map(app => {
      const intel = getFinancials(app);
      const audit = (app.paymentLedger || [])
        .map(p => `M${p.month}: ${p.amount} (${p.type || 'completed'})`)
        .join("; ");

      return [
        app.id.substring(0, 8),
        `"${app.name}"`,
        `"${app.school || 'N/A'}"`,
        `"${app.domain || 'N/A'}"`,
        `"${intel.months} Months"`,
        intel.totalDue,
        intel.totalPaid,
        intel.debt,
        intel.remainingBalance,
        `"${audit}"`
      ];
    });

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Corporate_Financial_Audit_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`;
    link.click();
    toast.success("Audit Exported", { description: "The financial ledger has been downloaded." });
  };

  return (
    <TooltipProvider>
      <div className="space-y-10 pt-4 animate-in fade-in duration-700">

        {/* --- PREMIUM FINANCIAL SUMMARY --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Liquid Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-blue-100 dark:border-blue-900/30 shadow-sm relative overflow-hidden group hover:border-[#155DFC] transition-all duration-500"
          >
            <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-[#155DFC] group-hover:bg-[#155DFC] group-hover:text-white transition-all duration-500">
                <Landmark size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Liquid Balance</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-slate-900 dark:text-white tabular-nums">
                    {totals.currentBalance.toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-[#155DFC]">XAF</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                <span className="text-[10px] font-black text-[#155DFC] uppercase tracking-widest">Available Funds</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info size={12} className="text-slate-300 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-slate-900 text-white rounded-xl p-3 border-none shadow-2xl shadow-[#155DFC]/20">
                    <p className="text-[10px] font-black uppercase text-blue-400 mb-1">Calculation Logic</p>
                    <p className="text-xs">Realized Revenue (Income) - Total Tracked Expenses</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#155DFC] opacity-[0.02] rounded-full group-hover:scale-150 transition-transform duration-700" />
          </motion.div>

          {/* Expected Gross Income */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-blue-50/50 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-[#155DFC] transition-all duration-500"
          >
            <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:bg-[#155DFC] group-hover:text-white transition-all duration-500">
                <TrendingUp size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Rough Expected Gross Revenue</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-slate-900 dark:text-white tabular-nums">
                    {totals.expectedIncome.toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-slate-400">XAF</span>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-4 border-t border-slate-50 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-[#155DFC] transition-colors">
                <Briefcase size={12} />
                Contract Pipeline
              </div>
            </div>
          </motion.div>

          {/* Arrears Risk */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-3xl relative overflow-hidden group"
          >
            <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-rose-400 mb-2 group-hover:scale-110 transition-transform">
                <AlertCircle size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Overdue Arrears</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-rose-500 tabular-nums">
                    {totals.totalArrears.toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-slate-500">XAF</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-[10px] font-black text-rose-400 uppercase tracking-widest">
                  <Clock size={12} className="animate-pulse" />
                  Immediate Collection
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Paid Ratio</p>
                  <p className="text-xs font-black text-emerald-400 tabular-nums">
                    {totals.paidCount} / {totals.count}
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-rose-500/10 rounded-full blur-[70px]" />
          </motion.div>

          {/* Total Expenses / Withdrawals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-[#155DFC] transition-all duration-500"
          >
            <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:bg-[#155DFC] group-hover:text-white transition-all duration-500">
                <Receipt size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Corporate Expenses</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-slate-900 dark:text-white tabular-nums">
                    {totals.totalExpenses.toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-slate-400">XAF</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpensesAuditOpen(true)}
                  className="h-6 px-2 text-[8px] font-black uppercase text-[#155DFC] hover:bg-blue-50 rounded-lg gap-1"
                >
                  <History size={10} /> View Audit
                </Button>
                <ShieldCheck size={12} className="text-slate-300" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* --- ACTIONS BAR --- */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="relative w-full md:max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#155DFC] transition-colors" size={18} />
            <Input
              placeholder="Search ledger by name, school, or option..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 pl-12 rounded-2xl border-none bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/40 dark:shadow-none focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/10 text-sm font-bold placeholder:text-slate-300"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-800 p-1.5 shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (sortBy === "last_payment") setSortOrder(prev => prev === "asc" ? "desc" : "asc");
                  else { setSortBy("last_payment"); setSortOrder("desc"); }
                }}
                className={cn(
                  "h-10 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all gap-2",
                  sortBy === "last_payment" ? "bg-blue-50 text-[#155DFC]" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <Calendar size={14} />
                Date {sortBy === "last_payment" && (sortOrder === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (sortBy === "debt") setSortOrder(prev => prev === "asc" ? "desc" : "asc");
                  else { setSortBy("debt"); setSortOrder("desc"); }
                }}
                className={cn(
                  "h-10 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all gap-2",
                  sortBy === "debt" ? "bg-rose-50 text-rose-500" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <AlertCircle size={14} />
                Debt {sortBy === "debt" && (sortOrder === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
              </Button>
            </div>

            <Button
              onClick={() => {
                setWithdrawData({ id: "", amount: "", reason: "", pin: "" });
                setShowPin(false);
                setIsWithdrawModalOpen(true);
              }}
              className="h-14 px-8 rounded-2xl bg-[#155DFC] hover:bg-[#1A3CB9] text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-blue-500/20 flex-1 md:flex-none gap-3 active:scale-95 transition-all"
            >
              <ArrowDownLeft size={18} /> Withdraw Funds
            </Button>
            <Button
              variant="outline"
              onClick={handleExportAudit}
              className="h-14 px-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px] tracking-widest hover:border-[#155DFC] hover:text-[#155DFC] transition-all gap-2"
            >
              <Download size={18} /> Export Audit
            </Button>
          </div>
        </div>

        {/* --- MAIN LEDGER TABLE --- */}
        <div id="ledger-table-container" className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-50 dark:border-slate-800 shadow-3xl shadow-slate-200/30 overflow-hidden ring-8 ring-slate-50/50 dark:ring-slate-900/50">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/40">
                  <th
                    className="px-8 py-8 text-left border-b border-slate-100 dark:border-slate-800 cursor-pointer group/th"
                    onClick={() => {
                      if (sortBy === "name") setSortOrder(prev => prev === "asc" ? "desc" : "asc");
                      else { setSortBy("name"); setSortOrder("asc"); }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Intern Identification</span>
                      {sortBy === "name" ? (
                        sortOrder === "asc" ? <ArrowUp size={12} className="text-[#155DFC]" /> : <ArrowDown size={12} className="text-[#155DFC]" />
                      ) : (
                        <ArrowUpDown size={12} className="text-slate-200 group-hover/th:text-slate-400 transition-colors" />
                      )}
                    </div>
                  </th>
                  <th className="px-8 py-8 text-left border-b border-slate-100 dark:border-slate-800"><span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Academic Option</span></th>
                  <th className="px-8 py-8 text-center border-b border-slate-100 dark:border-slate-800"><span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Monthly Ledger Audit</span></th>
                  <th className="px-8 py-8 text-right border-b border-slate-100 dark:border-slate-800"><span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Financial status</span></th>
                  <th className="px-8 py-8 border-b border-slate-100 dark:border-slate-800"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                <AnimatePresence mode="popLayout">
                  {sortedData.map((app, appIdx) => {
                    const intel = getFinancials(app);
                    return (
                      <motion.tr
                        key={app.id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: appIdx * 0.04 }}
                        className="group hover:bg-blue-50/20 dark:hover:bg-blue-900/5 transition-all duration-300"
                      >
                        {/* ID Column */}
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center gap-5">
                            <div className="relative">
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#155DFC] to-indigo-700 p-0.5 shadow-lg relative z-10 group-hover:rotate-3 transition-transform">
                                {app.avatarUrl && app.avatarUrl !== '/default-avatar.svg' ? (
                                  <Image src={app.avatarUrl} alt={app.name} width={56} height={56} className="rounded-[14px] object-cover h-full w-full" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-white font-black text-lg uppercase">{app.name.charAt(0)}</div>
                                )}
                              </div>
                              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-xl bg-white dark:bg-slate-800 shadow-lg border-2 border-slate-100 dark:border-slate-700 flex items-center justify-center z-20">
                                <CheckCircle2 size={12} className={cn(intel.remainingBalance === 0 ? "text-emerald-500" : "text-slate-300")} />
                              </div>
                            </div>
                            <div>
                              <p className="text-base font-black text-slate-900 dark:text-white leading-none mb-1 group-hover:text-[#155DFC] transition-colors">{app.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{app.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Option Column */}
                        <td className="px-8 py-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 border-none text-[9px] font-black uppercase px-2 py-0.5 rounded-md">
                                {app.domain || "Not Specified"}
                              </Badge>
                            </div>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                              <Building2 size={12} className="text-[#155DFC]" />
                              {app.school || "Independent"}
                            </p>
                          </div>
                        </td>

                        {/* Audit Toggles */}
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-center gap-2.5">
                            {Array.from({ length: intel.months }).map((_, i) => {
                              const record = intel.ledger.find(p => p.month === i + 1 && p.status === 'paid');
                              const isPaid = !!record;
                              const key = `${app.id}-${i}`;
                              const loading = updatingPayments[key];
                              const isAdvance = record?.type === 'advance';
                              const isPast = (i + 1) < (getFinancials(app).monthsElapsed || 1);

                              return (
                                <Tooltip key={i}>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={() => {
                                        if (loading) return;
                                        if (!isPaid) {
                                          setModalContext({ applicant: app, monthIndex: i });
                                          setCustomAmount(intel.rate ? String(intel.rate) : "50000");
                                          setPaymentType('completed');
                                          setIsAmountModalOpen(true);
                                        } else {
                                          performUpdate(app, i, false, 0, 'completed');
                                        }
                                      }}
                                      disabled={loading}
                                      className={cn(
                                        "relative flex flex-col items-center justify-center w-12 h-12 rounded-xl border-2 transition-all duration-300 group/month shadow-sm",
                                        isPaid
                                          ? (isAdvance ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-blue-50 border-blue-200 text-blue-700 shadow-blue-200/50")
                                          : "bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-200 hover:border-blue-300 hover:bg-white"
                                      )}
                                    >
                                      <span className={cn(
                                        "text-[9px] font-black uppercase leading-none",
                                        isPaid ? (isAdvance ? "text-amber-600" : "text-[#155DFC]") : "text-slate-300"
                                      )}>M{i + 1}</span>

                                      <div className="mt-1">
                                        {loading ? (
                                          <Loader2 size={10} className="animate-spin text-[#155DFC]" />
                                        ) : isPaid ? (
                                          isAdvance ? <Clock size={12} /> : <CheckCircle2 size={12} />
                                        ) : (
                                          <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                        )}
                                      </div>
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-slate-900 text-white rounded-[1.5rem] p-4 shadow-3xl border-none ring-1 ring-white/10">
                                    <div className="space-y-2">
                                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Quarterly Audit: Month {i + 1}</p>
                                      <div className="space-y-1">
                                        <p className="text-sm font-bold flex items-center gap-2">
                                          {isPaid ? record.type?.toUpperCase() : "OUTSTANDING"}
                                          {isPaid && <Tag size={12} className="text-blue-400" />}
                                        </p>
                                        <p className="text-[11px] opacity-60">Value: {isPaid ? record.amount?.toLocaleString() : intel.rate.toLocaleString()} XAF</p>
                                        {isPaid && record.date && <p className="text-[9px] opacity-40">Registered: {format(new Date(record.date), 'MMM dd, HH:mm')}</p>}
                                      </div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              );
                            })}
                          </div>
                        </td>

                        {/* Final Balance */}
                        <td className="px-8 py-6 text-right whitespace-nowrap">
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-5">
                              <div className="text-right">
                                <p className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest mb-1">Realized</p>
                                <div className="flex items-center gap-1.5 justify-end">
                                  <span className="text-sm font-black text-[#155DFC] tabular-nums">{intel.totalPaid.toLocaleString()}</span>
                                  <span className="text-[10px] font-bold text-slate-400">XAF</span>
                                </div>
                              </div>
                              <div className="w-px h-10 bg-slate-100 dark:bg-slate-800" />
                              <div className="text-right">
                                <p className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest mb-1">Status</p>
                                <div className="flex items-center gap-2 justify-end">
                                  {intel.debt > 0 ? (
                                    <Badge className="bg-rose-50 dark:bg-rose-900/30 text-rose-500 border-none font-black text-[10px] h-7 px-3 flex items-center gap-2 rounded-lg">
                                      -{intel.debt.toLocaleString()} OWED
                                      <AlertCircle size={12} className="animate-pulse" />
                                    </Badge>
                                  ) : (
                                    <Badge className={cn(
                                      "border-none font-black text-[10px] h-7 px-3 flex items-center gap-2 rounded-lg",
                                      intel.remainingBalance === 0 ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600" : "bg-blue-50 dark:bg-blue-900/30 text-blue-600"
                                    )}>
                                      {intel.remainingBalance === 0 ? "SETTLED" : "CURRENT"}
                                      <ShieldCheck size={12} />
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="w-full max-w-[160px] h-2 bg-slate-50 dark:bg-slate-800/40 rounded-full mt-2 relative overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${intel.totalDue > 0 ? (intel.totalPaid / intel.totalDue) * 100 : 0}%` }}
                                className={cn(
                                  "h-full rounded-full transition-all duration-1000",
                                  intel.debt > 0 ? "bg-gradient-to-r from-rose-400 to-rose-600" : "bg-[#155DFC]"
                                )}
                              />
                            </div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-1">
                              {intel.remainingBalance > 0 ? `${intel.remainingBalance.toLocaleString()} XAF to Recovery` : "Full Asset Recovery Complete"}
                            </p>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-8 py-6">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-10 w-10 p-0 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                            onClick={() => confirm(`Authorize financial cleanup for ${app.name}?`) && onDelete(app.id)}
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

        {/* --- WITHDRAWAL & EDIT & DELETE DIALOG --- */}
        <Dialog open={isWithdrawModalOpen} onOpenChange={setIsWithdrawModalOpen}>
          <DialogContent className="max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] border-none shadow-3xl p-0 overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800">
            <div className="bg-[#155DFC] p-8 text-white relative">
              <DialogTitle className="text-2xl font-black mb-1">
                {isDeleting ? "Delete expense record" : (withdrawData.id ? "Edit Financial Record" : "Corporate withdrawal")}
              </DialogTitle>
              <DialogDescription className="text-blue-100 text-[11px] font-black uppercase tracking-widest opacity-80">
                {isDeleting ? "Irreversible Audit correction" : "Strict Authorization required"}
              </DialogDescription>
            </div>

            <div className="p-8 space-y-6">
              {!isDeleting && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Withdrawal Amount (XAF)</label>
                    <div className="relative group">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#155DFC] transition-colors" size={18} />
                      <Input
                        type="number"
                        value={withdrawData.amount}
                        onChange={(e) => setWithdrawData(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="e.g. 50000"
                        className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50 dark:bg-slate-800/40 text-lg font-bold focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/10 transition-all placeholder:text-slate-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason for Withdrawal</label>
                    <div className="relative group">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#155DFC] transition-colors" size={18} />
                      <Input
                        value={withdrawData.reason}
                        onChange={(e) => setWithdrawData(prev => ({ ...prev, reason: e.target.value }))}
                        placeholder="e.g. Office Supplies, Maintenance..."
                        className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50 dark:bg-slate-800/40 text-sm font-bold focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/10 transition-all placeholder:text-slate-300"
                      />
                    </div>
                  </div>
                </>
              )}

              {isDeleting && (
                <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-2xl border-2 border-rose-100 dark:border-rose-900/30">
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mb-1">Confirm Deletion</p>
                  <p className="text-[10px] text-rose-500 font-medium">
                    You are deleting the expense: <span className="font-black uppercase">"{withdrawData.reason}"</span> for <span className="font-black">{Number(withdrawData.amount).toLocaleString()} XAF</span>.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Secure Authorization PIN</Label>
                <div className="relative group">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#155DFC] transition-colors" size={18} />
                  <Input
                    type={showPin ? "text" : "password"}
                    value={withdrawData.pin}
                    onChange={(e) => setWithdrawData(prev => ({ ...prev, pin: e.target.value }))}
                    placeholder="••••"
                    className={cn(
                      "h-14 pl-12 pr-12 rounded-2xl border-slate-100 bg-slate-50 dark:bg-slate-800/40 text-lg font-black tracking-[0.5em] focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/10 transition-all placeholder:tracking-normal placeholder:text-slate-300",
                      showPin && "tracking-normal"
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-slate-400 hover:text-[#155DFC]"
                    onClick={() => setShowPin(!showPin)}
                  >
                    {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="ghost"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="flex-1 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleWithdrawal}
                  disabled={isWithdrawing || (!isDeleting && (!withdrawData.amount || !withdrawData.reason)) || !withdrawData.pin}
                  className={cn(
                    "flex-[2] h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl transition-all active:scale-95 gap-3",
                    isDeleting
                      ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20"
                      : "bg-[#155DFC] hover:bg-[#1A3CB9] text-white shadow-blue-500/20"
                  )}
                >
                  {isWithdrawing ? <Loader2 className="animate-spin" size={18} /> : (isDeleting ? <Trash2 size={18} /> : <ShieldCheck size={18} />)}
                  {isWithdrawing ? "Processing..." : (isDeleting ? "Verify & Delete" : "Authorize Transaction")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* --- EXPENSES AUDIT DIALOG --- */}
        <Dialog open={isExpensesAuditOpen} onOpenChange={setIsExpensesAuditOpen}>
          <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] border-none shadow-3xl p-0 overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800">
            <div className="bg-slate-900 p-8 text-white relative">
              <div className="flex justify-between items-start">
                <div>
                  <DialogTitle className="text-2xl font-black mb-1">Financial Audit trail</DialogTitle>
                  <DialogDescription className="text-indigo-400 text-[11px] font-black uppercase tracking-widest">Historical Expense Reconciliation</DialogDescription>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Payment Distribution</p>
                  <p className="text-xl font-black text-indigo-400 tabular-nums">
                    {totals.paidCount} / {totals.count}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {totals.departmentStats.map((dept, i) => (
                  <Badge key={i} className="bg-white/5 border-white/10 text-[8px] font-black uppercase px-2 py-1 rounded-lg">
                    {dept.name}: {dept.paid}/{dept.total}
                  </Badge>
                ))}
              </div>
              <History className="absolute -right-6 -bottom-6 text-white/2 rotate-12" size={140} />
            </div>

            <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-4">
              {expenses.length === 0 ? (
                <div className="text-center py-10">
                  <Receipt size={40} className="text-slate-200 mx-auto mb-4" />
                  <p className="text-sm font-black text-slate-400">No expenses recorded in the current cycle.</p>
                </div>
              ) : (
                expenses.map((expense, idx) => (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-5 rounded-2xl border-2 border-slate-50 dark:border-slate-800 flex items-center justify-between group hover:border-indigo-100 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-500">
                        <ArrowDownLeft size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{expense.reason}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          {format(new Date(expense.created_at), 'MMM dd, yyyy • HH:mm')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <p className="text-lg font-black text-slate-900 dark:text-white tabular-nums">{expense.amount.toLocaleString()}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">XAF</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-[#155DFC] hover:bg-blue-50"
                          onClick={() => openEditExpense(expense)}
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                          onClick={() => openDeleteExpense(expense)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* --- PAYMENT ENTRY DIALOG --- */}
        <Dialog open={isAmountModalOpen} onOpenChange={setIsAmountModalOpen}>
          <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] border-none shadow-3xl p-0 overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800">
            <div className="bg-gradient-to-br from-[#155DFC] via-blue-700 to-indigo-800 p-8 text-white relative">
              <div className="relative z-10 text-center">
                <DialogTitle className="text-2xl font-black mb-1">Manual Receipt logging</DialogTitle>
                <DialogDescription className="text-blue-200 text-[10px] font-black uppercase tracking-[0.2em] tracking-widest mt-2">{modalContext?.applicant.name} • Month {modalContext ? modalContext.monthIndex + 1 : ""}</DialogDescription>
              </div>
              <DollarSign className="absolute -right-6 -top-6 text-white/5" size={120} />
            </div>

            <div className="p-8 space-y-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#155DFC] ml-1">Allocated Collection Amount (XAF)</Label>
                <div className="relative group">
                  <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#155DFC] transition-colors" size={20} />
                  <Input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="h-16 pl-14 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border-none text-xl font-black tabular-nums transition-all focus:ring-8 focus:ring-blue-50 dark:focus:ring-blue-900/10"
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#155DFC] ml-1">Collection Outcome Category</Label>
                <RadioGroup
                  value={paymentType}
                  onValueChange={(val: any) => setPaymentType(val)}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="relative">
                    <RadioGroupItem value="completed" id="completed" className="sr-only" />
                    <Label
                      htmlFor="completed"
                      className={cn(
                        "flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all cursor-pointer h-24",
                        paymentType === 'completed'
                          ? "bg-blue-50 border-[#155DFC] text-[#155DFC]"
                          : "bg-slate-50 border-slate-100 text-slate-400 grayscale opacity-60 hover:opacity-100"
                      )}
                    >
                      <CheckCircle2 size={24} className="mb-2" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Full Payment</span>
                    </Label>
                  </div>
                  <div className="relative">
                    <RadioGroupItem value="advance" id="advance" className="sr-only" />
                    <Label
                      htmlFor="advance"
                      className={cn(
                        "flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all cursor-pointer h-24",
                        paymentType === 'advance'
                          ? "bg-amber-50 border-amber-500 text-amber-600"
                          : "bg-slate-50 border-slate-100 text-slate-400 grayscale opacity-60 hover:opacity-100"
                      )}
                    >
                      <Clock size={24} className="mb-2" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Partial Advance</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex gap-4 pt-2">
                <Button
                  variant="ghost"
                  onClick={() => setIsAmountModalOpen(false)}
                  className="flex-1 h-16 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400 hover:bg-slate-100 transition-all"
                >
                  Discard Entry
                </Button>
                <Button
                  onClick={handleModalSubmit}
                  className="flex-[2] h-16 rounded-2xl bg-[#155DFC] hover:bg-[#1A3CB9] text-white font-black uppercase text-[10px] tracking-[0.25em] shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Commit Audit <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </TooltipProvider>
  );
};
