import { memo } from 'react';
import { formatDateTime, formatTimestamp } from '@/lib/time.ts';
import Tooltip from '../Tooltip.tsx';

interface FormattedTimestampProps {
  timestamp: string | number | Date;
  precise?: boolean;
}

function FormattedTimestamp({ timestamp, precise }: FormattedTimestampProps) {
  return (
    <Tooltip label={formatDateTime(timestamp, precise)}>
      <span className='cursor-help'>{formatTimestamp(timestamp)}</span>
    </Tooltip>
  );
}

export default memo(FormattedTimestamp);
