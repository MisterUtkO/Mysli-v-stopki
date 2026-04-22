import React, { useState, createContext, useContext, useEffect } from "react";
import { View, Text, Pressable, Modal, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import { useColors } from "@/hooks/use-colors";
import { useI18n } from "@/lib/context/i18n-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const SWIPE_THRESHOLD = 60;

// Adaptive values based on screen size
const getAdaptiveValues = () => {
  const isSmallScreen = SCREEN_WIDTH < 380;
  const isMediumScreen = SCREEN_WIDTH >= 380 && SCREEN_WIDTH < 480;
  
  return {
    containerPaddingHorizontal: isSmallScreen ? 16 : 24,
    cardMaxWidth: isSmallScreen ? SCREEN_WIDTH * 0.9 : 360,
    contentPadding: isSmallScreen ? 20 : 28,
    iconFontSize: isSmallScreen ? 40 : 52,
    titleFontSize: isSmallScreen ? 18 : 22,
    descriptionFontSize: isSmallScreen ? 13 : 15,
    descriptionMinHeight: isSmallScreen ? 60 : 88,
    buttonFontSize: isSmallScreen ? 12 : 14,
    buttonPaddingVertical: isSmallScreen ? 10 : 13,
  };
};

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

  // Shared value for swipe drag
  const translateX = useSharedValue(0);

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem("hasSeenOnboarding", "true");
      setVisible(false);
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
  };

  const goToNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSkip();
    }
  };

  const goToPrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSwipeEnd = (dx: number) => {
    if (dx < -SWIPE_THRESHOLD) {
      // Swipe left → next
      goToNext();
    } else if (dx > SWIPE_THRESHOLD) {
      // Swipe right → previous
      goToPrevious();
    }
    translateX.value = withTiming(0, { duration: 200 });
  };

  const panGesture = Gesture.Pan()
    // Lower thresholds for better native responsiveness
    .activeOffsetX([-8, 8])
    .failOffsetY([-10, 10])
    .onUpdate((e) => {
      // Subtle rubber-band resistance to show the card is draggable
      translateX.value = e.translationX * 0.5;
    })
    .onEnd((e) => {
      runOnJS(handleSwipeEnd)(e.translationX);
    })
    .onFinalize(() => {
      translateX.value = withTiming(0, { duration: 200 });
    });

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value * 0.15 }],
    opacity: interpolate(
      Math.abs(translateX.value),
      [0, 100],
      [1, 0.85],
      Extrapolation.CLAMP
    ),
  }));

  const step = ONBOARDING_STEPS[currentStep];

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
      {/*
        GestureHandlerRootView MUST wrap content inside Modal on native iOS/Android.
        Without it, react-native-gesture-handler gestures are silently ignored
        because the gesture responder tree is not connected to the modal's root.
      */}
      <GestureHandlerRootView
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: getAdaptiveValues().containerPaddingHorizontal,
        }}
      >
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              {
                width: "100%",
                maxWidth: getAdaptiveValues().cardMaxWidth,
                borderRadius: 24,
                backgroundColor: colors.background,
                overflow: "hidden",
              },
              cardAnimStyle,
            ]}
          >
            {/* Content area — fixed height, no ScrollView to avoid layout issues */}
            <View style={{ padding: getAdaptiveValues().contentPadding }}>
              {/* Icon */}
              <View style={{ alignItems: "center", marginBottom: 16 }}>
                <Text style={{ fontSize: getAdaptiveValues().iconFontSize }}>{step.icon}</Text>
              </View>

              {/* Title */}
              <Text
                style={{
                  fontSize: getAdaptiveValues().titleFontSize,
                  fontWeight: "700",
                  textAlign: "center",
                  marginBottom: 12,
                  color: colors.foreground,
                  lineHeight: getAdaptiveValues().titleFontSize * 1.3,
                }}
                numberOfLines={2}
              >
                {stepTitle}
              </Text>

              {/* Description */}
              <Text
                style={{
                  fontSize: getAdaptiveValues().descriptionFontSize,
                  textAlign: "center",
                  lineHeight: getAdaptiveValues().descriptionFontSize * 1.5,
                  color: colors.muted,
                  minHeight: getAdaptiveValues().descriptionMinHeight,
                }}
              >
                {stepDescription}
              </Text>

              {/* Swipe hint */}
              <Text
                style={{
                  fontSize: 12,
                  textAlign: "center",
                  color: colors.border,
                  marginTop: 8,
                  marginBottom: 4,
                }}
              >
                {t.onboarding?.swipeHint || "← свайп для навигации →"}
              </Text>

              {/* Progress dots */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  marginVertical: 16,
                  gap: 8,
                }}
              >
                {ONBOARDING_STEPS.map((_, index) => (
                  <Pressable
                    key={index}
                    onPress={() => setCurrentStep(index)}
                    style={{
                      width: index === currentStep ? 20 : 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor:
                        index === currentStep ? colors.primary : colors.border,
                    }}
                  />
                ))}
              </View>

              {/* Buttons */}
              <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                {currentStep > 0 ? (
                  <Pressable
                    onPress={goToPrevious}
                    style={({ pressed }) => ({
                      flex: 1,
                      minWidth: "45%",
                      paddingVertical: getAdaptiveValues().buttonPaddingVertical,
                      borderRadius: 10,
                      alignItems: "center",
                      backgroundColor: colors.surface,
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <Text style={{ fontWeight: "600", color: colors.muted, fontSize: getAdaptiveValues().buttonFontSize }}>
                      {t.onboarding?.previous || "← Назад"}
                    </Text>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={handleSkip}
                    style={({ pressed }) => ({
                      flex: 1,
                      minWidth: "45%",
                      paddingVertical: getAdaptiveValues().buttonPaddingVertical,
                      borderRadius: 10,
                      alignItems: "center",
                      backgroundColor: colors.surface,
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <Text style={{ fontWeight: "600", color: colors.muted, fontSize: getAdaptiveValues().buttonFontSize }}>
                      {t.onboarding?.skip || "Пропустить"}
                    </Text>
                  </Pressable>
                )}

                <Pressable
                  onPress={goToNext}
                  style={({ pressed }) => ({
                    flex: 1,
                    minWidth: "45%",
                    paddingVertical: getAdaptiveValues().buttonPaddingVertical,
                    borderRadius: 10,
                    alignItems: "center",
                    backgroundColor: colors.primary,
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <Text style={{ fontWeight: "700", color: "white", fontSize: getAdaptiveValues().buttonFontSize }}>
                    {currentStep === ONBOARDING_STEPS.length - 1
                      ? (t.onboarding?.getStarted || "Начать")
                      : (t.onboarding?.next || "Далее →")}
                  </Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
}
