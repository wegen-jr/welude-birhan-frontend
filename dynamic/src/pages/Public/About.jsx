import React from "react";
import {
  Heart,
  BookOpen,
  Users,
  HandHeart,
  Eye,
  Cross,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "../../Contexts/LanguageContext";
export default function About() {
  const { t } = useLanguage();
  const about = t.aboutPage;

  const valueIcons = [
    Cross,
    Heart,
    BookOpen,
    Users,
    HandHeart,
  ];

  return (
    <main className="min-h-screen bg-[#081226] text-white">

      {/* Hero */}
      <section className="relative flex min-h-[55vh] items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0b1b3d] via-[#081226] to-[#050b18]" />

        <div className="absolute inset-0 opacity-10">
          <Cross className="absolute left-[15%] top-[20%] h-40 w-40" />
          <Cross className="absolute bottom-[10%] right-[15%] h-56 w-56" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-6 py-24 text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-amber-400">
            Welude Birhan
          </p>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {about.hero.title}
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            {about.hero.subtitle}
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-amber-400">
              Welude Birhan
            </p>

            <h2 className="text-3xl font-bold sm:text-4xl">
              {about.intro.title}
            </h2>
          </div>

          <div className="space-y-5 text-base leading-8 text-slate-300">
            {about.intro.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto grid max-w-7xl gap-px px-6 py-16 md:grid-cols-2">
          
          <div className="rounded-2xl border border-white/10 bg-[#0b1b3d] p-8">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400">
              <Cross size={24} />
            </div>

            <h2 className="text-2xl font-bold">
              {about.mission.title}
            </h2>

            <p className="mt-4 leading-8 text-slate-300">
              {about.mission.description}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0b1b3d] p-8">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400">
              <Eye size={24} />
            </div>

            <h2 className="text-2xl font-bold">
              {about.vision.title}
            </h2>

            <p className="mt-4 leading-8 text-slate-300">
              {about.vision.description}
            </p>
          </div>

        </div>
      </section>

      {/* Core Values */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-400">
            Welude Birhan
          </p>

          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            {about.values.title}
          </h2>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {about.values.items.map((value, index) => {
            const Icon = valueIcons[index] || Heart;

            return (
              <div
                key={value.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-amber-400/30 hover:bg-white/[0.05]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400">
                  <Icon size={21} />
                </div>

                <h3 className="mt-5 text-lg font-semibold">
                  {value.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Community */}
      <section className="bg-[#0b1b3d]">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-3xl">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400">
              <Users size={24} />
            </div>

            <h2 className="text-3xl font-bold">
              {about.community.title}
            </h2>

            <p className="mt-5 text-base leading-8 text-slate-300">
              {about.community.description}
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="relative overflow-hidden rounded-3xl border border-amber-400/20 bg-gradient-to-br from-[#102652] to-[#0b1b3d] px-8 py-14 text-center sm:px-14">
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold sm:text-4xl">
              {about.callToAction.title}
            </h2>

            <p className="mt-5 leading-8 text-slate-300">
              {about.callToAction.description}
            </p>

            <button
              type="button"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
            >
              {about.callToAction.button}
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </section>

    </main>
  );
}
