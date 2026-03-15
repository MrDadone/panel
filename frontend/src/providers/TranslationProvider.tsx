import { ReactNode, startTransition, useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import { getTranslationMapping, setGlobalTranslationHandle, TranslationContext, TranslationItemRecord } from 'shared';
import { z } from 'zod';
import { $ZodConfig } from 'zod/v4/core';
import { axiosInstance } from '@/api/axios.ts';
import baseTranslations from '@/translations.ts';

const modules = import.meta.glob('/node_modules/zod/v4/locales/*.js');

type LanguageData = {
  items: TranslationItemRecord;
  translations: Record<string, string>;
};

declare global {
  interface String {
    md(): ReactNode;
  }
}

String.prototype.md = function (): ReactNode {
  return <Markdown>{this.toString()}</Markdown>;
};

const TranslationProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState('en');
  const [languageData, setLanguageData] = useState<LanguageData | null>(null);

  const loadZod = async (lang: string) => {
    if (!modules[`/node_modules/zod/v4/locales/${lang}.js`]) {
      return;
    }

    const { default: locale } = (await modules[`/node_modules/zod/v4/locales/${lang}.js`]()) as {
      default: () => $ZodConfig;
    };

    z.config(locale());
  };

  useEffect(() => {
    startTransition(() => {
      if (language === 'en') {
        setLanguageData(null);
      } else {
        axiosInstance
          .get(`/translations/${language}.json`)
          .then(({ data }) => {
            const dataSpace = import.meta.env.DEV ? data : data[''];

            const result: LanguageData = {
              items: dataSpace.items,
              translations: dataSpace.translations,
            };

            for (const key in data) {
              if (key === '') continue;

              for (const item in data.items) {
                result.items[`${key}.${item}`] = data.items[item];
              }
              for (const translation in data.translation) {
                result.items[`${key}.${translation}`] = data.translations[translation];
              }
            }

            result.translations = getTranslationMapping(result.translations);

            if (import.meta.env.DEV) {
              console.debug('Loaded language data', language, result);
            }

            setLanguageData(result);
          })
          .catch((err) => {
            setLanguage('en');
            console.error(err);
          });
      }

      loadZod(language);
    });

    localStorage.setItem('lastLanguage', language);
  }, [language]);

  useEffect(() => {
    const lastLanguage = localStorage.getItem('lastLanguage');
    if (lastLanguage) {
      setLanguage(lastLanguage);
    }
  }, []);

  const t = (key: string, values: Record<string, string | number>): string => {
    if (!languageData?.translations[key] && !baseTranslations.mapping[key as never]) {
      throw new Error(`Language key ${key} not found.`);
    }

    let translation = languageData?.translations[key] || (baseTranslations.mapping[key as never] as string);

    if (values) {
      Object.keys(values).forEach((placeholder) => {
        translation = translation.replaceAll(`{${placeholder}}`, String(values[placeholder]));
      });
    }

    return translation;
  };

  const tItem = (key: string, count: number): string => {
    if (!languageData?.items[key] && !baseTranslations.items[key as never]) {
      throw new Error(`Language item key ${key} not found.`);
    }

    const translationItem = languageData?.items[key] || baseTranslations.items[key as never];
    const rules = new Intl.PluralRules(language);

    return translationItem[rules.select(count)].replaceAll('{count}', count.toString());
  };

  setGlobalTranslationHandle({ language, setLanguage, t, tItem });

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t, tItem }}>{children}</TranslationContext.Provider>
  );
};

export default TranslationProvider;
export { getTranslations, useTranslations } from './contexts/translationContext.ts';
