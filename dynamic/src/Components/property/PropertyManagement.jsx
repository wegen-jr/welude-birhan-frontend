import { Link } from "react-router-dom";
import {
  Boxes,
  Construction,
  DollarSign,
  ArrowRight,
  Clock,
  Layers,
  Sparkles,
  CheckCircle2
} from "lucide-react";

export default function PropertyManagement({ isDarkMode = true }) {
  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Top Notification Banner */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
          isDarkMode
            ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
            : "bg-amber-50 border-amber-200 text-amber-800"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
            <Construction className="w-5 h-5 text-amber-500 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                Module Maintenance Notice
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30">
                Decoupled
              </span>
            </div>
            <p className="text-xs sm:text-sm opacity-90 mt-0.5">
              Property & Asset API endpoints are temporarily paused while backend schema refactoring is underway.
            </p>
          </div>
        </div>

        <Link
          to="/dashboard/finance"
          className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md transition-all shrink-0"
        >
          <span>Open Finance Hub</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Under Construction Hero Card */}
      <div
        className={`p-8 sm:p-12 rounded-3xl border text-center relative overflow-hidden transition-all ${
          isDarkMode
            ? "bg-[#0b1b3d]/70 border-white/10 shadow-2xl"
            : "bg-white border-slate-200 shadow-sm"
        }`}
      >
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-xl mx-auto">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Boxes className="w-10 h-10" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-slate-400 mb-4">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Architecture Alignment in Progress</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-3">
            Property Management Under Construction
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-8">
            The backend logic for Property and Inventory Management is currently being decoupled and rebuilt 
            to support unified product catalogs and automated batch-level tracking. To ensure database consistency 
            and prevent frontend conflicts, this module has been temporarily isolated.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/dashboard/finance"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 transition-all"
            >
              <DollarSign className="w-4 h-4" />
              <span>Go to Finance & Sales Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Decoupling Roadmap & Architecture Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className={`p-6 rounded-2xl border transition-all ${
            isDarkMode
              ? "bg-[#0b1b3d]/50 border-white/10"
              : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
            Finance & Sales Isolated
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Finance and Point-of-Sale operations are now 100% independent. Live revenue, unit sales, and transaction audits continue without inventory dependencies.
          </p>
        </div>

        <div
          className={`p-6 rounded-2xl border transition-all ${
            isDarkMode
              ? "bg-[#0b1b3d]/50 border-white/10"
              : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 border border-amber-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
            Schema Harmonization
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            The backend team is aligning purchase batches (<code className="font-mono text-amber-400">/purchase-products</code>) with product definitions (<code className="font-mono text-amber-400">/products</code>).
          </p>
        </div>

        <div
          className={`p-6 rounded-2xl border transition-all ${
            isDarkMode
              ? "bg-[#0b1b3d]/50 border-white/10"
              : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 border border-blue-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
            Upcoming Asset Registry
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            When restored, the Property view will feature automated stock reconciliation, supplier cost tracking, and downloadable PDF inventory slips.
          </p>
        </div>
      </div>
    </div>
  );
}
