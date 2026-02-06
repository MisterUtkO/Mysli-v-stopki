import { View, Text, Pressable, ScrollView } from "react-native";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value: string; // HH:MM format
  onChange: (time: string) => void;
}

export function TimePicker({ value, onChange }: TimePickerProps) {
  const [hours, minutes] = value.split(":").map(Number);
  const [showPicker, setShowPicker] = useState(false);

  const handleHourChange = (hour: number) => {
    const newTime = `${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    onChange(newTime);
  };

  const handleMinuteChange = (minute: number) => {
    const newTime = `${String(hours).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    onChange(newTime);
  };

  return (
    <View className="gap-2">
      <Pressable
        onPress={() => setShowPicker(!showPicker)}
        className="bg-background border border-border rounded-lg px-4 py-3 flex-row items-center justify-between"
      >
        <Text className="text-foreground font-medium">Daily Reminder Time</Text>
        <Text className="text-primary font-bold text-lg">{value}</Text>
      </Pressable>

      {showPicker && (
        <View className="bg-surface rounded-lg p-4 border border-border">
          <View className="flex-row gap-4 items-center justify-center mb-4">
            {/* Hours */}
            <View className="items-center">
              <Text className="text-xs text-muted mb-2">Hours</Text>
              <ScrollView
                horizontal={false}
                scrollEnabled={true}
                className="h-32 w-16"
                showsVerticalScrollIndicator={false}
              >
                {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                  <Pressable
                    key={hour}
                    onPress={() => handleHourChange(hour)}
                    className={cn(
                      "py-2 px-3 rounded items-center justify-center",
                      hours === hour ? "bg-primary" : "bg-transparent"
                    )}
                  >
                    <Text
                      className={cn(
                        "text-lg font-semibold",
                        hours === hour ? "text-background" : "text-foreground"
                      )}
                    >
                      {String(hour).padStart(2, "0")}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <Text className="text-2xl font-bold text-foreground">:</Text>

            {/* Minutes */}
            <View className="items-center">
              <Text className="text-xs text-muted mb-2">Minutes</Text>
              <ScrollView
                horizontal={false}
                scrollEnabled={true}
                className="h-32 w-16"
                showsVerticalScrollIndicator={false}
              >
                {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                  <Pressable
                    key={minute}
                    onPress={() => handleMinuteChange(minute)}
                    className={cn(
                      "py-2 px-3 rounded items-center justify-center",
                      minutes === minute ? "bg-primary" : "bg-transparent"
                    )}
                  >
                    <Text
                      className={cn(
                        "text-lg font-semibold",
                        minutes === minute ? "text-background" : "text-foreground"
                      )}
                    >
                      {String(minute).padStart(2, "0")}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>

          <Pressable
            onPress={() => setShowPicker(false)}
            className="bg-primary rounded-lg py-2 items-center"
          >
            <Text className="text-background font-semibold">Done</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
