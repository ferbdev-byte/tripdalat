'use client';

import { PiggyBank, ReceiptText, WalletCards } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { getMockTripById, type MockExpense } from '../../../../../data/mock-trip';

type BudgetPageProps = {
  params: Promise<{ tripId: string }>;
};

type ExpenseRow = {
  id: string;
  category: string;
  amount: number;
  note: string | null;
  spent_at: string;
};

const categoryLabelMap: Record<string, string> = {
  food: 'Ăn uống',
  transport: 'Di chuyển',
  ticket: 'Vé',
  hotel: 'Lưu trú',
  shopping: 'Mua sắm',
  other: 'Khác',
};

const pieColors = ['#D8BFD8', '#F6C1CC', '#CFE8D6', '#BFD7EA', '#F3D8B5', '#E5D4EF'];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);

export default function TripBudgetPage({ params }: BudgetPageProps) {
  const [tripId, setTripId] = useState('');
  const [budgetTotal, setBudgetTotal] = useState(0);
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((value) => {
      setTripId(value.tripId);
    });
  }, [params]);

  useEffect(() => {
    if (!tripId) return;

    const load = () => {
      setLoading(true);
      const tripData = getMockTripById(tripId);
      setBudgetTotal(tripData.budgetTotal);
      setExpenses(
        [...tripData.expenses]
          .sort((a: MockExpense, b: MockExpense) => new Date(b.spent_at).getTime() - new Date(a.spent_at).getTime())
          .map((expense: MockExpense) => ({
            id: expense.id,
            category: expense.category,
            amount: expense.amount,
            note: expense.note,
            spent_at: expense.spent_at,
          })),
      );
      setLoading(false);
    };

    load();
  }, [tripId]);

  const totalSpent = useMemo(() => {
    return expenses.reduce((sum: number, expense: ExpenseRow) => sum + Number(expense.amount), 0);
  }, [expenses]);

  const budgetProgress = useMemo(() => {
    if (budgetTotal <= 0) return 0;
    return (totalSpent / budgetTotal) * 100;
  }, [totalSpent, budgetTotal]);

  const pieData = useMemo(() => {
    const grouped = new Map<string, number>();

    for (const expense of expenses) {
      grouped.set(expense.category, (grouped.get(expense.category) ?? 0) + Number(expense.amount));
    }

    return Array.from(grouped.entries()).map(([category, amount]) => ({
      category,
      label: categoryLabelMap[category] ?? category,
      amount,
    }));
  }, [expenses]);

  const progressColorClass = budgetProgress > 90 ? 'bg-red-500' : budgetProgress > 70 ? 'bg-amber-500' : 'bg-pine-green';

  return (
    <main className="min-h-screen space-y-10 bg-[#FDFCFB] p-8 md:p-10">
      <header className="space-y-3 transition-all duration-700">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/45 px-4 py-1.5 text-xs text-[#869484] backdrop-blur-md">
          <PiggyBank className="h-3.5 w-3.5" strokeWidth={1.5} />
          Dalat Dream Budget
        </p>
        <h1 className="text-4xl text-text md:text-5xl" style={{ fontFamily: 'var(--font-heading), serif' }}>
          Bản giao hưởng chi tiêu
        </h1>
        <p className="text-sm leading-7 text-text/75">Theo dõi ngân sách bằng tông pastel dịu mắt, thoáng, nhẹ và trực quan.</p>
      </header>

      <div className="grid grid-cols-1 gap-10 xl:grid-cols-3">
        <Card className="rounded-[2rem] border-white/20 bg-white/40 backdrop-blur-md transition-all duration-700 xl:col-span-1">
          <CardHeader className="p-8">
            <CardTitle className="inline-flex items-center gap-2" style={{ fontFamily: 'var(--font-heading), serif' }}>
              <WalletCards className="h-5 w-5 text-[#D4A5A5]" strokeWidth={1.5} />
              Tổng quan chi tiêu
            </CardTitle>
            <CardDescription>Donut Chart theo danh mục chi phí.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            {loading ? (
              <p className="text-sm text-text/70">Đang tải dữ liệu...</p>
            ) : pieData.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-[2rem] border border-dashed border-[#869484]/30 bg-white/35 p-8 text-center backdrop-blur-md transition-all duration-700">
                <div className="text-5xl">🐻💤</div>
                <p className="mt-3 text-sm font-medium text-text">Ví tiền vẫn ngủ yên, chưa có khoản chi nào.</p>
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="amount" nameKey="label" innerRadius={72} outerRadius={98} paddingAngle={4}>
                      {pieData.map((entry, index) => (
                        <Cell key={entry.category} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-white/20 bg-white/40 backdrop-blur-md transition-all duration-700 xl:col-span-2">
          <CardHeader className="p-8">
            <CardTitle className="inline-flex items-center gap-2" style={{ fontFamily: 'var(--font-heading), serif' }}>
              <PiggyBank className="h-5 w-5 text-[#D4A5A5]" strokeWidth={1.5} />
              Mức độ vung tay quá trán
            </CardTitle>
            <CardDescription>
              Đã chi {formatCurrency(totalSpent)} / Dự kiến {formatCurrency(budgetTotal)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-8 pt-0">
            <div className="h-4 w-full overflow-hidden rounded-full bg-[#ebe9e5]">
              <div
                className={`h-full transition-all duration-700 ${progressColorClass}`}
                style={{ width: `${Math.min(budgetProgress, 100)}%` }}
              />
            </div>
            <p className="text-sm text-text/70">{budgetProgress.toFixed(1)}% ngân sách đã sử dụng</p>
            {budgetProgress > 90 && (
              <p className="text-sm font-semibold text-[#D4A5A5]">Cảnh báo: Bạn đang sắp chạm ngưỡng vung tay quá trán!</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[2rem] border-white/20 bg-white/40 backdrop-blur-md transition-all duration-700">
        <CardHeader className="p-8">
          <CardTitle className="inline-flex items-center gap-2" style={{ fontFamily: 'var(--font-heading), serif' }}>
            <ReceiptText className="h-5 w-5 text-[#869484]" strokeWidth={1.5} />
            Expense List
          </CardTitle>
          <CardDescription>Bảng chi tiết khoản chi với khoảng trắng thoáng, không dùng đường kẻ cứng.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          {expenses.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-[2rem] border border-dashed border-[#869484]/30 bg-white/35 p-8 text-center backdrop-blur-md transition-all duration-700">
              <div className="text-5xl">🐻💤</div>
              <p className="mt-3 text-sm font-medium text-text">Ví tiền vẫn ngủ yên, chưa có khoản chi nào.</p>
              <p className="mt-1 text-xs text-text/70">Những khoản chi đầu tiên sẽ xuất hiện ở đây theo tông màu pastel.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {expenses.map((expense) => (
                <article
                  key={expense.id}
                  className="rounded-[2rem] bg-white/55 p-6 shadow-soft transition-all duration-700 hover:bg-white/70"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-[#869484]">
                        {categoryLabelMap[expense.category] ?? expense.category}
                      </p>
                      <p className="mt-2 text-sm text-text/75">{expense.note ?? 'Không có ghi chú'}</p>
                      <p className="mt-2 text-xs text-text/60">{new Date(expense.spent_at).toLocaleString('vi-VN')}</p>
                    </div>
                    <p className="text-base font-semibold text-[#D4A5A5]">{formatCurrency(Number(expense.amount))}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
