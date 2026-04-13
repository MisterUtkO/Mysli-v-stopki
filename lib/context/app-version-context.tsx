import React, { createContext, useContext } from "react";
// Version is hardcoded here but comes from app.config.ts
// Update this value when releasing a new version
const APP_VERSION = "1.0.9.2";

interface AppVersionContextType {
  version: string;
}

const AppVersionContext = createContext<AppVersionContextType | undefined>(undefined);

interface AppVersionProviderProps {
  children: React.ReactNode;
}

/**
 * AppVersionProvider — simple version management
 * Version comes from app.config.ts (single source of truth)
 */
export function AppVersionProvider({ children }: AppVersionProviderProps) {
  const value: AppVersionContextType = {
    version: APP_VERSION,
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
