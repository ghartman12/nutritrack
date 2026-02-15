import Badge from "@/components/ui/Badge";

interface CalorieEstimateBadgeProps {
  isEstimate: boolean;
}

export default function CalorieEstimateBadge({ isEstimate }: CalorieEstimateBadgeProps) {
  if (!isEstimate) return null;
  return <Badge variant="ai" tooltip="This is an AI estimate and may not be accurate. Not intended as medical advice. Consult a healthcare professional for personalized nutrition guidance.">AI estimate</Badge>;
}
