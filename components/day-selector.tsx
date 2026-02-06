import { View, Text, Pressable } from "react-native";
import { cn } from "@/lib/utils";
import * as Haptics from "expo-haptics";

interface DaySelectorProps {
  selectedDays: number[]; // 0=Sunday, 1=Monday, ..., 6=Saturday
  onChange: (days: number[]) => void;
}

const DAYS = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

export function DaySelector({ selectedDays, onChange }: DaySelectorProps) {
  const toggleDay = (day: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selectedDays.includes(day)) {
      onChange(selectedDays.filter((d) => d !== day));
    } else {
      onChange([...selectedDays, day].sort());
    }
  };

  const selectWeekdays = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange([1, 2, 3, 4, 5]); // Monday to Friday
  };

  const selectWeekend = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange([0, 6]); // Saturday and Sunday
  };

  const selectAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange([0, 1, 2, 3, 4, 5, 6]);
  };

  return (
    <View className="gap-3">
      <View className="flex-row gap-2 flex-wrap">
        {DAYS.map((day) => (
          <Pressable
            key={day.value}
            onPress={() => toggleDay(day.value)}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            className={cn(
              "w-12 h-12 rounded-lg border-2 items-center justify-center",
              selectedDays.includes(day.value)
                ? "bg-primary border-primary"
                : "bg-surface border-border"
            )}
          >
            <Text
              className={cn(
                "font-semibold text-sm",
                selectedDays.includes(day.value) ? "text-background" : "text-foreground"
              )}
            >
              {day.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View className="flex-row gap-2">
        <Pressable
          onPress={selectWeekdays}
          style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
          className="flex-1 bg-blue-500 rounded-lg py-2 px-3"
        >
          <Text className="text-white text-sm font-semibold text-center">Weekdays</Text>
        </Pressable>
        <Pressable
          onPress={selectWeekend}
          style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
          className="flex-1 bg-orange-500 rounded-lg py-2 px-3"
        >
          <Text className="text-white text-sm font-semibold text-center">Weekend</Text>
        </Pressable>
        <Pressable
          onPress={selectAll}
          style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
          className="flex-1 bg-green-500 rounded-lg py-2 px-3"
        >
          <Text className="text-white text-sm font-semibold text-center">All Days</Text>
        </Pressable>
      </View>
    </View>
  );
}
