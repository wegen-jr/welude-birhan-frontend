import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  X,
  PackagePlus,
  Loader2,
  DollarSign,
  Calendar,
  Building,
  User,
  Hash,
  AlertCircle,
  Tag,
  Info
} from "lucide-react";
import { propertyService } from "../../services/propertyService";
import { memberService } from "../../services/memberService";
import { extractErrorMessage } from "../../utils/errorUtils";

export default function ProductRegistrationModal({
  isOpen,
  onClose,
  onProductCreated,
  isDarkMode = true,
}) {
  const [formData, setFormData] = useState({
    productName: "",
    quantity: "",
    purchaseDate: new Date().toISOString().slice(0, 10),
    purchaseFrom: "",
    purchaseBy: "",
    purchasePrice: "",
    price: "",
  });

  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [useManualPhone, setUseManualPhone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Load members for custodian / purchaser phone number verification
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    async function loadMembers() {
      setLoadingMembers(true);
      try {
        const data = await memberService.getAllMembers();
        if (isMounted) {
          setMembers(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.warn("Could not load members for purchaser selection:", err);
      } finally {
        if (isMounted) setLoadingMembers(false);
      }
    }
    loadMembers();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage("");
  };

  const handleMemberSelect = (e) => {
    const selectedPhone = e.target.value;
    setFormData((prev) => ({ ...prev, purchaseBy: selectedPhone }));
    setErrorMessage("");
  };

  // Calculations for quick preview
  const cost = parseFloat(formData.purchasePrice) || 0;
  const retail = parseFloat(formData.price) || 0;
  const qty = parseInt(formData.quantity, 10) || 0;
  const totalValuation = qty * cost;
  const unitMargin = retail - cost;
  const marginPercent = retail > 0 ? ((unitMargin / retail) * 100).toFixed(1) : 0;

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
    if (!formData.purchaseFrom.trim()) {
      setErrorMessage("Supplier / Store (Purchase From) is required.");
      return;
    }
    if (!formData.purchaseBy.trim()) {
      setErrorMessage("Purchaser / Custodian phone number is required.");
      return;
    }
    if (formData.purchasePrice === "" || parseFloat(formData.purchasePrice) < 0) {
      setErrorMessage("Purchase price must be a non-negative number.");
      return;
    }
    if (formData.price === "" || parseFloat(formData.price) < 0) {
      setErrorMessage("Selling price must be a non-negative number.");
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
        purchasePrice: parseFloat(formData.purchasePrice),
        price: parseFloat(formData.price),
      };

      const result = await propertyService.createProduct(payload);
      toast.success(`Asset "${formData.productName}" successfully registered!`);
      if (onProductCreated) onProductCreated(result);
      setErrorMessage("");
      onClose();
    } catch (err) {
      console.error("Product registration error:", err);
      const dynamicMsg = extractErrorMessage(err, "Failed to register product.");
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
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-inherit bg-amber-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold tracking-tight">
                Register New Asset / Product
              </h3>
              <p className="text-xs text-slate-400">
                Record new inventory into organizational asset management
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

          {/* Product Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Product / Asset Name <span className="text-amber-500">*</span>
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                placeholder="e.g. Sunday School Hymn Book, Sound Console"
                required
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                  isDarkMode
                    ? "bg-white/5 border-white/10 text-slate-100 placeholder-slate-500"
                    : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                }`}
              />
            </div>
          </div>

          {/* Grid: Quantity, Purchase Price, Selling Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Quantity <span className="text-amber-500">*</span>
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
                  placeholder="e.g. 50"
                  required
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                    isDarkMode
                      ? "bg-white/5 border-white/10 text-slate-100 placeholder-slate-500"
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Cost Price (ETB) <span className="text-amber-500">*</span>
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
                  placeholder="e.g. 150.00"
                  required
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                    isDarkMode
                      ? "bg-white/5 border-white/10 text-slate-100 placeholder-slate-500"
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Selling Price (ETB) <span className="text-amber-500">*</span>
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
                  placeholder="e.g. 200.00"
                  required
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                    isDarkMode
                      ? "bg-white/5 border-white/10 text-slate-100 placeholder-slate-500"
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Pricing Margin Preview Pill */}
          <div
            className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
              isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
            }`}
          >
            <div className="flex items-center gap-2 text-slate-400">
              <Info className="w-3.5 h-3.5 text-amber-500" />
              <span>Valuation Preview:</span>
            </div>
            <div className="flex items-center gap-4">
              <span>
                Total Batch Cost:{" "}
                <strong className="text-amber-500 font-mono">
                  {totalValuation.toLocaleString("en-US", { minimumFractionDigits: 2 })} ETB
                </strong>
              </span>
              <span>
                Unit Margin:{" "}
                <strong className={unitMargin >= 0 ? "text-emerald-400 font-mono" : "text-red-400 font-mono"}>
                  {unitMargin.toFixed(2)} ETB ({marginPercent}%)
                </strong>
              </span>
            </div>
          </div>

          {/* Supplier and Purchase Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Supplier / Store <span className="text-amber-500">*</span>
              </label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="purchaseFrom"
                  value={formData.purchaseFrom}
                  onChange={handleChange}
                  placeholder="e.g. Holy Trinity Bookstore, Commercial Vendor"
                  required
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                    isDarkMode
                      ? "bg-white/5 border-white/10 text-slate-100 placeholder-slate-500"
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Purchase Date <span className="text-amber-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
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

          {/* Purchaser / Custodian (verified member phone number) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Purchaser / Staff Member Phone <span className="text-amber-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setUseManualPhone((prev) => !prev)}
                className="text-[11px] text-amber-500 hover:underline font-medium"
              >
                {useManualPhone ? "Select from Members" : "Enter Phone Manually"}
              </button>
            </div>

            {!useManualPhone && members.length > 0 ? (
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={formData.purchaseBy}
                  onChange={handleMemberSelect}
                  required
                  disabled={loadingMembers}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                    isDarkMode
                      ? "bg-[#081226] border-white/10 text-slate-100"
                      : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                >
                  <option value="">
                    {loadingMembers ? "-- Loading church members... --" : "-- Select Church Member / Staff --"}
                  </option>
                  {members.map((m) => {
                    const phone = m.phone || m.phoneNumber || "";
                    const name = m.fullName || m.name || m.full_name || "Member";
                    return (
                      <option key={m.id || phone} value={phone}>
                        {name} ({phone || "No phone"})
                      </option>
                    );
                  })}
                </select>
              </div>
            ) : (
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="purchaseBy"
                  value={formData.purchaseBy}
                  onChange={handleChange}
                  placeholder="e.g. 0911223344 (Verified Member Phone Number)"
                  required
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                    isDarkMode
                      ? "bg-white/5 border-white/10 text-slate-100 placeholder-slate-500"
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                  }`}
                />
              </div>
            )}
            <p className="text-[11px] text-slate-400 mt-1">
              Backend verifies the purchaser phone number against the church member roster.
            </p>
          </div>

          {/* Modal Actions */}
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
                  <span>Registering Asset...</span>
                </>
              ) : (
                <>
                  <PackagePlus className="w-4 h-4" />
                  <span>Register Asset</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
