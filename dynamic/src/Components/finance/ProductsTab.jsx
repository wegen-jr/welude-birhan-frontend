import { useState, useMemo } from "react";
import { toast } from "react-toastify";
import {
  Package,
  Plus,
  Search,
  RefreshCw,
  FileText,
  Trash2,
  AlertTriangle,
  AlertCircle,
  Loader2,
  Calendar,
  Phone
} from "lucide-react";
import { financeService } from "../../services/financeService";
import { extractErrorMessage } from "../../utils/errorUtils";

export default function ProductsTab({
  products = [],
  loading = false,
  onRefresh,
  isAuthorized = false,
  isDarkMode = true,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Retrieve current user phone for smart autofill
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();
  const defaultMemberPhone = user?.phone || user?.phoneNo || user?.phoneNumber || "";

  // Form State
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPhnoNo, setFormPhnoNo] = useState(defaultMemberPhone);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return products;
    return products.filter((p) => {
      const creatorPhone = p.creatBy || p.createBy || p.phnoNo || p.phoneNo || p.phone || p.member?.phoneNo || p.member?.phone || "";
      return (
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        creatorPhone.toLowerCase().includes(q) ||
        String(p.id).includes(q)
      );
    });
  }, [products, searchQuery]);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formName.trim()) {
      setErrorMessage("Product name is required.");
      return;
    }
    if (!formDescription.trim()) {
      setErrorMessage("Product description is required.");
      return;
    }
    if (!formPhnoNo.trim()) {
      setErrorMessage("Creator / Member phone number is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await financeService.createProduct({
        name: formName.trim(),
        description: formDescription.trim(),
        creatBy: formPhnoNo.trim(),
      });
      toast.success(`Product "${formName.trim()}" registered successfully!`);
      setIsRegisterOpen(false);
      setFormName("");
      setFormDescription("");
      setFormPhnoNo(defaultMemberPhone);
      setErrorMessage("");
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to create product:", err);
      const dynamicMsg = extractErrorMessage(err, "Failed to register product.");
      setErrorMessage(dynamicMsg);
      toast.error(dynamicMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    try {
      await financeService.deleteProduct(deletingProduct.id);
      toast.success(`Product "${deletingProduct.name}" removed successfully.`);
      setDeletingProduct(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to delete product:", err);
      toast.error(err.message || "Failed to delete product.");
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
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold border border-amber-500/20">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900 dark:text-slate-100">
              Product Catalog Items
            </h3>
            <p className="text-xs text-slate-400">
              Register master product listings, descriptions, and catalog items before purchase intake.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onRefresh}
            disabled={loading}
            title="Refresh Products"
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
              <span>Register Product</span>
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
            placeholder="Search products by name or description..."
            className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
              isDarkMode
                ? "bg-white/5 border-white/10 text-slate-100 placeholder-slate-500"
                : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
            }`}
          />
        </div>
      </div>

      {/* Products Table */}
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
            <p className="text-sm">Fetching catalog products from live API...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3 border border-amber-500/20">
              <Package className="w-7 h-7" />
            </div>
            <h4 className="text-base font-serif font-bold text-slate-900 dark:text-slate-100 mb-1">
              No products found
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
              {searchQuery
                ? "No catalog items match your search query."
                : "There are currently no products registered in the inventory catalog."}
            </p>
            {isAuthorized && !searchQuery && (
              <button
                onClick={() => setIsRegisterOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Register First Product</span>
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
                  <th className="px-4 py-3.5">Product ID</th>
                  <th className="px-4 py-3.5">Product Name</th>
                  <th className="px-4 py-3.5">Description / Specifications</th>
                  <th className="px-4 py-3.5">Creator Phone</th>
                  <th className="px-4 py-3.5">Date Added</th>
                  {isAuthorized && <th className="px-4 py-3.5 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-inherit">
                {filteredProducts.map((p) => (
                  <tr
                    key={p.id}
                    className={`transition-colors ${
                      isDarkMode
                        ? "hover:bg-white/5 text-slate-300"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <td className="px-4 py-3.5 font-mono font-bold text-amber-500">
                      #PRD-{p.id}
                    </td>

                    <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-slate-100">
                      {p.name}
                    </td>

                    <td className="px-4 py-3.5 text-slate-300 max-w-md">
                      <span className="inline-flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="line-clamp-2">{p.description || "No description provided."}</span>
                      </span>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-[11px]">
                      {p.creatBy || p.createBy || p.phnoNo || p.phoneNo || p.phone || p.member?.phoneNo || p.member?.phone ? (
                        <span className="inline-flex items-center gap-1 text-slate-200">
                          <Phone className="w-3 h-3 text-amber-500/80" />
                          <span>{p.creatBy || p.createBy || p.phnoNo || p.phoneNo || p.phone || p.member?.phoneNo || p.member?.phone}</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px]">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "Catalog Item"}</span>
                      </span>
                    </td>

                    {isAuthorized && (
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => setDeletingProduct(p)}
                          title="Delete Product"
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Register Product Modal */}
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
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold">Register Catalog Product</h3>
                  <p className="text-xs text-slate-400">Add an item to the product directory</p>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 mb-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Product Name <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    setErrorMessage("");
                  }}
                  placeholder="e.g. Mezmure Dawit, Silver Blessing Cross, Uniform"
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                    isDarkMode
                      ? "bg-white/5 border-white/10 text-slate-100"
                      : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Creator / Member Phone Number <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={formPhnoNo}
                    onChange={(e) => {
                      setFormPhnoNo(e.target.value);
                      setErrorMessage("");
                    }}
                    placeholder="e.g. 0911223344 or +251911223344"
                    required
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                      isDarkMode
                        ? "bg-white/5 border-white/10 text-slate-100 placeholder-slate-500"
                        : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                    }`}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Validated against live Sunday School church member directory.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Detailed Description <span className="text-amber-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => {
                    setFormDescription(e.target.value);
                    setErrorMessage("");
                  }}
                  placeholder="e.g. Hardcover edition with Ge'ez & Amharic parallel text, 350 pages."
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all resize-none ${
                    isDarkMode
                      ? "bg-white/5 border-white/10 text-slate-100 placeholder-slate-500"
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                  }`}
                />
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
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Product</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
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
            <h3 className="text-lg font-serif font-bold mb-2">Delete Catalog Product</h3>
            <p className="text-xs sm:text-sm text-slate-400 mb-6">
              Are you sure you want to remove product{" "}
              <strong className="text-white">"{deletingProduct.name}"</strong> (#PRD-{deletingProduct.id})? This will also affect any associated purchase batches.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
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
                onClick={handleDeleteProduct}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-red-500 hover:bg-red-600 text-white transition-all disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Product</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
