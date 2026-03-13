import { CloudDrizzle, Clock3, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

const mockTimeline = [
  { time: '05:30', place: 'Đồi chè Cầu Đất', note: 'Săn mây sớm' },
  { time: '09:00', place: 'Tú Mơ To', note: 'Coffee & chill' },
  { time: '15:30', place: 'Hồ Tuyền Lâm', note: 'Dạo thuyền nhẹ' },
];

export default function DemoDashboardPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-text md:text-4xl">Dashboard Mockup · Dalat Dream</h1>
          <p className="text-sm text-text/70">Bản demo giao diện mềm mại, thoáng và thơ theo phong cách Đà Lạt mộng mơ.</p>
        </header>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-1 border-secondary/40 bg-secondary/25">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-text">
                <CloudDrizzle className="h-5 w-5 text-secondary" />
                Weather Hub
              </CardTitle>
              <CardDescription>Màu tím oải hương nhẹ cho vùng thời tiết.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl border border-secondary/40 bg-white/50 p-5 text-sm text-text/80">
                Nhiệt độ 16°C · Độ ẩm 92% · Có cơ hội săn mây cao vào 5h sáng.
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1 border-primary/25 bg-white/45">
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
              <CardDescription>Lịch trình theo giờ với icon mờ nhẹ và font serif cho tên địa điểm.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockTimeline.map((item) => (
                <div key={`${item.time}-${item.place}`} className="rounded-2xl border border-primary/15 bg-white/50 p-4">
                  <p className="inline-flex items-center gap-2 text-xs text-text/60">
                    <Clock3 className="h-3.5 w-3.5 opacity-60" />
                    {item.time}
                  </p>
                  <p className="mt-2 text-lg text-text" style={{ fontFamily: 'var(--font-heading), serif' }}>
                    {item.place}
                  </p>
                  <p className="mt-1 text-sm text-text/70">{item.note}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="lg:col-span-1 border-primary/25 bg-white/45">
            <CardHeader>
              <CardTitle>Map Preview</CardTitle>
              <CardDescription>Khung bản đồ demo bo tròn, viền rêu, nền trắng mờ.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-64 items-center justify-center rounded-2xl border border-primary/20 bg-white/60 text-text/65">
                <div className="text-center">
                  <MapPin className="mx-auto h-6 w-6 text-primary/70" />
                  <p className="mt-2 text-sm">Map Placeholder · Pine Forest Layer</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
