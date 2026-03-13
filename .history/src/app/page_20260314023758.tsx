'use client';

import Link from 'next/link';
import { mockData } from '../data/mockData';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FDFCFB] to-[#E5E7E9] px-6 py-10 md:px-10 md:py-14">
      <section className="mx-auto max-w-5xl rounded-dalat border border-white/20 bg-white/40 p-8 backdrop-blur-xl md:p-12">
        <h1 className="text-5xl text-[#4A4A4A] md:text-7xl">Đà Lạt Trip Planner</h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-[#4A4A4A]/80 md:text-base">{mockData.trip.subtitle}</p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href={`/trips/${mockData.trip.id}`}
            className="rounded-full bg-[#869484] px-6 py-3 text-sm font-medium text-white shadow-[0_10px_30px_rgba(134,148,132,0.25)] transition hover:opacity-90"
          >
            Bắt đầu
          </Link>
        </div>
      </section>
    </main>
  );
}
