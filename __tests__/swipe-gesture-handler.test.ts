import { describe, it, expect } from "vitest";

// Test the status cycling logic used in SwipeableTaskCard
type TaskStatus = "not_started" | "in_progress" | "completed";

function cycleStatus(currentStatus: TaskStatus): TaskStatus {
  switch (currentStatus) {
    case "not_started": return "in_progress";
    case "in_progress": return "completed";
    case "completed": return "not_started";
  }
}

function getNextStatusColor(currentStatus: TaskStatus): string {
  switch (currentStatus) {
    case "not_started": return "#3B82F6";
    case "in_progress": return "#22C55E";
    case "completed": return "#9CA3AF";
  }
}

function getNextStatusLabel(status: TaskStatus, isRu: boolean): string {
  switch (status) {
    case "not_started": return isRu ? "В процессе →" : "In progress →";
    case "in_progress": return isRu ? "Выполнено →" : "Complete →";
    case "completed": return isRu ? "Не начато →" : "Not started →";
  }
}

// Test swipe threshold logic
function detectSwipeDirection(translationX: number, threshold: number): "right" | "left" | "none" {
  if (translationX > threshold) return "right";
  if (translationX < -threshold) return "left";
  return "none";
}

describe("Swipe Gesture Handler - Status Cycling", () => {
  it("cycles not_started → in_progress", () => {
    expect(cycleStatus("not_started")).toBe("in_progress");
  });

  it("cycles in_progress → completed", () => {
    expect(cycleStatus("in_progress")).toBe("completed");
  });

  it("cycles completed → not_started (loop)", () => {
    expect(cycleStatus("completed")).toBe("not_started");
  });

  it("full cycle returns to original after 3 swipes", () => {
    let status: TaskStatus = "not_started";
    status = cycleStatus(status); // in_progress
    status = cycleStatus(status); // completed
    status = cycleStatus(status); // not_started
    expect(status).toBe("not_started");
  });
});

describe("Swipe Gesture Handler - Swipe Detection", () => {
  const THRESHOLD = 60;

  it("detects right swipe when translationX > threshold", () => {
    expect(detectSwipeDirection(80, THRESHOLD)).toBe("right");
  });

  it("detects left swipe when translationX < -threshold", () => {
    expect(detectSwipeDirection(-80, THRESHOLD)).toBe("left");
  });

  it("returns none when translationX is within threshold", () => {
    expect(detectSwipeDirection(30, THRESHOLD)).toBe("none");
    expect(detectSwipeDirection(-30, THRESHOLD)).toBe("none");
    expect(detectSwipeDirection(0, THRESHOLD)).toBe("none");
  });

  it("returns none exactly at threshold boundary", () => {
    expect(detectSwipeDirection(60, THRESHOLD)).toBe("none");
    expect(detectSwipeDirection(-60, THRESHOLD)).toBe("none");
  });

  it("detects right swipe just above threshold", () => {
    expect(detectSwipeDirection(61, THRESHOLD)).toBe("right");
  });
});

describe("Swipe Gesture Handler - Visual Feedback", () => {
  it("shows blue color for next status when current is not_started", () => {
    expect(getNextStatusColor("not_started")).toBe("#3B82F6");
  });

  it("shows green color for next status when current is in_progress", () => {
    expect(getNextStatusColor("in_progress")).toBe("#22C55E");
  });

  it("shows gray color for next status when current is completed", () => {
    expect(getNextStatusColor("completed")).toBe("#9CA3AF");
  });

  it("shows correct English label for swipe right", () => {
    expect(getNextStatusLabel("not_started", false)).toBe("In progress →");
    expect(getNextStatusLabel("in_progress", false)).toBe("Complete →");
    expect(getNextStatusLabel("completed", false)).toBe("Not started →");
  });

  it("shows correct Russian label for swipe right", () => {
    expect(getNextStatusLabel("not_started", true)).toBe("В процессе →");
    expect(getNextStatusLabel("in_progress", true)).toBe("Выполнено →");
    expect(getNextStatusLabel("completed", true)).toBe("Не начато →");
  });
});
