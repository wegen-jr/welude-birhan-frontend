import { useState } from "react";
import { toast } from "react-toastify";
import {
  X,
  MinusCircle,
  Loader2,
  Hash,
  AlertCircle,
  PackageMinus
} from "lucide-react";
import { propertyService } from "../../services/propertyService";
import { extractErrorMessage } from "../../utils/errorUtils";

export default function AssetDecrementModal({
  isOpen,
  onClose,
  asset,
  onAssetDecremented,
  isDarkMode = true,
}) {
  const [amount, setAmount] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen || !asset) return null;

  const currentStock = Number(asset.quantity ?? asset.stockQuantity) || 0;
  const deductQty = parseInt(amount, 10) || 0;
  const remainingAfter = Math.max(0, currentStock - deductQty);
  const rawId = String(asset.id || asset._id || "");
  const displayId = rawId.length > 10 ? `#AST-${rawId.slice(0, 8)}` : `#AST-${rawId}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (isNaN(deductQty) || deductQty <= 0) {
      setErrorMessage("Deduction quantity must be at least 1.");
      return;
    }
    if (deductQty > currentStock) {
      setErrorMessage(`Cannot deduct ${deductQty} items. Only ${currentStock} available in inventory.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await propertyService.decrementAsset(asset.id, deductQty);
      toast.success(`Deducted ${deductQty} unit(s) from asset "${asset.name}".`);
      if (onAssetDecremented) onAssetDecremented(result);
      onClose();
    } catch (err) {
      console.error("Asset decrement error:", err);
      const dynamicMsg = extractErrorMessage(err, "Failed to decrease asset quantity.");
      setErrorMessage(dynamicMsg);
      toast.error(dynamicMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-[92vw] sm:max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl flex flex-col transition-all ${
          isDarkMode
            ? "bg-[#0b1b3d] border-white/10 text-slate-100"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-inherit bg-amber-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              <PackageMinus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold tracking-tight">
                Reduce Stock / Record Breakage
              </h3>
              <p className="text-xs text-slate-400">
                {displayId} • {asset.name}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Current Stock Balance info */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
              isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
            }`}
          >
            <div>
              <span className="text-slate-400 block">Current In-Stock:</span>
              <span className="font-bold text-sm text-slate-100 dark:text-slate-100">{currentStock} Units</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block">Remaining After:</span>
              <span className={`font-bold text-sm ${remainingAfter <= 5 ? "text-amber-400" : "text-emerald-400"}`}>
                {remainingAfter} Units
              </span>
            </div>
          </div>

          {/* Amount to Deduct */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Units to Deduct / Breakage Amount <span className="text-amber-500">*</span>
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                min="1"
                max={currentStock}
                step="1"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
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
            <p className="text-[11px] text-slate-400 mt-1">
              Calls backend decrement endpoint to reflect damaged, broken, or consumed items.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-inherit flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
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
              disabled={isSubmitting || currentStock <= 0}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deducting...</span>
                </>
              ) : (
                <>
                  <MinusCircle className="w-4 h-4" />
                  <span>Confirm Reduction</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
