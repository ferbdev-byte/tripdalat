'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase/client';

type AuthState = 'checking' | 'authenticated' | 'guest';

export default function HomePage() {
  const [authState, setAuthState] = useState<AuthState>('checking');

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setAuthState('guest');
        return;
      }

      if (data.session) {
        setAuthState('authenticated');
        return;
      }

      setAuthState('guest');
    };

    void checkSession();
  }, []);

  const startHref = authState === 'authenticated' ? '/trips' : '/login';

  if (authState === 'checking') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-blue-50 p-10">
        <div className="rounded-2xl bg-white p-6 text-base text-gray-700 shadow">
          Đang kiểm tra hành trình của bạn...
        </div>
      </main>
    );
  }

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
          <Link href={startHref} className="rounded-full bg-blue-500 px-6 py-3 text-white shadow">
            Bắt đầu chuyến đi
          </Link>
          <Link href="/register" className="rounded-full border border-gray-300 px-6 py-3 text-gray-700">
            Tạo tài khoản mới
          </Link>
        </div>
      </section>
    </main>
  );
}
