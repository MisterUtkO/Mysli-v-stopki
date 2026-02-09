import { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { SwipeableTaskCard } from "@/components/swipeable-task-card";
import { useTaskContext } from "@/lib/context/task-context";
import { useI18n } from "@/lib/context/i18n-context";
import type { Task, TaskStatus } from "@/lib/domain/types";

export default function HomeScreen() {
  const router = useRouter();
  const { tasks, deleteTask, updateTask } = useTaskContext();
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  useEffect(() => {
    let filtered = tasks;

    if (search.trim()) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(search.toLowerCase()) ||
          task.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (selectedStatus) {
      filtered = filtered.filter((task) => task.status === selectedStatus);
    }

    setFilteredTasks(filtered);
  }, [tasks, search, selectedStatus]);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    await updateTask(taskId, { status: newStatus });
  };

  const handleDelete = async (taskId: string) => {
    await deleteTask(taskId);
  };

  const renderTaskCard = ({ item }: { item: Task }) => (
    <SwipeableTaskCard
      task={item}
      emoji={item.emoji}
      onPress={() => router.push(`/task-detail/${item.id}`)}
      onStatusChange={(newStatus) => handleStatusChange(item.id, newStatus)}
      onDelete={() => handleDelete(item.id)}
    />
  );

  return (
    <ScreenContainer className="p-4">
      <View className="gap-4 flex-1">
        <View>
          <Text className="text-2xl font-bold text-foreground mb-4">
            {t.home.title}
          </Text>

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={t.home.search}
            placeholderTextColor="#999"
            className="bg-surface border border-border rounded-lg p-3 text-foreground mb-3"
          />

          <View className="flex-row gap-2 mb-3">
            {[
              { label: t.home.active, value: "not_started" },
              { label: t.home.done, value: "completed" },
            ].map((status) => (
              <Pressable
                key={status.value}
                onPress={() =>
                  setSelectedStatus(
                    selectedStatus === status.value ? null : status.value
                  )
                }
                className={`px-3 py-2 rounded ${
                  selectedStatus === status.value
                    ? "bg-primary"
                    : "bg-surface border border-border"
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    selectedStatus === status.value
                      ? "text-white"
                      : "text-foreground"
                  }`}
                >
                  {status.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {filteredTasks.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-muted text-center">{t.home.noTasks}</Text>
          </View>
        ) : (
          <FlatList
            data={filteredTasks}
            renderItem={renderTaskCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}

        <Pressable
          onPress={() => router.push("/add-task")}
          className="bg-primary rounded-lg p-4 mt-4"
        >
          <Text className="text-center text-white font-bold text-lg">
            {t.home.addTask}
          </Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}
