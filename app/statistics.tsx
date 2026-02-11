import { View, Text, ScrollView, Pressable, Dimensions } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useTaskContext } from "@/lib/context/task-context";
import { useI18n } from "@/lib/context/i18n-context";
import { useColors } from "@/hooks/use-colors";
import { useRouter } from "expo-router";
import type { Task } from "@/lib/domain/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function getStartOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function getStartOfWeek(ts: number): number {
  const d = new Date(ts);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function getDayLabel(ts: number, isRu: boolean): string {
  const d = new Date(ts);
  const days = isRu
    ? ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[d.getDay()];
}

function getMonthLabel(month: number, isRu: boolean): string {
  const months = isRu
    ? ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"]
    : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months[month];
}

// Simple bar chart component
function BarChart({ data, maxValue, barColor, labelColor }: {
  data: { label: string; value: number }[];
  maxValue: number;
  barColor: string;
  labelColor: string;
}) {
  const chartWidth = SCREEN_WIDTH - 64;
  const barWidth = Math.min(32, (chartWidth - data.length * 4) / data.length);
  const chartHeight = 120;

  return (
    <View style={{ height: chartHeight + 30, flexDirection: "row", alignItems: "flex-end", justifyContent: "center", gap: 4 }}>
      {data.map((item, i) => {
        const barHeight = maxValue > 0 ? (item.value / maxValue) * chartHeight : 0;
        return (
          <View key={i} style={{ alignItems: "center", width: barWidth }}>
            {item.value > 0 && (
              <Text style={{ fontSize: 9, color: labelColor, marginBottom: 2, fontWeight: "600" }}>
                {item.value}
              </Text>
            )}
            <View
              style={{
                width: barWidth - 4,
                height: Math.max(barHeight, 2),
                backgroundColor: barColor,
                borderRadius: 4,
              }}
            />
            <Text style={{ fontSize: 8, color: labelColor, marginTop: 4, opacity: 0.7 }}>
              {item.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// Donut/pie segment (simplified as horizontal bars)
function QuadrantBars({ tasks, isRu }: { tasks: Task[]; isRu: boolean }) {
  const active = tasks.filter((t) => t.status !== "completed");
  const q1 = active.filter((t) => t.quadrant === "Q1").length;
  const q2 = active.filter((t) => t.quadrant === "Q2").length;
  const q3 = active.filter((t) => t.quadrant === "Q3").length;
  const q4 = active.filter((t) => t.quadrant === "Q4").length;
  const total = q1 + q2 + q3 + q4;
  const maxQ = Math.max(q1, q2, q3, q4, 1);

  const quadrants = [
    { label: `Q1 ${isRu ? "Делать" : "Do"}`, value: q1, color: "#EF4444" },
    { label: `Q2 ${isRu ? "План" : "Plan"}`, value: q2, color: "#F59E0B" },
    { label: `Q3 ${isRu ? "Делег." : "Deleg."}`, value: q3, color: "#3B82F6" },
    { label: `Q4 ${isRu ? "Отлож." : "Defer"}`, value: q4, color: "#22C55E" },
  ];

  return (
    <View style={{ gap: 8 }}>
      {quadrants.map((q) => (
        <View key={q.label} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={{ fontSize: 11, color: q.color, fontWeight: "700", width: 80 }}>{q.label}</Text>
          <View style={{ flex: 1, height: 18, backgroundColor: "rgba(128,128,128,0.1)", borderRadius: 9, overflow: "hidden" }}>
            <View
              style={{
                height: 18,
                width: `${maxQ > 0 ? (q.value / maxQ) * 100 : 0}%`,
                backgroundColor: q.color,
                borderRadius: 9,
                justifyContent: "center",
                paddingLeft: 8,
              }}
            >
              {q.value > 0 && (
                <Text style={{ fontSize: 10, color: "#FFF", fontWeight: "700" }}>{q.value}</Text>
              )}
            </View>
          </View>
          <Text style={{ fontSize: 11, color: "#999", width: 30, textAlign: "right" }}>
            {total > 0 ? Math.round((q.value / total) * 100) : 0}%
          </Text>
        </View>
      ))}
    </View>
  );
}

export default function StatisticsScreen() {
  const { tasks } = useTaskContext();
  const { language } = useI18n();
  const colors = useColors();
  const router = useRouter();
  const isRu = language === "ru";

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const activeTasks = tasks.filter((t) => t.status !== "completed").length;
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress").length;
  const notStartedTasks = tasks.filter((t) => t.status === "not_started").length;

  // Weekly completion data (last 7 days)
  const now = Date.now();
  const oneDayMs = 86400000;
  const weekData: { label: string; value: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = getStartOfDay(now - i * oneDayMs);
    const dayEnd = dayStart + oneDayMs;
    const completedOnDay = tasks.filter(
      (t) => t.status === "completed" && t.updatedAt >= dayStart && t.updatedAt < dayEnd
    ).length;
    weekData.push({
      label: getDayLabel(dayStart, isRu),
      value: completedOnDay,
    });
  }
  const weekMax = Math.max(...weekData.map((d) => d.value), 1);

  // Monthly data (last 6 months)
  const monthData: { label: string; value: number }[] = [];
  const currentDate = new Date();
  for (let i = 5; i >= 0; i--) {
    const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1);
    const completedInMonth = tasks.filter(
      (t) => t.status === "completed" && t.updatedAt >= month.getTime() && t.updatedAt < monthEnd.getTime()
    ).length;
    monthData.push({
      label: getMonthLabel(month.getMonth(), isRu),
      value: completedInMonth,
    });
  }
  const monthMax = Math.max(...monthData.map((d) => d.value), 1);

  // Average priority
  const avgImportance = tasks.length > 0
    ? (tasks.reduce((sum, t) => sum + t.importance, 0) / tasks.length).toFixed(1)
    : "0";
  const avgUrgency = tasks.length > 0
    ? (tasks.reduce((sum, t) => sum + t.urgency, 0) / tasks.length).toFixed(1)
    : "0";

  // Completion rate
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Tasks created today
  const todayStart = getStartOfDay(now);
  const createdToday = tasks.filter((t) => t.createdAt >= todayStart).length;
  const completedToday = tasks.filter((t) => t.status === "completed" && t.updatedAt >= todayStart).length;

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="p-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1, marginRight: 12 }]}
          >
            <Text style={{ fontSize: 28, color: colors.primary }}>←</Text>
          </Pressable>
          <Text className="text-foreground font-bold" style={{ fontSize: 24, lineHeight: 30 }}>
            {isRu ? "Статистика" : "Statistics"}
          </Text>
        </View>

        {/* Summary Cards */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
          <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 14, padding: 12, alignItems: "center" }}>
            <Text style={{ fontSize: 28, fontWeight: "800", color: colors.primary }}>{totalTasks}</Text>
            <Text style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>{isRu ? "Всего" : "Total"}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 14, padding: 12, alignItems: "center" }}>
            <Text style={{ fontSize: 28, fontWeight: "800", color: "#22C55E" }}>{completedTasks}</Text>
            <Text style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>{isRu ? "Выполнено" : "Done"}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 14, padding: 12, alignItems: "center" }}>
            <Text style={{ fontSize: 28, fontWeight: "800", color: "#F59E0B" }}>{activeTasks}</Text>
            <Text style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>{isRu ? "Активных" : "Active"}</Text>
          </View>
        </View>

        {/* Completion Rate */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: "700", color: colors.foreground, marginBottom: 8 }}>
            {isRu ? "Процент выполнения" : "Completion Rate"}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ flex: 1, height: 12, backgroundColor: "rgba(128,128,128,0.15)", borderRadius: 6, overflow: "hidden" }}>
              <View
                style={{
                  height: 12,
                  width: `${completionRate}%`,
                  backgroundColor: completionRate >= 70 ? "#22C55E" : completionRate >= 40 ? "#F59E0B" : "#EF4444",
                  borderRadius: 6,
                }}
              />
            </View>
            <Text style={{ fontSize: 18, fontWeight: "800", color: colors.foreground }}>{completionRate}%</Text>
          </View>
        </View>

        {/* Today's Stats */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
          <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 14, padding: 12 }}>
            <Text style={{ fontSize: 10, color: colors.muted }}>{isRu ? "Создано сегодня" : "Created today"}</Text>
            <Text style={{ fontSize: 22, fontWeight: "800", color: colors.primary, marginTop: 4 }}>{createdToday}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 14, padding: 12 }}>
            <Text style={{ fontSize: 10, color: colors.muted }}>{isRu ? "Выполнено сегодня" : "Done today"}</Text>
            <Text style={{ fontSize: 22, fontWeight: "800", color: "#22C55E", marginTop: 4 }}>{completedToday}</Text>
          </View>
        </View>

        {/* Weekly Chart */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: "700", color: colors.foreground, marginBottom: 12 }}>
            {isRu ? "Выполнено за неделю" : "Completed this week"}
          </Text>
          <BarChart data={weekData} maxValue={weekMax} barColor={colors.primary} labelColor={colors.muted} />
        </View>

        {/* Monthly Chart */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: "700", color: colors.foreground, marginBottom: 12 }}>
            {isRu ? "Выполнено по месяцам" : "Completed by month"}
          </Text>
          <BarChart data={monthData} maxValue={monthMax} barColor="#8B5CF6" labelColor={colors.muted} />
        </View>

        {/* Quadrant Distribution */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: "700", color: colors.foreground, marginBottom: 12 }}>
            {isRu ? "Распределение по квадрантам" : "Quadrant Distribution"}
          </Text>
          <QuadrantBars tasks={tasks} isRu={isRu} />
        </View>

        {/* Status Breakdown */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: "700", color: colors.foreground, marginBottom: 12 }}>
            {isRu ? "По статусам" : "By Status"}
          </Text>
          <View style={{ gap: 6 }}>
            {[
              { label: isRu ? "Не начато" : "Not started", value: notStartedTasks, color: "#9CA3AF" },
              { label: isRu ? "В процессе" : "In progress", value: inProgressTasks, color: "#3B82F6" },
              { label: isRu ? "Выполнено" : "Completed", value: completedTasks, color: "#22C55E" },
            ].map((item) => (
              <View key={item.label} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: item.color }} />
                <Text style={{ fontSize: 13, color: colors.foreground, flex: 1 }}>{item.label}</Text>
                <Text style={{ fontSize: 13, fontWeight: "700", color: colors.foreground }}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Average Metrics */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: "700", color: colors.foreground, marginBottom: 12 }}>
            {isRu ? "Средние показатели" : "Average Metrics"}
          </Text>
          <View style={{ flexDirection: "row", gap: 16 }}>
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={{ fontSize: 10, color: colors.muted }}>{isRu ? "Важность" : "Importance"}</Text>
              <Text style={{ fontSize: 24, fontWeight: "800", color: "#F59E0B", marginTop: 4 }}>⚡{avgImportance}</Text>
            </View>
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={{ fontSize: 10, color: colors.muted }}>{isRu ? "Срочность" : "Urgency"}</Text>
              <Text style={{ fontSize: 24, fontWeight: "800", color: "#EF4444", marginTop: 4 }}>🔥{avgUrgency}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
