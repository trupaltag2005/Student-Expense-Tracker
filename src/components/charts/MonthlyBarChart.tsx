import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useCurrency } from '../../context/CurrencyContext.tsx';

interface MonthlyBarChartProps {
  data: Array<{
    name: string;
    income: number;
    expense: number;
    net?: number;
  }>;
  title?: string;
  height?: number;
}

export const MonthlyBarChart: React.FC<MonthlyBarChartProps> = ({
  data,
  title = 'Monthly Income vs. Expenses',
  height = 260,
}) => {
  const { formatAmount } = useCurrency();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white text-xs rounded-xl p-3 shadow-xl border border-slate-700 pointer-events-none space-y-1">
          <p className="font-bold text-slate-200 border-b border-slate-700 pb-1">{label}</p>
          <div className="flex items-center justify-between gap-4 text-emerald-400">
            <span>Income:</span>
            <span className="font-bold">{formatAmount(payload[0]?.value || 0)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-rose-400">
            <span>Expenses:</span>
            <span className="font-bold">{formatAmount(payload[1]?.value || 0)}</span>
          </div>
          {payload[0] && payload[1] && (
            <div className="flex items-center justify-between gap-4 text-slate-300 pt-1 border-t border-slate-800">
              <span>Net:</span>
              <span className="font-bold">
                {formatAmount((payload[0]?.value || 0) - (payload[1]?.value || 0))}
              </span>
            </div>
          )}
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
          Trends
        </span>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
            />
            <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
