'use client';

import Link from 'next/link';
import { mockData } from '../data/mockData';

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#FDFCFB] to-[#E5E7E9] px-6 py-10 md:px-10 md:py-14">
      <div className="pointer-events-none absolute -left-24 top-16 h-64 w-64 animate-mist rounded-full bg-rose/25 blur-3xl" />
      <div className="pointer-events-none absolute right-10 top-10 h-72 w-72 animate-mist rounded-full bg-pine/20 blur-3xl [animation-delay:1s]" />

      <section className="relative mx-auto max-w-5xl animate-fade-up rounded-dalat border border-white/30 bg-white/50 p-8 shadow-[0_22px_70px_rgba(106,116,109,0.16)] backdrop-blur-xl md:p-12">
        <p className="inline-flex animate-fade-up rounded-full border border-white/60 bg-white/60 px-4 py-1 text-xs tracking-wide text-pine [animation-delay:120ms]">DALAT DREAM · MOCK MODE</p>
        <h1 className="mt-4 animate-fade-up text-5xl leading-[1.04] text-[#4A4A4A] [animation-delay:220ms] md:text-7xl">Đà Lạt Trip Planner</h1>
        <p className="mt-5 max-w-2xl animate-fade-up text-sm leading-7 text-[#4A4A4A]/80 [animation-delay:320ms] md:text-base">{mockData.trip.subtitle}</p>

        <div className="mt-9 flex flex-wrap items-center gap-3 animate-fade-up [animation-delay:420ms]">
          <Link
            href={`/trips/${mockData.trip.id}`}
            className="rounded-full bg-[#869484] px-7 py-3 text-sm font-medium text-white shadow-[0_14px_34px_rgba(134,148,132,0.34)] transition duration-300 hover:-translate-y-0.5 hover:scale-[1.02] hover:opacity-90"
          >
            Bắt đầu
          </Link>
        </div>
      </section>
    </main>
  );
}
