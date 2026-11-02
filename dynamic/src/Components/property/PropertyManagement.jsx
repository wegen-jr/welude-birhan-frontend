import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import {
  Boxes,
  Package,
  PackagePlus,
  DollarSign,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  FileDown,
  Eye,
  Edit,
  Trash2,
  MinusCircle,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Clock,
  Layers,
  ChevronDown,
  Sparkles,
  Inbox
} from "lucide-react";

import { propertyService } from "../../services/propertyService";
import { extractErrorMessage } from "../../utils/errorUtils";
import { generatePropertyInventoryPdf } from "../../utils/pdfExport";

// Modals
import ProductRegistrationModal from "./ProductRegistrationModal";
import ProductEditModal from "./ProductEditModal";
import ProductDetailsModal from "./ProductDetailsModal";
import AssetDecrementModal from "./AssetDecrementModal";

const ASSET_TYPES = [
  { value: "ALL", label: "All Categories" },
  { value: "ELECTRONICS", label: "Electronics & IT" },
  { value: "AUDIO_VISUAL", label: "Audio / Visual Media" },
  { value: "FURNITURE", label: "Furniture & Seating" },
  { value: "INSTRUMENT", label: "Musical Instruments" },
  { value: "BOOK", label: "Books & Publications" },
  { value: "VEHICLE", label: "Vehicles & Transport" },
  { value: "FACILITY", label: "Facility Tools" },
  { value: "OTHER", label: "Other Parish Property" },
];

export default function PropertyManagement({ isDarkMode = true }) {
  // Live asset catalog state (zero mock data)
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [stockFilter, setStockFilter] = useState("ALL"); // ALL, IN_STOCK, LOW_STOCK, OUT_OF_STOCK

  // Modal states
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDecrementOpen, setIsDecrementOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Active target asset for modals
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Retrieve logged-in admin user details
  const adminUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  /**
   * Fetch live assets from backend API
   */
  const loadAssets = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    setFetchError(null);

    try {
      const data = await propertyService.getAssets();
      setAssets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("[PropertyManagement] Failed to fetch live assets:", err);
      const msg = extractErrorMessage(err, "Failed to load assets from server.");
      setFetchError(msg);
      toast.error(msg);
      setAssets([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadAssets(true);
  };

  /**
   * Calculate live summary statistics strictly from fetched response data
   */
  const metrics = useMemo(() => {
    return propertyService.calculateMetrics(assets);
  }, [assets]);

  /**
   * Filtered assets based on search query, type, status, and stock level
   */
  const filteredAssets = useMemo(() => {
    return assets.filter((item) => {
      // 1. Text Search query
      const query = searchQuery.trim().toLowerCase();
      if (query) {
        const name = (item.name || item.productName || item.assetName || "").toLowerCase();
        const desc = (item.description || "").toLowerCase();
        const type = (item.type || item.category || "").toLowerCase();
        const id = String(item.id || item._id || "").toLowerCase();
        const custodian = String(item.recordedByPhone || item.purchaseBy || "").toLowerCase();

        const matches =
          name.includes(query) ||
          desc.includes(query) ||
          type.includes(query) ||
          id.includes(query) ||
          custodian.includes(query);

        if (!matches) return false;
      }

      // 2. Category / Type filter
      if (selectedType !== "ALL") {
        const itemType = String(item.type || item.category || "").toUpperCase();
        if (itemType !== selectedType) return false;
      }

      // 3. Status filter
      if (selectedStatus !== "ALL") {
        const itemStatus = String(item.status || "ACTIVE").toUpperCase();
        if (itemStatus !== selectedStatus) return false;
      }

      // 4. Stock Level filter
      const qty = Number(item.quantity ?? item.stockQuantity) || 0;
      if (stockFilter === "IN_STOCK" && qty <= 0) return false;
      if (stockFilter === "LOW_STOCK" && (qty <= 0 || qty > 5)) return false;
      if (stockFilter === "OUT_OF_STOCK" && qty > 0) return false;

      return true;
    });
  }, [assets, searchQuery, selectedType, selectedStatus, stockFilter]);

  /**
   * Delete asset handler
   */
  const confirmDeleteAsset = async () => {
    if (!selectedAsset?.id) return;
    setIsDeleting(true);

    try {
      await propertyService.deleteAsset(selectedAsset.id);
      toast.success(`Asset "${selectedAsset.name}" has been deleted.`);
      setIsDeleteOpen(false);
      setSelectedAsset(null);
      loadAssets(true);
    } catch (err) {
      console.error("[PropertyManagement] Asset deletion failed:", err);
      const msg = extractErrorMessage(err, "Failed to delete asset.");
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Generate official PDF inventory report
   */
  const handleGeneratePdf = () => {
    if (assets.length === 0) {
      toast.warning("No assets to export. Please register items first.");
      return;
    }

    try {
      setIsGeneratingPdf(true);
      generatePropertyInventoryPdf(assets, {
        subtitle: "Property & Asset Management",
        adminUser,
      });
      toast.success("Official Property & Asset Report generated!");
    } catch (err) {
      console.error("[PropertyManagement] PDF export failed:", err);
      toast.error("Failed to generate PDF report.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Controls & Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight">
            Property & Asset Catalog
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real-time physical asset registration, stock quantities, and valuation audits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            title="Refresh Asset Records"
            className={`p-2.5 rounded-xl border transition-all ${
              isDarkMode
                ? "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300"
                : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700"
            } disabled:opacity-50`}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-amber-500" : ""}`} />
          </button>

          {/* Official Property PDF Report Button */}
          <button
            onClick={handleGeneratePdf}
            disabled={isLoading || isGeneratingPdf || assets.length === 0}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              isDarkMode
                ? "bg-white/5 border-white/10 hover:bg-white/10 text-slate-200"
                : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {isGeneratingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
            ) : (
              <FileDown className="w-4 h-4 text-amber-500" />
            )}
            <span>Generate PDF Report</span>
          </button>

          {/* Register Asset Button */}
          <button
            onClick={() => setIsRegisterOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <PackagePlus className="w-4 h-4" />
            <span>Register Asset</span>
          </button>
        </div>
      </div>

      {/* Top Statistic Cards - Calculated exclusively from live API response data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Registered Assets */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isDarkMode
              ? "bg-[#0b1b3d]/70 border-white/10 shadow-sm"
              : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Total Registered Assets
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-serif tracking-tight">
              {isLoading ? (
                <span className="inline-block w-12 h-6 bg-slate-500/20 animate-pulse rounded" />
              ) : (
                metrics.totalAssets.toLocaleString()
              )}
            </span>
            <span className="text-xs text-slate-400">catalog items</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Distinct physical assets recorded
          </p>
        </div>

        {/* Card 2: Total Inventory Valuation */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isDarkMode
              ? "bg-[#0b1b3d]/70 border-white/10 shadow-sm"
              : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Total Inventory Valuation
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-serif font-mono tracking-tight text-amber-500">
              {isLoading ? (
                <span className="inline-block w-24 h-6 bg-slate-500/20 animate-pulse rounded" />
              ) : (
                metrics.totalValuation.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              )}
            </span>
            <span className="text-xs text-amber-500 font-bold">ETB</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Cumulative monetary valuation of stock
          </p>
        </div>

        {/* Card 3: Low Stock Warnings */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isDarkMode
              ? "bg-[#0b1b3d]/70 border-white/10 shadow-sm"
              : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Low Stock Warnings
            </span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                metrics.lowStockWarnings > 0
                  ? "bg-red-500/10 text-red-400 border-red-500/20"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold font-serif tracking-tight ${
                metrics.lowStockWarnings > 0 ? "text-red-400" : "text-emerald-400"
              }`}
            >
              {isLoading ? (
                <span className="inline-block w-8 h-6 bg-slate-500/20 animate-pulse rounded" />
              ) : (
                metrics.lowStockWarnings
              )}
            </span>
            <span className="text-xs text-slate-400">assets ≤ 5 units</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {metrics.lowStockWarnings > 0
              ? "Attention needed: reserve low"
              : "All inventory thresholds optimal"}
          </p>
        </div>

        {/* Card 4: Total In-Stock Units */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isDarkMode
              ? "bg-[#0b1b3d]/70 border-white/10 shadow-sm"
              : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Total In-Stock Units
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-serif tracking-tight">
              {isLoading ? (
                <span className="inline-block w-14 h-6 bg-slate-500/20 animate-pulse rounded" />
              ) : (
                metrics.totalUnits.toLocaleString()
              )}
            </span>
            <span className="text-xs text-slate-400">physical units</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Sum of all items on church premises
          </p>
        </div>
      </div>

      {/* Search & Filters Toolbar */}
      <div
        className={`p-4 rounded-2xl border transition-all flex flex-col lg:flex-row items-stretch lg:items-center gap-3.5 ${
          isDarkMode ? "bg-[#0b1b3d]/50 border-white/10" : "bg-white border-slate-200 shadow-sm"
        }`}
      >
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets by name, category, notes, or UUID..."
            className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
              isDarkMode
                ? "bg-white/5 border-white/10 text-slate-100 placeholder-slate-500"
                : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className={`px-3 py-2 pr-8 rounded-xl text-xs font-medium border appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                isDarkMode
                  ? "bg-[#081226] border-white/10 text-slate-200"
                  : "bg-slate-50 border-slate-200 text-slate-700"
              }`}
            >
              {ASSET_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={`px-3 py-2 pr-8 rounded-xl text-xs font-medium border appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                isDarkMode
                  ? "bg-[#081226] border-white/10 text-slate-200"
                  : "bg-slate-50 border-slate-200 text-slate-700"
              }`}
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="RETIRED">Retired</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Stock Level Filter */}
          <div className="relative">
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className={`px-3 py-2 pr-8 rounded-xl text-xs font-medium border appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
                isDarkMode
                  ? "bg-[#081226] border-white/10 text-slate-200"
                  : "bg-slate-50 border-slate-200 text-slate-700"
              }`}
            >
              <option value="ALL">All Stock Levels</option>
              <option value="IN_STOCK">In Stock (&gt; 0)</option>
              <option value="LOW_STOCK">Low Stock (1-5)</option>
              <option value="OUT_OF_STOCK">Out of Stock (0)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Inventory Data Table / Loading / Empty States */}
      <div
        className={`rounded-2xl border overflow-hidden transition-all ${
          isDarkMode
            ? "bg-[#0b1b3d]/60 border-white/10 shadow-xl"
            : "bg-white border-slate-200 shadow-sm"
        }`}
      >
        {isLoading ? (
          /* Loading State */
          <div className="p-16 text-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-amber-500 mx-auto" />
            <div>
              <p className="text-sm font-semibold">Fetching Live Inventory Records...</p>
              <p className="text-xs text-slate-400 mt-0.5">Connecting to church property backend</p>
            </div>
          </div>
        ) : fetchError && assets.length === 0 ? (
          /* Error State */
          <div className="p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold">Failed to Load Property Records</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{fetchError}</p>
            </div>
            <button
              onClick={() => loadAssets()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>
          </div>
        ) : assets.length === 0 ? (
          /* Clean Empty State: If the database is empty */
          <div className="p-16 text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
              <Inbox className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold tracking-tight">
                No assets registered
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                The church asset ledger is currently empty. Start recording physical property, equipment, and Sunday School inventory.
              </p>
            </div>
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <PackagePlus className="w-4 h-4" />
              <span>Register First Asset</span>
            </button>
          </div>
        ) : filteredAssets.length === 0 ? (
          /* Filtered empty state */
          <div className="p-12 text-center max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-500/10 text-slate-400 flex items-center justify-center mx-auto">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold">No Matching Assets Found</h3>
            <p className="text-xs text-slate-400">
              No inventory records match your search criteria. Try modifying your search or clearing filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedType("ALL");
                setSelectedStatus("ALL");
                setStockFilter("ALL");
              }}
              className="text-xs text-amber-500 hover:underline font-semibold"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          /* Inventory Data Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead
                className={`border-b text-[11px] font-semibold uppercase tracking-wider ${
                  isDarkMode
                    ? "bg-white/5 border-white/10 text-slate-400"
                    : "bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                <tr>
                  <th className="px-4 py-3.5 w-12 text-center">#</th>
                  <th className="px-4 py-3.5">Asset ID</th>
                  <th className="px-4 py-3.5">Name & Specifications</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5 text-center">Stock Level</th>
                  <th className="px-4 py-3.5 text-right">Unit Value</th>
                  <th className="px-4 py-3.5 text-right">Total Valuation</th>
                  <th className="px-4 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-inherit">
                {filteredAssets.map((asset, index) => {
                  const rawId = String(asset.id || asset._id || index + 1);
                  const displayId = rawId.length > 10 ? `#AST-${rawId.slice(0, 8)}` : `#AST-${rawId}`;
                  const name = asset.name || asset.productName || asset.assetName || "Unnamed Asset";
                  const desc = asset.description || "";
                  const type = String(asset.type || asset.category || "GENERAL").toUpperCase();
                  const status = String(asset.status || "ACTIVE").toUpperCase();
                  const qty = Number(asset.quantity ?? asset.stockQuantity) || 0;
                  const unitVal = Number(asset.value ?? asset.purchasePrice ?? asset.price) || 0;
                  const totalVal = qty * unitVal;

                  return (
                    <tr
                      key={rawId}
                      className={`transition-colors ${
                        isDarkMode ? "hover:bg-white/5" : "hover:bg-slate-50"
                      }`}
                    >
                      {/* # Index */}
                      <td className="px-4 py-3.5 text-center text-slate-400 font-mono">
                        {index + 1}
                      </td>

                      {/* Asset ID */}
                      <td className="px-4 py-3.5 font-mono text-xs font-semibold text-amber-500 whitespace-nowrap">
                        <span title={rawId}>{displayId}</span>
                      </td>

                      {/* Name & Description */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 max-w-xs truncate">
                          {name}
                        </div>
                        {desc && (
                          <div className="text-[11px] text-slate-400 max-w-xs truncate mt-0.5">
                            {desc}
                          </div>
                        )}
                      </td>

                      {/* Type / Category */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wider ${
                            isDarkMode
                              ? "bg-white/5 text-slate-300 border border-white/10"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {type}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : status === "MAINTENANCE"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                          }`}
                        >
                          {status}
                        </span>
                      </td>

                      {/* Stock Level */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        {qty > 5 ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>{qty} units</span>
                          </span>
                        ) : qty > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20">
                            <AlertTriangle className="w-3 h-3" />
                            <span>{qty} (Low)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-red-400 bg-red-500/10 border border-red-500/20">
                            <span>0 (Out)</span>
                          </span>
                        )}
                      </td>

                      {/* Unit Value */}
                      <td className="px-4 py-3.5 text-right font-mono whitespace-nowrap text-slate-700 dark:text-slate-300">
                        {unitVal.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        <span className="text-[10px] text-slate-400">ETB</span>
                      </td>

                      {/* Total Valuation */}
                      <td className="px-4 py-3.5 text-right font-mono font-bold whitespace-nowrap text-slate-900 dark:text-slate-100">
                        {totalVal.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        <span className="text-[10px] text-amber-500">ETB</span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          {/* View Details */}
                          <button
                            onClick={() => {
                              setSelectedAsset(asset);
                              setIsDetailsOpen(true);
                            }}
                            title="View Asset Details"
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isDarkMode
                                ? "border-white/10 hover:bg-white/10 text-slate-300 hover:text-white"
                                : "border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Asset */}
                          <button
                            onClick={() => {
                              setSelectedAsset(asset);
                              setIsEditOpen(true);
                            }}
                            title="Edit Asset Details"
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isDarkMode
                                ? "border-white/10 hover:bg-white/10 text-amber-400 hover:text-amber-300"
                                : "border-slate-200 hover:bg-slate-100 text-amber-600 hover:text-amber-700"
                            }`}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Decrement Stock */}
                          <button
                            onClick={() => {
                              setSelectedAsset(asset);
                              setIsDecrementOpen(true);
                            }}
                            title="Record Breakage / Deduct Quantity"
                            disabled={qty <= 0}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isDarkMode
                                ? "border-white/10 hover:bg-white/10 text-blue-400 hover:text-blue-300"
                                : "border-slate-200 hover:bg-slate-100 text-blue-600 hover:text-blue-700"
                            } disabled:opacity-30 disabled:cursor-not-allowed`}
                          >
                            <MinusCircle className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Asset */}
                          <button
                            onClick={() => {
                              setSelectedAsset(asset);
                              setIsDeleteOpen(true);
                            }}
                            title="Delete Asset Record"
                            className="p-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer info bar */}
        {!isLoading && filteredAssets.length > 0 && (
          <div
            className={`px-5 py-3 border-t text-xs flex flex-wrap items-center justify-between gap-2 text-slate-400 ${
              isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
            }`}
          >
            <span>
              Showing <strong>{filteredAssets.length}</strong> of <strong>{assets.length}</strong> registered assets
            </span>
            <span>
              Cumulative Filtered Valuation:{" "}
              <strong className="text-amber-500 font-mono">
                {filteredAssets
                  .reduce(
                    (sum, a) =>
                      sum +
                      (Number(a.quantity ?? a.stockQuantity) || 0) *
                        (Number(a.value ?? a.purchasePrice ?? a.price) || 0),
                    0
                  )
                  .toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                ETB
              </strong>
            </span>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* MODALS */}
      {/* ==================================================== */}

      {/* 1. Register Modal */}
      <ProductRegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onProductCreated={() => loadAssets(true)}
        isDarkMode={isDarkMode}
      />

      {/* 2. Edit Modal */}
      <ProductEditModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedAsset(null);
        }}
        asset={selectedAsset}
        onAssetUpdated={() => loadAssets(true)}
        isDarkMode={isDarkMode}
      />

      {/* 3. Details Modal */}
      <ProductDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedAsset(null);
        }}
        asset={selectedAsset}
        isDarkMode={isDarkMode}
      />

      {/* 4. Decrement Stock Modal */}
      <AssetDecrementModal
        isOpen={isDecrementOpen}
        onClose={() => {
          setIsDecrementOpen(false);
          setSelectedAsset(null);
        }}
        asset={selectedAsset}
        onAssetDecremented={() => loadAssets(true)}
        isDarkMode={isDarkMode}
      />

      {/* 5. Delete Confirmation Modal */}
      {isDeleteOpen && selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 space-y-4 transition-all ${
              isDarkMode ? "bg-[#0b1b3d] border-white/10 text-slate-100" : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold font-serif">Confirm Asset Deletion</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Are you sure you want to permanently remove <strong className="text-slate-200">"{selectedAsset.name}"</strong> from inventory? This action will remove the record from live database ledgers.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-inherit">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteOpen(false);
                  setSelectedAsset(null);
                }}
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
                onClick={confirmDeleteAsset}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md transition-all disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Asset</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
