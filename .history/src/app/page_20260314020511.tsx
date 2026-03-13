'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F8F9FA] p-10">
      <section className="mx-auto max-w-5xl rounded-3xl bg-white p-10 shadow">
        <p className="mb-4 inline-block rounded-full bg-pink-100 px-4 py-1 text-sm text-gray-700">Đà Lạt Trip Planner</p>

        <h1 className="text-3xl font-bold text-gray-700 md:text-5xl">Lên kế hoạch Đà Lạt thật mềm mại và thông minh</h1>

        <p className="mt-6 text-base leading-8 text-gray-600 md:text-lg">
          Đây là phiên bản kiểm tra Tailwind bằng utility classes cơ bản. Nếu bạn thấy màu nền, spacing, bo góc và shadow hoạt động,
          thì pipeline CSS đã được khôi phục đúng.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/trips/dalat-2024" className="rounded-full bg-blue-500 px-6 py-3 text-white shadow">
            Xem hành trình của tôi
          </Link>
          <Link href="/demo" className="rounded-full border border-gray-300 px-6 py-3 text-gray-700">
            Xem bản demo giao diện
          </Link>
        </div>
      </section>
    </main>
  );
}
