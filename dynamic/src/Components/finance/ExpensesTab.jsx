import { useState, useMemo } from "react";
import { toast } from "react-toastify";
import {
  Receipt,
  Plus,
  Search,
  RefreshCw,
  Layers,
  DollarSign,
  FileText,
  Trash2,
  AlertTriangle,
  AlertCircle,
  Loader2,
  Calendar,
  Tag
} from "lucide-react";
import { financeService } from "../../services/financeService";
import { extractErrorMessage } from "../../utils/errorUtils";

export default function ExpensesTab({
  expenses = [],
  purchases = [],
  loading = false,
  onRefresh,
  isAuthorized = false,
  isDarkMode = true,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [deletingExpense, setDeletingExpense] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [costName, setCostName] = useState("Transport");
  const [costDescription, setCostDescription] = useState("");
  const [costAmount, setCostAmount] = useState("");
  const [purchaseProductsId, setPurchaseProductsId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const filteredExpenses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return expenses;
    return expenses.filter((e) => {
      const name = (e.costName || "").toLowerCase();
      const desc = (e.costDescription || "").toLowerCase();
      return (
        name.includes(q) ||
        desc.includes(q) ||
        String(e.id).includes(q) ||
        String(e.purchaseProductsId || "").includes(q)
      );
    });
  }, [expenses, searchQuery]);

  const totalExpenseAmount = useMemo(() => {
    return expenses.reduce((acc, e) => acc + (Number(e.costAmount) || 0), 0);
  }, [expenses]);

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const parsedAmount = parseFloat(costAmount);

    if (!costName.trim()) {
      setErrorMessage("Cost category/name is required.");
      return;
    }
    if (!costDescription.trim()) {
      setErrorMessage("Cost description is required.");
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage("Cost amount must be greater than zero.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        costName: costName.trim(),
        costDescription: costDescription.trim(),
        costAmount: parsedAmount,
      };

      if (purchaseProductsId) {
        payload.purchaseProductsId = parseInt(purchaseProductsId, 10);
      }

      await financeService.createExpense(payload);
      toast.success(`Operational expense "${costName.trim()}" logged successfully!`);
      setIsRegisterOpen(false);
      setErrorMessage("");
      setCostName("Transport");
      setCostDescription("");
      setCostAmount("");
      setPurchaseProductsId("");
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to create expense:", err);
      const dynamicMsg = extractErrorMessage(err, "Failed to record expense.");
      setErrorMessage(dynamicMsg);
      toast.error(dynamicMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async () => {
    if (!deletingExpense) return;
    setIsDeleting(true);
    try {
      await financeService.deleteExpense(deletingExpense.id);
      toast.success(`Expense record #EXP-${deletingExpense.id} removed.`);
      setDeletingExpense(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to delete expense:", err);
      toast.error(err.message || "Failed to delete expense record.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-header card */}
      <div
        className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
          isDarkMode
            ? "bg-[#0b1b3d]/60 border-white/10"
            : "bg-white border-slate-200 shadow-sm"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center font-bold border border-red-500/20">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900 dark:text-slate-100">
                Operational & Supplementary Expenses
              </h3>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                {totalExpenseAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB Total
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Record logistics, labor, transport, packaging, and non-inventory overhead deducted from net profits.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onRefresh}
            disabled={loading}
            title="Refresh Expenses"
            className={`p-2.5 rounded-xl border transition-all ${
              isDarkMode
                ? "border-white/10 hover:bg-white/10 text-slate-300"
                : "border-slate-200 hover:bg-slate-100 text-slate-700"
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-500" : ""}`} />
          </button>

          {isAuthorized && (
            <button
              onClick={() => {
                setErrorMessage("");
                setIsRegisterOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Record Expense</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div
        className={`p-4 rounded-2xl border transition-all ${
          isDarkMode
            ? "bg-[#0b1b3d]/60 border-white/10"
            : "bg-white border-slate-200 shadow-sm"
        }`}
      >
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search expenses by category, description..."
            className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
              isDarkMode
                ? "bg-white/5 border-white/10 text-slate-100 placeholder-slate-500"
                : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
            }`}
          />
        </div>
      </div>

      {/* Expenses Table */}
      <div
        className={`rounded-2xl border overflow-hidden transition-all ${
          isDarkMode
            ? "bg-[#0b1b3d]/60 border-white/10"
            : "bg-white border-slate-200 shadow-sm"
        }`}
      >
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            <p className="text-sm">Fetching expenses from live API...</p>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-3 border border-red-500/20">
              <Receipt className="w-7 h-7" />
            </div>
            <h4 className="text-base font-serif font-bold text-slate-900 dark:text-slate-100 mb-1">
              No operational expenses recorded
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
              {searchQuery
                ? "No expense records match your search criteria."
                : "Operational and supplementary costs recorded here will be automatically factored into your net profit margin."}
            </p>
            {isAuthorized && !searchQuery && (
              <button
                onClick={() => setIsRegisterOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Log First Expense</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead
                className={`border-b text-[11px] uppercase tracking-wider font-semibold ${
                  isDarkMode
                    ? "bg-white/5 border-white/10 text-slate-400"
                    : "bg-slate-50 border-slate-200 text-slate-500"
                }`}
              >
                <tr>
                  <th className="px-4 py-3.5">Expense ID</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Description</th>
                  <th className="px-4 py-3.5">Associated Batch</th>
                  <th className="px-4 py-3.5 text-right">Cost Amount</th>
                  <th className="px-4 py-3.5">Date Logged</th>
                  {isAuthorized && <th className="px-4 py-3.5 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-inherit">
                {filteredExpenses.map((e) => {
                  const amt = Number(e.costAmount) || 0;
                  const batchTag = e.purchaseProductsId ? `Batch #${e.purchaseProductsId}` : "General Overhead";

                  return (
                    <tr
                      key={e.id}
                      className={`transition-colors ${
                        isDarkMode
                          ? "hover:bg-white/5 text-slate-300"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <td className="px-4 py-3.5 font-mono font-bold text-amber-500">
                        #EXP-{e.id}
                      </td>

                      <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-slate-100">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                          <Tag className="w-3 h-3" />
                          <span>{e.costName}</span>
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-slate-300 max-w-sm">
                        <span className="inline-flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="line-clamp-2">{e.costDescription}</span>
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[11px] text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <Layers className="w-3 h-3 text-slate-400" />
                          <span>{batchTag}</span>
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right font-mono font-bold text-red-400">
                        -{amt.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB
                      </td>

                      <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px]">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{e.createdAt ? new Date(e.createdAt).toLocaleDateString() : "Logged"}</span>
                        </span>
                      </td>

                      {isAuthorized && (
                        <td className="px-4 py-3.5 text-center">
                          <button
                            onClick={() => setDeletingExpense(e)}
                            title="Delete Expense"
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isDarkMode
                                ? "border-white/10 hover:bg-red-500/10 text-red-400 hover:text-red-300"
                                : "border-slate-200 hover:bg-red-50 text-red-600 hover:text-red-700"
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Expense Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-all ${
              isDarkMode
                ? "bg-[#0b1b3d] border-white/10 text-slate-100"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-inherit mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center font-bold">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold">Record Operational Expense</h3>
                  <p className="text-xs text-slate-400">Log cost against operational overhead</p>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 mb-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Cost Name / Category <span className="text-amber-500">*</span>
                </label>
                <select
                  value={costName}
                  onChange={(e) => {
                    setCostName(e.target.value);
                    setErrorMessage("");
                  }}
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                    isDarkMode
                      ? "bg-[#081226] border-white/10 text-slate-100"
                      : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                >
                  <option value="Transport">Transport & Logistics</option>
                  <option value="Labor">Labor & Handling</option>
                  <option value="Storage">Storage & Warehousing</option>
                  <option value="Packaging">Packaging & Materials</option>
                  <option value="Utilities">Utilities & Power</option>
                  <option value="Maintenance">Maintenance & Repairs</option>
                  <option value="Office Supplies">Administrative & Supplies</option>
                  <option value="Other">Other Operational Cost</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Cost Description <span className="text-amber-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={costDescription}
                  onChange={(e) => {
                    setCostDescription(e.target.value);
                    setErrorMessage("");
                  }}
                  placeholder="e.g. Freight transport for 50 hymnal books from printer"
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all resize-none ${
                    isDarkMode
                      ? "bg-white/5 border-white/10 text-slate-100 placeholder-slate-500"
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Monetary Amount (ETB) <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={costAmount}
                    onChange={(e) => {
                      setCostAmount(e.target.value);
                      setErrorMessage("");
                    }}
                    required
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                      isDarkMode
                        ? "bg-white/5 border-white/10 text-slate-100 placeholder-slate-500"
                        : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                    }`}
                  />
                </div>
              </div>

              {/* Optional Associated Purchase Batch */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Associated Purchase Batch <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Layers className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={purchaseProductsId}
                    onChange={(e) => {
                      setPurchaseProductsId(e.target.value);
                      setErrorMessage("");
                    }}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                      isDarkMode
                        ? "bg-[#081226] border-white/10 text-slate-100"
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  >
                    <option value="">-- None (General Administrative Overhead) --</option>
                    {purchases.map((b) => (
                      <option key={b.id} value={b.id}>
                        Batch #{b.id} ({b.product?.name || `Product #${b.productId}`} - {b.quantity} units)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-inherit flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    isDarkMode
                      ? "border-white/10 hover:bg-white/10 text-slate-300"
                      : "border-slate-200 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Recording...</span>
                    </>
                  ) : (
                    <span>Record Expense</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-all ${
              isDarkMode
                ? "bg-[#0b1b3d] border-white/10 text-slate-100"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mb-4 border border-red-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold mb-2">Delete Expense Record</h3>
            <p className="text-xs sm:text-sm text-slate-400 mb-6">
              Are you sure you want to remove expense record{" "}
              <strong className="text-white">#EXP-{deletingExpense.id}</strong> ("{deletingExpense.costName}") for{" "}
              <strong className="text-amber-400">{Number(deletingExpense.costAmount || 0).toFixed(2)} ETB</strong>?
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingExpense(null)}
                disabled={isDeleting}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  isDarkMode
                    ? "border-white/10 hover:bg-white/10 text-slate-300"
                    : "border-slate-200 hover:bg-slate-100 text-slate-700"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteExpense}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-red-500 hover:bg-red-600 text-white transition-all disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Expense</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
