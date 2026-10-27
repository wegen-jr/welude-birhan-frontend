import { useState, useMemo } from "react";
import { toast } from "react-toastify";
import {
  ShoppingCart,
  Plus,
  Search,
  RefreshCw,
  FileText,
  Calendar,
  Loader2,
  Printer,
  Layers,
  Inbox,
  Phone
} from "lucide-react";
import { generateSalesSummaryPdf, generateSaleReceiptPdf } from "../../utils/pdfExport";

export default function SalesTab({
  sales = [],
  loading = false,
  onRefresh,
  onOpenPos,
  isAuthorized = false,
  isDarkMode = true,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");

  const filteredSales = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    return sales.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const pName = (s.product?.name || s.productName || (s.productId ? `Product #${s.productId}` : "")).toLowerCase();
      const batchStr = s.purchaseProductId ? `batch #${s.purchaseProductId}`.toLowerCase() : "";
      const phoneStr = (s.customerPhone || s.phone || s.phoneNumber || s.purchaseProduct?.supplier?.phone || "").toLowerCase();
      const matchesSearch =
        !q ||
        pName.includes(q) ||
        batchStr.includes(q) ||
        phoneStr.includes(q) ||
        String(s.id).includes(q);

      let matchesDate = true;
      const rawDate = s.createdAt || s.salesDate || s.date;
      if (dateFilter !== "all" && rawDate) {
        const saleDate = new Date(rawDate);
        if (dateFilter === "today") {
          matchesDate = saleDate.toISOString().slice(0, 10) === todayStr;
        } else if (dateFilter === "this_week") {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          matchesDate = saleDate >= sevenDaysAgo && saleDate <= now;
        } else if (dateFilter === "this_month") {
          matchesDate =
            saleDate.getMonth() === now.getMonth() &&
            saleDate.getFullYear() === now.getFullYear();
        }
      }

      return matchesSearch && matchesDate;
    });
  }, [sales, searchQuery, dateFilter]);

  const handleExportPdf = () => {
    if (filteredSales.length === 0) {
      toast.info("No sales transactions match the filter to export.");
      return;
    }
    generateSalesSummaryPdf(filteredSales, { subtitle: "Finance & Sales Administration" });
    toast.success("Sales Summary Report PDF generated!");
  };

  const handlePrintReceipt = (sale) => {
    generateSaleReceiptPdf(sale, { subtitle: "Finance & Sales Administration" });
    toast.success(`Receipt for transaction #SLS-${sale.id} generated!`);
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
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900 dark:text-slate-100">
              Point of Sale Ledger (POS Transactions)
            </h3>
            <p className="text-xs text-slate-400">
              Live audit record of inventory sold, batch references, and gross revenue transactions.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onRefresh}
            disabled={loading}
            title="Refresh Sales"
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
            disabled={loading || sales.length === 0}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              isDarkMode
                ? "bg-white/5 border-white/10 hover:bg-white/10 text-slate-200 disabled:opacity-40"
                : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800 disabled:opacity-40"
            }`}
          >
            <FileText className="w-4 h-4 text-amber-500" />
            <span>Export Sales PDF</span>
          </button>

          {isAuthorized && (
            <button
              onClick={onOpenPos}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20 transition-all shrink-0"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Record New Sale (POS)</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-all ${
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
            placeholder="Search by transaction #, product, batch..."
            className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
              isDarkMode
                ? "bg-white/5 border-white/10 text-slate-100 placeholder-slate-500"
                : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
            }`}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
            <Calendar className="w-3.5 h-3.5" />
            <span>Date Scope:</span>
          </div>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className={`w-full sm:w-auto px-3 py-2 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all ${
              isDarkMode
                ? "bg-[#081226] border-white/10 text-slate-100"
                : "bg-slate-50 border-slate-200 text-slate-900"
            }`}
          >
            <option value="all">All Time ({sales.length})</option>
            <option value="today">Today</option>
            <option value="this_week">Past 7 Days</option>
            <option value="this_month">This Month</option>
          </select>
        </div>
      </div>

      {/* Sales Transactions Table */}
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
            <p className="text-sm">Fetching sales transactions from backend...</p>
          </div>
        ) : filteredSales.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3 border border-amber-500/20">
              <Inbox className="w-7 h-7" />
            </div>
            <h4 className="text-base font-serif font-bold text-slate-900 dark:text-slate-100 mb-1">
              No transactions found
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
              {searchQuery || dateFilter !== "all"
                ? "No sales match your current search or date filter."
                : "There are currently no product sales transactions recorded in the system."}
            </p>
            {isAuthorized && !searchQuery && dateFilter === "all" && (
              <button
                onClick={onOpenPos}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Record First Sale</span>
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
                  <th className="px-4 py-3.5">Sale ID</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Product Item</th>
                  <th className="px-4 py-3.5">Batch Reference</th>
                  <th className="px-4 py-3.5">Contact Phone</th>
                  <th className="px-4 py-3.5 text-center">Qty</th>
                  <th className="px-4 py-3.5 text-right">Unit Price</th>
                  <th className="px-4 py-3.5 text-right">Total Amount</th>
                  <th className="px-4 py-3.5 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-inherit">
                {filteredSales.map((s) => {
                  const qty = Number(s.quantity) || 0;
                  const unitPrice = Number(s.unitPrice ?? s.salesPrice ?? 0);
                  const total = s.totalPrice !== undefined && s.totalPrice !== null
                    ? Number(s.totalPrice)
                    : qty * unitPrice;
                  const rawDate = s.createdAt || s.salesDate || s.date;
                  const dateStr = rawDate ? new Date(rawDate).toLocaleDateString() : "N/A";
                  const productName = s.product?.name || s.productName || (s.productId ? `Product #${s.productId}` : "Item");
                  const batchText = s.purchaseProductId ? `Batch #${s.purchaseProductId}` : "—";
                  const contactPhone = s.customerPhone || s.phone || s.phoneNumber || s.contactPhone || s.purchaseProduct?.supplier?.phone || null;

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
                        #SLS-{s.id}
                      </td>

                      <td className="px-4 py-3.5 text-slate-400">
                        {dateStr}
                      </td>

                      <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-slate-100">
                        {productName}
                      </td>

                      <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px]">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 border border-white/10">
                          <Layers className="w-3 h-3 text-slate-400" />
                          <span>{batchText}</span>
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[11px]">
                        {contactPhone ? (
                          <span className="inline-flex items-center gap-1.5 text-slate-200">
                            <Phone className="w-3.5 h-3.5 text-amber-500/80" />
                            <span>{contactPhone}</span>
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

                      <td className="px-4 py-3.5 text-right font-mono font-medium">
                        {unitPrice.toFixed(2)} ETB
                      </td>

                      <td className="px-4 py-3.5 text-right font-mono font-bold text-amber-500">
                        {total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => handlePrintReceipt(s)}
                          title="Generate Receipt (PDF)"
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
                            isDarkMode
                              ? "border-white/10 hover:bg-white/10 text-amber-400 hover:text-amber-300"
                              : "border-slate-200 hover:bg-slate-100 text-amber-600 hover:text-amber-700"
                          }`}
                        >
                          <Printer className="w-3 h-3" />
                          <span>Print</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
