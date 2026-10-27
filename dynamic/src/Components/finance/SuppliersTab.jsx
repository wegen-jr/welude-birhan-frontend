import { useState, useMemo } from "react";
import { toast } from "react-toastify";
import {
  Building2,
  Plus,
  Search,
  RefreshCw,
  Phone,
  MapPin,
  Trash2,
  Edit3,
  AlertTriangle,
  AlertCircle,
  Loader2,
  Calendar,
  FileText,
  Copy,
  Check,
  X
} from "lucide-react";
import { financeService } from "../../services/financeService";
import { generateSuppliersReportPdf } from "../../utils/pdfExport";
import { validatePhoneNumber, formatPhoneDisplay } from "../../utils/phoneValidation";
import { extractErrorMessage } from "../../utils/errorUtils";

export default function SuppliersTab({
  suppliers = [],
  loading = false,
  onRefresh,
  isAuthorized = false,
  isDarkMode = true,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [deletingSupplier, setDeletingSupplier] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Retrieve current user phone for member identification
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();
  const defaultMemberPhone = user?.phone || user?.phoneNo || user?.phoneNumber || "";

  // Registration Form State
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formRecordedBy, setFormRecordedBy] = useState(defaultMemberPhone);
  const [formAddress, setFormAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Edit Form State
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [editErrorMessage, setEditErrorMessage] = useState("");

  const filteredSuppliers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return suppliers;
    return suppliers.filter((s) => {
      const name = (s.name || "").toLowerCase();
      const phone = (s.phone || s.phoneNumber || s.contactPhone || s.phone_number || "").toLowerCase();
      const recordedBy = (s.purchaseBy || s.recordedBy || s.registeredBy || s.memberPhone || s.member?.phone || s.member?.name || "").toLowerCase();
      const address = (s.address || "").toLowerCase();
      const idStr = String(s.id || "");
      return name.includes(q) || phone.includes(q) || recordedBy.includes(q) || address.includes(q) || idStr.includes(q);
    });
  }, [suppliers, searchQuery]);

  const handleCopyPhone = async (phone, id) => {
    if (!phone) return;
    try {
      await navigator.clipboard.writeText(phone);
      setCopiedId(id);
      toast.info(`Phone number ${phone} copied to clipboard!`);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.warn("Failed to copy phone to clipboard:", err);
    }
  };

  const handleExportPdf = () => {
    if (filteredSuppliers.length === 0) {
      toast.info("No supplier records available to export.");
      return;
    }
    generateSuppliersReportPdf(filteredSuppliers, { subtitle: "Finance & Procurement Administration" });
    toast.success("Vendor & Supplier Directory PDF exported!");
  };

  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const name = formName.trim();
    const phone = formPhone.trim();
    const recordedBy = formRecordedBy.trim();
    const address = formAddress.trim();

    if (!name) {
      setErrorMessage("Supplier / Vendor name is required.");
      return;
    }

    if (!phone) {
      setErrorMessage("Supplier contact phone number is required.");
      return;
    }

    if (!recordedBy) {
      setErrorMessage("Recorded By (Member Phone) is required.");
      return;
    }

    if (!address) {
      setErrorMessage("Physical business address is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await financeService.createSupplier({
        name,
        phone,
        address,
        purchaseBy: recordedBy,
      });
      toast.success(`Supplier "${name}" registered successfully!`);
      setIsRegisterOpen(false);
      setFormName("");
      setFormPhone("");
      setFormAddress("");
      setFormRecordedBy(defaultMemberPhone);
      setErrorMessage("");
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to create supplier:", err);
      const dynamicMsg = extractErrorMessage(err, "Failed to create supplier.");
      setErrorMessage(dynamicMsg);
      toast.error(dynamicMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (supplier) => {
    setEditingSupplier(supplier);
    setEditName(supplier.name || "");
    setEditPhone(supplier.phone || supplier.phoneNumber || supplier.contactPhone || supplier.phone_number || "");
    setEditAddress(supplier.address || "");
    setEditErrorMessage("");
  };

  const handleUpdateSupplier = async (e) => {
    e.preventDefault();
    if (!editingSupplier) return;
    setEditErrorMessage("");

    const name = editName.trim();
    const phone = editPhone.trim();
    const address = editAddress.trim();

    if (!name) {
      setEditErrorMessage("Supplier / Vendor name is required.");
      return;
    }

    const phoneValidation = validatePhoneNumber(phone, { required: true });
    if (!phoneValidation.isValid) {
      setEditErrorMessage(phoneValidation.error);
      toast.error(phoneValidation.error);
      return;
    }

    if (!address) {
      setEditErrorMessage("Physical business address is required.");
      return;
    }

    setIsUpdating(true);
    try {
      await financeService.updateSupplier(editingSupplier.id, {
        name,
        phone,
        address,
      });
      toast.success(`Supplier "${name}" updated successfully!`);
      setEditingSupplier(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to update supplier:", err);
      const msg = err.message || "Failed to update supplier.";
      setEditErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteSupplier = async () => {
    if (!deletingSupplier) return;
    setIsDeleting(true);
    try {
      await financeService.deleteSupplier(deletingSupplier.id);
      toast.success(`Supplier "${deletingSupplier.name}" removed successfully.`);
      setDeletingSupplier(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to delete supplier:", err);
      toast.error(err.message || "Failed to delete supplier.");
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
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900 dark:text-slate-100">
              Vendor & Supplier Directory
            </h3>
            <p className="text-xs text-slate-400">
              Manage physical product suppliers, vendor contact phone numbers, and procurement fulfillment partners.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onRefresh}
            disabled={loading}
            title="Refresh Suppliers"
            className={`p-2.5 rounded-xl border transition-all ${
              isDarkMode
                ? "border-white/10 hover:bg-white/10 text-slate-300"
                : "border-slate-200 hover:bg-slate-100 text-slate-700"
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-500" : ""}`} />
          </button>

          <button
            onClick={handleExportPdf}
            disabled={loading || suppliers.length === 0}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              isDarkMode
                ? "bg-white/5 border-white/10 hover:bg-white/10 text-slate-200 disabled:opacity-40"
                : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800 disabled:opacity-40"
            }`}
          >
            <FileText className="w-4 h-4 text-amber-500" />
            <span>Export Vendors PDF</span>
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
              <span>Register Supplier</span>
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
            placeholder="Search suppliers by name, phone, address..."
            className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
              isDarkMode
                ? "bg-white/5 border-white/10 text-slate-100 placeholder-slate-500"
                : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
            }`}
          />
        </div>
      </div>

      {/* Suppliers Table */}
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
            <p className="text-sm">Fetching suppliers from live API...</p>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3 border border-amber-500/20">
              <Building2 className="w-7 h-7" />
            </div>
            <h4 className="text-base font-serif font-bold text-slate-900 dark:text-slate-100 mb-1">
              No suppliers found
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
              {searchQuery
                ? "No registered suppliers match your search criteria."
                : "There are currently no product vendors registered in the system."}
            </p>
            {isAuthorized && !searchQuery && (
              <button
                onClick={() => setIsRegisterOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Register First Supplier</span>
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
                  <th className="px-4 py-3.5">Supplier ID</th>
                  <th className="px-4 py-3.5">Vendor Name</th>
                  <th className="px-4 py-3.5">Contact Phone</th>
                  <th className="px-4 py-3.5">Recorded By</th>
                  <th className="px-4 py-3.5">Physical Address</th>
                  <th className="px-4 py-3.5">Date Registered</th>
                  {isAuthorized && <th className="px-4 py-3.5 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-inherit">
                {filteredSuppliers.map((s) => {
                  const phoneVal = s.phone || s.phoneNumber || s.contactPhone || s.phone_number;
                  const displayPhone = formatPhoneDisplay(phoneVal, "—");
                  const recordedBy = s.purchaseBy || s.recordedBy || s.registeredBy || s.memberPhone || s.member?.phone || s.member?.name || null;

                  return (
                    <tr
                      key={s.id}
                      className={`transition-colors ${
                        isDarkMode
                          ? "hover:bg-white/5 text-slate-300"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <td className="px-4 py-3.5 font-mono font-bold text-amber-500">
                        #SUP-{s.id}
                      </td>

                      <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-slate-100">
                        {s.name}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="inline-flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 font-mono text-slate-200 dark:text-slate-200">
                            <Phone className="w-3.5 h-3.5 text-amber-500/80" />
                            <span className={phoneVal ? "font-semibold text-slate-100 dark:text-slate-100" : "text-slate-500 italic"}>
                              {displayPhone}
                            </span>
                          </span>
                          {phoneVal && (
                            <button
                              onClick={() => handleCopyPhone(phoneVal, s.id)}
                              title="Copy Phone Number"
                              className={`p-1 rounded transition-colors ${
                                copiedId === s.id
                                    ? "text-emerald-400 bg-emerald-500/10"
                                  : isDarkMode
                                  ? "text-slate-400 hover:text-amber-400 hover:bg-white/10"
                                  : "text-slate-500 hover:text-amber-600 hover:bg-slate-200"
                              }`}
                            >
                              {copiedId === s.id ? (
                                <Check className="w-3.5 h-3.5" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Recorded By Column */}
                      <td className="px-4 py-3.5 font-mono text-[11px]">
                        {recordedBy ? (
                          <span className="inline-flex items-center gap-1.5 text-slate-200">
                            <Phone className="w-3 h-3 text-amber-500/80 shrink-0" />
                            <span>{recordedBy}</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-slate-300">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{s.address || "—"}</span>
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-slate-400">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "Active"}</span>
                        </span>
                      </td>

                      {isAuthorized && (
                        <td className="px-4 py-3.5 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(s)}
                              title="Edit Supplier"
                              className={`p-1.5 rounded-lg border transition-colors ${
                                isDarkMode
                                  ? "border-white/10 hover:bg-amber-500/10 text-amber-400 hover:text-amber-300"
                                  : "border-slate-200 hover:bg-amber-50 text-amber-600 hover:text-amber-700"
                              }`}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingSupplier(s)}
                              title="Delete Supplier"
                              className={`p-1.5 rounded-lg border transition-colors ${
                                isDarkMode
                                  ? "border-white/10 hover:bg-red-500/10 text-red-400 hover:text-red-300"
                                  : "border-slate-200 hover:bg-red-50 text-red-600 hover:text-red-700"
                              }`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
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

      {/* Register Supplier Modal */}
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
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold">Register New Supplier</h3>
                  <p className="text-xs text-slate-400">Create vendor profile for inventory purchasing</p>
                </div>
              </div>
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 mb-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateSupplier} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Supplier / Vendor Name <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Acme Corp, Addis Religious Bookstore"
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
                  Contact Phone Number <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => {
                      setFormPhone(e.target.value);
                      setErrorMessage("");
                    }}
                    placeholder="e.g. +251 91 122 3344 or 0911223344"
                    required
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                      isDarkMode
                        ? "bg-white/5 border-white/10 text-slate-100"
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  External supplier/vendor telephone or mobile contact (requires no member verification).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Recorded By (Member Phone) <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={formRecordedBy}
                    onChange={(e) => {
                      setFormRecordedBy(e.target.value);
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
                  Validated against church member directory (member recording this vendor).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Physical / Business Address <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    placeholder="e.g. Piazza St., Holy Trinity Compound, Addis Ababa"
                    required
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                      isDarkMode
                        ? "bg-white/5 border-white/10 text-slate-100"
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
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
                    !formName.trim() ||
                    !formPhone.trim() ||
                    !formRecordedBy.trim() ||
                    !formAddress.trim()
                  }
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Supplier</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Supplier Modal */}
      {editingSupplier && (
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
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold">Update Supplier Profile</h3>
                  <p className="text-xs text-slate-400">Edit vendor contact information and address</p>
                </div>
              </div>
              <button
                onClick={() => setEditingSupplier(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editErrorMessage && (
              <div className="p-3 mb-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editErrorMessage}</span>
              </div>
            )}

            <form onSubmit={handleUpdateSupplier} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Supplier / Vendor Name <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Acme Corp"
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
                  Contact Phone Number <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => {
                      setEditPhone(e.target.value);
                      setEditErrorMessage("");
                    }}
                    placeholder="e.g. +251 91 122 3344 or 0911223344"
                    required
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                      isDarkMode
                        ? "bg-white/5 border-white/10 text-slate-100"
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Format: Standard Ethiopian (+251 9... / 09...) or international number.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Physical / Business Address <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="e.g. Piazza St., Addis Ababa"
                    required
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                      isDarkMode
                        ? "bg-white/5 border-white/10 text-slate-100"
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-inherit flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingSupplier(null)}
                  disabled={isUpdating}
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
                  disabled={isUpdating}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-all disabled:opacity-50"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <span>Update Supplier</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingSupplier && (
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
            <h3 className="text-lg font-serif font-bold mb-2">Delete Supplier Record</h3>
            <p className="text-xs sm:text-sm text-slate-400 mb-6">
              Are you sure you want to remove supplier{" "}
              <strong className="text-white">"{deletingSupplier.name}"</strong> (#SUP-{deletingSupplier.id})? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingSupplier(null)}
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
                onClick={handleDeleteSupplier}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-red-500 hover:bg-red-600 text-white transition-all disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Supplier</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
