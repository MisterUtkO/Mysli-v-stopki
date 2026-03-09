import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, Modal } from "react-native";
import { useColors } from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to Eisenhower Priority",
    description:
      "Manage your tasks efficiently using the Eisenhower Matrix method. Organize tasks by urgency and importance.",
    icon: "📋",
  },
  {
    id: "tasks",
    title: "Tasks Screen",
    description:
      "View all your tasks in different views: All, Start, In Progress, and Done. Swipe tasks to change their status or delete them.",
    icon: "✓",
  },
  {
    id: "matrix",
    title: "Eisenhower Matrix",
    description:
      "Visualize your tasks in a 2x2 matrix: Urgent & Important, Important, Urgent, and Neither. Focus on what matters most.",
    icon: "📊",
  },
  {
    id: "kanban",
    title: "Kanban Board",
    description:
      "Organize tasks in columns: To Do, In Progress, and Done. Drag tasks between columns to update their status.",
    icon: "📌",
  },
  {
    id: "achievements",
    title: "Achievements",
    description:
      "Track your progress with daily, weekly, and monthly achievements. Celebrate your productivity milestones!",
    icon: "🏆",
  },
  {
    id: "tips",
    title: "Pro Tips",
    description:
      "Create tasks with clear titles, set priorities, and review your progress regularly. Start with one task and build momentum!",
    icon: "💡",
  },
];

export function OnboardingTutorial() {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const colors = useColors();

  const checkAndShowOnboarding = async () => {
    try {
      const hasSeenOnboarding = await AsyncStorage.getItem(
        "hasSeenOnboarding"
      );
      if (!hasSeenOnboarding) {
        setVisible(true);
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error);
    }
  };

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem("hasSeenOnboarding", "true");
      setVisible(false);
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
  };

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSkip();
    }
  };

  const step = ONBOARDING_STEPS[currentStep];

  React.useEffect(() => {
    checkAndShowOnboarding();
  }, []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleSkip}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: "80%",
            borderRadius: 24,
            padding: 32,
            backgroundColor: colors.background,
          }}
        >
          <ScrollView>
            {/* Icon */}
            <View style={{ alignItems: "center", marginBottom: 24 }}>
              <Text style={{ fontSize: 48 }}>{step.icon}</Text>
            </View>

            {/* Title */}
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                textAlign: "center",
                marginBottom: 16,
                color: colors.foreground,
              }}
            >
              {step.title}
            </Text>

            {/* Description */}
            <Text
              style={{
                fontSize: 16,
                textAlign: "center",
                marginBottom: 32,
                lineHeight: 24,
                color: colors.muted,
              }}
            >
              {step.description}
            </Text>

            {/* Progress Indicator */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginBottom: 32,
                gap: 8,
              }}
            >
              {ONBOARDING_STEPS.map((_, index) => (
                <View
                  key={index}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor:
                      index === currentStep ? colors.primary : colors.border,
                  }}
                />
              ))}
            </View>

            {/* Buttons */}
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable
                onPress={handleSkip}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: "center",
                  backgroundColor: colors.surface,
                }}
              >
                <Text
                  style={{
                    fontWeight: "600",
                    color: colors.muted,
                  }}
                >
                  Skip
                </Text>
              </Pressable>

              <Pressable
                onPress={handleNext}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: "center",
                  backgroundColor: colors.primary,
                }}
              >
                <Text
                  style={{
                    fontWeight: "600",
                    color: "white",
                  }}
                >
                  {currentStep === ONBOARDING_STEPS.length - 1
                    ? "Get Started"
                    : "Next"}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
