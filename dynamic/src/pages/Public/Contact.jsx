import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Church,
} from "lucide-react";
import { useLanguage } from "../../Contexts/LanguageContext";

export default function Contact() {
  const { t } = useLanguage();
  const content = t.contactPage;

  return (
    <main className="min-h-screen  text-[#1d2940]">

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#081226] px-6 py-24 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,164,76,0.16),transparent_35%)]" />

        <div className="relative mx-auto max-w-6xl text-center">
          <div className="mb-5 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#c9a44c]/50">
              <Church
                size={25}
                strokeWidth={1.4}
                className="text-[#c9a44c]"
              />
            </div>
          </div>

          <p className="text-xs uppercase tracking-[0.3em] text-[#c9a44c]">
            {content.hero.label}
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            {content.hero.title}
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">
            {content.hero.subtitle}
          </p>
        </div>
      </section>

      {/* Contact content */}
      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">

          {/* Contact information */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-200 p-7 shadow-sm">
              <h2 className="text-xl font-semibold">
                {content.information.title}
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                {content.information.description}
              </p>

              <div className="mt-8 space-y-6">

                <ContactItem
                  icon={MapPin}
                  label={content.information.address.label}
                  value={content.information.address.value}
                />

                <ContactItem
                  icon={Phone}
                  label={content.information.phone.label}
                  value={content.information.phone.value}
                />

                <ContactItem
                  icon={Mail}
                  label={content.information.email.label}
                  value={content.information.email.value}
                />

                <ContactItem
                  icon={Clock}
                  label={content.information.officeHours.label}
                  value={content.information.officeHours.value}
                />

              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-200  p-7 shadow-sm md:p-9">

              <h2 className="text-2xl font-semibold text-white">
                {content.form.title}
              </h2>

              <p className="mt-2 text-sm text-white">
                {content.form.description}
              </p>

              <form className="mt-8 space-y-5 text-white">

                <div className="grid gap-5 md:grid-cols-2 ">

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      {content.form.name}
                    </label>

                    <input
                      type="text"
                      name="name"
                      placeholder={content.form.namePlaceholder}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#c9a44c] focus:ring-1 focus:ring-[#c9a44c]/30"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      {content.form.email}
                    </label>

                    <input
                      type="email"
                      name="email"
                      placeholder={content.form.emailPlaceholder}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#c9a44c] focus:ring-1 focus:ring-[#c9a44c]/30"
                    />
                  </div>

                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    {content.form.subject}
                  </label>

                  <input
                    type="text"
                    name="subject"
                    placeholder={content.form.subjectPlaceholder}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#c9a44c] focus:ring-1 focus:ring-[#c9a44c]/30"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    {content.form.message}
                  </label>

                  <textarea
                    name="message"
                    rows={6}
                    placeholder={content.form.messagePlaceholder}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#c9a44c] focus:ring-1 focus:ring-[#c9a44c]/30"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#c9a44c] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#b8943e]"
                >
                  <Send size={17} />
                  {content.form.send}
                </button>

              </form>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}

function ContactItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f5eddd]">
        <Icon size={18} className="text-[#c9a44c]" />
      </div>

      <div>
        <p className="text-xs uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-sm font-medium text-[#1d2940]">
          {value}
        </p>
      </div>
    </div>
  );
}