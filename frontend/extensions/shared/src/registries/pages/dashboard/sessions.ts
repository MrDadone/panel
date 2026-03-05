import { ContainerRegistry, Registry } from 'shared';
import { ContextMenuRegistry } from '../../slices/contextMenu.ts';

export class SessionsRegistry implements Registry {
  public mergeFrom(other: this): this {
    this.container.mergeFrom(other.container);
    this.sessionContextMenu.mergeFrom(other.sessionContextMenu);

    return this;
  }

  public container: ContainerRegistry = new ContainerRegistry();
  public sessionContextMenu: ContextMenuRegistry<{ session: UserSession }> = new ContextMenuRegistry();

  public enterContainer(callback: (registry: ContainerRegistry) => unknown): this {
    callback(this.container);
    return this;
  }

  public enterSessionContextMenu(callback: (registry: ContextMenuRegistry<{ session: UserSession }>) => unknown): this {
    callback(this.sessionContextMenu);
    return this;
  }
}
