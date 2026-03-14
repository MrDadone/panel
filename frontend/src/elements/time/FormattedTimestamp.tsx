'use no memo';

import classNames from 'classnames';
import { memo, useEffect, useState } from 'react';
import { formatDateTime, formatTimestamp } from '@/lib/time.ts';
import Tooltip from '../Tooltip.tsx';

interface FormattedTimestampProps {
  timestamp: string | number | Date;
  className?: string;
  autoUpdate?: boolean;
  precise?: boolean;
}

function FormattedTimestamp({ timestamp, className, autoUpdate = true, precise }: FormattedTimestampProps) {
  const [, forceRender] = useState(0);

  useEffect(() => {
    if (!autoUpdate) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    const targetTime = new Date(timestamp).getTime();

    const scheduleNextUpdate = () => {
      const diffMs = Date.now() - targetTime;

      if (diffMs < 60_000) {
        timeoutId = setTimeout(() => {
          forceRender((prev) => prev + 1);
          scheduleNextUpdate();
        }, 1000);
      } else if (diffMs < 3_600_000) {
        timeoutId = setTimeout(() => {
          forceRender((prev) => prev + 1);
          scheduleNextUpdate();
        }, 60_000);
      }
    };

    scheduleNextUpdate();

    return () => clearTimeout(timeoutId);
  }, [timestamp, autoUpdate]);

  return (
    <Tooltip label={formatDateTime(timestamp, precise)}>
      <span className={classNames('cursor-help', className)}>{formatTimestamp(timestamp)}</span>
    </Tooltip>
  );
}

export default memo(FormattedTimestamp);
