import { ReactNode } from 'react';
import Card from './Card.tsx';

export default function ChartBlock({
  icon,
  title,
  legend,
  children,
}: {
  icon: ReactNode;
  title: string;
  legend?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className='relative'>
      <div className='flex items-center justify-between px-4 py-2'>
        <h3 className='transition-colors duration-100'>
          {icon} {title}
        </h3>
        {legend && <span className='text-sm flex items-center'>{legend}</span>}
      </div>
      <div className='z-10 min-h-full'>{children}</div>
    </Card>
  );
}
