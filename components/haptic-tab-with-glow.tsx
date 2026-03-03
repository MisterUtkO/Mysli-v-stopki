import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";
import { useSharedValue, withRepeat, withTiming, useAnimatedStyle } from "react-native-reanimated";
import Animated from "react-native-reanimated";
import { useEffect } from "react";
import { View } from "react-native";

export function HapticTabWithGlow(props: BottomTabBarButtonProps) {
  const opacity = useSharedValue(0.3);
  const isActive = props.accessibilityState?.selected ?? false;

  useEffect(() => {
    if (isActive) {
      opacity.value = withRepeat(
        withTiming(1, { duration: 1500 }),
        -1,
        true
      );
    } else {
      opacity.value = 0.3;
    }
  }, [isActive, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={{ position: "relative", flex: 1 }}>
      {isActive && (
        <Animated.View
          style={[
            {
              position: "absolute",
              top: -8,
              left: 0,
              right: 0,
              height: 4,
              backgroundColor: "#0a7ea4",
              borderRadius: 2,
            },
            animatedStyle,
          ]}
        />
      )}
      <PlatformPressable
        {...props}
        onPressIn={(ev) => {
          if (process.env.EXPO_OS === "ios") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          props.onPressIn?.(ev);
        }}
      />
    </View>
  );
}
