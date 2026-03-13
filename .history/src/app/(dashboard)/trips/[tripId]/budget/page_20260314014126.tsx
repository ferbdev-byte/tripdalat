'use client';

import { useEffect, useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ExpenseList } from '../../../../../components/budget/ExpenseList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { supabase } from '../../../../../lib/supabase/client';

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

const pieColors = ['#1F5F4A', '#6FA8DC', '#f59e0b', '#8b5cf6', '#ec4899', '#94a3b8'];

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

    const load = async () => {
      setLoading(true);

      const [tripResult, expensesResult] = await Promise.all([
        supabase.from('trips').select('budget_total').eq('id', tripId).single(),
        supabase
          .from('expenses')
          .select('id, category, amount, note, spent_at')
          .eq('trip_id', tripId)
          .order('spent_at', { ascending: false }),
      ]);

      if (tripResult.data?.budget_total) {
        setBudgetTotal(Number(tripResult.data.budget_total));
      } else {
        setBudgetTotal(0);
      }

      setExpenses((expensesResult.data ?? []) as ExpenseRow[]);
      setLoading(false);
    };

    void load();
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
    <main className="space-y-6 p-4 md:p-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Budget Dashboard</h1>
        <p className="text-sm text-slate-600">Theo dõi tổng chi tiêu theo danh mục và cảnh báo vung tay quá trán.</p>
      </header>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Tổng quan chi tiêu</CardTitle>
            <CardDescription>Donut Chart theo danh mục chi phí.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-slate-500">Đang tải dữ liệu...</p>
            ) : pieData.length === 0 ? (
              <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-mist-gray bg-white/60 p-6 text-center backdrop-blur-sm">
                <div className="text-5xl">🐻💤</div>
                <p className="mt-3 text-sm font-medium text-slate-700">Ví tiền vẫn ngủ yên, chưa có khoản chi nào.</p>
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="amount" nameKey="label" innerRadius={70} outerRadius={95} paddingAngle={3}>
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

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Mức độ vung tay quá trán</CardTitle>
            <CardDescription>
              Đã chi {formatCurrency(totalSpent)} / Dự kiến {formatCurrency(budgetTotal)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-4 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full transition-all ${progressColorClass}`}
                style={{ width: `${Math.min(budgetProgress, 100)}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-slate-600">{budgetProgress.toFixed(1)}% ngân sách đã sử dụng</p>
            {budgetProgress > 90 && (
              <p className="mt-2 text-sm font-semibold text-red-600">Cảnh báo: Bạn đang sắp chạm ngưỡng vung tay quá trán!</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense List</CardTitle>
          <CardDescription>Bảng chi tiết các khoản chi tiêu trong chuyến đi.</CardDescription>
        </CardHeader>
        <CardContent>
          <ExpenseList expenses={expenses} />
        </CardContent>
      </Card>
    </main>
  );
}
