"use client";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { format } from "date-fns";
import Card from "@/components/ui/Card";

interface DayData {
  date: string;
  calories: number;
}

interface CalorieChartProps {
  data: DayData[];
  goal: number;
}

export default function CalorieChart({ data, goal }: CalorieChartProps) {
  const [range, setRange] = useState<7 | 30>(7);
  const sliced = data.slice(0, range);
  const chartData = sliced.map((d) => ({
    date: format(new Date(d.date), "MMM d"),
    calories: Math.round(d.calories),
  })).reverse();

  if (chartData.length === 0) {
    return (
      <Card>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Calorie Intake</h3>
        <p className="text-sm text-gray-500 text-center py-8">Log food to see your calorie trends.</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Calorie Intake</h3>
        <div className="flex gap-1">
          {([7, 30] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-lg text-xs font-medium ${range === r ? "bg-emerald-100 text-emerald-800" : "text-gray-500 hover:bg-gray-100"}`}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
          <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
          <Tooltip />
          <ReferenceLine y={goal} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: "Goal", fill: "#f59e0b", fontSize: 11 }} />
          <Bar dataKey="calories" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
