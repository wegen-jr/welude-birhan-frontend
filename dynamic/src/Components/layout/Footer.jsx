import {
  Church,
  MapPin,
  Mail,
  Phone,
  Send,
  ArrowBigDown,
  ArrowBigDownDashIcon,
} from "lucide-react";
import logo from"../../assets/logo.png"
export default function Footer() {
  return (
    <footer className="bg-[#040b18] text-white">

      {/* ================= MAIN FOOTER ================= */}
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:py-20">

        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">

          {/* ================= BRAND ================= */}
          <div className="max-w-sm">

            {/* Logo */}
            <div className="flex items-center gap-3">

              <div
                className="
                  flex h-12 w-12
                  items-center justify-center
                  rounded-full
                  border-2 border-[#d4a72c]
                  
                "
              >
                <img
                  src={logo}
                  alt="Welude Birhan"
                  className="h-full w-full object-contain rounded-full"
                />
              </div>

              <div>
                <h2 className="font-serif text-xl font-semibold">
                  Welude Birhan
                </h2>

                <p className="mt-1 text-[9px] font-medium tracking-[0.18em] text-[#d4a72c] uppercase">
                  Holy Trinity Sunday School
                </p>
              </div>

            </div>

            {/* Description */}
            <p className="mt-6 text-sm leading-7 text-slate-400">
              Nurturing the next generation in the ancient, living faith,
              holy liturgy, and sacred apostolic tradition of the
              Ethiopian Orthodox Tewahedo Church.
            </p>

            {/* Social Media */}
            <div className="mt-6 flex items-center gap-3">

              <SocialLink
                href="#"
                label="Facebook"
                icon={<ArrowBigDownDashIcon size={16} />}
              />

              <SocialLink
                href="#"
                label="YouTube"
                icon={<ArrowBigDown size={16} />}
              />

              <SocialLink
                href="#"
                label="Telegram"
                icon={<Send size={16} />}
              />

            </div>

          </div>


          {/* ================= QUICK LINKS ================= */}
          <FooterColumn title="Quick Links">

            <FooterLink href="/" label="Home" />

            <FooterLink
              href="/about"
              label="About & Pillars"
            />

            <FooterLink
              href="/programs"
              label="Programs"
            />

            <FooterLink
              href="/gallery"
              label="Gallery & Testimonials"
            />

            <FooterLink
              href="/contact"
              label="Contact"
            />

          </FooterColumn>


          {/* ================= ABOUT ================= */}
          <FooterColumn title="Our Church">

            <FooterLink
              href="/about"
              label="Our Story"
            />

            <FooterLink
              href="/history"
              label="Our History"
            />

            <FooterLink
              href="/belief"
              label="Faith & Belief"
            />

            <FooterLink
              href="/leadership"
              label="Leadership"
            />

            <FooterLink
              href="/programs"
              label="Ministries & Programs"
            />

          </FooterColumn>


          {/* ================= CONTACT ================= */}
          <div>

            <h3
              className="
                text-xs
                font-semibold
                tracking-[0.22em]
                text-[#d4a72c]
                uppercase
              "
            >
              Visit Us
            </h3>

            <div className="mt-6 space-y-5">

              {/* Location */}
              <div className="flex gap-3">

                <MapPin
                  size={18}
                  strokeWidth={1.5}
                  className="mt-0.5 shrink-0 text-[#d4a72c]"
                />

                <div>
                  <p className="text-sm text-slate-300">
                    Holy Trinity Cathedral
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Dire Dawa, Ethiopia
                  </p>
                </div>

              </div>


              {/* Email */}
              <div className="flex gap-3">

                <Mail
                  size={18}
                  strokeWidth={1.5}
                  className="mt-0.5 shrink-0 text-[#d4a72c]"
                />

                <div>
                  <p className="text-sm text-slate-300">
                    Email
                  </p>

                  <a
                    href="mailto:info@weludebirhan.org"
                    className="
                      mt-1
                      block
                      text-xs
                      text-slate-500
                      transition
                      hover:text-[#d4a72c]
                    "
                  >
                    info@weludebirhan.org
                  </a>
                </div>

              </div>


              {/* Phone */}
              <div className="flex gap-3">

                <Phone
                  size={18}
                  strokeWidth={1.5}
                  className="mt-0.5 shrink-0 text-[#d4a72c]"
                />

                <div>
                  <p className="text-sm text-slate-300">
                    Phone
                  </p>

                  <a
                    href="tel:+251900000000"
                    className="
                      mt-1
                      block
                      text-xs
                      text-slate-500
                      transition
                      hover:text-[#d4a72c]
                    "
                  >
                    +251 900 000 000
                  </a>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* ================= DIVIDER ================= */}
      <div className="border-t border-white/[0.07]" />


      {/* ================= BOTTOM BAR ================= */}
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 sm:px-8 md:flex-row md:items-center md:justify-between">

        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} Welude Birhan Holy Trinity
          Sunday School. All rights reserved.
        </p>

        <div className="flex items-center gap-2 text-xs text-slate-600">

          <Church
            size={13}
            className="text-[#d4a72c]"
          />

          <span>
            Ethiopian Orthodox Tewahedo Church
          </span>

        </div>

      </div>

    </footer>
  );
}


/* ================================================= */
/* Footer Column                                     */
/* ================================================= */

function FooterColumn({ title, children }) {
  return (
    <div>

      <h3
        className="
          text-xs
          font-semibold
          tracking-[0.22em]
          text-[#d4a72c]
          uppercase
        "
      >
        {title}
      </h3>

      <div className="mt-6 space-y-3">
        {children}
      </div>

    </div>
  );
}


/* ================================================= */
/* Footer Link                                       */
/* ================================================= */

function FooterLink({ href, label }) {
  return (
    <a
      href={href}
      className="
        block
        text-sm
        text-slate-400
        transition-all
        duration-200
        hover:translate-x-1
        hover:text-[#e0c27b]
      "
    >
      {label}
    </a>
  );
}


/* ================================================= */
/* Social Link                                       */
/* ================================================= */

function SocialLink({ href, label, icon }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="
        flex h-9 w-9
        items-center justify-center
        rounded-full
        border border-white/10
        text-slate-400
        transition-all
        duration-300
        hover:border-[#d4a72c]/50
        hover:bg-[#d4a72c]/10
        hover:text-[#d4a72c]
      "
    >
      {icon}
    </a>
  );
}