import {
  X,
  FileText,
  Calendar,
  Building,
  User,
  Hash,
  DollarSign,
  Package,
  TrendingUp,
  Clock,
  Printer
} from "lucide-react";
import { generateSingleProductSlipPdf } from "../../utils/pdfExport";

export default function ProductDetailsModal({
  isOpen,
  onClose,
  product,
  isDarkMode = true,
}) {
  if (!isOpen || !product) return null;

  const qty = Number(product.quantity) || 0;
  const cost = Number(product.purchasePrice) || 0;
  const price = Number(product.price) || 0;
  const totalCost = qty * cost;
  const totalRetail = qty * price;
  const margin = price > 0 ? (((price - cost) / price) * 100).toFixed(1) : 0;

  const handleDownloadSlip = () => {
    generateSingleProductSlipPdf(product, { subtitle: "Property & Asset Management" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all ${
          isDarkMode
            ? "bg-[#0b1b3d] border-white/10 text-slate-100"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-inherit bg-amber-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold tracking-tight">
                {product.productName || "Asset Details"}
              </h3>
              <p className="text-xs text-amber-500 font-mono">
                Asset ID: #PRD-{product.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl border transition-colors ${
              isDarkMode
                ? "border-white/10 hover:bg-white/10 text-slate-400 hover:text-white"
                : "border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick status pill */}
          <div className="flex items-center justify-between p-4 rounded-xl border bg-amber-500/5 border-amber-500/20">
            <div>
              <span className="text-xs uppercase text-slate-400 font-semibold block">
                Inventory Status
              </span>
              <span className="text-base font-bold">
                {qty > 5 ? (
                  <span className="text-emerald-400">In Stock ({qty} available)</span>
                ) : qty > 0 ? (
                  <span className="text-amber-400">Low Stock ({qty} available)</span>
                ) : (
                  <span className="text-red-400">Out of Stock (0 units)</span>
                )}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase text-slate-400 font-semibold block">
                Total Asset Valuation
              </span>
              <span className="text-base font-bold font-mono text-amber-500">
                {totalCost.toLocaleString("en-US", { minimumFractionDigits: 2 })} ETB
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className={`p-3.5 rounded-xl border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"}`}>
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-semibold uppercase tracking-wider">Acquisition Cost</span>
              </div>
              <p className="text-sm font-bold font-mono">
                {cost.toFixed(2)} ETB
              </p>
            </div>

            <div className={`p-3.5 rounded-xl border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"}`}>
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold uppercase tracking-wider">Selling / Retail Price</span>
              </div>
              <p className="text-sm font-bold font-mono">
                {price.toFixed(2)} ETB
              </p>
            </div>

            <div className={`p-3.5 rounded-xl border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"}`}>
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Building className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-semibold uppercase tracking-wider">Supplier / Vendor</span>
              </div>
              <p className="text-sm font-semibold truncate">
                {product.purchaseFrom || "N/A"}
              </p>
            </div>

            <div className={`p-3.5 rounded-xl border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"}`}>
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <User className="w-3.5 h-3.5 text-purple-400" />
                <span className="font-semibold uppercase tracking-wider">Purchaser / Phone</span>
              </div>
              <p className="text-sm font-semibold truncate">
                {product.purchaseBy || "N/A"}
              </p>
            </div>

            <div className={`p-3.5 rounded-xl border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"}`}>
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-semibold uppercase tracking-wider">Purchase Date</span>
              </div>
              <p className="text-sm font-semibold">
                {product.purchaseDate ? new Date(product.purchaseDate).toLocaleDateString() : "N/A"}
              </p>
            </div>

            <div className={`p-3.5 rounded-xl border ${isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"}`}>
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold uppercase tracking-wider">Gross Margin %</span>
              </div>
              <p className="text-sm font-bold text-emerald-400">
                {margin}%
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-inherit flex items-center justify-between gap-3 bg-amber-500/5">
          <button
            type="button"
            onClick={onClose}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              isDarkMode
                ? "border-white/10 hover:bg-white/10 text-slate-300"
                : "border-slate-200 hover:bg-slate-100 text-slate-700"
            }`}
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleDownloadSlip}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-lg shadow-amber-500/20 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Generate Asset Slip (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
