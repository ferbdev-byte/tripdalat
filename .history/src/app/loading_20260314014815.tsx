export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/55 backdrop-blur-md">
      <div className="animate-pulse rounded-2xl border border-white/60 bg-white/70 px-6 py-4 text-sm font-medium text-slate-700 shadow-lg">
        Đang xua tan sương mù Đà Lạt...
      </div>
    </div>
  );
}
