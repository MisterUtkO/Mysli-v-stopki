import React, { useState, createContext, useContext, useEffect } from "react";
import { View, Text, Pressable, ScrollView, Modal } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { useI18n } from "@/lib/context/i18n-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface OnboardingStep {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    titleKey: "onboarding.welcome",
    descriptionKey: "onboarding.welcomeDescription",
    icon: "📋",
  },
  {
    id: "tasks",
    titleKey: "onboarding.tasksTitle",
    descriptionKey: "onboarding.tasksDescription",
    icon: "✓",
  },
  {
    id: "matrix",
    titleKey: "onboarding.matrixTitle",
    descriptionKey: "onboarding.matrixDescription",
    icon: "📊",
  },
  {
    id: "kanban",
    titleKey: "onboarding.kanbanTitle",
    descriptionKey: "onboarding.kanbanDescription",
    icon: "📌",
  },
  {
    id: "achievements",
    titleKey: "onboarding.achievementsTitle",
    descriptionKey: "onboarding.achievementsDescription",
    icon: "🏆",
  },
  {
    id: "tips",
    titleKey: "onboarding.tipsTitle",
    descriptionKey: "onboarding.tipsDescription",
    icon: "💡",
  },
];

interface OnboardingContextType {
  showOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error(
      "useOnboarding must be used within OnboardingTutorialProvider"
    );
  }
  return context;
}

export function OnboardingTutorialProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const showOnboarding = () => {
    setCurrentStep(0);
    setVisible(true);
  };

  // Check if user has seen onboarding on mount
  useEffect(() => {
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

    checkAndShowOnboarding();
  }, []);

  return (
    <OnboardingContext.Provider value={{ showOnboarding }}>
      <OnboardingTutorialModal
        visible={visible}
        setVisible={setVisible}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
      />
      {children}
    </OnboardingContext.Provider>
  );
}

function OnboardingTutorialModal({
  visible,
  setVisible,
  currentStep,
  setCurrentStep,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
}) {
  const colors = useColors();
  const { t } = useI18n();

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

  // Get translated text using the key path (e.g., "onboarding.welcome")
  const getTranslation = (key: string) => {
    const keys = key.split(".");
    let value: any = t;
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === "string" ? value : key;
  };

  const stepTitle = getTranslation(step.titleKey);
  const stepDescription = getTranslation(step.descriptionKey);

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
              {stepTitle}
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
              {stepDescription}
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
                  {t.onboarding.skip}
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
                    ? t.onboarding.getStarted
                    : t.onboarding.next}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
