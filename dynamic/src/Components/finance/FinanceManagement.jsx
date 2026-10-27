import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import {
  DollarSign,
  ShoppingCart,
  RefreshCw,
  TrendingUp,
  Receipt,
  Building2,
  Package,
  Layers,
  ShieldCheck,
  ShieldAlert,
  ArrowDownToLine
} from "lucide-react";
import { financeService } from "../../services/financeService";
import CreateSaleModal from "./CreateSaleModal";
import SuppliersTab from "./SuppliersTab";
import ProductsTab from "./ProductsTab";
import PurchasesTab from "./PurchasesTab";
import SalesTab from "./SalesTab";
import ExpensesTab from "./ExpensesTab";

export default function FinanceManagement({ isDarkMode = true }) {
  // Navigation active tab: 'suppliers' | 'products' | 'purchases' | 'sales' | 'expenses'
  const [activeTab, setActiveTab] = useState("sales");

  // Live state
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isRecordOpen, setIsRecordOpen] = useState(false);

  // User authorization
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();
  const userRole = (user?.role || "").toUpperCase();
  const isAuthorized = ["ADMIN", "FINANCE_LEADER", "LEADER"].includes(userRole);

  // Load all finance entities in parallel from live Swagger API
  const refreshAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [salesData, purchaseData, productData, supplierData, expenseData] =
        await Promise.all([
          financeService.getSales().catch((e) => {
            console.warn("Failed to fetch sales:", e);
            return [];
          }),
          financeService.getPurchases().catch((e) => {
            console.warn("Failed to fetch purchases:", e);
            return [];
          }),
          financeService.getProducts().catch((e) => {
            console.warn("Failed to fetch products:", e);
            return [];
          }),
          financeService.getSuppliers().catch((e) => {
            console.warn("Failed to fetch suppliers:", e);
            return [];
          }),
          financeService.getExpenses().catch((e) => {
            console.warn("Failed to fetch expenses:", e);
            return [];
          }),
        ]);

      setSales(Array.isArray(salesData) ? salesData : []);
      setPurchases(Array.isArray(purchaseData) ? purchaseData : []);
      setProducts(Array.isArray(productData) ? productData : []);
      setSuppliers(Array.isArray(supplierData) ? supplierData : []);
      setExpenses(Array.isArray(expenseData) ? expenseData : []);
    } catch (err) {
      console.error("Error refreshing finance data:", err);
      toast.error(err.message || "Failed to sync finance data from backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function init() {
      try {
        const [salesData, purchaseData, productData, supplierData, expenseData] =
          await Promise.all([
            financeService.getSales().catch(() => []),
            financeService.getPurchases().catch(() => []),
            financeService.getProducts().catch(() => []),
            financeService.getSuppliers().catch(() => []),
            financeService.getExpenses().catch(() => []),
          ]);

        if (active) {
          setSales(Array.isArray(salesData) ? salesData : []);
          setPurchases(Array.isArray(purchaseData) ? purchaseData : []);
          setProducts(Array.isArray(productData) ? productData : []);
          setSuppliers(Array.isArray(supplierData) ? supplierData : []);
          setExpenses(Array.isArray(expenseData) ? expenseData : []);
        }
      } catch (err) {
        if (active) {
          console.error("Failed to load initial finance records:", err);
          toast.error("Failed to load finance records from server.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    init();
    return () => {
      active = false;
    };
  }, []);

  // -------------------------------------------------------------
  // Comprehensive Financial Formula Calculations:
  // Net Profit = (Total Gross Sales) - (COGS from Batches) - (Total Expenses)
  // -------------------------------------------------------------
  const { totalGrossSales, totalCOGS, totalExpenses, netProfit, totalUnitsSold } =
    useMemo(() => {
      // 1. Total Gross Sales
      const grossSales = sales.reduce((acc, s) => {
        const qty = Number(s.quantity) || 0;
        const price = Number(s.unitPrice ?? s.salesPrice ?? 0);
        const total = s.totalPrice !== undefined && s.totalPrice !== null ? Number(s.totalPrice) : qty * price;
        return acc + total;
      }, 0);

      // 2. Cost of Goods Sold (COGS) from Purchase Batches
      const purchaseBatchMap = new Map();
      purchases.forEach((p) => {
        purchaseBatchMap.set(Number(p.id), Number(p.unitPrice) || 0);
      });

      const cogs = sales.reduce((acc, s) => {
        const qty = Number(s.quantity) || 0;
        const batchCost = s.purchaseProduct?.unitPrice !== undefined
          ? Number(s.purchaseProduct.unitPrice)
          : purchaseBatchMap.get(Number(s.purchaseProductId)) || 0;
        return acc + qty * batchCost;
      }, 0);

      // 3. Operational Expenses from Other Costs
      const operationalCosts = expenses.reduce((acc, e) => {
        return acc + (Number(e.costAmount) || 0);
      }, 0);

      // 4. Net Profit Realization
      const profit = grossSales - cogs - operationalCosts;

      // 5. Units Sold
      const units = sales.reduce((acc, s) => acc + (Number(s.quantity) || 0), 0);

      return {
        totalGrossSales: grossSales,
        totalCOGS: cogs,
        totalExpenses: operationalCosts,
        netProfit: profit,
        totalUnitsSold: units,
      };
    }, [sales, purchases, expenses]);

  // Tab definitions
  const tabs = [
    {
      id: "suppliers",
      label: "1. Suppliers",
      icon: Building2,
      count: suppliers.length,
      description: "Vendors & Sources",
    },
    {
      id: "products",
      label: "2. Products",
      icon: Package,
      count: products.length,
      description: "Catalog Items",
    },
    {
      id: "purchases",
      label: "3. Purchases",
      icon: Layers,
      count: purchases.length,
      description: "Inventory Intake Batches",
    },
    {
      id: "sales",
      label: "4. Sales (POS)",
      icon: ShoppingCart,
      count: sales.length,
      description: "Transactions Ledger",
    },
    {
      id: "expenses",
      label: "5. Expenses",
      icon: Receipt,
      count: expenses.length,
      description: "Operational Costs",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner Card */}
      <div
        className={`p-6 sm:p-7 rounded-2xl border transition-all ${
          isDarkMode
            ? "bg-[#0b1b3d]/60 border-white/10"
            : "bg-white border-slate-200 shadow-sm"
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold shrink-0 border border-amber-500/20">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Finance & Sales Administration
                </h2>
                {isAuthorized ? (
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                      isDarkMode
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-emerald-50 border-emerald-200 text-emerald-700"
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Authorized Finance</span>
                  </span>
                ) : (
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                      isDarkMode
                        ? "bg-slate-500/10 border-slate-500/20 text-slate-400"
                        : "bg-slate-100 border-slate-200 text-slate-600"
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Read Only</span>
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                End-to-end commerce management: register suppliers, catalog products, log purchase batches, record POS sales, and audit net margins.
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={refreshAllData}
              disabled={loading}
              title="Refresh all finance modules"
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
                onClick={() => setIsRecordOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 transition-all shrink-0"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Record Sale (POS)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main KPI Statistic Cards (Strict Business Logic Formula) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Gross Sales Revenue */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isDarkMode
              ? "bg-[#0b1b3d]/60 border-white/10"
              : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Gross Sales Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-amber-500 mt-3">
            {loading ? "..." : `${totalGrossSales.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Total sales across {sales.length} transaction slip(s)
          </p>
        </div>

        {/* Cost of Goods Sold (COGS) */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isDarkMode
              ? "bg-[#0b1b3d]/60 border-white/10"
              : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Cost of Goods (COGS)
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <ArrowDownToLine className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-slate-300 mt-3">
            {loading ? "..." : `${totalCOGS.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Batch intake costs for {totalUnitsSold} unit(s) dispensed
          </p>
        </div>

        {/* Operational Expenses */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isDarkMode
              ? "bg-[#0b1b3d]/60 border-white/10"
              : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Operational Expenses
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-red-400 mt-3">
            {loading ? "..." : `-${totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {expenses.length} supplementary cost records logged
          </p>
        </div>

        {/* Net Profit Realization (Gross Sales - COGS - Expenses) */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isDarkMode
              ? "bg-[#0b1b3d]/60 border-white/10"
              : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Net Profit Realization
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p
            className={`text-2xl font-bold font-mono mt-3 ${
              netProfit >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {loading ? "..." : `${netProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Gross Sales − COGS − Operational Costs
          </p>
        </div>
      </div>

      {/* Sub-navigation Tabs Menu */}
      <div
        className={`p-1.5 rounded-2xl border transition-all ${
          isDarkMode
            ? "bg-[#0b1b3d]/70 border-white/10"
            : "bg-white border-slate-200 shadow-sm"
        }`}
      >
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20 scale-[1.01]"
                    : isDarkMode
                    ? "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-slate-950" : "text-amber-500"}`} />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    isActive
                      ? "bg-black/15 text-slate-950 font-bold"
                      : isDarkMode
                      ? "bg-white/10 text-slate-300"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Sub-Tab View */}
      <div className="transition-all duration-200">
        {activeTab === "suppliers" && (
          <SuppliersTab
            suppliers={suppliers}
            loading={loading}
            onRefresh={refreshAllData}
            isAuthorized={isAuthorized}
            isDarkMode={isDarkMode}
          />
        )}

        {activeTab === "products" && (
          <ProductsTab
            products={products}
            loading={loading}
            onRefresh={refreshAllData}
            isAuthorized={isAuthorized}
            isDarkMode={isDarkMode}
          />
        )}

        {activeTab === "purchases" && (
          <PurchasesTab
            purchases={purchases}
            products={products}
            suppliers={suppliers}
            loading={loading}
            onRefresh={refreshAllData}
            isAuthorized={isAuthorized}
            isDarkMode={isDarkMode}
          />
        )}

        {activeTab === "sales" && (
          <SalesTab
            sales={sales}
            loading={loading}
            onRefresh={refreshAllData}
            onOpenPos={() => setIsRecordOpen(true)}
            isAuthorized={isAuthorized}
            isDarkMode={isDarkMode}
          />
        )}

        {activeTab === "expenses" && (
          <ExpensesTab
            expenses={expenses}
            purchases={purchases}
            loading={loading}
            onRefresh={refreshAllData}
            isAuthorized={isAuthorized}
            isDarkMode={isDarkMode}
          />
        )}
      </div>

      {/* Modal: POS Sale */}
      <CreateSaleModal
        isOpen={isRecordOpen}
        onClose={() => setIsRecordOpen(false)}
        onSaleRecorded={() => {
          refreshAllData();
        }}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
