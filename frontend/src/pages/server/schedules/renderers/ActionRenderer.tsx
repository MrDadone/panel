import { Stack, Text } from '@mantine/core';
import Code from '@/elements/Code.tsx';
import { formatMiliseconds } from '@/lib/time.ts';
import ScheduleDynamicParameterRenderer from '../ScheduleDynamicParameterRenderer.tsx';

type ActionRendererMode = 'compact' | 'detailed';

interface ActionRendererProps {
  action: ScheduleAction;
  mode?: ActionRendererMode;
}

class RendererMap {
  // @ts-ignore
  private compactRenderers: Record<ScheduleAction['type'], (action: never) => React.ReactNode> = {};
  // @ts-ignore
  private detailedRenderers: Record<ScheduleAction['type'], (action: never) => React.ReactNode> = {};

  public addRenderer<T extends ScheduleAction['type']>(
    type: T,
    compactRenderer: (action: Extract<ScheduleAction, { type: T }>) => React.ReactNode,
    detailedRenderer: (action: Extract<ScheduleAction, { type: T }>) => React.ReactNode,
  ) {
    this.compactRenderers[type] = compactRenderer;
    this.detailedRenderers[type] = detailedRenderer;
  }

  public getRenderer<T extends ScheduleAction['type']>(
    type: T,
    mode: ActionRendererMode,
  ): ((action: Extract<ScheduleAction, { type: T }>) => React.ReactNode) | undefined {
    return mode === 'compact' ? (this.compactRenderers[type] as never) : (this.detailedRenderers[type] as never);
  }
}

const rendererMap = new RendererMap();

rendererMap.addRenderer(
  'sleep',
  (a) => <span>Sleep for {a.duration}ms</span>,
  (a) => <Text size='sm'>Sleep for {a.duration}ms</Text>,
);
rendererMap.addRenderer(
  'ensure',
  () => <span>Ensure a condition matches</span>,
  () => <Text size='sm'>Ensure a condition matches</Text>,
);
rendererMap.addRenderer(
  'format',
  (a) => (
    <span>
      Format a string into <ScheduleDynamicParameterRenderer value={a.outputInto} />
    </span>
  ),
  (a) => (
    <Text size='sm'>
      Format a string into <ScheduleDynamicParameterRenderer value={a.outputInto} />
    </Text>
  ),
);
rendererMap.addRenderer(
  'match_regex',
  (a) => (
    <span>
      Match <ScheduleDynamicParameterRenderer value={a.input} /> with regex <Code>{a.regex}</Code>
    </span>
  ),
  (a) => (
    <Text size='sm'>
      Match <ScheduleDynamicParameterRenderer value={a.input} /> with regex <Code>{a.regex}</Code>
    </Text>
  ),
);
rendererMap.addRenderer(
  'wait_for_console_line',
  (a) => (
    <span>
      Wait {formatMiliseconds(a.timeout)} for console line containing{' '}
      <ScheduleDynamicParameterRenderer value={a.contains} />
    </span>
  ),
  (a) => (
    <Stack gap='xs'>
      <Text size='sm'>
        Line must contain: <ScheduleDynamicParameterRenderer value={a.contains} />
      </Text>
      <Text size='sm'>
        Timeout: <Code>{a.timeout}ms</Code>
      </Text>
      <Text size='xs' c='dimmed'>
        Ignore Failure: {a.ignoreFailure ? 'Yes' : 'No'}
      </Text>
    </Stack>
  ),
);
rendererMap.addRenderer(
  'send_power',
  (a) => <span>Do {a.action}</span>,
  (a) => (
    <Stack gap='xs'>
      <Text size='sm'>
        Power Action: <Code>{a.action}</Code>
      </Text>
      <Text size='xs' c='dimmed'>
        Ignore Failure: {a.ignoreFailure ? 'Yes' : 'No'}
      </Text>
    </Stack>
  ),
);
rendererMap.addRenderer(
  'send_command',
  (a) => (
    <span>
      Run <ScheduleDynamicParameterRenderer value={a.command} />
    </span>
  ),
  (a) => (
    <Stack gap='xs'>
      <Text size='sm'>
        Command: <ScheduleDynamicParameterRenderer value={a.command} />
      </Text>
      <Text size='xs' c='dimmed'>
        Ignore Failure: {a.ignoreFailure ? 'Yes' : 'No'}
      </Text>
    </Stack>
  ),
);
rendererMap.addRenderer(
  'create_backup',
  (a) => (
    <span>
      Create <ScheduleDynamicParameterRenderer value={a.name} />
    </span>
  ),
  (a) => (
    <Stack gap='xs'>
      <Text size='sm'>
        Backup Name: <ScheduleDynamicParameterRenderer value={a.name} />
      </Text>
      <Text size='xs' c='dimmed'>
        Foreground: {a.foreground ? 'Yes' : 'No'} | Ignore Failure: {a.ignoreFailure ? 'Yes' : 'No'}
      </Text>
      {a.ignoredFiles.length > 0 && (
        <Text size='xs' c='dimmed'>
          Ignored Files: {a.ignoredFiles.join(', ')}
        </Text>
      )}
    </Stack>
  ),
);
rendererMap.addRenderer(
  'create_directory',
  (a) => (
    <span>
      Create <ScheduleDynamicParameterRenderer value={a.name} /> in <ScheduleDynamicParameterRenderer value={a.root} />
    </span>
  ),
  (a) => (
    <Stack gap='xs'>
      <Text size='sm'>
        Directory: <ScheduleDynamicParameterRenderer value={a.name} />
      </Text>
      <Text size='sm'>
        Root: <ScheduleDynamicParameterRenderer value={a.root} />
      </Text>
      <Text size='xs' c='dimmed'>
        Ignore Failure: {a.ignoreFailure ? 'Yes' : 'No'}
      </Text>
    </Stack>
  ),
);
rendererMap.addRenderer(
  'write_file',
  (a) => (
    <span>
      Write to <ScheduleDynamicParameterRenderer value={a.file} />
    </span>
  ),
  (a) => (
    <Stack gap='xs'>
      <Text size='sm'>
        File: <ScheduleDynamicParameterRenderer value={a.file} />
      </Text>
      <Text size='xs' c='dimmed'>
        Append: <Code>{a.append ? 'Yes' : 'No'}</Code>
      </Text>
      <Text size='xs' c='dimmed'>
        Ignore Failure: {a.ignoreFailure ? 'Yes' : 'No'}
      </Text>
    </Stack>
  ),
);
rendererMap.addRenderer(
  'copy_file',
  (a) => (
    <span>
      Copy <ScheduleDynamicParameterRenderer value={a.file} /> to{' '}
      <ScheduleDynamicParameterRenderer value={a.destination} />
    </span>
  ),
  (a) => (
    <Stack gap='xs'>
      <Text size='sm'>
        From: <ScheduleDynamicParameterRenderer value={a.file} />
      </Text>
      <Text size='sm'>
        To: <ScheduleDynamicParameterRenderer value={a.destination} />
      </Text>
      <Text size='xs' c='dimmed'>
        Foreground: {a.foreground ? 'Yes' : 'No'} | Ignore Failure: {a.ignoreFailure ? 'Yes' : 'No'}
      </Text>
    </Stack>
  ),
);
rendererMap.addRenderer(
  'delete_files',
  (a) => (
    <span>
      Delete <Code>{a.files.join(', ')}</Code>
    </span>
  ),
  (a) => (
    <Stack gap='xs'>
      <Text size='sm'>
        Root: <ScheduleDynamicParameterRenderer value={a.root} />
      </Text>
      <Text size='xs' c='dimmed'>
        Files: {a.files.join(', ')}
      </Text>
    </Stack>
  ),
);
rendererMap.addRenderer(
  'rename_files',
  (a) => <span>Rename {a.files.length} files</span>,
  (a) => (
    <Stack gap='xs'>
      <Text size='sm'>
        Root: <ScheduleDynamicParameterRenderer value={a.root} />
      </Text>
      <Text size='xs' c='dimmed'>
        Files: {a.files.length} file(s)
      </Text>
    </Stack>
  ),
);
rendererMap.addRenderer(
  'compress_files',
  (a) => (
    <span>
      Compress {a.files.length} files in <ScheduleDynamicParameterRenderer value={a.root} /> to{' '}
      <ScheduleDynamicParameterRenderer value={a.name} />
    </span>
  ),
  (a) => (
    <Stack gap='xs'>
      <Text size='sm'>
        Output: <ScheduleDynamicParameterRenderer value={a.name} />
      </Text>
      <Text size='sm'>
        Root: <ScheduleDynamicParameterRenderer value={a.root} />
      </Text>
      <Text size='xs' c='dimmed'>
        Files: {a.files.length} file(s) | Format: {a.format}
      </Text>
      <Text size='xs' c='dimmed'>
        Foreground: {a.foreground ? 'Yes' : 'No'} | Ignore Failure: {a.ignoreFailure ? 'Yes' : 'No'}
      </Text>
    </Stack>
  ),
);
rendererMap.addRenderer(
  'decompress_file',
  (a) => (
    <span>
      Decompress <ScheduleDynamicParameterRenderer value={a.file} /> to{' '}
      <ScheduleDynamicParameterRenderer value={a.root} />
    </span>
  ),
  (a) => (
    <Stack gap='xs'>
      <Text size='sm'>
        File: <ScheduleDynamicParameterRenderer value={a.file} />
      </Text>
      <Text size='sm'>
        Root: <ScheduleDynamicParameterRenderer value={a.root} />
      </Text>
      <Text size='xs' c='dimmed'>
        Foreground: {a.foreground ? 'Yes' : 'No'} | Ignore Failure: {a.ignoreFailure ? 'Yes' : 'No'}
      </Text>
    </Stack>
  ),
);
rendererMap.addRenderer(
  'update_startup_variable',
  (a) => (
    <span>
      Set <ScheduleDynamicParameterRenderer value={a.envVariable} /> to{' '}
      <ScheduleDynamicParameterRenderer value={a.value} />
    </span>
  ),
  (a) => (
    <Stack gap='xs'>
      <Text size='sm'>
        Variable: <ScheduleDynamicParameterRenderer value={a.envVariable} />
      </Text>
      <Text size='sm'>
        Value: <ScheduleDynamicParameterRenderer value={a.value} />
      </Text>
      <Text size='xs' c='dimmed'>
        Ignore Failure: {a.ignoreFailure ? 'Yes' : 'No'}
      </Text>
    </Stack>
  ),
);
rendererMap.addRenderer(
  'update_startup_command',
  (a) => (
    <span>
      Set to <ScheduleDynamicParameterRenderer value={a.command} />
    </span>
  ),
  (a) => (
    <Stack gap='xs'>
      <Text size='sm'>
        Command: <ScheduleDynamicParameterRenderer value={a.command} />
      </Text>
      <Text size='xs' c='dimmed'>
        Ignore Failure: {a.ignoreFailure ? 'Yes' : 'No'}
      </Text>
    </Stack>
  ),
);
rendererMap.addRenderer(
  'update_startup_docker_image',
  (a) => (
    <span>
      Set to <ScheduleDynamicParameterRenderer value={a.image} />
    </span>
  ),
  (a) => (
    <Stack gap='xs'>
      <Text size='sm'>
        Image: <ScheduleDynamicParameterRenderer value={a.image} />
      </Text>
      <Text size='xs' c='dimmed'>
        Ignore Failure: {a.ignoreFailure ? 'Yes' : 'No'}
      </Text>
    </Stack>
  ),
);

export default function ActionRenderer({ action, mode = 'compact' }: ActionRendererProps) {
  const renderer = rendererMap.getRenderer(action.type, mode);

  if (!renderer) {
    return mode === 'compact' ? (
      <span>Select an action type to configure</span>
    ) : (
      <Text size='sm' c='dimmed'>
        Action details not available
      </Text>
    );
  }

  return <>{renderer(action)}</>;
}
