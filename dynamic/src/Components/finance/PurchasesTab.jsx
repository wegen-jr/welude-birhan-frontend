import { useState, useMemo } from "react";
import { toast } from "react-toastify";
import {
  Layers,
  Plus,
  Search,
  RefreshCw,
  Package,
  Building2,
  DollarSign,
  Hash,
  Calendar,
  Trash2,
  AlertTriangle,
  AlertCircle,
  Loader2,
  Calculator,
  Phone,
  FileSpreadsheet
} from "lucide-react";
import { financeService } from "../../services/financeService";
import { extractErrorMessage } from "../../utils/errorUtils";
import BatchFinancialReportModal from "./BatchFinancialReportModal";

export default function PurchasesTab({
  purchases = [],
  products = [],
  suppliers = [],
  loading = false,
  onRefresh,
  isAuthorized = false,
  isDarkMode = true,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [deletingPurchase, setDeletingPurchase] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedReportBatch, setSelectedReportBatch] = useState(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Retrieve current user phone for smart autofill
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();
  const defaultMemberPhone = user?.phone || user?.phoneNo || user?.phoneNumber || "";

  // Form State for Purchase Intake
  const [formProductId, setFormProductId] = useState("");
  const [formSupplierId, setFormSupplierId] = useState("");
  const [formPurchaseBy, setFormPurchaseBy] = useState(defaultMemberPhone);
  const [formPurchaseDate, setFormPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [formQuantity, setFormQuantity] = useState("10");
  const [formUnitPrice, setFormUnitPrice] = useState("");
  const [formSalePrice, setFormSalePrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const filteredPurchases = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return purchases;
    return purchases.filter((b) => {
      const prodName = (b.product?.name || `Product #${b.productId}`).toLowerCase();
      const supName = (b.supplier?.name || `Supplier #${b.supplierId}`).toLowerCase();
      const purchaser = String(b.purchaseBy || b.purchasedBy || "").toLowerCase();
      return (
        prodName.includes(q) ||
        supName.includes(q) ||
        purchaser.includes(q) ||
        String(b.id).includes(q) ||
        String(b.productId).includes(q)
      );
    });
  }, [purchases, searchQuery]);

  // Calculations for purchase form
  const parsedQty = parseInt(formQuantity, 10) || 0;
  const parsedCost = parseFloat(formUnitPrice) || 0;
  const parsedSalePrice = parseFloat(formSalePrice) || 0;
  const computedTotalCost = parsedQty * parsedCost;
  const computedExpectedRevenue = parsedQty * parsedSalePrice;
  const computedExpectedMargin = computedExpectedRevenue - computedTotalCost;

  const handleCreatePurchase = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const prodId = parseInt(formProductId, 10);
    const supId = parseInt(formSupplierId, 10);
    const trimmedPurchaseBy = formPurchaseBy.trim();

    if (!supId || isNaN(supId)) {
      setErrorMessage("Please select a Supplier / Vendor first.");
      return;
    }
    if (!prodId || isNaN(prodId)) {
      setErrorMessage("Please select a Product from the catalog.");
      return;
    }
    if (!trimmedPurchaseBy) {
      setErrorMessage("Purchased By (Member phone number) is required.");
      return;
    }
    if (parsedQty < 1) {
      setErrorMessage("Quantity must be at least 1 unit.");
      return;
    }
    if (parsedCost <= 0) {
      setErrorMessage("Unit cost price must be greater than zero.");
      return;
    }
    if (parsedSalePrice <= 0) {
      setErrorMessage("Selling price per unit must be greater than zero.");
      return;
    }

    setIsSubmitting(true);
    try {
      await financeService.createPurchase({
        productId: prodId,
        supplierId: supId,
        purchaseDate: formPurchaseDate,
        unitPrice: parsedCost,
        salePrice: parsedSalePrice,
        totalPrice: computedTotalCost,
        quantity: parsedQty,
        purchaseBy: trimmedPurchaseBy,
      });

      toast.success(`Purchase Batch recorded! Total cost: ${computedTotalCost.toFixed(2)} ETB`);
      setIsRegisterOpen(false);
      setErrorMessage("");
      setFormProductId("");
      setFormSupplierId("");
      setFormPurchaseBy(defaultMemberPhone);
      setFormQuantity("10");
      setFormUnitPrice("");
      setFormSalePrice("");
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to register purchase batch:", err);
      const dynamicMsg = extractErrorMessage(err, "Failed to log purchase.");
      setErrorMessage(dynamicMsg);
      toast.error(dynamicMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePurchase = async () => {
    if (!deletingPurchase) return;
    setIsDeleting(true);
    try {
      await financeService.deletePurchase(deletingPurchase.id);
      toast.success(`Purchase Batch #BAT-${deletingPurchase.id} removed.`);
      setDeletingPurchase(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to delete purchase batch:", err);
      toast.error(err.message || "Failed to delete purchase batch.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenReport = (batch) => {
    setSelectedReportBatch(batch);
    setIsReportOpen(true);
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
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold border border-amber-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900 dark:text-slate-100">
              Purchases & Inventory Intake (Batches)
            </h3>
            <p className="text-xs text-slate-400">
              Log stock purchases from vendors, establish cost baselines (COGS), and audit batch performance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onRefresh}
            disabled={loading}
            title="Refresh Purchases"
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
              <span>Log Stock Intake</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Bar & Quick Batch Report Selector */}
      <div
        className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 transition-all ${
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
            placeholder="Search batches by product, supplier..."
            className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
              isDarkMode
                ? "bg-white/5 border-white/10 text-slate-100 placeholder-slate-500"
                : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
            }`}
          />
        </div>

        {/* Quick Batch Reports Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <FileSpreadsheet className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500" />
            <select
              value=""
              onChange={(e) => {
                const bId = e.target.value;
                if (!bId) return;
                const found = purchases.find((p) => String(p.id) === String(bId));
                if (found) handleOpenReport(found);
              }}
              className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                isDarkMode
                  ? "bg-white/5 border-white/10 text-slate-200"
                  : "bg-slate-50 border-slate-200 text-slate-800"
              }`}
            >
              <option value="">-- Batch Reports (Quick View) --</option>
              {purchases.map((b) => (
                <option key={b.id} value={b.id}>
                  #BAT-{b.id} • {b.product?.name || `Product #${b.productId}`} ({b.quantity} units)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Purchases Table */}
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
            <p className="text-sm">Fetching purchase batches from live API...</p>
          </div>
        ) : filteredPurchases.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3 border border-amber-500/20">
              <Layers className="w-7 h-7" />
            </div>
            <h4 className="text-base font-serif font-bold text-slate-900 dark:text-slate-100 mb-1">
              No purchase batches recorded
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
              {searchQuery
                ? "No purchase batches match your search query."
                : "Record stock purchases from vendors to create inventory batches for POS sales."}
            </p>
            {isAuthorized && !searchQuery && (
              <button
                onClick={() => setIsRegisterOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Log First Purchase Batch</span>
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
                  <th className="px-4 py-3.5">Batch ID</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Product Name</th>
                  <th className="px-4 py-3.5">Supplier / Vendor</th>
                  <th className="px-4 py-3.5">Purchased By</th>
                  <th className="px-4 py-3.5 text-center">Intake Qty</th>
                  <th className="px-4 py-3.5 text-right">Cost Price (COGS)</th>
                  <th className="px-4 py-3.5 text-right">Target Retail Price</th>
                  <th className="px-4 py-3.5 text-right">Total Batch Cost</th>
                  <th className="px-4 py-3.5 text-center">Audit Report</th>
                  {isAuthorized && <th className="px-4 py-3.5 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-inherit">
                {filteredPurchases.map((b) => {
                  const qty = Number(b.quantity) || 0;
                  const cost = Number(b.unitPrice) || 0;
                  const retail = Number(b.salePrice) || 0;
                  const total = b.totalPrice !== undefined && b.totalPrice !== null ? Number(b.totalPrice) : qty * cost;
                  const prodName = b.product?.name || `Product #${b.productId}`;
                  const matchedSupplier = b.supplier || suppliers.find((s) => Number(s.id) === Number(b.supplierId));
                  const supName = matchedSupplier?.name || (b.supplierId ? `Supplier #${b.supplierId}` : "Direct Vendor");
                  const supPhone = matchedSupplier?.phone || matchedSupplier?.phoneNumber || matchedSupplier?.contactPhone || null;
                  const purchaserPhone = b.purchaseBy || b.purchasedBy || b.member?.phone || b.member?.name || b.phone || b.memberPhone || null;

                  return (
                    <tr
                      key={b.id}
                      className={`transition-colors ${
                        isDarkMode
                          ? "hover:bg-white/5 text-slate-300"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <td className="px-4 py-3.5 font-mono font-bold text-amber-500">
                        #BAT-{b.id}
                      </td>

                      <td className="px-4 py-3.5 text-slate-400">
                        {b.purchaseDate ? new Date(b.purchaseDate).toLocaleDateString() : "N/A"}
                      </td>

                      <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-slate-100">
                        {prodName}
                      </td>

                      <td className="px-4 py-3.5 text-slate-300">
                        <div className="font-medium text-slate-900 dark:text-slate-100">{supName}</div>
                        <div className="text-[11px] text-slate-400 font-mono inline-flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-amber-500/70" />
                          <span>{supPhone || "—"}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[11px]">
                        {purchaserPhone ? (
                          <span className="inline-flex items-center gap-1 text-slate-200">
                            <Phone className="w-3 h-3 text-amber-500/80 shrink-0" />
                            <span>{purchaserPhone}</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {qty}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right font-mono text-slate-300">
                        {cost.toFixed(2)} ETB
                      </td>

                      <td className="px-4 py-3.5 text-right font-mono font-medium text-emerald-400">
                        {retail.toFixed(2)} ETB
                      </td>

                      <td className="px-4 py-3.5 text-right font-mono font-bold text-amber-500">
                        {total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => handleOpenReport(b)}
                          title="View Audit Report"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-all hover:scale-[1.02] shadow-sm"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
                          <span>View Audit Report</span>
                        </button>
                      </td>

                      {isAuthorized && (
                        <td className="px-4 py-3.5 text-center">
                          <button
                            onClick={() => setDeletingPurchase(b)}
                            title="Delete Batch"
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

      {/* Log Stock Intake Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl transition-all max-h-[92vh] overflow-y-auto ${
              isDarkMode
                ? "bg-[#0b1b3d] border-white/10 text-slate-100"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-inherit mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold">Log Inventory Intake Batch</h3>
                  <p className="text-xs text-slate-400">Record stock purchase from vendor</p>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 mb-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreatePurchase} className="space-y-4">
              {/* Step 1: Supplier Select First */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  1. Select Vendor / Supplier <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={formSupplierId}
                    onChange={(e) => {
                      setFormSupplierId(e.target.value);
                      setErrorMessage("");
                    }}
                    required
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                      isDarkMode
                        ? "bg-[#081226] border-white/10 text-slate-100"
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  >
                    <option value="">-- Choose Supplier / Vendor --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.phone || "No phone"})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Step 2: Cascading Product Select (Unlocked after Supplier) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  2. Select Product Item <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <Package className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={formProductId}
                    onChange={(e) => {
                      setFormProductId(e.target.value);
                      setErrorMessage("");
                    }}
                    required
                    disabled={!formSupplierId}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDarkMode
                        ? "bg-[#081226] border-white/10 text-slate-100"
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  >
                    <option value="">
                      {!formSupplierId
                        ? "-- Select Supplier First to Unlock Products --"
                        : "-- Choose Product From Catalog --"}
                    </option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (ID: #{p.id})
                      </option>
                    ))}
                  </select>
                </div>
                {!formSupplierId && (
                  <p className="text-[11px] text-amber-400/90 mt-1">
                    Please select a supplier first to unlock product selection.
                  </p>
                )}
              </div>

              {/* Step 3: Purchased By (Required Member Phone Number) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Purchased By (Member Phone Number) <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={formPurchaseBy}
                    onChange={(e) => {
                      setFormPurchaseBy(e.target.value);
                      setErrorMessage("");
                    }}
                    placeholder="e.g. 0911223344 or +251911223344"
                    required
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                      isDarkMode
                        ? "bg-[#081226] border-white/10 text-slate-100 placeholder-slate-500"
                        : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                    }`}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Validated against church member directory (creator or purchaser).
                </p>
              </div>

              {/* Purchase Date */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Purchase Date <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={formPurchaseDate}
                    onChange={(e) => {
                      setFormPurchaseDate(e.target.value);
                      setErrorMessage("");
                    }}
                    required
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                      isDarkMode
                        ? "bg-white/5 border-white/10 text-slate-100"
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>
              </div>

              {/* Quantity, Unit Cost, Target Sale Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Quantity In <span className="text-amber-500">*</span>
                  </label>
                  <div className="relative">
                    <Hash className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={formQuantity}
                      onChange={(e) => {
                        setFormQuantity(e.target.value);
                        setErrorMessage("");
                      }}
                      required
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                        isDarkMode
                          ? "bg-white/5 border-white/10 text-slate-100"
                          : "bg-slate-50 border-slate-200 text-slate-900"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Unit Cost (ETB) <span className="text-amber-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                      value={formUnitPrice}
                      onChange={(e) => {
                        setFormUnitPrice(e.target.value);
                        setErrorMessage("");
                      }}
                      required
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                        isDarkMode
                          ? "bg-white/5 border-white/10 text-slate-100"
                          : "bg-slate-50 border-slate-200 text-slate-900"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Target Retail (ETB) <span className="text-amber-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                      value={formSalePrice}
                      onChange={(e) => {
                        setFormSalePrice(e.target.value);
                        setErrorMessage("");
                      }}
                      required
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                        isDarkMode
                          ? "bg-white/5 border-white/10 text-slate-100"
                          : "bg-slate-50 border-slate-200 text-slate-900"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Total Batch Expenditure Calculation */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                  isDarkMode ? "bg-amber-500/5 border-amber-500/20" : "bg-amber-50 border-amber-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-amber-500" />
                  <span className="text-slate-400 font-semibold uppercase">Total Batch Cost:</span>
                  <span className="font-mono font-bold text-amber-500 text-base">
                    {computedTotalCost.toLocaleString("en-US", { minimumFractionDigits: 2 })} ETB
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Projected Margin:</span>
                  <span
                    className={`font-mono font-bold ${
                      computedExpectedMargin >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {computedExpectedMargin.toLocaleString("en-US", { minimumFractionDigits: 2 })} ETB
                  </span>
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
                  disabled={
                    isSubmitting ||
                    !formProductId ||
                    !formSupplierId ||
                    !formPurchaseBy.trim() ||
                    parsedQty < 1 ||
                    parsedCost <= 0 ||
                    parsedSalePrice <= 0
                  }
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Recording...</span>
                    </>
                  ) : (
                    <span>Create Purchase Batch</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingPurchase && (
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
            <h3 className="text-lg font-serif font-bold mb-2">Delete Purchase Batch</h3>
            <p className="text-xs sm:text-sm text-slate-400 mb-6">
              Are you sure you want to delete purchase batch <strong className="text-white">#BAT-{deletingPurchase.id}</strong>? Any sales dependent on this batch will be impacted.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingPurchase(null)}
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
                onClick={handleDeletePurchase}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-red-500 hover:bg-red-600 text-white transition-all disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Batch</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formal Batch Financial Performance Report Modal */}
      <BatchFinancialReportModal
        isOpen={isReportOpen}
        onClose={() => {
          setIsReportOpen(false);
          setSelectedReportBatch(null);
        }}
        batch={selectedReportBatch}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
