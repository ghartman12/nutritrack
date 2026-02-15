"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import Card from "@/components/ui/Card";

interface DayExercise {
  date: string;
  minutes: number;
  calories: number;
}

interface ExerciseChartProps {
  data: DayExercise[];
}

export default function ExerciseChart({ data }: ExerciseChartProps) {
  const chartData = data.slice(0, 7).map((d) => ({
    date: format(new Date(d.date), "MMM d"),
    minutes: d.minutes,
    calories: Math.round(d.calories),
  })).reverse();

  if (chartData.length === 0) {
    return (
      <Card>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Exercise</h3>
        <p className="text-sm text-gray-500 text-center py-8">Log exercise to see your activity trends.</p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Exercise (7 days)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
          <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
          <Tooltip />
          <Bar dataKey="minutes" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Minutes" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
