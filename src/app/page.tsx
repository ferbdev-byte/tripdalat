'use client';

import Link from 'next/link';
import { mockData } from '../data/mockData';

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#FDFCFB] to-[#E5E7E9] px-4 py-6 sm:px-6 sm:py-10 md:px-10 md:py-14">
      <div className="pointer-events-none absolute -left-24 top-10 h-40 w-40 animate-mist rounded-full bg-rose/25 blur-3xl sm:top-16 sm:h-64 sm:w-64" />
      <div className="pointer-events-none absolute right-0 top-4 h-48 w-48 animate-mist rounded-full bg-pine/20 blur-3xl [animation-delay:1s] sm:right-10 sm:top-10 sm:h-72 sm:w-72" />

      <section className="relative mx-auto max-w-5xl animate-fade-up rounded-dalat border border-white/30 bg-white/50 p-5 shadow-[0_22px_70px_rgba(106,116,109,0.16)] backdrop-blur-xl sm:p-8 md:p-12">
        <p className="inline-flex animate-fade-up rounded-full border border-white/60 bg-white/60 px-4 py-1 text-xs tracking-wide text-pine [animation-delay:120ms]">DALAT DREAM · MOCK MODE</p>
        <h1 className="mt-4 animate-fade-up text-[2.4rem] leading-[1.06] text-[#4A4A4A] [animation-delay:220ms] sm:text-5xl md:text-7xl">Đà Lạt Trip Planner</h1>
        <p className="mt-4 max-w-2xl animate-fade-up text-sm leading-6 text-[#4A4A4A]/80 [animation-delay:320ms] sm:mt-5 sm:leading-7 md:text-base">{mockData.trip.subtitle}</p>

        <div className="mt-7 flex flex-col gap-3 animate-fade-up sm:mt-9 sm:flex-row sm:flex-wrap sm:items-center [animation-delay:420ms]">
          <Link
            href={`/trips/${mockData.trip.id}`}
            className="rounded-full bg-[#869484] px-7 py-3 text-center text-sm font-medium text-white shadow-[0_14px_34px_rgba(134,148,132,0.34)] transition duration-300 hover:-translate-y-0.5 hover:scale-[1.02] hover:opacity-90"
          >
            Bắt đầu
          </Link>
        </div>
      </section>
    </main>
  );
}
