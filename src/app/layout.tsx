import './globals.css';
import type { Metadata } from 'next';
import { Caveat, Inter, Playfair_Display } from 'next/font/google';
import { Code2 } from 'lucide-react';

const headingFont = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const bodyFont = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const handwritingFont = Caveat({
  subsets: ['latin'],
  variable: '--font-handwriting',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Đà Lạt Trip Planner',
  description: 'Ứng dụng lập kế hoạch du lịch Đà Lạt với phong cách mềm mại và mộng mơ.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={`${headingFont.variable} ${bodyFont.variable} ${handwritingFont.variable}`}>
        <div className="min-h-screen flex flex-col">
          <div className="flex-1">{children}</div>
          <footer className="px-4 pb-4 pt-2 sm:px-6 sm:pb-6">
            <div className="mx-auto flex w-fit max-w-7xl items-center justify-center gap-2 rounded-full border border-white/30 bg-white/55 px-4 py-2 text-xs text-[#4A4A4A]/70 backdrop-blur-xl shadow-[0_10px_24px_rgba(74,74,74,0.06)]">
              <Code2 className="h-3.5 w-3.5 text-pine" />
              <span>Author · Võ Ngọc Cường</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
