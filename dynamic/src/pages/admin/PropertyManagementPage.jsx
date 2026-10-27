import { useOutletContext, Link } from "react-router-dom";
import {
  ShieldCheck,
  DollarSign,
  ArrowRight
} from "lucide-react";
import PropertyManagement from "../../Components/property/PropertyManagement";
import { useLanguage } from "@/Contexts/LanguageContext";

export default function PropertyManagementPage() {
  const { t } = useLanguage();
  const context = useOutletContext();
  const isDarkMode = context?.isDarkMode ?? true;

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();
  const userRole = (user?.role || "").toUpperCase();
  const isAuthorized = ["ADMIN", "FINANCE_LEADER", "LEADER"].includes(userRole);

  return (
    <div
      className={`p-6 sm:p-8 space-y-8 min-h-full transition-colors duration-300 ${
        isDarkMode ? "text-slate-100" : "text-slate-800"
      }`}
    >
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-inherit">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-500 font-semibold mb-1">
            <span>Sunday School Administration</span>
            <span>/</span>
            <span>Property & Assets</span>
            {isAuthorized && (
              <>
                <span>/</span>
                <span className="text-emerald-400 font-normal flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Authorized Custodian</span>
                </span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
            {t.adminSide?.property || "Property Management"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Register church property and physical assets, track on-hand stock quantities, and audit acquisition costs.
          </p>
        </div>

        <Link
          to="/dashboard/finance"
          className={`self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
            isDarkMode
              ? "bg-white/5 border-white/10 hover:bg-white/10 text-slate-200"
              : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800"
          }`}
        >
          <DollarSign className="w-4 h-4 text-amber-500" />
          <span>{t.adminSide?.finance || "Finance & Sales"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Property Management Content */}
      <PropertyManagement isDarkMode={isDarkMode} />
    </div>
  );
}
