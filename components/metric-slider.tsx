import { View, Text } from "react-native";
import Slider from "@react-native-community/slider";

interface MetricSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  description?: string;
}

export function MetricSlider({
  label,
  value,
  onChange,
  description,
}: MetricSliderProps) {
  const getColor = (val: number) => {
    if (val <= 3) return "#9CA3AF"; // Gray
    if (val <= 6) return "#F59E0B"; // Amber
    return "#22C55E"; // Green
  };

  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-1">
          <Text className="text-sm font-semibold text-foreground">{label}</Text>
          {description && (
            <Text className="text-xs text-muted mt-0.5">{description}</Text>
          )}
        </View>
        <View
          className="w-12 h-8 rounded-lg items-center justify-center"
          style={{ backgroundColor: getColor(value) }}
        >
          <Text className="text-white font-bold text-sm">{value}</Text>
        </View>
      </View>

      <View style={{ height: 40, justifyContent: "center" }}>
        <Slider
          style={{ height: 40 }}
          minimumValue={1}
          maximumValue={10}
          step={1}
          value={value}
          onValueChange={onChange}
          minimumTrackTintColor={getColor(value)}
          maximumTrackTintColor="#E5E7EB"
        />
      </View>

      <View className="flex-row justify-between mt-1">
        <Text className="text-xs text-muted">Low</Text>
        <Text className="text-xs text-muted">High</Text>
      </View>
    </View>
  );
}
