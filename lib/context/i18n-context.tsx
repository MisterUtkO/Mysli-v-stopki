import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import type { Language } from "@/lib/i18n/translations";
import { getTranslations, type Translations } from "@/lib/i18n/translations";

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: Translations;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [isLoading, setIsLoading] = useState(true);

  // Initialize language on mount
  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        // Try to get saved language preference
        const saved = await AsyncStorage.getItem("app_language");
        if (saved === "en" || saved === "ru") {
          setLanguageState(saved);
          return;
        }

        // Detect system language
        const systemLang = Localization.getLocales()[0]?.languageCode;
        if (systemLang === "ru") {
          setLanguageState("ru");
        } else {
          setLanguageState("en");
        }
      } catch (error) {
        console.warn("Failed to initialize language:", error);
        setLanguageState("en");
      } finally {
        setIsLoading(false);
      }
    };

    initializeLanguage();
  }, []);

  const setLanguage = async (lang: Language) => {
    try {
      setLanguageState(lang);
      await AsyncStorage.setItem("app_language", lang);
    } catch (error) {
      console.error("Failed to save language preference:", error);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        t: getTranslations(language),
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}
