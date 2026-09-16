import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useCurrency } from '../../context/CurrencyContext.tsx';
import { CATEGORIES_META } from '../../utils/categories.ts';

interface ExpenseChartProps {
  data: Array<{ category: string; amount: number; percentage: number }>;
  title?: string;
  height?: number;
}

const PALETTE = [
  '#6366f1', // indigo
  '#f59e0b', // amber
  '#ec4899', // pink
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#8b5cf6', // purple
  '#f43f5e', // rose
  '#3b82f6', // blue
  '#14b8a6', // teal
  '#64748b', // slate
];

export const ExpenseChart: React.FC<ExpenseChartProps> = ({
  data,
  title = 'Expense Breakdown by Category',
  height = 260,
}) => {
  const { formatAmount } = useCurrency();

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col items-center justify-center text-center text-slate-400 h-64">
        <p className="text-xs font-semibold">No expense records found to plot.</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white text-xs rounded-xl px-3 py-2 shadow-xl border border-slate-700 pointer-events-none">
          <p className="font-bold">{item.category}</p>
          <p className="text-indigo-300 font-semibold">{formatAmount(item.amount)}</p>
          <p className="text-slate-400 text-[10px]">{item.percentage}% of total expenses</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          {data.length} Categories
        </span>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="amount"
              nameKey="category"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Category Mini Legend */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-3 border-t border-slate-100 max-h-24 overflow-y-auto">
        {data.slice(0, 6).map((item, idx) => (
          <div key={item.category} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 truncate">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: PALETTE[idx % PALETTE.length] }}
              />
              <span className="text-slate-700 font-medium truncate">{item.category}</span>
            </div>
            <span className="text-slate-900 font-bold ml-1">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
