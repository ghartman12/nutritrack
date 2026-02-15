"use client";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import Card from "@/components/ui/Card";

interface WeightEntry {
  id: string;
  date: string;
  weight: number;
  unit: string;
}

interface WeightChartProps {
  entries: WeightEntry[];
}

export default function WeightChart({ entries }: WeightChartProps) {
  const [range, setRange] = useState<30 | 90>(30);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - range);
  const filtered = entries.filter((e) => new Date(e.date) >= cutoff);
  const data = filtered.map((e) => ({
    date: format(new Date(e.date), "MMM d"),
    weight: e.weight,
  })).reverse();

  if (data.length === 0) {
    return (
      <Card>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Weight Trend</h3>
        <p className="text-sm text-gray-500 text-center py-8">Log your weight to see trends here.</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Weight Trend</h3>
        <div className="flex gap-1">
          {([30, 90] as const).map((r) => (
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
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
          <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" domain={["auto", "auto"]} />
          <Tooltip />
          <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
