import { Stack, Text } from '@mantine/core';
import Code from '@/elements/Code.tsx';
import { formatMiliseconds } from '@/lib/time.ts';
import ScheduleDynamicParameterRenderer from '../ScheduleDynamicParameterRenderer.tsx';

type ActionRendererMode = 'compact' | 'detailed';

interface ActionRendererProps {
  action: ScheduleAction;
  mode?: ActionRendererMode;
}

const COMPACT_RENDERERS: Record<ScheduleAction['type'], (action: any) => React.ReactNode> = {
  sleep: (a) => <span>Sleep for {a.duration}ms</span>,
  ensure: () => <span>Ensure a condition matches</span>,
  format: (a) => (
    <span>
      Format a string into <ScheduleDynamicParameterRenderer value={a.outputInto} />
    </span>
  ),
  match_regex: (a) => (
    <span>
      Match <ScheduleDynamicParameterRenderer value={a.input} /> with regex <Code>{a.regex}</Code>
    </span>
  ),
  wait_for_console_line: (a) => (
    <span>
      Wait {formatMiliseconds(a.timeout)} for console line containing{' '}
      <ScheduleDynamicParameterRenderer value={a.contains} />
    </span>
  ),
  send_power: (a) => <span>Do {a.action}</span>,
  send_command: (a) => (
    <span>
      Run <ScheduleDynamicParameterRenderer value={a.command} />
    </span>
  ),
  create_backup: (a) => (
    <span>
      Create <ScheduleDynamicParameterRenderer value={a.name} />
    </span>
  ),
  create_directory: (a) => (
    <span>
      Create <ScheduleDynamicParameterRenderer value={a.name} /> in <ScheduleDynamicParameterRenderer value={a.root} />
    </span>
  ),
  write_file: (a) => (
    <span>
      Write to <ScheduleDynamicParameterRenderer value={a.file} />
    </span>
  ),
  copy_file: (a) => (
    <span>
      Copy <ScheduleDynamicParameterRenderer value={a.file} /> to{' '}
      <ScheduleDynamicParameterRenderer value={a.destination} />
    </span>
  ),
  delete_files: (a) => (
    <span>
      Delete <Code>{a.files.join(', ')}</Code>
    </span>
  ),
  rename_files: (a) => <span>Rename {a.files.length} files</span>,
  compress_files: (a) => (
    <span>
      Compress {a.files.length} files in <ScheduleDynamicParameterRenderer value={a.root} /> to{' '}
      <ScheduleDynamicParameterRenderer value={a.name} />
    </span>
  ),
  decompress_file: (a) => (
    <span>
      Decompress <ScheduleDynamicParameterRenderer value={a.file} /> to{' '}
      <ScheduleDynamicParameterRenderer value={a.root} />
    </span>
  ),
  update_startup_variable: (a) => (
    <span>
      Set <ScheduleDynamicParameterRenderer value={a.envVariable} /> to{' '}
      <ScheduleDynamicParameterRenderer value={a.value} />
    </span>
  ),
  update_startup_command: (a) => (
    <span>
      Set to <ScheduleDynamicParameterRenderer value={a.command} />
    </span>
  ),
  update_startup_docker_image: (a) => (
    <span>
      Set to <ScheduleDynamicParameterRenderer value={a.image} />
    </span>
  ),
};

const DETAILED_RENDERERS: Record<ScheduleAction['type'], (action: any) => React.ReactNode> = {
  sleep: (a) => <Text size='sm'>Sleep for {a.duration}ms</Text>,
  ensure: () => <Text size='sm'>Ensure a condition matches</Text>,
  format: (a) => (
    <Text size='sm'>
      Format a string into <ScheduleDynamicParameterRenderer value={a.outputInto} />
    </Text>
  ),
  match_regex: (a) => (
    <Text size='sm'>
      Match <ScheduleDynamicParameterRenderer value={a.input} /> with regex <Code>{a.regex}</Code>
    </Text>
  ),
  wait_for_console_line: (a) => (
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
  send_power: (a) => (
    <Stack gap='xs'>
      <Text size='sm'>
        Power Action: <Code>{a.action}</Code>
      </Text>
      <Text size='xs' c='dimmed'>
        Ignore Failure: {a.ignoreFailure ? 'Yes' : 'No'}
      </Text>
    </Stack>
  ),
  send_command: (a) => (
    <Stack gap='xs'>
      <Text size='sm'>
        Command: <ScheduleDynamicParameterRenderer value={a.command} />
      </Text>
      <Text size='xs' c='dimmed'>
        Ignore Failure: {a.ignoreFailure ? 'Yes' : 'No'}
      </Text>
    </Stack>
  ),
  create_backup: (a) => (
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
  create_directory: (a) => (
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
  write_file: (a) => (
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
  copy_file: (a) => (
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
  delete_files: (a) => (
    <Stack gap='xs'>
      <Text size='sm'>
        Root: <ScheduleDynamicParameterRenderer value={a.root} />
      </Text>
      <Text size='xs' c='dimmed'>
        Files: {a.files.join(', ')}
      </Text>
    </Stack>
  ),
  rename_files: (a) => (
    <Stack gap='xs'>
      <Text size='sm'>
        Root: <ScheduleDynamicParameterRenderer value={a.root} />
      </Text>
      <Text size='xs' c='dimmed'>
        Files: {a.files.length} file(s)
      </Text>
    </Stack>
  ),
  compress_files: (a) => (
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
  decompress_file: (a) => (
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
  update_startup_variable: (a) => (
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
  update_startup_command: (a) => (
    <Stack gap='xs'>
      <Text size='sm'>
        Command: <ScheduleDynamicParameterRenderer value={a.command} />
      </Text>
      <Text size='xs' c='dimmed'>
        Ignore Failure: {a.ignoreFailure ? 'Yes' : 'No'}
      </Text>
    </Stack>
  ),
  update_startup_docker_image: (a) => (
    <Stack gap='xs'>
      <Text size='sm'>
        Image: <ScheduleDynamicParameterRenderer value={a.image} />
      </Text>
      <Text size='xs' c='dimmed'>
        Ignore Failure: {a.ignoreFailure ? 'Yes' : 'No'}
      </Text>
    </Stack>
  ),
};

export default function ActionRenderer({ action, mode = 'compact' }: ActionRendererProps) {
  const renderers = mode === 'compact' ? COMPACT_RENDERERS : DETAILED_RENDERERS;
  const renderer = renderers[action.type];

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
