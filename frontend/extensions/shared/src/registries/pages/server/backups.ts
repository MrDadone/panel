import { ContainerRegistry, Registry } from 'shared';
import type { Props as ContainerProps } from '@/elements/containers/ServerContentContainer.tsx';
import { ContextMenuRegistry } from '../../slices/contextMenu.ts';

export class BackupsRegistry implements Registry {
  public mergeFrom(other: this): this {
    this.container.mergeFrom(other.container);
    this.backupContextMenu.mergeFrom(other.backupContextMenu);

    return this;
  }

  public container: ContainerRegistry<ContainerProps> = new ContainerRegistry();
  public backupContextMenu: ContextMenuRegistry<{ backup: ServerBackup }> = new ContextMenuRegistry();

  public enterContainer(callback: (registry: ContainerRegistry<ContainerProps>) => unknown): this {
    callback(this.container);
    return this;
  }

  public enterBackupContextMenu(callback: (registry: ContextMenuRegistry<{ backup: ServerBackup }>) => unknown): this {
    callback(this.backupContextMenu);
    return this;
  }
}
