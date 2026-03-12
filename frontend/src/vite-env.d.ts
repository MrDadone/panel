/// <reference types="vite/client" />

import type { ExtensionContext } from 'shared';

declare global {
  interface Window {
    extensionContext: ExtensionContext;
  }

  type AndCreated<T extends object> = T & {
    created: Date;
  };

  interface NestEgg {
    uuid: string;
    name: string;
    description: string | null;
    startup: string;
    separatePort: boolean;
    features: string[];
    dockerImages: {
      [key: string]: string;
    };
    created: Date;
  }

  interface Server {
    uuid: string;
    uuidShort: string;
    allocation: ServerAllocation | null;
    egg: NestEgg;
    status: ServerStatus | null;
    suspended: boolean;
    isOwner: boolean;
    permissions: string[];
    locationUuid: string;
    locationName: string;
    nodeUuid: string;
    nodeName: string;
    nodeMaintenanceEnabled: boolean;
    sftpHost: string;
    sftpPort: number;
    name: string;
    description: string | null;
    limits: ServerLimits;
    featureLimits: ServerFeatureLimits;
    startup: string;
    image: string;
    autoKill: {
      enabled: boolean;
      seconds: number;
    };
    autoStartBehavior: ServerAutostartBehavior;
    timezone: string | null;
    created: Date;
  }

  interface ImagePullProgress {
    status: 'pulling' | 'extracting';
    progress: number;
    total: number;
  }

  interface ServerPullQueryResult {
    fileName: string | null;
    fileSize: number | null;
    finalUrl: string;
    headers: Record<string, string>;
  }

  interface ScheduleStatus {
    running: boolean;
    step: string | null;
  }

  interface EnvVariable {
    envVariable: string;
    value: string;
  }

  interface UserSession {
    uuid: string;
    ip: string;
    userAgent: string;
    isUsing: boolean;
    lastUsed: Date;
    created: Date;
  }

  type SshKeyProvider = 'github' | 'gitlab' | 'launchpad';

  interface UserSecurityKey {
    uuid: string;
    name: string;
    credentialId: string;
    lastUsed: Date | null;
    created: Date;
  }

  interface CaptchaProviderNone {
    type: 'none';
  }

  interface CaptchaProviderTurnstile {
    type: 'turnstile';
    siteKey: string;
    secretKey: string;
  }

  interface CaptchaProviderRecaptcha {
    type: 'recaptcha';
    siteKey: string;
    secretKey: string;
    v3: boolean;
  }

  interface CaptchaProviderHcaptcha {
    type: 'hcaptcha';
    siteKey: string;
    secretKey: string;
  }

  interface CaptchaProviderFriendlyCaptcha {
    type: 'friendly_captcha';
    siteKey: string;
    apiKey: string;
  }

  type CaptchaProvider =
    | CaptchaProviderNone
    | CaptchaProviderTurnstile
    | CaptchaProviderRecaptcha
    | CaptchaProviderHcaptcha
    | CaptchaProviderFriendlyCaptcha;

  type CompressionLevel = 'best_speed' | 'good_speed' | 'good_compression' | 'best_compression';

  interface DirectoryEntry {
    name: string;
    created: Date;
    modified: Date;
    mode: string;
    modeBits: string;
    size: number;
    sizePhysical: number;
    directory: boolean;
    file: boolean;
    symlink: boolean;
    mime: string;
  }

  interface Download {
    identifier: string;
    destination: string;
    progress: number;
    total: number;
  }

  type BackupDisk = 'local' | 's3' | 'ddup-bak' | 'btrfs' | 'zfs' | 'restic';

  interface BackupDiskConfigurationS3 {
    accessKey: string;
    secretKey: string;
    bucket: string;
    region: string;
    endpoint: string;
    pathStyle: boolean;
    partSize: number;
  }

  interface BackupDiskConfigurationRestic {
    repository: string;
    retryLockSeconds: number;
    environment: Record<string, string>;
  }

  interface BackupDiskConfigurations {
    s3: BackupDiskConfigurationS3;
    restic: BackupDiskConfigurationRestic;
  }

  type StorageDriverType = 'filesystem' | 's3';

  interface StorageDriverFilesystem {
    type: 'filesystem';
    path: string;
  }

  interface StorageDriverS3 {
    type: 's3';
    publicUrl: string;
    accessKey: string;
    secretKey: string;
    bucket: string;
    region: string;
    endpoint: string;
    pathStyle: boolean;
  }

  type StorageDriver = StorageDriverFilesystem | StorageDriverS3;

  type MailModeType = 'none' | 'smtp' | 'sendmail' | 'filesystem';

  interface MailModeNone {
    type: 'none';
  }

  interface MailModeSmtp {
    type: 'smtp';
    host: string;
    port: number;
    username: string | null;
    password: string | null;
    useTls: boolean;
    fromAddress: string;
    fromName: string | null;
  }

  interface MailModeSendmail {
    type: 'sendmail';
    command: string;
    fromAddress: string;
    fromName: string | null;
  }

  interface MailModeFilesystem {
    type: 'filesystem';
    path: string;
    fromAddress: string;
    fromName: string | null;
  }

  type MailMode = MailModeNone | MailModeSmtp | MailModeSendmail | MailModeFilesystem;

  type ProcessConfigurationConfigParser = 'file' | 'yaml' | 'properties' | 'ini' | 'json' | 'xml' | 'toml';

  interface PublicCaptchaProviderNone {
    type: 'none';
  }

  interface PublicCaptchaProviderTurnstile {
    type: 'turnstile';
    siteKey: string;
  }

  interface PublicCaptchaProviderRecaptcha {
    type: 'recaptcha';
    siteKey: string;
    v3: boolean;
  }

  interface PublicCaptchaProviderHcaptcha {
    type: 'hcaptcha';
    siteKey: string;
  }

  interface PublicCaptchaProviderFriendlyCaptcha {
    type: 'friendly_captcha';
    siteKey: string;
  }

  type PublicCaptchaProvider =
    | PublicCaptchaProviderNone
    | PublicCaptchaProviderTurnstile
    | PublicCaptchaProviderRecaptcha
    | PublicCaptchaProviderHcaptcha
    | PublicCaptchaProviderFriendlyCaptcha;

  interface PublicSettings {
    version: string;
    oobeStep: OobeStepKey | null;
    appDebug: boolean;
    captchaProvider: PublicCaptchaProvider;
    app: {
      url: string;
      icon: string;
      name: string;
      language: string;
      registrationEnabled: boolean;
    };
    server: {
      maxFileManagerViewSize: number;
      maxFileManagerContentSearchSize: number;
      maxFileManagerSearchResults: number;
      maxSchedulesStepCount: number;
      allowOverwritingCustomDockerImage: boolean;
      allowEditingStartupCommand: boolean;
      allowAcknowledgingInstallationFailure: boolean;
    };
  }

  type TwoFactorRequirement = 'admins' | 'all_users' | 'none';

  interface AdminSettings {
    oobeStep: OobeStepKey | null;
    storageDriver: StorageDriver;
    mailMode: MailMode;
    captchaProvider: CaptchaProvider;
    app: {
      name: string;
      icon: string;
      url: string;
      language: string;
      twoFactorRequirement: TwoFactorRequirement;
      telemetryEnabled: boolean;
      registrationEnabled: boolean;
    };
    webauthn: {
      rpId: string;
      rpOrigin: string;
    };
    server: {
      maxFileManagerViewSize: number;
      maxFileManagerContentSearchSize: number;
      maxFileManagerSearchResults: number;
      maxSchedulesStepCount: number;
      allowOverwritingCustomDockerImage: boolean;
      allowEditingStartupCommand: boolean;
      allowViewingInstallationLogs: boolean;
      allowAcknowledgingInstallationFailure: boolean;
      allowViewingTransferProgress: boolean;
    };
    activity: {
      adminLogRetentionDays: number;
      userLogRetentionDays: number;
      serverLogRetentionDays: number;

      serverLogAdminActivity: boolean;
      serverLogScheduleActivity: boolean;
    };
  }

  interface ResourceUsage {
    memoryBytes: number;
    memoryLimitBytes: number;
    diskBytes: number;
    state: ServerPowerState;
    network: {
      rxBytes: number;
      txBytes: number;
    };
    cpuAbsolute: number;
    uptime: number;
  }

  interface Pagination<T> {
    total: number;
    perPage: number;
    page: number;
    data: T[];
  }

  type ServerPowerState = 'offline' | 'starting' | 'stopping' | 'running';

  type ServerPowerAction = 'start' | 'stop' | 'restart' | 'kill';

  type ServerBackupStatus = 'starting' | 'finished' | 'failed';

  type ServerStatus = 'installing' | 'install_failed' | 'restoring_backup';

  interface PermissionMap {
    [category: string]: {
      description: string;
      permissions: Record<string, string>;
    };
  }

  interface ApiPermissions {
    userPermissions: PermissionMap;
    serverPermissions: PermissionMap;
    adminPermissions: PermissionMap;
  }

  type ArchiveFormat =
    | 'tar'
    | 'tar_gz'
    | 'tar_xz'
    | 'tar_lzip'
    | 'tar_bz2'
    | 'tar_lz4'
    | 'tar_zstd'
    | 'zip'
    | 'seven_zip';
  type StreamingArchiveFormat = 'tar' | 'tar_gz' | 'tar_xz' | 'tar_lzip' | 'tar_bz2' | 'tar_lz4' | 'tar_zstd' | 'zip';
  type OobeStepKey = 'register' | 'configuration' | 'location' | 'node' | 'node_verify' | 'finished' | '';

  type GroupedDatabaseHosts = {
    [key in DatabaseType]: {
      group: string;
      items: { value: string; label: string }[];
    };
  };
}
