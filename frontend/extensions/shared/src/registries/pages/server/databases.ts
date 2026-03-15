import { ContainerRegistry, Registry } from 'shared';
import { z } from 'zod';
import type { Props as ContainerProps } from '@/elements/containers/ServerContentContainer.tsx';
import { serverDatabaseSchema } from '@/lib/schemas/server/databases.ts';
import { ContextMenuRegistry } from '../../slices/contextMenu.ts';

export class DatabasesRegistry implements Registry {
  public mergeFrom(other: this): this {
    this.container.mergeFrom(other.container);
    this.databaseContextMenu.mergeFrom(other.databaseContextMenu);

    return this;
  }

  public container: ContainerRegistry<ContainerProps> = new ContainerRegistry();
  public databaseContextMenu: ContextMenuRegistry<{ database: z.infer<typeof serverDatabaseSchema> }> =
    new ContextMenuRegistry();

  public enterContainer(callback: (registry: ContainerRegistry<ContainerProps>) => unknown): this {
    callback(this.container);
    return this;
  }

  public enterDatabaseContextMenu(
    callback: (registry: ContextMenuRegistry<{ database: z.infer<typeof serverDatabaseSchema> }>) => unknown,
  ): this {
    callback(this.databaseContextMenu);
    return this;
  }
}
