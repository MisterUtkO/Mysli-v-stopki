import { View, Text, Pressable } from "react-native";
import { cn } from "@/lib/utils";

interface TaskPopupBubbleProps {
  title: string;
  description?: string;
  importance?: number;
  urgency?: number;
  dueDate?: string;
  dueTime?: string;
  status?: string;
  isRu?: boolean;
  position?: {
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
  };
  onClose?: () => void;
}

export function TaskPopupBubble({
  title,
  description,
  importance,
  urgency,
  dueDate,
  dueTime,
  status,
  isRu = false,
  position = { top: 100, left: 20 },
  onClose,
}: TaskPopupBubbleProps) {
  const statusText = {
    not_started: isRu ? "Не начато" : "Not started",
    in_progress: isRu ? "В процессе" : "In progress",
    completed: isRu ? "Выполнено" : "Completed",
  };

  return (
    <View
      className="absolute z-50 max-w-xs"
      style={{
        top: position.top,
        left: position.left,
        right: position.right,
        bottom: position.bottom,
      }}
    >
      {/* Bubble container with comic-style border */}
      <View className="bg-white rounded-2xl p-4 shadow-lg border-2 border-black">
        {/* Close button */}
        <Pressable
          onPress={onClose}
          className="absolute -top-2 -right-2 w-6 h-6 bg-black rounded-full items-center justify-center z-10"
        >
          <Text className="text-white text-sm font-bold">×</Text>
        </Pressable>

        {/* Title */}
        <Text className="text-base font-bold text-foreground mb-2 pr-4">
          {title}
        </Text>

        {/* Description (if different from title) */}
        {description && description !== title && (
          <Text className="text-sm text-muted mb-3 leading-relaxed">
            {description}
          </Text>
        )}

        {/* Info grid */}
        <View className="gap-2">
          {/* Importance & Urgency */}
          {(importance !== undefined || urgency !== undefined) && (
            <View className="flex-row gap-3">
              {importance !== undefined && (
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-muted">
                    {isRu ? "Важность" : "Importance"}
                  </Text>
                  <Text className="text-sm font-bold text-red-600">
                    {importance}/7
                  </Text>
                </View>
              )}
              {urgency !== undefined && (
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-muted">
                    {isRu ? "Срочность" : "Urgency"}
                  </Text>
                  <Text className="text-sm font-bold text-orange-600">
                    {urgency}/7
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Due Date & Time */}
          {dueDate && (
            <View>
              <Text className="text-xs font-semibold text-muted">
                {isRu ? "Срок" : "Due"}
              </Text>
              <Text className="text-sm font-semibold text-foreground">
                📅 {dueDate}
                {dueTime ? ` ${dueTime}` : ""}
              </Text>
            </View>
          )}

          {/* Status */}
          {status && (
            <View>
              <Text className="text-xs font-semibold text-muted">
                {isRu ? "Статус" : "Status"}
              </Text>
              <Text className="text-sm font-semibold text-blue-600">
                {statusText[status as keyof typeof statusText] || status}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Comic-style pointer (tail) */}
      <View
        className="absolute w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"
        style={{
          left: 20,
          top: -8,
          borderLeftWidth: 8,
          borderRightWidth: 8,
          borderTopWidth: 8,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderTopColor: "white",
        }}
      />

      {/* Pointer border (black outline) */}
      <View
        className="absolute w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-black"
        style={{
          left: 19,
          top: -10,
          borderLeftWidth: 8,
          borderRightWidth: 8,
          borderTopWidth: 8,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderTopColor: "black",
        }}
      />
    </View>
  );
}
