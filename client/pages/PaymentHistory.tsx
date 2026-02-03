import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Download,
  Loader,
  Eye,
  Calendar,
  DollarSign,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface EscrowTransaction {
  id: string;
  jobId: string;
  totalAmount: number;
  painterbookcoCommission: number;
  escrowCost: number;
  painterAmount: number;
  commissionRate: number;
  status: string;
  customerPaidAmount: number;
  painterPaidAmount: number;
  fundedAt?: string;
  releasedAt?: string;
  cancelled?: boolean;
  cancellationType?: string;
}

interface Job {
  id: string;
  title: string;
  customerId: string;
  painterId: string;
}

interface PaymentRecord {
  transaction: EscrowTransaction;
  job?: Job;
}

export default function PaymentHistory() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "completed" | "pending" | "cancelled"
  >("all");
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(
    null
  );

  const token = localStorage.getItem("paintbook:token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchPayments();
  }, [token, navigate]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      // In production, you'd have a dedicated endpoint for payment history
      // For now, we'll fetch all jobs and their escrow transactions
      const response = await fetch("/api/jobs?pageSize=100", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch payments");
      }

      const data = await response.json();
      // This would need to be combined with escrow transaction data
      // For demo purposes, we're using mock data
      setPayments([]);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Failed to load payment history");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "funded":
      case "released":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-blue-500" />;
      case "refunded":
      case "cancelled":
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <CreditCard className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "funded":
      case "released":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-blue-100 text-blue-800";
      case "refunded":
      case "cancelled":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-background to-muted py-12 px-4 md:px-6"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            Payment History
          </h1>
          <p className="text-muted-foreground">
            View your transaction history and payment details
          </p>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-card rounded-2xl p-6 border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-muted-foreground">
                Total Payments
              </h3>
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold">
              {formatCurrency(payments.length * 500)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {payments.length} transactions
            </p>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-muted-foreground">
                Completed
              </h3>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold">
              {payments.filter((p) => p.transaction.status === "released")
                .length}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Successful transactions
            </p>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-muted-foreground">Pending</h3>
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold">
              {payments.filter((p) => p.transaction.status === "pending").length}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Awaiting processing
            </p>
          </div>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-3 mb-8 flex-wrap"
        >
          {["all", "completed", "pending", "cancelled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-card hover:bg-muted border border-border"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </motion.div>

        {/* Transactions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl border border-border/50 overflow-hidden"
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : payments.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No transactions</h3>
              <p className="text-muted-foreground">
                {filter === "all"
                  ? "You don't have any transactions yet."
                  : `No ${filter} transactions found.`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border/50 bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Transaction ID
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Commission
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment, idx) => (
                    <motion.tr
                      key={payment.transaction.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-mono">
                        {payment.transaction.id.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold">
                        {formatCurrency(payment.transaction.totalAmount)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(payment.transaction.status)}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              payment.transaction.status
                            )}`}
                          >
                            {payment.transaction.status.toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {payment.transaction.fundedAt
                          ? new Date(
                              payment.transaction.fundedAt
                            ).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {payment.transaction.commissionRate}%
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedPayment(payment)}
                          className="text-primary hover:text-primary/80 font-semibold flex items-center gap-1 ml-auto"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden md:inline">View</span>
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Details Modal */}
        {selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedPayment(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl p-6 max-w-md w-full border border-border"
            >
              <h2 className="text-2xl font-bold mb-6">Transaction Details</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <span className="font-mono font-semibold">
                    {selectedPayment.transaction.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="font-semibold">
                    {formatCurrency(
                      selectedPayment.transaction.totalAmount
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Painter Amount:</span>
                  <span className="font-semibold">
                    {formatCurrency(
                      selectedPayment.transaction.painterAmount
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Commission:</span>
                  <span className="font-semibold">
                    {formatCurrency(
                      selectedPayment.transaction.painterbookcoCommission
                    )}{" "}
                    ({selectedPayment.transaction.commissionRate}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Escrow Fee:</span>
                  <span className="font-semibold">
                    {formatCurrency(
                      selectedPayment.transaction.escrowCost
                    )}
                  </span>
                </div>
                <div className="border-t border-border/50 pt-4 flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedPayment.transaction.status)}
                    <span className="font-semibold">
                      {selectedPayment.transaction.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedPayment(null)}
                className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
