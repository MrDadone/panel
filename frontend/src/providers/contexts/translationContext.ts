import { useContext } from 'react';
import { GetPlaceholders, globalTranslationHandle, TranslationContext } from 'shared';
import baseTranslations from '@/translations.ts';

export const useTranslations = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslations must be used within a TranslationProvider');
  }

  return {
    language: context.language,
    setLanguage: context.setLanguage,
    t<K extends (typeof baseTranslations)['paths']>(
      key: K,
      values: Record<GetPlaceholders<(typeof baseTranslations)['mapping'][K]>[number], string | number>,
    ): string {
      return context.t(key, values);
    },
    tItem(key: keyof (typeof baseTranslations)['items'], count: number): string {
      return context.tItem(key as string, count);
    },
  };
};

export const getTranslations = (): ReturnType<typeof useTranslations> => {
  if (!globalTranslationHandle) {
    throw new Error('getTranslations called before TranslationProvider initialized');
  }

  return globalTranslationHandle;
};
