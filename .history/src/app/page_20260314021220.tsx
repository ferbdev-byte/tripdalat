'use client';

import Link from 'next/link';
import { mockData } from '../data/mockData';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background px-6 py-10 md:px-10 md:py-14">
      <section className="mx-auto max-w-6xl rounded-[2rem] border border-white/20 bg-white/45 p-8 backdrop-blur-md md:p-12">
        <p className="inline-flex items-center rounded-full border border-pine-green/20 bg-white/60 px-4 py-1.5 text-xs text-pine-green">
          Dalat Dream Planner
        </p>

        <h1 className="mt-5 max-w-3xl text-4xl leading-tight text-text md:text-6xl">
          Chạm vào một chuyến đi mềm như mây, rõ như bản đồ và linh hoạt theo cơn mưa.
        </h1>

        <p className="mt-5 max-w-2xl text-sm leading-7 text-text/75 md:text-base">
          {mockData.trip.subtitle}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={`/trips/${mockData.trip.id}`} className="rounded-full bg-hydrangea-blue px-6 py-3 text-sm font-medium text-text transition hover:opacity-90">
            Mở Dalat Dream Dashboard
          </Link>
          <Link href={`/trips/${mockData.trip.id}/budget`} className="rounded-full border border-pine-green/25 bg-white/55 px-6 py-3 text-sm font-medium text-pine-green transition hover:bg-white/75">
            Xem ngân sách chuyến đi
          </Link>
        </div>
      </section>
    </main>
  );
}
