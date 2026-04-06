/**
 * ReleaseNotesRepository — loads and manages local changelog
 * All data comes from assets/release_notes.json (offline, no network)
 */

interface ReleaseNote {
  versionName: string;
  versionCode: number;
  notes: {
    ru?: string[];
    en?: string[];
    [key: string]: string[] | undefined;
  };
}

interface ReleaseNotesData {
  versions: ReleaseNote[];
}

let cachedData: ReleaseNotesData | null = null;

/**
 * Load release notes from local JSON file
 */
async function loadReleaseNotesData(): Promise<ReleaseNotesData> {
  if (cachedData) {
    return cachedData;
  }

  try {
    // Import the JSON file directly (works in React Native/Expo)
    const data = require("@/assets/release_notes.json") as ReleaseNotesData;
    cachedData = data;
    return data;
  } catch (error) {
    console.error("[ReleaseNotesRepository] Failed to load release notes:", error);
    return { versions: [] };
  }
}

/**
 * Get release notes for a specific version
 */
export async function getReleaseNotesForVersion(
  versionName: string,
  language: "ru" | "en" = "en"
): Promise<string[]> {
  const data = await loadReleaseNotesData();
  const version = data.versions.find((v) => v.versionName === versionName);

  if (!version) {
    return [];
  }

  // Try requested language first
  if (version.notes[language]?.length) {
    return version.notes[language]!;
  }

  // Fallback to English
  if (version.notes.en?.length) {
    return version.notes.en;
  }

  // Fallback to Russian
  if (version.notes.ru?.length) {
    return version.notes.ru;
  }

  return [];
}

/**
 * Get all available versions
 */
export async function getAllVersions(): Promise<ReleaseNote[]> {
  const data = await loadReleaseNotesData();
  return data.versions;
}

/**
 * Get latest version's release notes
 */
export async function getLatestReleaseNotes(
  language: "ru" | "en" = "en"
): Promise<string[]> {
  const data = await loadReleaseNotesData();
  if (data.versions.length === 0) {
    return [];
  }

  const latestVersion = data.versions[0]; // Assuming first item is latest
  return getReleaseNotesForVersion(latestVersion.versionName, language);
}
