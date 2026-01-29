"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, DollarSign, Calendar } from "lucide-react";

interface StudentPayment {
  student_id: string;
  student_name: string;
  application_id: string;
  is_paid: boolean;
  amount_paid_xaf?: number;
  payment_date?: string;
  payment_ref?: string;
}

interface AdminPaymentManagerProps {
  programId: string;
}

export function AdminPaymentManager({ programId }: AdminPaymentManagerProps) {
  const [payments, setPayments] = useState<StudentPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPayment, setEditingPayment] = useState<StudentPayment | null>(null);
  const [formData, setFormData] = useState({
    amount_paid_xaf: "",
    payment_ref: "",
    notes: "",
  });

  useEffect(() => {
    fetchPayments();
  }, [programId]);

  const fetchPayments = async () => {
    try {
      const response = await fetch(`/api/programs/${programId}/payments`);
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsPaid = async (studentId: string, applicationId: string) => {
    try {
      const response = await fetch(
        `/api/programs/${programId}/students/${studentId}/payment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            is_paid: true,
            amount_paid_xaf: formData.amount_paid_xaf || null,
            payment_ref: formData.payment_ref,
            notes: formData.notes,
            applicationId,
            payment_date: new Date().toISOString(),
          }),
        }
      );

      if (response.ok) {
        fetchPayments();
        setEditingPayment(null);
        setFormData({ amount_paid_xaf: "", payment_ref: "", notes: "" });
        alert("Payment marked successfully!");
      }
    } catch (error) {
      console.error("Error updating payment:", error);
      alert("Failed to update payment");
    }
  };

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <div className="animate-spin w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-600 mx-auto" />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-blue-50 border-blue-200 p-4">
        <div className="flex gap-3">
          <DollarSign className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <strong>Manual Payment Processing:</strong> Update payment status for accepted students. 
            When marked as paid, students can access premium resources.
          </div>
        </div>
      </Card>

      {payments.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          No accepted students yet for this program.
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3 font-semibold">Student</th>
                <th className="text-left p-3 font-semibold">Status</th>
                <th className="text-left p-3 font-semibold">Amount</th>
                <th className="text-left p-3 font-semibold">Payment Date</th>
                <th className="text-left p-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.student_id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{payment.student_name}</td>
                  <td className="p-3">
                    {payment.is_paid ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-green-700 font-semibold">Paid</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-orange-600" />
                        <span className="text-orange-700 font-semibold">Unpaid</span>
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    {payment.amount_paid_xaf ? (
                      `${payment.amount_paid_xaf} XAF`
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="p-3">
                    {payment.payment_date ? (
                      new Date(payment.payment_date).toLocaleDateString()
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="p-3">
                    {!payment.is_paid ? (
                      <Button
                        size="sm"
                        onClick={() => setEditingPayment(payment)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Mark as Paid
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled>
                        ✓ Paid
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Payment Modal */}
      {editingPayment && (
        <Card className="p-6 border-2 border-green-300">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">
                Mark {editingPayment.student_name} as Paid
              </h3>
              <Button
                variant="ghost"
                onClick={() => setEditingPayment(null)}
              >
                ✕
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold block mb-2">
                  Amount Paid (XAF)
                </label>
                <Input
                  type="number"
                  value={formData.amount_paid_xaf}
                  onChange={(e) =>
                    setFormData({ ...formData, amount_paid_xaf: e.target.value })
                  }
                  placeholder="e.g., 25000"
                />
              </div>

              <div>
                <label className="text-sm font-semibold block mb-2">
                  Payment Reference (Optional)
                </label>
                <Input
                  value={formData.payment_ref}
                  onChange={(e) =>
                    setFormData({ ...formData, payment_ref: e.target.value })
                  }
                  placeholder="e.g., TXN-12345678"
                />
              </div>

              <div>
                <label className="text-sm font-semibold block mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="e.g., Mobile money payment received"
                  className="w-full p-2 border rounded-lg text-sm"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditingPayment(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    handleMarkAsPaid(
                      editingPayment.student_id,
                      editingPayment.application_id
                    )
                  }
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Confirm Payment
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
