import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const projectRoot = path.resolve(__dirname, "..");

// Test 1: Theme system supports 4 color schemes (read source file)
describe("Theme configuration", () => {
  const themeSource = fs.readFileSync(path.join(projectRoot, "lib/_core/theme.ts"), "utf-8");

  it("should define amoled color scheme", () => {
    expect(themeSource).toContain("palette.amoled");
    expect(themeSource).toContain('"#000000"'); // AMOLED black background
  });

  it("should define pastel color scheme", () => {
    expect(themeSource).toContain("palette.pastel");
    expect(themeSource).toContain('"#FFF8F0"'); // Pastel warm background
  });

  it("should export Colors with all 4 schemes", () => {
    expect(themeSource).toContain('light: buildRuntimePalette("light")');
    expect(themeSource).toContain('dark: buildRuntimePalette("dark")');
    expect(themeSource).toContain('amoled: buildRuntimePalette("amoled")');
    expect(themeSource).toContain('pastel: buildRuntimePalette("pastel")');
  });

  it("should export ColorScheme type with all 4 values", () => {
    expect(themeSource).toContain('"light" | "dark" | "amoled" | "pastel"');
  });
});

// Test 2: Theme provider supports new schemes
describe("Theme provider", () => {
  const providerSource = fs.readFileSync(path.join(projectRoot, "lib/theme-provider.tsx"), "utf-8");

  it("should recognize amoled and pastel in saved theme loading", () => {
    expect(providerSource).toContain('"amoled"');
    expect(providerSource).toContain('"pastel"');
  });

  it("should map amoled to dark native scheme", () => {
    expect(providerSource).toContain('scheme === "amoled"');
  });

  it("should map pastel to light native scheme", () => {
    expect(providerSource).toContain('scheme === "pastel"');
  });
});

// Test 3: Achievements no longer have isSecret
describe("Achievement definitions", () => {
  const achievementsSource = fs.readFileSync(path.join(projectRoot, "lib/achievements/definitions.ts"), "utf-8");

  it("should not contain isSecret property", () => {
    expect(achievementsSource).not.toContain("isSecret");
  });

  it("should still have secret conditionType achievements", () => {
    expect(achievementsSource).toContain('conditionType: "secret"');
  });

  it("should have descriptions for all secret achievements", () => {
    // Check that night_owl, early_bird, perfectionist, zen_master have descriptions
    expect(achievementsSource).toContain("Night Owl");
    expect(achievementsSource).toContain("Early Bird");
    expect(achievementsSource).toContain("Perfectionist");
    expect(achievementsSource).toContain("Zen Master");
    expect(achievementsSource).toContain("Ночная сова");
    expect(achievementsSource).toContain("Ранняя пташка");
    expect(achievementsSource).toContain("Перфекционист");
    expect(achievementsSource).toContain("Мастер Дзен");
  });
});

// Test 4: Settings type supports new themes
describe("Settings type", () => {
  const typesSource = fs.readFileSync(path.join(projectRoot, "lib/domain/types.ts"), "utf-8");

  it("should include amoled and pastel in theme type", () => {
    expect(typesSource).toContain('"amoled"');
    expect(typesSource).toContain('"pastel"');
  });
});

// Test 5: Clipboard copy has web fallback
describe("Clipboard copy in settings", () => {
  const settingsSource = fs.readFileSync(path.join(projectRoot, "app/(tabs)/settings.tsx"), "utf-8");

  it("should have web clipboard fallback", () => {
    expect(settingsSource).toContain("navigator.clipboard.writeText");
  });

  it("should have legacy execCommand fallback", () => {
    expect(settingsSource).toContain('document.execCommand("copy")');
  });

  it("should show alert if all copy methods fail", () => {
    expect(settingsSource).toContain("Copy manually");
    expect(settingsSource).toContain("Скопируйте вручную");
  });
});

// Test 6: Settings has 4 theme options
describe("Settings theme selector", () => {
  const settingsSource = fs.readFileSync(path.join(projectRoot, "app/(tabs)/settings.tsx"), "utf-8");

  it("should have all 4 theme options", () => {
    expect(settingsSource).toContain('"light"');
    expect(settingsSource).toContain('"dark"');
    expect(settingsSource).toContain('"amoled"');
    expect(settingsSource).toContain('"pastel"');
    expect(settingsSource).toContain("AMOLED");
    expect(settingsSource).toContain("Пастель");
  });
});

// Test 7: Kanban board has rename column feature
describe("Kanban board column renaming", () => {
  const kanbanSource = fs.readFileSync(path.join(projectRoot, "components/kanban-board.tsx"), "utf-8");

  it("should have rename column state", () => {
    expect(kanbanSource).toContain("renamingColumn");
    expect(kanbanSource).toContain("renameText");
  });

  it("should have rename column handler", () => {
    expect(kanbanSource).toContain("handleRenameColumn");
  });

  it("should have rename column modal", () => {
    expect(kanbanSource).toContain("Rename Column");
    expect(kanbanSource).toContain("Переименовать столбец");
  });

  it("should have edit icon in column header", () => {
    expect(kanbanSource).toContain("✏️");
  });
});

// Test 8: AnimatedEmoji has multiple animation types
describe("AnimatedEmoji component", () => {
  const emojiSource = fs.readFileSync(path.join(projectRoot, "components/animated-emoji.tsx"), "utf-8");

  it("should have multiple animation types", () => {
    expect(emojiSource).toContain('"flicker"');
    expect(emojiSource).toContain('"sparkle"');
    expect(emojiSource).toContain('"heartbeat"');
    expect(emojiSource).toContain('"float"');
    expect(emojiSource).toContain('"wiggle"');
    expect(emojiSource).toContain('"bounce"');
  });

  it("should map fire emoji to flicker animation", () => {
    expect(emojiSource).toContain('"🔥": "flicker"');
  });

  it("should map heart emoji to heartbeat animation", () => {
    expect(emojiSource).toContain('"❤️": "heartbeat"');
  });

  it("should skip animations on web for performance", () => {
    expect(emojiSource).toContain('if (Platform.OS === "web")');
  });
});

// Test 9: Notification scheduler
describe("Notification scheduler", () => {
  const notifSource = fs.readFileSync(path.join(projectRoot, "lib/services/notification-scheduler.ts"), "utf-8");

  it("should have task notification scheduling", () => {
    expect(notifSource).toContain("scheduleTaskNotifications");
  });

  it("should have motivational notification scheduling", () => {
    expect(notifSource).toContain("scheduleMotivationalNotification");
  });

  it("should have Android notification channels", () => {
    expect(notifSource).toContain("task-reminders");
    expect(notifSource).toContain("motivational");
  });

  it("should support per-task notification frequency", () => {
    expect(notifSource).toContain("task.notificationFrequency");
  });
});

// Test 10: Achievements screen shows all info (no hidden)
describe("Achievements screen", () => {
  const achievementsScreen = fs.readFileSync(path.join(projectRoot, "app/(tabs)/achievements.tsx"), "utf-8");

  it("should always show achievement descriptions", () => {
    // Should NOT contain the old secret hiding logic
    expect(achievementsScreen).not.toContain("🤫 Secret achievement");
    expect(achievementsScreen).not.toContain("🤫 Секретное достижение");
  });

  it("should always show achievement title (no ???)", () => {
    // The old code showed "???" for locked achievements
    // Now it should always show the real title
    expect(achievementsScreen).not.toContain(': "???"');
  });
});
