import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  X,
  ShoppingCart,
  Loader2,
  DollarSign,
  Hash,
  AlertCircle,
  Package,
  Layers,
  Building2,
  Calculator,
  TrendingUp,
  AlertTriangle,
  Phone
} from "lucide-react";
import { financeService } from "../../services/financeService";
import { validatePhoneNumber } from "../../utils/phoneValidation";
import { extractErrorMessage } from "../../utils/errorUtils";

export default function CreateSaleModal({
  isOpen,
  onClose,
  onSaleRecorded,
  isDarkMode = true,
}) {
  // Retrieve current user phone for smart autofill
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();
  const defaultMemberPhone = user?.phone || user?.phoneNo || user?.phoneNumber || "";

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(false);

  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");
  const [memberPhone, setMemberPhone] = useState(defaultMemberPhone);
  const [customerPhone, setCustomerPhone] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Load suppliers, products and purchase batches from live Swagger API on modal open
  useEffect(() => {
    if (!isOpen) return;
    let active = true;

    async function loadPrerequisites() {
      setLoadingInitial(true);
      setErrorMessage("");
      try {
        const [prodList, purchaseList, supplierList] = await Promise.all([
          financeService.getProducts().catch((err) => {
            console.warn("Could not load products:", err);
            return [];
          }),
          financeService.getPurchases().catch((err) => {
            console.warn("Could not load purchase batches:", err);
            return [];
          }),
          financeService.getSuppliers().catch((err) => {
            console.warn("Could not load suppliers:", err);
            return [];
          }),
        ]);

        if (active) {
          const validProds = Array.isArray(prodList) ? prodList : [];
          const validPurchases = Array.isArray(purchaseList) ? purchaseList : [];
          const validSuppliers = Array.isArray(supplierList) ? supplierList : [];
          setProducts(validProds);
          setPurchases(validPurchases);
          setSuppliers(validSuppliers);

          // Reset selection state
          setSelectedSupplierId("");
          setSelectedProductId("");
          setSelectedBatchId("");
          setQuantity("1");
          setUnitPrice("");
          setMemberPhone(defaultMemberPhone);
          setCustomerPhone("");
        }
      } finally {
        if (active) setLoadingInitial(false);
      }
    }

    loadPrerequisites();
    return () => {
      active = false;
    };
  }, [isOpen, defaultMemberPhone]);

  if (!isOpen) return null;

  // Filter batches for the currently selected supplier
  const batchesForSupplier = purchases.filter(
    (b) => Number(b.supplierId) === Number(selectedSupplierId)
  );

  // Cascading Products: Products associated with selected supplier batches
  const availableProducts = (() => {
    if (!selectedSupplierId) return [];
    const prodIdsWithBatches = new Set(batchesForSupplier.map((b) => Number(b.productId)));
    const matchingProds = products.filter((p) => prodIdsWithBatches.has(Number(p.id)));

    // Fallback if some batches have product object but id was not in products list
    const existingIds = new Set(matchingProds.map((p) => Number(p.id)));
    batchesForSupplier.forEach((b) => {
      if (b.productId && !existingIds.has(Number(b.productId))) {
        matchingProds.push({
          id: b.productId,
          name: b.product?.name || `Product #${b.productId}`,
        });
        existingIds.add(Number(b.productId));
      }
    });

    // If this supplier has no batches yet, provide catalog products so user can still see them
    if (matchingProds.length === 0 && batchesForSupplier.length === 0) {
      return products;
    }

    return matchingProds;
  })();

  // Cascading Batches: Batches for selected supplier AND selected product
  const availableBatches = purchases.filter(
    (b) =>
      Number(b.supplierId) === Number(selectedSupplierId) &&
      Number(b.productId) === Number(selectedProductId)
  );

  const selectedBatchObj = availableBatches.find(
    (b) => Number(b.id) === Number(selectedBatchId)
  );

  const handleSupplierChange = (e) => {
    const supId = e.target.value;
    setSelectedSupplierId(supId);
    setSelectedProductId("");
    setSelectedBatchId("");
    setUnitPrice("");
    setErrorMessage("");
  };

  const handleProductChange = (e) => {
    const prodId = e.target.value;
    setSelectedProductId(prodId);
    setErrorMessage("");

    const matchingBatches = purchases.filter(
      (b) =>
        Number(b.supplierId) === Number(selectedSupplierId) &&
        Number(b.productId) === Number(prodId)
    );

    if (matchingBatches.length > 0) {
      const firstBatch = matchingBatches[0];
      setSelectedBatchId(String(firstBatch.id));
      setUnitPrice(firstBatch.salePrice !== undefined ? String(firstBatch.salePrice) : "");
    } else {
      setSelectedBatchId("");
      setUnitPrice("");
    }
  };

  const handleBatchChange = (e) => {
    const batchId = e.target.value;
    setSelectedBatchId(batchId);
    setErrorMessage("");

    const foundBatch = availableBatches.find((b) => Number(b.id) === Number(batchId));
    if (foundBatch && foundBatch.salePrice !== undefined) {
      setUnitPrice(String(foundBatch.salePrice));
    }
  };

  const parsedQty = parseInt(quantity, 10) || 0;
  const parsedUnitPrice = parseFloat(unitPrice) || 0;
  const grossSaleTotal = parsedQty * parsedUnitPrice;
  const batchCostPrice = selectedBatchObj ? Number(selectedBatchObj.unitPrice) || 0 : 0;
  const realizedMargin = parsedQty * (parsedUnitPrice - batchCostPrice);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const supId = parseInt(selectedSupplierId, 10);
    const prodId = parseInt(selectedProductId, 10);
    const batchId = parseInt(selectedBatchId, 10);
    const trimmedMemberPhone = memberPhone.trim();

    if (!supId || isNaN(supId)) {
      setErrorMessage("Please select a Supplier / Vendor first.");
      return;
    }
    if (!prodId || isNaN(prodId)) {
      setErrorMessage("Please select a Product from the catalog.");
      return;
    }
    if (!batchId || isNaN(batchId)) {
      setErrorMessage("Please select an active Purchase Batch for this product.");
      return;
    }
    if (!trimmedMemberPhone) {
      setErrorMessage("Member phone number (purchaseBy) is required.");
      return;
    }
    if (parsedQty < 1) {
      setErrorMessage("Quantity must be at least 1 unit.");
      return;
    }
    if (unitPrice === "" || parsedUnitPrice <= 0) {
      setErrorMessage("Unit sale price must be a valid positive number.");
      return;
    }

    const trimmedCustomerPhone = customerPhone.trim();
    if (trimmedCustomerPhone) {
      const phoneValidation = validatePhoneNumber(trimmedCustomerPhone, { required: false });
      if (!phoneValidation.isValid) {
        setErrorMessage(phoneValidation.error);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        productId: prodId,
        purchaseProductId: batchId,
        quantity: parsedQty,
        unitPrice: parsedUnitPrice,
        purchaseBy: trimmedMemberPhone,
      };

      const result = await financeService.createSale(payload);
      toast.success(
        `Sale recorded successfully! Total: ${grossSaleTotal.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} ETB`
      );
      const enrichedResult = result && typeof result === "object"
        ? { ...result, customerPhone: trimmedCustomerPhone, purchaseBy: trimmedMemberPhone }
        : { id: result?.id, customerPhone: trimmedCustomerPhone, purchaseBy: trimmedMemberPhone };
      if (onSaleRecorded) onSaleRecorded(enrichedResult);
      setErrorMessage("");
      onClose();
    } catch (err) {
      console.error("Sale recording error:", err);
      const dynamicMsg = extractErrorMessage(err, "Failed to record sale transaction.");
      setErrorMessage(dynamicMsg);
      toast.error(dynamicMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-all ${
          isDarkMode
            ? "bg-[#0b1b3d] border-white/10 text-slate-100"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-inherit bg-amber-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold border border-amber-500/20">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold tracking-tight">
                Record Point of Sale (POS)
              </h3>
              <p className="text-xs text-slate-400">
                Dispense product inventory from an active intake batch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className={`p-2 rounded-xl border transition-colors ${
              isDarkMode
                ? "border-white/10 hover:bg-white/10 text-slate-400 hover:text-white"
                : "border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {loadingInitial ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-7 h-7 animate-spin text-amber-500" />
              <p className="text-xs">Loading live products & purchase batches from backend...</p>
            </div>
          ) : (
            <>
              {/* Step 1: Supplier Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  1. Select Vendor / Supplier <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={selectedSupplierId}
                    onChange={handleSupplierChange}
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

              {/* Step 2: Cascading Product Item Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  2. Select Product Item <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <Package className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={selectedProductId}
                    onChange={handleProductChange}
                    required
                    disabled={!selectedSupplierId || availableProducts.length === 0}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDarkMode
                        ? "bg-[#081226] border-white/10 text-slate-100"
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  >
                    <option value="">
                      {!selectedSupplierId
                        ? "-- Select Supplier First to Unlock Products --"
                        : availableProducts.length === 0
                        ? "-- No Products Found for this Supplier --"
                        : "-- Choose Product From Supplier Catalog --"}
                    </option>
                    {availableProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (ID: #{p.id})
                      </option>
                    ))}
                  </select>
                </div>
                {!selectedSupplierId && (
                  <p className="text-[11px] text-amber-400/90 mt-1">
                    Please select a supplier first to unlock product selection.
                  </p>
                )}
                {selectedSupplierId && availableProducts.length === 0 && (
                  <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>No products available from this supplier. Please log a Purchase Batch under Purchases.</span>
                  </p>
                )}
              </div>

              {/* Step 3: Cascading Purchase Batch Reference */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  3. Purchase Batch Reference <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <Layers className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={selectedBatchId}
                    onChange={handleBatchChange}
                    required
                    disabled={!selectedProductId || availableBatches.length === 0}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDarkMode
                        ? "bg-[#081226] border-white/10 text-slate-100"
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  >
                    <option value="">
                      {!selectedProductId
                        ? "-- Select Product First to View Batches --"
                        : availableBatches.length === 0
                        ? "-- No Intake Batches Found for this Selection --"
                        : "-- Select Purchase Batch --"}
                    </option>
                    {availableBatches.map((b) => {
                      const dateStr = b.purchaseDate ? new Date(b.purchaseDate).toLocaleDateString() : "";
                      return (
                        <option key={b.id} value={b.id}>
                          Batch #{b.id} — Total: {b.quantity} units | Cost: {Number(b.unitPrice || 0).toFixed(2)} ETB | Target Price: {Number(b.salePrice || 0).toFixed(2)} ETB {dateStr ? `(${dateStr})` : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {selectedProductId && availableBatches.length === 0 && (
                  <div className="p-3 mt-2 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>
                      No intake purchase records exist for this product and supplier. Please log a Purchase Batch under the Purchases tab.
                    </span>
                  </div>
                )}
              </div>

              {/* Quantity & Unit Sale Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Quantity to Sell <span className="text-amber-500">*</span>
                  </label>
                  <div className="relative">
                    <Hash className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={quantity}
                      onChange={(e) => {
                        setQuantity(e.target.value);
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
                  {selectedBatchObj && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Batch intake pool: <span className="font-mono font-bold text-amber-400">{selectedBatchObj.quantity} units</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Unit Sale Price (ETB) <span className="text-amber-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={unitPrice}
                      onChange={(e) => {
                        setUnitPrice(e.target.value);
                        setErrorMessage("");
                      }}
                      required
                      placeholder="0.00"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                        isDarkMode
                          ? "bg-white/5 border-white/10 text-slate-100 placeholder-slate-500"
                          : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                      }`}
                    />
                  </div>
                  {selectedBatchObj && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Acquisition cost: <span className="font-mono text-slate-300">{batchCostPrice.toFixed(2)} ETB</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Member Phone Number (Who records this sale - required per Swagger CreateProductSaleDto) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Member Phone Number (Recorded By) <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={memberPhone}
                    onChange={(e) => {
                      setMemberPhone(e.target.value);
                      setErrorMessage("");
                    }}
                    required
                    placeholder="e.g. 0911223344 or +251911223344"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                      isDarkMode
                        ? "bg-[#081226] border-white/10 text-slate-100 placeholder-slate-500"
                        : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                    }`}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Validated against Sunday School church member directory.
                </p>
              </div>

              {/* Customer / Buyer Contact Phone (Optional POS Receipt detail) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Customer / Buyer Contact Phone <span className="text-slate-500 font-normal lowercase">(optional for slip)</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => {
                      setCustomerPhone(e.target.value);
                      setErrorMessage("");
                    }}
                    placeholder="e.g. +251 91 122 3344 or 0911223344"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                      isDarkMode
                        ? "bg-white/5 border-white/10 text-slate-100 placeholder-slate-500"
                        : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                    }`}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Optional buyer contact for receipt generation.
                </p>
              </div>

              {/* POS Calculation Summary Box */}
              <div
                className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs transition-all ${
                  isDarkMode ? "bg-amber-500/5 border-amber-500/20" : "bg-amber-50 border-amber-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shrink-0">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] uppercase font-semibold">
                      Gross Sale Total:
                    </span>
                    <span className="text-xl font-bold font-mono text-amber-500">
                      {grossSaleTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB
                    </span>
                  </div>
                </div>

                {selectedBatchObj && (
                  <div className="text-left sm:text-right">
                    <span className="text-slate-400 block text-[11px] uppercase font-semibold">
                      Estimated Batch Margin:
                    </span>
                    <span
                      className={`text-sm font-bold font-mono inline-flex items-center gap-1 ${
                        realizedMargin >= 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{realizedMargin.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB</span>
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-inherit flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
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
                loadingInitial ||
                !selectedSupplierId ||
                !selectedProductId ||
                !selectedBatchId ||
                !memberPhone.trim() ||
                parsedQty < 1 ||
                parsedUnitPrice <= 0
              }
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Recording Sale...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>Record Transaction</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
