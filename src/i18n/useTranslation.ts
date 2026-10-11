import { useAppStore } from '../store/useAppStore';
import {
  SupportedLanguage,
  SUPPORTED_LANGUAGES,
  LanguageInfo,
  getTranslation
} from './translations';

export function useTranslation() {
  const language = useAppStore(s => s.language);
  const setLanguage = useAppStore(s => s.setLanguage);

  const t = (key: string, fallback?: string): string => {
    return getTranslation(language, key, fallback);
  };

  const currentLanguageInfo =
    SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  return {
    t,
    language,
    setLanguage,
    currentLanguageInfo,
    supportedLanguages: SUPPORTED_LANGUAGES
  };
}

export type { SupportedLanguage, LanguageInfo };
