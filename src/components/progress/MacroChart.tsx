"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format } from "date-fns";
import Card from "@/components/ui/Card";

interface DayMacros {
  date: string;
  protein: number;
  carbs: number;
  fat: number;
}

interface MacroChartProps {
  data: DayMacros[];
}

export default function MacroChart({ data }: MacroChartProps) {
  const chartData = data.slice(0, 7).map((d) => ({
    date: format(new Date(d.date), "MMM d"),
    protein: Math.round(d.protein),
    carbs: Math.round(d.carbs),
    fat: Math.round(d.fat),
  })).reverse();

  if (chartData.length === 0) {
    return (
      <Card>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Macro Breakdown</h3>
        <p className="text-sm text-gray-500 text-center py-8">Log food to see your macro trends.</p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Macro Breakdown (7 days)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
          <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
          <Tooltip />
          <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="protein" fill="#3b82f6" radius={[2, 2, 0, 0]} />
          <Bar dataKey="carbs" fill="#f59e0b" radius={[2, 2, 0, 0]} />
          <Bar dataKey="fat" fill="#f43f5e" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
