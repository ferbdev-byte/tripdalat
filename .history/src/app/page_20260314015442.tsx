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
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="rounded-2xl border border-primary/20 bg-white/45 px-6 py-4 text-sm text-text shadow-soft backdrop-blur-xl">
          Đang chuẩn bị khởi hành đến Đà Lạt...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(248,249,250,0.2) 0%, rgba(248,249,250,0.92) 85%), url('https://images.unsplash.com/photo-1599341624460-70f907e8682e?auto=format&fit=crop&w=1600&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 pb-20 pt-24 text-center md:pt-28">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-secondary/50 bg-white/45 px-4 py-1.5 text-xs font-medium text-primary backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5" />
          Đà Lạt Trip Planner
        </div>

          <div className="w-full max-w-4xl rounded-2xl border border-white/60 bg-white/30 p-8 shadow-soft backdrop-blur-xl md:p-12">
            <h1 className="max-w-4xl text-4xl font-bold leading-tight text-text md:text-6xl">
              Đà Lạt Trip Planner
            </h1>

            <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-text/80 md:text-lg">
              Một không gian lập lịch trình mềm mại, tối giản và giàu cảm hứng — để mỗi chuyến đi giữa rừng thông, quán nhỏ và làn
              sương Đà Lạt đều trọn vẹn.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={startHref}
                className="rounded-full bg-accent px-7 py-3 text-sm font-semibold text-text shadow-soft transition hover:scale-[1.02] hover:bg-accent/90"
              >
                Bắt đầu chuyến đi
              </Link>
              <Link
                href="/register"
                className="rounded-full border border-primary/25 bg-white/55 px-6 py-3 text-sm font-semibold text-text backdrop-blur-md transition hover:bg-white/70"
              >
                Tạo tài khoản mới
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-5 px-6 pb-16 pt-8 md:grid-cols-3">
        <article className="rounded-2xl border border-primary/20 bg-white/50 p-6 shadow-soft backdrop-blur-xl">
          <Cloud className="h-5 w-5 text-secondary" />
          <h2 className="mt-3 text-lg font-semibold text-text">Weather Hub</h2>
          <p className="mt-2 text-sm leading-7 text-text/80">
            Theo dõi xác suất mưa, độ ẩm và mây sớm để tối ưu lịch săn mây.
          </p>
        </article>

        <article className="rounded-2xl border border-primary/20 bg-white/50 p-6 shadow-soft backdrop-blur-xl">
          <MapPinned className="h-5 w-5 text-primary" />
          <h2 className="mt-3 text-lg font-semibold text-text">Smart Itinerary</h2>
          <p className="mt-2 text-sm leading-7 text-text/80">
            Tự động gợi ý đổi điểm outdoor sang indoor khi dự báo mưa cao.
          </p>
        </article>

        <article className="rounded-2xl border border-primary/20 bg-white/50 p-6 shadow-soft backdrop-blur-xl">
          <Coffee className="h-5 w-5 text-accent" />
          <h2 className="mt-3 text-lg font-semibold text-text">Budget & Cafe Finder</h2>
          <p className="mt-2 text-sm leading-7 text-text/80">
            Theo dõi ngân sách và gợi ý quán cafe có mái che gần bạn trong những cơn mưa Đà Lạt.
          </p>
        </article>
      </section>
    </main>
  );
}
