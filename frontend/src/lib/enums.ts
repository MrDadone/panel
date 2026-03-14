import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faDocker } from '@fortawesome/free-brands-svg-icons';
import {
  faBoxArchive,
  faBriefcase,
  faChartPie,
  faCloud,
  faCode,
  faCog,
  faCompress,
  faComputer,
  faCopy,
  faDatabase,
  faDownload,
  faEarthAmerica,
  faEdit,
  faEgg,
  faEquals,
  faExpand,
  faFile,
  faFileZipper,
  faFingerprint,
  faFolder,
  faFolderOpen,
  faGear,
  faHourglass,
  faKey,
  faKiwiBird,
  faNetworkWired,
  faPlay,
  faPowerOff,
  faPuzzlePiece,
  faScroll,
  faServer,
  faSkull,
  faStopwatch,
  faTerminal,
  faTextSlash,
  faTrash,
  faUnlockKeyhole,
  faUser,
  faUserSecret,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { z } from 'zod';
import { adminBackupConfigurationSchema } from '@/lib/schemas/admin/backupConfigurations.ts';
import { processConfigurationConfigParser } from '@/lib/schemas/admin/eggs.ts';
import { adminSettingsEmailSchema, adminSettingsStorageSchema } from '@/lib/schemas/admin/settings.ts';
import { databaseType, streamingArchiveFormat } from '@/lib/schemas/generic.ts';
import { archiveFormat, compressionLevel } from '@/lib/schemas/server/files.ts';
import {
  serverScheduleComparator,
  serverScheduleConditionSchema,
  serverSchedulePreConditionSchema,
  serverScheduleStepActionSchema,
  serverScheduleTriggerSchema,
} from '@/lib/schemas/server/schedules.ts';
import { serverBackupStatus, serverPowerAction, serverPowerState } from '@/lib/schemas/server/server.ts';
import { publicSettingsCaptchaProviderSchema } from '@/lib/schemas/settings.ts';
import { userSshKeyProvider } from '@/lib/schemas/user/sshKeys.ts';

export const captchaProviderTypeLabelMapping: Record<
  z.infer<typeof publicSettingsCaptchaProviderSchema>['type'],
  string
> = {
  none: 'None',
  turnstile: 'Turnstile',
  recaptcha: 'reCAPTCHA',
  hcaptcha: 'hCaptcha',
  friendly_captcha: 'Friendly Captcha',
};

export const compressionLevelLabelMapping: Record<z.infer<typeof compressionLevel>, string> = {
  best_speed: 'Best Speed',
  good_speed: 'Good Speed',
  good_compression: 'Good Compression',
  best_compression: 'Best Compression',
};

export const processConfigurationParserLabelMapping: Record<
  z.infer<typeof processConfigurationConfigParser>,
  string
> = {
  file: 'File',
  yaml: 'YAML',
  properties: 'Properties',
  ini: 'INI',
  json: 'JSON',
  xml: 'XML',
  toml: 'TOML',
};

export const databaseTypeLabelMapping: Record<z.infer<typeof databaseType>, string> = {
  mysql: 'MySQL',
  postgres: 'PostgreSQL',
};

export const backupDiskLabelMapping: Record<z.infer<typeof adminBackupConfigurationSchema>['backupDisk'], string> = {
  local: 'Local',
  s3: 'S3',
  'ddup-bak': 'Ddup-Bak',
  btrfs: 'Btrfs',
  zfs: 'ZFS',
  restic: 'Restic',
};

export const storageDriverTypeLabelMapping: Record<z.infer<typeof adminSettingsStorageSchema>['type'], string> = {
  filesystem: 'Filesystem',
  s3: 'S3',
};

export const mailModeTypeLabelMapping: Record<z.infer<typeof adminSettingsEmailSchema>['type'], string> = {
  none: 'None',
  smtp: 'SMTP',
  sendmail: 'Sendmail Command',
  filesystem: 'Filesystem',
};

export const archiveFormatLabelMapping: Record<z.infer<typeof archiveFormat>, string> = {
  tar: '.tar',
  tar_gz: '.tar.gz',
  tar_xz: '.tar.xz',
  tar_lzip: '.tar.lz',
  tar_bz2: '.tar.bz2',
  tar_lz4: '.tar.lz4',
  tar_zstd: '.tar.zst',
  zip: '.zip',
  seven_zip: '.7z',
};

export const streamingArchiveFormatLabelMapping: Record<z.infer<typeof streamingArchiveFormat>, string> = {
  tar: '.tar',
  tar_gz: '.tar.gz',
  tar_xz: '.tar.xz',
  tar_lzip: '.tar.lz',
  tar_bz2: '.tar.bz2',
  tar_lz4: '.tar.lz4',
  tar_zstd: '.tar.zst',
  zip: '.zip',
};

export const schedulePreConditionLabelMapping: Record<
  z.infer<typeof serverSchedulePreConditionSchema>['type'],
  string
> = {
  none: 'None',
  and: 'AND (All must be true)',
  or: 'OR (Any must be true)',
  not: 'NOT (Must not be true)',
  server_state: 'Server State',
  uptime: 'Uptime',
  cpu_usage: 'CPU Usage',
  memory_usage: 'Memory Usage',
  disk_usage: 'Disk Usage',
  file_exists: 'File Exists',
};

export const scheduleConditionLabelMapping: Record<z.infer<typeof serverScheduleConditionSchema>['type'], string> = {
  none: 'None',
  and: 'AND (All must be true)',
  or: 'OR (Any must be true)',
  not: 'NOT (Must not be true)',
  variable_exists: 'Variable Exists',
  variable_contains: 'Variable Contains',
  variable_equals: 'Variable Equals',
  variable_starts_with: 'Variable Starts With',
  variable_ends_with: 'Variable Ends With',
};

export const scheduleComparatorLabelMapping: Record<z.infer<typeof serverScheduleComparator>, string> = {
  smaller_than: 'Smaller Than',
  smaller_than_or_equals: 'Smaller Than or Equals',
  equal: 'Equals',
  greater_than: 'Greater Than',
  greater_than_or_equals: 'Greater Than or Equals',
};

export const scheduleComparatorOperatorMapping: Record<z.infer<typeof serverScheduleComparator>, string> = {
  smaller_than: '<',
  smaller_than_or_equals: '<=',
  equal: '==',
  greater_than: '>',
  greater_than_or_equals: '>=',
};

export const serverPowerStateLabelMapping: Record<z.infer<typeof serverPowerState>, string> = {
  running: 'Running',
  offline: 'Offline',
  starting: 'Starting',
  stopping: 'Stopping',
};

export const serverPowerActionLabelMapping: Record<z.infer<typeof serverPowerAction>, string> = {
  start: 'Start',
  stop: 'Stop',
  restart: 'Restart',
  kill: 'Kill',
};

export const serverBackupStatusLabelMapping: Record<z.infer<typeof serverBackupStatus>, string> = {
  starting: 'Starting',
  finished: 'Finished',
  failed: 'Failed',
};

export const scheduleStepLabelMapping: Record<z.infer<typeof serverScheduleStepActionSchema>['type'], string> = {
  sleep: 'Sleep',
  ensure: 'Ensure',
  format: 'Format',
  match_regex: 'Match Regex',
  wait_for_console_line: 'Wait for Console Line',
  send_power: 'Send Power Signal',
  send_command: 'Send Command',
  create_backup: 'Create Backup',
  create_directory: 'Create Directory',
  write_file: 'Write File',
  copy_file: 'Copy File',
  delete_files: 'Delete Files',
  rename_files: 'Rename Files',
  compress_files: 'Compress Files',
  decompress_file: 'Decompress File',
  update_startup_variable: 'Update Startup Variable',
  update_startup_command: 'Update Startup Command',
  update_startup_docker_image: 'Update Docker Image',
};

export const scheduleStepDefaultMapping: Record<
  z.infer<typeof serverScheduleStepActionSchema>['type'],
  z.infer<typeof serverScheduleStepActionSchema>
> = {
  sleep: {
    type: 'sleep',
    duration: 0,
  },
  ensure: {
    type: 'ensure',
    condition: { type: 'none' },
  },
  format: {
    type: 'format',
    format: '',
    outputInto: { variable: '' },
  },
  match_regex: {
    type: 'match_regex',
    input: '',
    regex: '',
    outputInto: [],
  },
  wait_for_console_line: {
    type: 'wait_for_console_line',
    ignoreFailure: false,
    contains: '',
    timeout: 5000,
    outputInto: null,
  },
  send_power: {
    type: 'send_power',
    ignoreFailure: false,
    action: 'start',
  },
  send_command: {
    type: 'send_command',
    ignoreFailure: false,
    command: '',
  },
  create_backup: {
    type: 'create_backup',
    ignoreFailure: false,
    foreground: false,
    name: null,
    ignoredFiles: [],
  },
  create_directory: {
    type: 'create_directory',
    ignoreFailure: false,
    root: '/',
    name: '',
  },
  write_file: {
    type: 'write_file',
    ignoreFailure: false,
    append: false,
    file: '/file.txt',
    content: '',
  },
  copy_file: {
    type: 'copy_file',
    ignoreFailure: false,
    foreground: false,
    file: '/source.txt',
    destination: '/destination.txt',
  },
  delete_files: {
    type: 'delete_files',
    root: '/',
    files: [],
  },
  rename_files: {
    type: 'rename_files',
    root: '/',
    files: [],
  },
  compress_files: {
    type: 'compress_files',
    ignoreFailure: false,
    foreground: false,
    root: '/',
    files: [],
    format: 'tar_gz',
    name: 'backup.tar.gz',
  },
  decompress_file: {
    type: 'decompress_file',
    ignoreFailure: false,
    foreground: false,
    root: '/',
    file: 'backup.tar.gz',
  },
  update_startup_variable: {
    type: 'update_startup_variable',
    ignoreFailure: false,
    envVariable: '',
    value: '',
  },
  update_startup_command: {
    type: 'update_startup_command',
    ignoreFailure: false,
    command: '',
  },
  update_startup_docker_image: {
    type: 'update_startup_docker_image',
    ignoreFailure: false,
    image: '',
  },
};

export const scheduleStepIconMapping: Record<z.infer<typeof serverScheduleStepActionSchema>['type'], IconDefinition> = {
  sleep: faHourglass,
  ensure: faEquals,
  format: faTextSlash,
  match_regex: faEquals,
  wait_for_console_line: faTerminal,
  send_power: faPowerOff,
  send_command: faTerminal,
  create_backup: faDatabase,
  create_directory: faFolder,
  write_file: faFile,
  copy_file: faCopy,
  delete_files: faTrash,
  rename_files: faEdit,
  compress_files: faCompress,
  decompress_file: faExpand,
  update_startup_variable: faGear,
  update_startup_command: faCode,
  update_startup_docker_image: faDocker,
};

export const sshKeyProviderLabelMapping: Record<z.infer<typeof userSshKeyProvider>, string> = {
  github: 'GitHub',
  gitlab: 'GitLab',
  launchpad: 'Launchpad',
};

export const permissionCategoryIconMapping: Record<string, IconDefinition> = {
  stats: faChartPie,
  account: faUser,
  activity: faBriefcase,
  allocations: faNetworkWired,
  'api-keys': faCloud,
  'backup-configurations': faFileZipper,
  backups: faBoxArchive,
  control: faTerminal,
  'database-hosts': faDatabase,
  databases: faDatabase,
  eggs: faEgg,
  assets: faFolderOpen,
  extensions: faPuzzlePiece,
  files: faFolderOpen,
  locations: faEarthAmerica,
  mounts: faFolder,
  nests: faKiwiBird,
  'egg-repositories': faDownload,
  'oauth-providers': faFingerprint,
  nodes: faServer,
  roles: faScroll,
  schedules: faStopwatch,
  'security-keys': faUnlockKeyhole,
  servers: faComputer,
  sessions: faUserSecret,
  settings: faCog,
  'ssh-keys': faKey,
  'oauth-links': faFingerprint,
  startup: faPlay,
  subusers: faUsers,
  users: faUsers,
};

export const scheduleTriggerIconMapping: Record<z.infer<typeof serverScheduleTriggerSchema>['type'], IconDefinition> = {
  cron: faStopwatch,
  power_action: faPowerOff,
  server_state: faServer,
  backup_status: faBoxArchive,
  console_line: faTerminal,
  crash: faSkull,
};

export const scheduleTriggerColorMapping: Record<z.infer<typeof serverScheduleTriggerSchema>['type'], string> = {
  cron: 'blue',
  power_action: 'orange',
  server_state: 'green',
  backup_status: 'green',
  console_line: 'gray',
  crash: 'red',
};

export const scheduleTriggerLabelMapping: Record<z.infer<typeof serverScheduleTriggerSchema>['type'], string> = {
  cron: 'Cron',
  power_action: 'Power Action',
  server_state: 'Server State',
  backup_status: 'Backup Status',
  console_line: 'Console Line',
  crash: 'Crash',
};

export const scheduleTriggerDefaultMapping: Record<
  z.infer<typeof serverScheduleTriggerSchema>['type'],
  z.infer<typeof serverScheduleTriggerSchema>
> = {
  cron: { type: 'cron', schedule: '' },
  power_action: { type: 'power_action', action: 'start' },
  server_state: { type: 'server_state', state: 'running' },
  backup_status: { type: 'backup_status', status: 'starting' },
  console_line: { type: 'console_line', contains: '', outputInto: null },
  crash: { type: 'crash' },
};
