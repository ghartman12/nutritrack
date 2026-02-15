"use client";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { format } from "date-fns";

interface Digest {
  id: string;
  date: string;
  type: string;
  content: string;
}

interface DigestHistoryProps {
  digests: Digest[];
}

export default function DigestHistory({ digests }: DigestHistoryProps) {
  if (digests.length === 0) {
    return (
      <Card>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">AI Insights</h3>
        <p className="text-sm text-gray-500 text-center py-4">Your AI-generated insights will appear here after you start logging.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900">AI Insights</h3>
      {digests.map((digest) => (
        <Card key={digest.id} padding="sm">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="ai">{digest.type}</Badge>
            <span className="text-xs text-gray-400">{format(new Date(digest.date), "MMM d, yyyy")}</span>
          </div>
          <p className="text-sm text-gray-700">{digest.content}</p>
        </Card>
      ))}
    </div>
  );
}
