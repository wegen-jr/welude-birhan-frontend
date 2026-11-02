import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  X,
  Edit3,
  Loader2,
  DollarSign,
  User,
  Hash,
  AlertCircle,
  Tag,
  Layers,
  FileText,
  Activity,
  Info
} from "lucide-react";
import { propertyService } from "../../services/propertyService";
import { extractErrorMessage } from "../../utils/errorUtils";

const ASSET_TYPES = [
  { value: "ELECTRONICS", label: "Electronics & IT Equipment" },
  { value: "AUDIO_VISUAL", label: "Sound & Audio/Visual Media" },
  { value: "FURNITURE", label: "Furniture & Church Seating" },
  { value: "INSTRUMENT", label: "Musical Instruments & Hymnal Items" },
  { value: "BOOK", label: "Books, Scriptures & Publications" },
  { value: "VEHICLE", label: "Vehicles & Transport" },
  { value: "FACILITY", label: "Facility & Maintenance Tools" },
  { value: "OTHER", label: "Other Parish Property" },
];

function getInitialFormData(asset) {
  return {
    name: asset?.name ?? asset?.productName ?? asset?.assetName ?? "",
    type: String(asset?.type ?? asset?.category ?? "ELECTRONICS").toUpperCase(),
    value: asset?.value !== undefined ? String(asset.value) : (asset?.purchasePrice !== undefined ? String(asset.purchasePrice) : "0"),
    quantity: asset?.quantity !== undefined ? String(asset.quantity) : (asset?.stockQuantity !== undefined ? String(asset.stockQuantity) : "1"),
    status: String(asset?.status || "ACTIVE").toUpperCase(),
    description: asset?.description || "",
    recordedByPhone: asset?.recordedByPhone || asset?.purchaseBy || "",
  };
}

export default function ProductEditModal({
  isOpen,
  onClose,
  product, // accepts asset as product or asset
  asset,   // alias
  onProductUpdated,
  onAssetUpdated,
  isDarkMode = true,
}) {
  const currentAsset = asset || product;
  const [formData, setFormData] = useState(() => getInitialFormData(currentAsset));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (currentAsset) {
      setFormData(getInitialFormData(currentAsset));
      setErrorMessage("");
    }
  }, [currentAsset]);

  if (!isOpen || !currentAsset) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage("");
  };

  const qty = parseInt(formData.quantity, 10) || 0;
  const unitVal = parseFloat(formData.value) || 0;
  const totalValuation = qty * unitVal;
  const rawId = String(currentAsset.id || currentAsset._id || "");
  const displayId = rawId.length > 10 ? `#AST-${rawId.slice(0, 8)}` : `#AST-${rawId}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.name.trim()) {
      setErrorMessage("Asset name is required.");
      return;
    }
    if (formData.quantity === "" || parseInt(formData.quantity, 10) < 0) {
      setErrorMessage("Quantity must be a non-negative integer.");
      return;
    }
    if (formData.value === "" || parseFloat(formData.value) < 0) {
      setErrorMessage("Monetary value must be a non-negative number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type.toUpperCase(),
        value: parseFloat(formData.value),
        quantity: parseInt(formData.quantity, 10),
        status: formData.status,
      };

      if (formData.recordedByPhone.trim()) {
        payload.recordedByPhone = formData.recordedByPhone.trim();
        payload.purchaseBy = formData.recordedByPhone.trim();
      }

      const result = await propertyService.updateAsset(currentAsset.id, payload);
      toast.success(`Asset "${formData.name}" updated successfully!`);
      if (onProductUpdated) onProductUpdated(result);
      if (onAssetUpdated) onAssetUpdated(result);
      setErrorMessage("");
      onClose();
    } catch (err) {
      console.error("Asset update error:", err);
      const dynamicMsg = extractErrorMessage(err, "Failed to update asset.");
      setErrorMessage(dynamicMsg);
      toast.error(dynamicMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-all ${
          isDarkMode
            ? "bg-[#0b1b3d] border-white/10 text-slate-100"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-inherit bg-amber-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold tracking-tight">
                Edit Asset {displayId}
              </h3>
              <p className="text-xs text-slate-400">
                Update inventory specifications, valuation, and operational status
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Asset Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Asset Name <span className="text-amber-500">*</span>
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                  isDarkMode
                    ? "bg-white/5 border-white/10 text-slate-100"
                    : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              />
            </div>
          </div>

          {/* Grid: Type & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Category / Classification
              </label>
              <div className="relative">
                <Layers className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                    isDarkMode
                      ? "bg-[#081226] border-white/10 text-slate-100"
                      : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                >
                  {ASSET_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Operational Status
              </label>
              <div className="relative">
                <Activity className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                    isDarkMode
                      ? "bg-[#081226] border-white/10 text-slate-100"
                      : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                >
                  <option value="ACTIVE">ACTIVE (Operational & In-Service)</option>
                  <option value="MAINTENANCE">MAINTENANCE (Under Repair / Servicing)</option>
                  <option value="RETIRED">RETIRED (Decommissioned / Archival)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid: Quantity & Value */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Quantity on Hand
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  name="quantity"
                  min="0"
                  step="1"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                    isDarkMode
                      ? "bg-white/5 border-white/10 text-slate-100"
                      : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Unit Value (ETB)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  name="value"
                  min="0"
                  step="0.01"
                  value={formData.value}
                  onChange={handleChange}
                  required
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                    isDarkMode
                      ? "bg-white/5 border-white/10 text-slate-100"
                      : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Valuation Preview */}
          <div
            className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
              isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
            }`}
          >
            <div className="flex items-center gap-2 text-slate-400">
              <Info className="w-3.5 h-3.5 text-amber-500" />
              <span>Reconciled Valuation:</span>
            </div>
            <span className="font-mono text-amber-500 font-bold">
              {totalValuation.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB
            </span>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Description & Specifications
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <textarea
                name="description"
                rows="2"
                value={formData.description}
                onChange={handleChange}
                placeholder="Serial number, physical condition, storage location, or model notes"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                  isDarkMode
                    ? "bg-white/5 border-white/10 text-slate-100"
                    : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              />
            </div>
          </div>

          {/* Custodian Phone */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Custodian / Recorded Member Phone
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="recordedByPhone"
                value={formData.recordedByPhone}
                onChange={handleChange}
                placeholder="e.g. 0911223344"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                  isDarkMode
                    ? "bg-white/5 border-white/10 text-slate-100"
                    : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              />
            </div>
          </div>

          {/* Actions */}
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
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
