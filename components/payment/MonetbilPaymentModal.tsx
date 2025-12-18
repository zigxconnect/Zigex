"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/uiComponent/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Phone, CreditCard, CheckCircle2, Smartphone, Zap } from "lucide-react";
import { toast } from "sonner";

interface MonetbilPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
  email?: string;
}

type PaymentStatus = "idle" | "processing" | "waiting_confirmation" | "success";

export function MonetbilPaymentModal({
  isOpen,
  onClose,
  onSuccess,
  amount,
  email
}: MonetbilPaymentModalProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [status, setStatus] = useState<PaymentStatus>("idle");

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStatus("idle");
      setPhoneNumber("");
    }
  }, [isOpen]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || phoneNumber.length < 9) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setStatus("processing");

    // Simulate network request to initiate payment
    setTimeout(() => {
      setStatus("waiting_confirmation");
      
      // STUCK STATE: We intentionally do NOT transition to success.
      // The user will just see the "Check your phone" screen indefinitely
      // until they manually close the modal.
      
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90%] sm:w-full sm:max-w-md rounded-2xl transition-all duration-300">
        {status === "success" ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-12 h-12 text-green-600 drop-shadow-sm" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-2xl font-bold text-gray-900">Payment Successful!</h3>
              <p className="text-gray-500">Your transaction has been confirmed.</p>
            </div>
            <div className="text-sm font-mono bg-gray-50 px-3 py-1 rounded border border-gray-200 text-gray-600 mt-2">
              ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Lock className="w-5 h-5 text-green-600" />
                Secure Payment
              </DialogTitle>
              <DialogDescription>
                Pay <span className="font-bold text-gray-900">{amount} XAF</span> to generate your Smart Application
              </DialogDescription>
            </DialogHeader>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="bg-blue-100/50 p-2 rounded-full shrink-0">
                <Zap className="w-5 h-5 text-blue-600 fill-blue-600/20" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-blue-900">Fast-Track Your Application</h4>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Get reviewed in <span className="font-bold bg-blue-100 px-1 rounded text-blue-800">under 1 hour</span> instead of the standard 48 hours.
                </p>
              </div>
            </div>

            {status === "waiting_confirmation" ? (
              <div className="py-8 flex flex-col items-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-100 rounded-full animate-ping opacity-75"></div>
                  <div className="relative bg-white p-5 rounded-full border-2 border-orange-100 shadow-sm">
                    <Smartphone className="w-10 h-10 text-orange-600 animate-pulse" />
                  </div>
                </div>
                
                <div className="text-center space-y-2">
                  <h3 className="font-semibold text-lg text-gray-900">Confirm Payment on Phone</h3>
                  <p className="text-sm text-gray-500 max-w-[260px] mx-auto">
                    Please check your phone <span className="font-mono font-medium text-gray-900">{phoneNumber}</span> to authorize the transaction.
                  </p>
                  <div className="bg-blue-50 text-blue-700 text-xs px-3 py-2 rounded-md mt-2 inline-block border border-blue-100">
                    Dial *126# (MTN) or #150# (Orange) if you don't receive the prompt.
                  </div>
                </div>

                <div className="w-full max-w-[200px] space-y-1">
                  <div className="flex justify-between text-[10px] text-gray-400 uppercase font-medium">
                    <span>Waiting</span>
                    <span>...</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 w-1/3 animate-[shimmer_1s_infinite] rounded-full"></div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePayment} className="space-y-6 py-4">
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 p-4 rounded-xl border border-orange-100 flex items-center gap-3">
                    <div className="bg-white p-2.5 rounded-lg shadow-sm">
                      <CreditCard className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Mobile Money</p>
                      <p className="text-xs text-gray-500">MTN MoMo / Orange Money</p>
                    </div>
                    <div className="ml-auto flex gap-1.5">
                       <div className="w-8 h-5 bg-[#FFCC00] rounded shadow-sm border border-black/5" title="MTN"></div>
                       <div className="w-8 h-5 bg-[#FF6600] rounded shadow-sm border border-black/5" title="Orange"></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative group">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="6XXXXXXXX"
                        className="pl-9 font-mono tracking-wide transition-all focus:ring-2 focus:ring-blue-100"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                        maxLength={9}
                        required
                        disabled={status === "processing"}
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium flex justify-between">
                      <span>Cameroon (+237)</span>
                      <span>9 Digits</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button 
                    type="submit" 
                    className="w-full bg-[#004E98] hover:bg-[#003B73] text-white font-semibold py-6 shadow-lg shadow-blue-900/10 transition-all active:scale-[0.98]"
                    disabled={status === "processing"}
                  >
                    {status === "processing" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Initiating...
                      </>
                    ) : (
                      `Pay ${amount} XAF`
                    )}
                  </Button>
                  <div className="flex items-center justify-center gap-1.5 opacity-60">
                    <Lock className="w-3 h-3 text-gray-500" />
                    <span className="text-[10px] text-gray-500 font-medium">Secured by Monetbil</span>
                  </div>
                </div>
              </form>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
