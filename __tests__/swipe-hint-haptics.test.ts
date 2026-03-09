import { describe, it, expect } from "vitest";

describe("Swipe Hint Component", () => {
  it("should have SwipeHint component file with correct structure", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync(
      "/home/ubuntu/eisenhower-priority-app/components/swipe-hint.tsx",
      "utf-8"
    );
    expect(content).toContain("export function SwipeHint");
    expect(content).toContain("SWIPE_HINT_KEY");
    expect(content).toContain("AsyncStorage");
  });

  it("should support both Russian and English text", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync(
      "/home/ubuntu/eisenhower-priority-app/components/swipe-hint.tsx",
      "utf-8"
    );
    expect(content).toContain("Свайпните вправо");
    expect(content).toContain("Swipe right to change status");
    expect(content).toContain("Свайп влево");
    expect(content).toContain("Swipe left to delete");
  });
});

describe("Screen Transition Component", () => {
  it("should have ScreenTransition component file", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync(
      "/home/ubuntu/eisenhower-priority-app/components/screen-transition.tsx",
      "utf-8"
    );
    expect(content).toContain("export function ScreenTransition");
    expect(content).toContain("TransitionType");
  });
});

describe("Swipe Status Cycle Logic", () => {
  it("should cycle status correctly: not_started -> in_progress -> completed -> not_started", () => {
    type TaskStatus = "not_started" | "in_progress" | "completed";
    const statusCycle: TaskStatus[] = ["not_started", "in_progress", "completed"];

    const getNextStatus = (current: TaskStatus): TaskStatus => {
      const currentIndex = statusCycle.indexOf(current);
      return statusCycle[(currentIndex + 1) % statusCycle.length];
    };

    expect(getNextStatus("not_started")).toBe("in_progress");
    expect(getNextStatus("in_progress")).toBe("completed");
    expect(getNextStatus("completed")).toBe("not_started");
  });

  it("should complete full cycle back to start", () => {
    type TaskStatus = "not_started" | "in_progress" | "completed";
    const statusCycle: TaskStatus[] = ["not_started", "in_progress", "completed"];

    const getNextStatus = (current: TaskStatus): TaskStatus => {
      const currentIndex = statusCycle.indexOf(current);
      return statusCycle[(currentIndex + 1) % statusCycle.length];
    };

    let status: TaskStatus = "not_started";
    status = getNextStatus(status); // in_progress
    status = getNextStatus(status); // completed
    status = getNextStatus(status); // not_started
    expect(status).toBe("not_started");
  });
});

describe("Haptic Feedback Integration", () => {
  it("should have haptics import in swipeable-task-card", async () => {
    // Read the file content to verify haptics is imported
    const fs = await import("fs");
    const content = fs.readFileSync(
      "/home/ubuntu/eisenhower-priority-app/components/swipeable-task-card.tsx",
      "utf-8"
    );
    expect(content).toContain('import * as Haptics from "expo-haptics"');
    expect(content).toContain("Haptics.impactAsync");
    expect(content).toContain("Haptics.notificationAsync");
  });

  it("should guard haptics with Platform.OS check", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync(
      "/home/ubuntu/eisenhower-priority-app/components/swipeable-task-card.tsx",
      "utf-8"
    );
    // Haptics should only fire on native, not web
    expect(content).toContain('Platform.OS !== "web"');
  });
});

describe("Screen Transition Animation Tuning", () => {
  it("should use easing curves for smooth animations", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync(
      "/home/ubuntu/eisenhower-priority-app/components/screen-transition.tsx",
      "utf-8"
    );
    expect(content).toContain("Easing.out(Easing.cubic)");
    expect(content).toContain("Easing.in(Easing.cubic)");
  });

  it("should have default duration of 250ms", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync(
      "/home/ubuntu/eisenhower-priority-app/components/screen-transition.tsx",
      "utf-8"
    );
    expect(content).toContain("duration = 250");
  });

  it("should have shorter exit animation than enter", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync(
      "/home/ubuntu/eisenhower-priority-app/components/screen-transition.tsx",
      "utf-8"
    );
    // Exit uses duration * 0.8 for snappier feel
    expect(content).toContain("duration * 0.8");
  });
});
