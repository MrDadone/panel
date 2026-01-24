import { ReactNode, useEffect } from 'react';
import { useRelativePageStore } from '@/stores/relativePage.ts';

export default function ContentContainer({ title, children }: { title: string; children: ReactNode }) {
  const { setTitle } = useRelativePageStore();

  useEffect(() => {
    setTitle(title);
  }, [title]);

  return children;
}
