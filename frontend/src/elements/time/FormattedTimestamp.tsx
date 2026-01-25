import { formatDateTime, formatTimestamp } from '@/lib/time.ts';
import Tooltip from '../Tooltip.tsx';

interface FormattedTimestampProps {
  timestamp: string | number | Date;
}

export default function FormattedTimestamp({ timestamp }: FormattedTimestampProps) {
  return (
    <Tooltip label={formatDateTime(timestamp)}>
      <span className='cursor-help'>{formatTimestamp(timestamp)}</span>
    </Tooltip>
  );
}
