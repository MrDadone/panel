import { ContainerRegistry, Registry } from 'shared';
import type { Props as ContainerProps } from '@/elements/containers/ServerContentContainer.tsx';
import { ContextMenuRegistry } from '../../slices/contextMenu.ts';

export class DatabasesRegistry implements Registry {
  public mergeFrom(other: this): this {
    this.container.mergeFrom(other.container);
    this.databaseContextMenu.mergeFrom(other.databaseContextMenu);

    return this;
  }

  public container: ContainerRegistry<ContainerProps> = new ContainerRegistry();
  public databaseContextMenu: ContextMenuRegistry<{ database: ServerDatabase }> = new ContextMenuRegistry();

  public enterContainer(callback: (registry: ContainerRegistry<ContainerProps>) => unknown): this {
    callback(this.container);
    return this;
  }

  public enterDatabaseContextMenu(
    callback: (registry: ContextMenuRegistry<{ database: ServerDatabase }>) => unknown,
  ): this {
    callback(this.databaseContextMenu);
    return this;
  }
}
