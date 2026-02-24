import ActionBar from '@/elements/ActionBar.tsx';
import Button from '@/elements/Button.tsx';
import { useTranslations } from '@/providers/TranslationProvider.tsx';

interface BulkActionBarProps {
  selectedCount: number;
  onClear: () => void;
  onAction: (action: ServerPowerAction) => void;
  loading: ServerPowerAction | null;
}

export default function BulkActionBar({ selectedCount, onClear, onAction, loading }: BulkActionBarProps) {
  const { t } = useTranslations();

  return (
    <ActionBar opened={selectedCount > 0}>
      <Button
        color='green'
        onClick={() => onAction('start')}
        loading={loading === 'start'}
        disabled={loading !== null && loading !== 'start'}
      >
        {t('pages.server.console.power.start', {})} ({selectedCount})
      </Button>
      <Button
        color='gray'
        onClick={() => onAction('restart')}
        loading={loading === 'restart'}
        disabled={loading !== null && loading !== 'restart'}
      >
        {t('pages.server.console.power.restart', {})} ({selectedCount})
      </Button>
      <Button
        color='red'
        onClick={() => onAction('stop')}
        loading={loading === 'stop'}
        disabled={loading !== null && loading !== 'stop'}
      >
        {t('pages.server.console.power.stop', {})} ({selectedCount})
      </Button>
      <Button variant='default' onClick={onClear}>
        {t('common.button.cancel', {})}
      </Button>
    </ActionBar>
  );
}
