"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Phone, Smartphone, DollarSign, Lock, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  programTitle: string;
  price: number;
  currency: string;
  onPaymentSuccess: () => void;
}

type PaymentProvider = "mtn" | "orange" | "nexttel" | null;
type PaymentStep = "provider" | "phone" | "processing" | "success" | "failed";

export function PaymentModal({
  isOpen,
  onClose,
  programTitle,
  price,
  currency,
  onPaymentSuccess,
}: PaymentModalProps) {
  const [step, setStep] = useState<PaymentStep>("provider");
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const providers = [
    {
      id: "mtn",
      name: "MTN Mobile Money",
      color: "bg-yellow-500",
      icon: "📱",
      code: "*156#",
    },
    {
      id: "orange",
      name: "Orange Money",
      color: "bg-orange-500",
      icon: "🟠",
      code: "*150#",
    },
    {
      id: "nexttel",
      name: "Nexttel",
      color: "bg-red-500",
      icon: "📲",
      code: "*120#",
    },
  ];

  const handleProviderSelect = (provider: PaymentProvider) => {
    setSelectedProvider(provider);
    setStep("phone");
  };

  const handlePhoneSubmit = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      alert("Please enter a valid phone number");
      return;
    }

    setIsProcessing(true);
    setStep("processing");

    try {
      const response = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: selectedProvider,
          phoneNumber,
          amount: price,
          currency,
          programTitle,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep("success");
        setTimeout(() => {
          onPaymentSuccess();
          onClose();
        }, 3000);
      } else {
        setStep("failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setStep("failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setStep("provider");
    setSelectedProvider(null);
    setPhoneNumber("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            Complete Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Header Info */}
          <Card className="bg-blue-50 border-blue-200 p-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Program</div>
              <div className="font-semibold text-gray-900">{programTitle}</div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-blue-200">
                <span className="text-sm text-gray-600">Amount to Pay</span>
                <span className="font-bold text-lg text-blue-600">
                  {price} {currency}
                </span>
              </div>
            </div>
          </Card>

          {/* Step 1: Provider Selection */}
          {step === "provider" && (
            <div className="space-y-3">
              <div className="text-sm font-semibold text-gray-900">
                Choose Payment Method
              </div>
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => handleProviderSelect(provider.id as PaymentProvider)}
                  className="w-full p-4 rounded-lg border-2 border-gray-200 hover:border-blue-600 hover:bg-blue-50 transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{provider.icon}</div>
                      <div>
                        <div className="font-semibold text-gray-900">{provider.name}</div>
                        <div className="text-xs text-gray-500">Dial {provider.code}</div>
                      </div>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 group-hover:border-blue-600" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Phone Number */}
          {step === "phone" && (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-gray-900 block mb-2">
                  Enter Your Phone Number
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    +237
                  </div>
                  <Input
                    type="tel"
                    placeholder="6 7X XX XX XX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="pl-16"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This should be your registered {selectedProvider?.toUpperCase()} mobile money number
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <strong>Next step:</strong> After you click "Pay", you'll receive a prompt on your phone. Confirm the payment to complete the transaction.
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handlePhoneSubmit}
                  disabled={!phoneNumber || isProcessing}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isProcessing ? "Processing..." : "Pay Now"}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Processing */}
          {step === "processing" && (
            <div className="text-center py-6 space-y-4">
              <div className="animate-spin w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 mx-auto" />
              <div>
                <div className="font-semibold text-gray-900">Processing Payment</div>
                <p className="text-sm text-gray-600 mt-2">
                  Please check your phone and confirm the payment
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === "success" && (
            <div className="text-center py-6 space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="w-16 h-16 text-emerald-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-lg">Payment Successful!</div>
                <p className="text-sm text-gray-600 mt-2">
                  Your payment has been confirmed. You now have full access to the program.
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Failed */}
          {step === "failed" && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-2" />
                <div className="font-semibold text-red-900">Payment Failed</div>
                <p className="text-sm text-red-700 mt-1">
                  Your payment could not be processed. Please try again.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1"
                >
                  Try Different Method
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
