type ExpenseRow = {
  id: string;
  category: string;
  amount: number;
  note: string | null;
  spent_at: string;
};

type ExpenseListProps = {
  expenses: ExpenseRow[];
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);

const categoryLabelMap: Record<string, string> = {
  food: 'Ăn uống',
  transport: 'Di chuyển',
  ticket: 'Vé',
  hotel: 'Lưu trú',
  shopping: 'Mua sắm',
  other: 'Khác',
};

export function ExpenseList({ expenses }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-mist-gray bg-white/60 p-6 text-center backdrop-blur-sm">
        <div className="text-5xl">🐻💤</div>
        <p className="mt-3 text-sm font-medium text-slate-700">Chú gấu đang ngủ vì hôm nay bạn chưa tiêu đồng nào.</p>
        <p className="mt-1 text-xs text-slate-500">Thêm một khoản chi để bắt đầu theo dõi ngân sách chuyến đi.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white/60 backdrop-blur-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50/80">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">Danh mục</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">Ghi chú</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">Thời gian</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-700">Số tiền</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {expenses.map((expense) => (
            <tr key={expense.id} className="hover:bg-slate-50/70">
              <td className="px-4 py-3 text-slate-700">{categoryLabelMap[expense.category] ?? expense.category}</td>
              <td className="px-4 py-3 text-slate-600">{expense.note ?? '—'}</td>
              <td className="px-4 py-3 text-slate-600">{new Date(expense.spent_at).toLocaleString('vi-VN')}</td>
              <td className="px-4 py-3 text-right font-medium text-slate-800">{formatCurrency(expense.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
