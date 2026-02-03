import { Editor, loader } from '@monaco-editor/react';
import { ComponentProps } from 'react';

loader.config({
  paths: {
    vs: '/monaco/vs',
  },
});

export default function MonacoEditor(props: ComponentProps<typeof Editor>) {
  return <Editor {...props} />;
}
