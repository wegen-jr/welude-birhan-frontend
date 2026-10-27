import { useState } from "react";
import { toast } from "react-toastify";
import {
  X,
  Edit3,
  Loader2,
  DollarSign,
  Calendar,
  Building,
  User,
  Hash,
  AlertCircle,
  Tag
} from "lucide-react";
import { propertyService } from "../../services/propertyService";
import { extractErrorMessage } from "../../utils/errorUtils";

function getInitialFormData(prod) {
  return {
    productName: prod?.productName || "",
    quantity: prod?.quantity !== undefined ? String(prod.quantity) : "0",
    purchaseDate: prod?.purchaseDate
      ? new Date(prod.purchaseDate).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    purchaseFrom: prod?.purchaseFrom || "",
    purchaseBy: prod?.purchaseBy || "",
    purchasePrice: prod?.purchasePrice !== undefined ? String(prod.purchasePrice) : "0",
    price: prod?.price !== undefined ? String(prod.price) : "0",
  };
}

export default function ProductEditModal({
  isOpen,
  onClose,
  product,
  onProductUpdated,
  isDarkMode = true,
}) {
  const [prevProductId, setPrevProductId] = useState(product?.id);
  const [formData, setFormData] = useState(() => getInitialFormData(product));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (product && product.id !== prevProductId) {
    setPrevProductId(product.id);
    setFormData(getInitialFormData(product));
  }

  if (!isOpen || !product) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.productName.trim()) {
      setErrorMessage("Product name is required.");
      return;
    }
    if (formData.quantity === "" || parseInt(formData.quantity, 10) < 0) {
      setErrorMessage("Quantity must be a non-negative integer.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        productName: formData.productName.trim(),
        quantity: parseInt(formData.quantity, 10),
        purchaseDate: new Date(formData.purchaseDate).toISOString(),
        purchaseFrom: formData.purchaseFrom.trim(),
        purchaseBy: formData.purchaseBy.trim(),
        purchasePrice: parseFloat(formData.purchasePrice) || 0,
        price: parseFloat(formData.price) || 0,
      };

      const result = await propertyService.updateProduct(product.id, payload);
      toast.success(`Asset "${formData.productName}" updated successfully!`);
      if (onProductUpdated) onProductUpdated(result);
      setErrorMessage("");
      onClose();
    } catch (err) {
      console.error("Product update error:", err);
      const dynamicMsg = extractErrorMessage(err, "Failed to update product.");
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
                Edit Asset / Product #PRD-{product.id}
              </h3>
              <p className="text-xs text-slate-400">
                Update inventory specifications and price valuations
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

          {/* Product Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Product / Asset Name
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="productName"
                value={formData.productName}
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

          {/* Quantity, Cost, Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Quantity
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
                Cost Price (ETB)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  name="purchasePrice"
                  min="0"
                  step="0.01"
                  value={formData.purchasePrice}
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
                Selling Price (ETB)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  value={formData.price}
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

          {/* Supplier and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Supplier / Store
              </label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="purchaseFrom"
                  value={formData.purchaseFrom}
                  onChange={handleChange}
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
                Purchase Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                    isDarkMode
                      ? "bg-white/5 border-white/10 text-slate-100"
                      : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Purchaser / Custodian */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Purchaser / Custodian (Phone Number)
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="purchaseBy"
                value={formData.purchaseBy}
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
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
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
