import { Title } from '@mantine/core';
import Card from './Card.tsx';

export default function ScreenBlock({ title, content }: { title: string; content: string }) {
  return (
    <>
      <div className='flex items-center justify-center'>
        <Card className='w-full max-w-md text-center'>
          <Title order={2}>{title}</Title>
          <p className='text-sm text-neutral-700 mt-2'>{content}</p>
        </Card>
      </div>
    </>
  );
}
