import { ContainerRegistry, Registry } from 'shared';
import { z } from 'zod';
import type { Props as ContainerProps } from '@/elements/containers/ServerContentContainer.tsx';
import { serverBackupSchema } from '@/lib/schemas/server/backups.ts';
import { ContextMenuRegistry } from '../../slices/contextMenu.ts';

export class BackupsRegistry implements Registry {
  public mergeFrom(other: this): this {
    this.container.mergeFrom(other.container);
    this.backupContextMenu.mergeFrom(other.backupContextMenu);

    return this;
  }

  public container: ContainerRegistry<ContainerProps> = new ContainerRegistry();
  public backupContextMenu: ContextMenuRegistry<{ backup: z.infer<typeof serverBackupSchema> }> =
    new ContextMenuRegistry();

  public enterContainer(callback: (registry: ContainerRegistry<ContainerProps>) => unknown): this {
    callback(this.container);
    return this;
  }

  public enterBackupContextMenu(
    callback: (registry: ContextMenuRegistry<{ backup: z.infer<typeof serverBackupSchema> }>) => unknown,
  ): this {
    callback(this.backupContextMenu);
    return this;
  }
}
