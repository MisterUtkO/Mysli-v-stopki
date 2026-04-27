import React from "react";
import { useTaskContext } from "@/lib/context/task-context";
import { AnimatedSplashScreen } from "./animated-splash-screen";

/**
 * SplashScreenWrapper — Wrapper that shows animated splash screen while loading
 * 
 * This component wraps the main app content and shows the animated splash screen
 * until the TaskContext finishes loading (database initialization, etc.)
 */

interface SplashScreenWrapperProps {
  children: React.ReactNode;
}

export function SplashScreenWrapper({ children }: SplashScreenWrapperProps) {
  const { loading } = useTaskContext();

  // Show splash screen while loading
  if (loading) {
    return <AnimatedSplashScreen isReady={false} />;
  }

  // Show main app content
  return <>{children}</>;
}
