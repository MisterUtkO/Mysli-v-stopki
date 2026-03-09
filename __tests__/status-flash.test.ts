import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";

const cardPath = "/home/ubuntu/eisenhower-priority-app/components/swipeable-task-card.tsx";
const content = readFileSync(cardPath, "utf-8");

describe("Status Change Flash Animation", () => {
  it("should have flashOpacity animated value", () => {
    expect(content).toContain("flashOpacity");
    expect(content).toContain("new Animated.Value(0)");
  });

  it("should have flashColor state", () => {
    expect(content).toContain("flashColor");
    expect(content).toContain("setFlashColor");
  });

  it("should have triggerFlash function", () => {
    expect(content).toContain("triggerFlash");
    expect(content).toContain("flashOpacity.setValue(0.35)");
  });

  it("should map next status to correct colors", () => {
    expect(content).toContain("getNextStatusColor");
    // not_started -> in_progress = blue
    expect(content).toContain('#3B82F6');
    // in_progress -> completed = green
    expect(content).toContain('#22C55E');
    // completed -> not_started = gray
    expect(content).toContain('#9CA3AF');
  });

  it("should trigger flash on swipe right", () => {
    // triggerFlash should be called in the swipe right handler section
    const swipeRightIdx = content.indexOf("Swipe right");
    const swipeSection = content.slice(swipeRightIdx, swipeRightIdx + 600);
    expect(swipeSection).toContain("triggerFlash(task.status)");
  });

  it("should have flash overlay in card JSX", () => {
    expect(content).toContain("Flash overlay for status change animation");
    expect(content).toContain("backgroundColor: flashColor");
    expect(content).toContain("opacity: flashOpacity");
    expect(content).toContain('pointerEvents="none"');
  });

  it("should trigger flash on collapsed status icon press", () => {
    // Find the collapsed view section
    const collapsedIdx = content.indexOf("COLLAPSED VIEW");
    const expandedIdx = content.indexOf("EXPANDED VIEW");
    const collapsedSection = content.slice(collapsedIdx, expandedIdx);
    expect(collapsedSection).toContain("triggerFlash(task.status)");
  });

  it("should trigger flash on expanded status button press", () => {
    const expandedIdx = content.indexOf("EXPANDED VIEW");
    const expandedSection = content.slice(expandedIdx);
    expect(expandedSection).toContain("triggerFlash(task.status)");
  });

  it("should animate flash with 400ms duration", () => {
    expect(content).toContain("duration: 400");
  });
});
