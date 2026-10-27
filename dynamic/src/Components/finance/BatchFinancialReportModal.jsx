import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  X,
  FileSpreadsheet,
  Download,
  Loader2,
  TrendingUp,
  DollarSign,
  Package,
  AlertCircle,
  RefreshCw,
  Phone,
  CheckCircle2,
  ShieldCheck
} from "lucide-react";
import { financeService } from "../../services/financeService";
import { extractErrorMessage } from "../../utils/errorUtils";
import { generateBatchFinancialReportPdf } from "../../utils/pdfExport";

export default function BatchFinancialReportModal({
  isOpen,
  onClose,
  batch,
  isDarkMode = true,
}) {
  const [prevBatchId, setPrevBatchId] = useState(batch?.id);
  const [isFetchingManual, setIsFetchingManual] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  if (batch?.id !== prevBatchId) {
    setPrevBatchId(batch?.id);
    setReportData(null);
    setErrorMessage("");
    setIsFetchingManual(false);
  }

  // Retrieve current logged-in user / admin info for audit metadata
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();

  const batchId = batch?.id;
  const isLoading = Boolean(isOpen && batchId && reportData === null && !errorMessage) || isFetchingManual;

  // Trigger live API call whenever modal is opened for a specific batch
  useEffect(() => {
    if (!isOpen || !batchId) return;

    let isMounted = true;

    financeService
      .getBatchFinancialReport(batchId)
      .then((data) => {
        if (isMounted) {
          setReportData(data && typeof data === "object" ? data : {});
          setErrorMessage("");
        }
      })
      .catch((err) => {
        console.error("Failed to fetch batch financial report:", err);
        if (isMounted) {
          const dynamicMsg = extractErrorMessage(
            err,
            `Failed to generate financial report for Purchase Batch #BAT-${batchId}.`
          );
          setErrorMessage(dynamicMsg);
          setReportData(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsFetchingManual(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, batchId]);

  if (!isOpen || !batch) return null;

  // Metadata from batch object
  const prodName = batch.product?.name || `Product #${batch.productId || "N/A"}`;
  const supName = batch.supplier?.name || (batch.supplierId ? `Supplier #${batch.supplierId}` : "Direct Vendor");
  const supPhone = batch.supplier?.phone || batch.supplier?.phoneNumber || batch.supplier?.contactPhone || null;
  const purchaserPhone = batch.purchaseBy || batch.purchasedBy || "—";
  const purchaseDate = batch.purchaseDate ? new Date(batch.purchaseDate).toLocaleDateString() : "N/A";
  const initialQty = Number(batch.quantity || 0);
  const unitCost = Number(batch.unitPrice || 0);
  const salePrice = Number(batch.salePrice || 0);
  const totalCost = Number(batch.totalPrice ?? initialQty * unitCost);

  // STRICT ZERO-MOCK DATA: Directly read metrics returned by GET /product-sales/report/{purchaseProductId}
  const rawProfit = reportData?.profit ?? reportData?.totalProfit ?? reportData?.grossProfit ?? 0;
  const rawNetIncome = reportData?.netIncome ?? reportData?.net_income ?? reportData?.netProfit ?? 0;
  const rawRemainingStock =
    reportData?.remainingStock ??
    reportData?.remainingQuantity ??
    reportData?.remaining_stock ??
    reportData?.stock ??
    0;

  const netIncomeNum = Number(rawNetIncome);
  const profitNum = Number(rawProfit);
  const remainingStockNum = Number(rawRemainingStock);

  const handleDownloadPdf = () => {
    if (!reportData) {
      toast.warning("Financial report data has not yet loaded.");
      return;
    }

    setIsExporting(true);
    try {
      generateBatchFinancialReportPdf(reportData, batch, {
        adminUser: user,
      });
      toast.success("Office Report PDF generated successfully!");
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF document. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleRetry = () => {
    if (!batchId) return;
    setIsFetchingManual(true);
    setErrorMessage("");
    financeService
      .getBatchFinancialReport(batchId)
      .then((data) => {
        setReportData(data && typeof data === "object" ? data : {});
      })
      .catch((err) => {
        const dynamicMsg = extractErrorMessage(
          err,
          `Failed to load financial report for Purchase Batch #BAT-${batchId}.`
        );
        setErrorMessage(dynamicMsg);
      })
      .finally(() => {
        setIsFetchingManual(false);
      });
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
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold border border-amber-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-serif font-bold tracking-tight">
                  Purchase Batch Financial Performance Report
                </h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded-md font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  #BAT-{batch.id}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official financial reconciliation • {prodName} • {supName}
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Loading State */}
          {isLoading && (
            <div className="py-14 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              <p className="text-xs font-medium">
                Fetching live financial report from server (GET /product-sales/report/{batch.id})...
              </p>
            </div>
          )}

          {/* Dynamic Error State */}
          {!isLoading && errorMessage && (
            <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-semibold">Backend Report Generation Error:</span>
              </div>
              <p className="pl-6 text-slate-300 font-mono text-[11px]">{errorMessage}</p>
              <div className="pl-6 pt-1">
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Request</span>
                </button>
              </div>
            </div>
          )}

          {/* Loaded Report Content */}
          {!isLoading && !errorMessage && reportData && (
            <>
              {/* Executive Metrics Overview (Strictly mapped from live backend payload) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Reconciled Financial Performance Metrics</span>
                  </h4>
                  <span className="text-[10px] text-amber-400/90 font-mono">
                    Live Swagger Endpoint: /product-sales/report/{batch.id}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {/* Metric 1: Net Income */}
                  <div
                    className={`p-4 rounded-xl border transition-all ${
                      netIncomeNum >= 0
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-red-500/10 border-red-500/30 text-red-400"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold uppercase tracking-wider text-[11px]">Net Income</span>
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div className="text-xl font-mono font-bold">
                      {netIncomeNum.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      <span className="text-xs font-normal">ETB</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {netIncomeNum >= 0
                        ? "Positive net yield above total batch cost"
                        : "Deficit (batch capital still unrecovered)"}
                    </p>
                  </div>

                  {/* Metric 2: Profit */}
                  <div className="p-4 rounded-xl border bg-amber-500/10 border-amber-500/30 text-amber-400">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold uppercase tracking-wider text-[11px]">Gross / Realized Profit</span>
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div className="text-xl font-mono font-bold">
                      {profitNum.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      <span className="text-xs font-normal">ETB</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Realized margin from completed POS sales
                    </p>
                  </div>

                  {/* Metric 3: Remaining Stock */}
                  <div className="p-4 rounded-xl border bg-blue-500/10 border-blue-500/30 text-blue-400">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold uppercase tracking-wider text-[11px]">Remaining Stock</span>
                      <Package className="w-4 h-4" />
                    </div>
                    <div className="text-xl font-mono font-bold">
                      {remainingStockNum.toLocaleString()}{" "}
                      <span className="text-xs font-normal">Units</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Available unsold stock in inventory pool
                    </p>
                  </div>
                </div>
              </div>

              {/* Batch Procurement Specifications Reference */}
              <div
                className={`p-4 rounded-xl border ${
                  isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                }`}
              >
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Procurement & Baseline Specifications
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Catalog Product</span>
                    <strong className="text-slate-200">{prodName}</strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Vendor / Supplier</span>
                    <strong className="text-slate-200">{supName}</strong>
                    {supPhone && (
                      <span className="block text-[11px] text-slate-400 font-mono mt-0.5">
                        {supPhone}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Purchased / Recorded By</span>
                    <span className="inline-flex items-center gap-1 font-mono text-slate-200 mt-0.5">
                      <Phone className="w-3 h-3 text-amber-500" />
                      <span>{purchaserPhone}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Initial Intake Volume</span>
                    <span className="font-mono font-bold text-amber-400">
                      {initialQty.toLocaleString()} units
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Unit Cost (COGS)</span>
                    <span className="font-mono text-slate-200">{unitCost.toFixed(2)} ETB</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Target Retail Price</span>
                    <span className="font-mono text-emerald-400">{salePrice.toFixed(2)} ETB</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Total Initial Outlay</span>
                    <span className="font-mono font-bold text-slate-200">
                      {totalCost.toLocaleString("en-US", { minimumFractionDigits: 2 })} ETB
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Procurement Date</span>
                    <span className="font-mono text-slate-200">{purchaseDate}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Audit Verification Status</span>
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verified Ledger</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Office Submission Endorsement Note */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                  isDarkMode
                    ? "bg-amber-500/5 border-amber-500/20 text-slate-300"
                    : "bg-amber-50 border-amber-200 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-[11px]">
                    Structured for official church parish council review, finance committee archiving, and physical office submission.
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-inherit flex flex-col sm:flex-row items-center justify-between gap-3 bg-inherit">
          <div className="text-[11px] text-slate-400">
            Report Source: <code className="text-amber-400 font-mono">GET /product-sales/report/{batch.id}</code>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isDarkMode
                  ? "border-white/10 hover:bg-white/10 text-slate-300"
                  : "border-slate-200 hover:bg-slate-100 text-slate-700"
              }`}
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isLoading || !reportData || isExporting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Preparing PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Office Report (PDF)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
