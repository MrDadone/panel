import { CodeProps, Code as MantineCode } from '@mantine/core';
import hljs from 'highlight.js/lib/core';
import { forwardRef, useCallback, useEffect,useState } from 'react';
import 'highlight.js/styles/a11y-dark.min.css';
import { LanguageFn } from 'highlight.js';

const registeredLanguages = new Set<string>();

type HljsCodeProps = CodeProps & {
  languageName: string;
  language: () => Promise<LanguageFn>;
};

function HljsCode({ children, languageName, language, ...props }: HljsCodeProps, ref: React.Ref<HTMLPreElement>) {
  const codeContent = typeof children === 'string' ? children : 'Code content is not a string.';
	const [languageLoaded, setLanguageLoaded] = useState(registeredLanguages.has(languageName));

	const rendered = useCallback(() => {
		if (!registeredLanguages.has(languageName)) {
			return hljs.highlightAuto(codeContent).value;
		}
		return hljs.highlight(codeContent, { language: languageName }).value;
	}, [codeContent, languageName, languageLoaded]);

  useEffect(() => {
    if (!registeredLanguages.has(languageName)) {
      registeredLanguages.add(languageName);
      language().then((lang) => {
        hljs.registerLanguage(languageName, lang);
				setLanguageLoaded(true);
      });
    }
  }, [languageName, language]);

  return (
    <MantineCode
      block
      ref={ref}
      dangerouslySetInnerHTML={{
        __html: rendered()
      }}
      {...props}
    />
  );
}

export default forwardRef<HTMLPreElement, HljsCodeProps>(HljsCode);
