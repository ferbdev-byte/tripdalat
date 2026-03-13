'use client';

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white via-mist-gray/20 to-hydrangea-blue/20 p-6">
      <section className="w-full max-w-xl rounded-2xl border border-white/60 bg-white/70 p-6 text-center shadow-lg backdrop-blur-md">
        <p className="text-4xl">🌫️</p>
        <h1 className="mt-3 text-xl font-semibold text-slate-900">Sương mù dày quá, lạc đường rồi!</h1>
        <p className="mt-2 text-sm text-slate-600">Hãy thử tải lại trang.</p>
        <p className="mt-2 text-xs text-slate-500">{error.message}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 rounded-lg bg-pine-green px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Thử lại
        </button>
      </section>
    </main>
  );
}
