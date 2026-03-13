'use client';

import { Cloud, Coffee, MapPinned, Sparkles } from 'lucide-react';
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
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white via-hydrangea-blue/10 to-mist-gray/30 px-6">
        <div className="rounded-2xl border border-white/50 bg-white/60 px-6 py-4 text-sm text-slate-700 shadow-lg backdrop-blur-md">
          Đang chuẩn bị khởi hành đến Đà Lạt...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-hydrangea-blue/10 to-mist-gray/40">
      <section className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 pb-14 pt-20 text-center md:pt-24">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-hydrangea-blue/30 bg-white/70 px-4 py-1.5 text-xs font-medium text-pine-green backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5" />
          Đà Lạt Trip Planner
        </div>

        <h1 className="max-w-4xl text-4xl font-bold leading-tight text-slate-900 md:text-6xl">
          Đà Lạt Trip Planner
        </h1>

        <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 md:text-lg">
          Nền tảng lập kế hoạch du lịch Đà Lạt mộng mơ: quản lý lịch trình, thời tiết, bản đồ POI và ngân sách trong một không gian
          hiện đại như làn sương sớm.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={startHref}
            className="rounded-lg bg-pine-green px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Bắt đầu chuyến đi
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-hydrangea-blue/40 bg-white/80 px-5 py-2.5 text-sm font-semibold text-slate-700 backdrop-blur-sm transition hover:bg-white"
          >
            Tạo tài khoản mới
          </Link>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-6 pb-16 md:grid-cols-3">
        <article className="rounded-2xl border border-white/55 bg-white/55 p-5 shadow-lg shadow-hydrangea-blue/10 backdrop-blur-md">
          <Cloud className="h-5 w-5 text-hydrangea-blue" />
          <h2 className="mt-3 text-lg font-semibold text-slate-900">Weather Hub</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Theo dõi xác suất mưa, độ ẩm và mây sớm để tối ưu lịch săn mây.
          </p>
        </article>

        <article className="rounded-2xl border border-white/55 bg-white/55 p-5 shadow-lg shadow-hydrangea-blue/10 backdrop-blur-md">
          <MapPinned className="h-5 w-5 text-pine-green" />
          <h2 className="mt-3 text-lg font-semibold text-slate-900">Smart Itinerary</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Tự động gợi ý đổi điểm outdoor sang indoor khi dự báo mưa cao.
          </p>
        </article>

        <article className="rounded-2xl border border-white/55 bg-white/55 p-5 shadow-lg shadow-hydrangea-blue/10 backdrop-blur-md">
          <Coffee className="h-5 w-5 text-amber-600" />
          <h2 className="mt-3 text-lg font-semibold text-slate-900">Budget & Cafe Finder</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Theo dõi ngân sách và gợi ý quán cafe có mái che gần bạn trong những cơn mưa Đà Lạt.
          </p>
        </article>
      </section>
    </main>
  );
}
