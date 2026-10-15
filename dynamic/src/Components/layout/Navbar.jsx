import { useState } from "react";
import {
  Menu,
  X,
  CalendarDays,
  Image as ImageIcon,
  BookOpen,
  Phone,
  LogIn,
} from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";
export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 z-50 w-full">

      {/* Main Navbar */}
      <nav className="border-b border-white/10 bg-[#081226]/95 shadow-[0_8px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl">

        <div className="mx-auto flex h-[82px] max-w-7xl items-center justify-between px-5 sm:px-8">

          {/* Logo */}
          <Link
            to={'/'}
            className="group flex items-center gap-3"
          >
            <div className="relative flex items-center justify-center rounded-full border border-[#c9a85d]/40 bg-[#0c1c39]">
             <img src={logo} alt="logo" className="w-15 h-15 rounded-full" />

              <span className="absolute inset-[-4px] rounded-full border border-[#c9a85d]/10 transition-all duration-500 group-hover:inset-[-6px]" />
            </div>

            <div className="leading-none">
              <h1 className="font-serif text-[17px] font-semibold tracking-wide text-white">
                Welude Birhan
              </h1>

              <p className="mt-1 text-[9px] tracking-[0.28em] text-[#c9a85d] uppercase">
                Orthodox Church
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 lg:flex">

            <NavItem
              href="/"
              label="Home"
            />

            <NavItem
              href={'/about'}            
              label="About"
            />
            <NavItem
              href="/events"
              label="Events"
              icon={<CalendarDays size={15} />}
            />

            <NavItem
              href="/gallery"
              label="Gallery"
              icon={<ImageIcon size={15} />}
            />
            <NavItem
              href="/testimonials"
              label="Testimonials"
            />
            <NavItem
              href="/contact"
              label="Contact"
              icon={<Phone size={15} />}
            />
          </div>

          {/* Login */}
          <div className="hidden items-center gap-4 lg:flex">

            <div className="h-6 w-px bg-white/10" />
            <Link to={'/signin'} className="text-amber-300 flex items-center gap-3 hover:text-amber-500">
              <LogIn
                size={14}
                strokeWidth={1.7}
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
              Login
            </Link>

          </div>

          {/* Mobile Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="
              flex h-10 w-10 items-center justify-center
              rounded-lg border border-white/10
              bg-white/[0.03]
              text-slate-300
              transition
              hover:border-[#c9a85d]/30
              hover:text-[#d6b56a]
              lg:hidden
            "
            aria-label="Toggle navigation"
          >
            {mobileOpen ? (
              <X size={21} />
            ) : (
              <Menu size={21} />
            )}
          </button>

        </div>

        {/* Mobile Navigation */}
        <div
          className={`
            overflow-hidden border-t border-white/10
            bg-[#071226]
            transition-all duration-300
            lg:hidden
            ${
              mobileOpen
                ? "max-h-[600px] opacity-100"
                : "max-h-0 opacity-0"
            }
          `}
        >
          <div className="mx-auto max-w-7xl px-5 py-5">

            <MobileNavItem
              href="/"
              label="Home"
              onClick={() => setMobileOpen(false)}
            />

            <MobileNavItem
              href="/about"
              label="About"
              onClick={() => setMobileOpen(false)}
            />

            <MobileNavItem
              href="/events"
              label="Events"
              icon={<CalendarDays size={16} />}
              onClick={() => setMobileOpen(false)}
            />

            <MobileNavItem
              href="/gallery"
              label="Gallery"
              icon={<ImageIcon size={16} />}
              onClick={() => setMobileOpen(false)}
            />

            <MobileNavItem
              href="/contact"
              label="Contact"
              icon={<Phone size={16} />}
              onClick={() => setMobileOpen(false)}
            />

            {/* Mobile Login */}
            <div className="mt-4 border-t border-white/10 pt-4">

              <Link
                to={'/signin'}
                onClick={() => setMobileOpen(false)}
                className="
                  flex items-center justify-center gap-2
                  rounded-lg
                  border border-[#c9a85d]/40
                  px-4 py-3
                  text-sm font-medium
                  text-[#d6b56a]
                  transition
                  hover:bg-[#c9a85d]/10
                "
              >
                <LogIn size={15} />
                Login
              </Link>

            </div>

          </div>
        </div>

      </nav>
    </header>
  );
}


/* Desktop Navigation Item */

function NavItem({ href, label, icon }) {
  return (
    <a
      href={href}
      className="
        group flex items-center gap-1.5
        rounded-lg px-4 py-3
        text-sm text-slate-300
        transition-all duration-300
        hover:bg-white/[0.04]
        hover:text-[#e0c27b]
      "
    >
      {icon && (
        <span className="text-slate-400 transition group-hover:text-[#d6b56a]">
          {icon}
        </span>
      )}

      <span>{label}</span>
    </a>
  );
}


/* Mobile Navigation Item */

function MobileNavItem({
  href,
  label,
  icon,
  onClick,
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="
        flex items-center gap-3
        border-b border-white/[0.06]
        px-2 py-4
        text-sm text-slate-300
        transition
        hover:text-[#d6b56a]
      "
    >
      {icon && (
        <span className="text-[#b9964d]">
          {icon}
        </span>
      )}

      {label}
    </a>
  );
}
