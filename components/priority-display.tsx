import { View, Text } from "react-native";

interface PriorityDisplayProps {
  score: number;
  quadrant: "Q1" | "Q2" | "Q3" | "Q4";
  hint: string;
}

const QUADRANT_COLORS = {
  Q1: "#EF4444", // Red
  Q2: "#F59E0B", // Amber
  Q3: "#3B82F6", // Blue
  Q4: "#9CA3AF", // Gray
};

const QUADRANT_LABELS = {
  Q1: "Do Now",
  Q2: "Schedule",
  Q3: "Delegate",
  Q4: "Delete",
};

export function PriorityDisplay({ score, quadrant, hint }: PriorityDisplayProps) {
  const color = QUADRANT_COLORS[quadrant];
  const label = QUADRANT_LABELS[quadrant];

  const getScoreColor = (s: number) => {
    if (s >= 70) return "#EF4444"; // Red
    if (s >= 40) return "#F59E0B"; // Amber
    return "#9CA3AF"; // Gray
  };

  return (
    <View className="bg-surface rounded-lg p-6 border border-border items-center">
      {/* Priority Score Circle */}
      <View
        className="w-24 h-24 rounded-full items-center justify-center mb-4"
        style={{ backgroundColor: getScoreColor(score) }}
      >
        <Text className="text-4xl font-bold text-white">{Math.round(score)}</Text>
        <Text className="text-xs text-white/80 mt-1">Priority</Text>
      </View>

      {/* Quadrant Info */}
      <View
        className="px-4 py-2 rounded-full mb-3"
        style={{ backgroundColor: color }}
      >
        <Text className="text-white font-bold">{quadrant}</Text>
      </View>

      {/* Action Hint */}
      <Text className="text-base font-semibold text-foreground mb-1">{label}</Text>
      <Text className="text-sm text-muted text-center">{hint}</Text>
    </View>
  );
}
