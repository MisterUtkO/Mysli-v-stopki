import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SWIPE_HINT_KEY = "@swipe_hint_shown";

interface SwipeHintProps {
  isRu: boolean;
  hasTask: boolean;
}

/**
 * SwipeHint shows an animated arrow overlay on the first task card
 * to teach users they can swipe right to change status and left to delete.
 * Only shows once (persisted via AsyncStorage).
 */
export function SwipeHint({ isRu, hasTask }: SwipeHintProps) {
  const [visible, setVisible] = useState(false);
  const arrowX = useSharedValue(0);

  useEffect(() => {
    checkIfShouldShow();
  }, [hasTask]);

  const checkIfShouldShow = async () => {
    try {
      const shown = await AsyncStorage.getItem(SWIPE_HINT_KEY);
      if (!shown && hasTask) {
        setVisible(true);
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
          dismiss();
        }, 5000);
      }
    } catch {
      // Ignore errors
    }
  };

  const dismiss = async () => {
    setVisible(false);
    try {
      await AsyncStorage.setItem(SWIPE_HINT_KEY, "true");
    } catch {
      // Ignore errors
    }
  };

  useEffect(() => {
    if (visible) {
      // Animate arrow sliding right repeatedly
      arrowX.value = withRepeat(
        withSequence(
          withTiming(40, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 400, easing: Easing.inOut(Easing.ease) }),
          withDelay(200, withTiming(0, { duration: 1 }))
        ),
        -1,
        false
      );
    }
  }, [visible, arrowX]);

  const animatedArrowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: arrowX.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
      style={styles.container}
    >
      <View style={styles.hintRow}>
        <Animated.View style={[styles.arrowContainer, animatedArrowStyle]}>
          <Text style={styles.arrow}>→</Text>
        </Animated.View>
        <View style={styles.textContainer}>
          <Text style={styles.hintText}>
            {isRu
              ? "Свайпните вправо для смены статуса"
              : "Swipe right to change status"}
          </Text>
          <Text style={styles.hintSubtext}>
            {isRu
              ? "Свайп влево — удалить"
              : "Swipe left to delete"}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(10, 126, 164, 0.95)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  arrow: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  textContainer: {
    flex: 1,
  },
  hintText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    lineHeight: 18,
  },
  hintSubtext: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    lineHeight: 16,
    marginTop: 2,
  },
});
