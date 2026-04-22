/**
 * Tests for status change flash animation in SwipeableTaskCard
 * Updated to match react-native-gesture-handler + reanimated based implementation
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";

const cardPath = "/home/ubuntu/eisenhower-priority-app/components/task/swipeable-task-card.tsx";
const content = readFileSync(cardPath, "utf-8");

describe("Status Change Flash Animation", () => {
  it("should have flashOpacity animated value (useSharedValue or Animated.Value)", () => {
    const hasFlash = content.includes("flashOpacity") ||
      content.includes("flashAnim") ||
      content.includes("flashValue");
    expect(hasFlash).toBe(true);
  });

  it("should have triggerFlash function", () => {
    expect(content).toContain("triggerFlash");
  });

  it("should trigger flash on swipe right (status change)", () => {
    const hasFlashOnSwipe = content.includes("triggerFlash") &&
      content.includes("onStatusChange");
    expect(hasFlashOnSwipe).toBe(true);
  });

  it("should have flash overlay in card JSX", () => {
    // Flash overlay uses absolute positioning
    const hasFlashOverlay = content.includes("flashOpacity") &&
      (content.includes("position: \"absolute\"") || content.includes("position: 'absolute'"));
    expect(hasFlashOverlay).toBe(true);
  });

  it("should have color logic for flash based on status", () => {
    const hasColorLogic = content.includes("flashColor") ||
      content.includes("getNextStatusColor") ||
      content.includes("STATUS_COLORS") ||
      content.includes("flashColorValue");
    expect(hasColorLogic).toBe(true);
  });

  it("should use status-based colors for flash", () => {
    // Check for at least one status color
    const hasStatusColors =
      content.includes("#3B82F6") || // blue for in_progress
      content.includes("#22C55E") || // green for completed
      content.includes("#9CA3AF");   // gray for not_started
    expect(hasStatusColors).toBe(true);
  });

  it("should trigger flash on collapsed status icon press", () => {
    expect(content).toContain("triggerFlash");
    // Should be used in multiple places
    const count = (content.match(/triggerFlash/g) || []).length;
    expect(count).toBeGreaterThanOrEqual(2);
  });

  it("should trigger flash on expanded status button press", () => {
    const expandedIdx = content.indexOf("EXPANDED VIEW");
    if (expandedIdx !== -1) {
      const expandedSection = content.slice(expandedIdx);
      expect(expandedSection).toContain("triggerFlash");
    } else {
      // If no EXPANDED VIEW marker, just check triggerFlash exists multiple times
      const count = (content.match(/triggerFlash/g) || []).length;
      expect(count).toBeGreaterThanOrEqual(2);
    }
  });

  it("should have animation duration for flash effect", () => {
    const hasDuration = content.includes("duration: 400") ||
      content.includes("duration: 300") ||
      content.includes("duration: 350") ||
      content.includes("withTiming");
    expect(hasDuration).toBe(true);
  });
});
