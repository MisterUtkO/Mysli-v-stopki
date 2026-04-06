import React, { createContext, useContext } from "react";

interface AppVersionContextType {
  versionName: string;
  versionCode: number;
  uiVersionText: string; // "Версия 0.0.4" or "Version 0.0.4"
  fullVersionText: string; // "0.0.4 (4)"
}

const AppVersionContext = createContext<AppVersionContextType | undefined>(undefined);

interface AppVersionProviderProps {
  children: React.ReactNode;
  isRu?: boolean;
}

/**
 * AppVersionProvider — centralized version management
 * Version values come from app.config.ts (single source of truth)
 * All screens and logs should use useAppVersion() hook
 */
export function AppVersionProvider({ children, isRu = false }: AppVersionProviderProps) {
  // These values come from app.config.ts
  const versionName = "0.0.4";
  const versionCode = 4;

  const uiVersionText = isRu ? `Версия ${versionName}` : `Version ${versionName}`;
  const fullVersionText = `${versionName} (${versionCode})`;

  const value: AppVersionContextType = {
    versionName,
    versionCode,
    uiVersionText,
    fullVersionText,
  };

  return (
    <AppVersionContext.Provider value={value}>
      {children}
    </AppVersionContext.Provider>
  );
}

export function useAppVersion(): AppVersionContextType {
  const context = useContext(AppVersionContext);
  if (!context) {
    throw new Error("useAppVersion must be used within AppVersionProvider");
  }
  return context;
}
