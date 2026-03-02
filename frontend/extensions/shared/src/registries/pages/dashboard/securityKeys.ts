import { ContainerRegistry, Registry } from 'shared';
import { ContextMenuRegistry } from '../../slices/contextMenu.ts';

export class SecurityKeysRegistry implements Registry {
  public mergeFrom(other: this): this {
    this.container.mergeFrom(other.container);
    this.securityKeyContextMenu.mergeFrom(other.securityKeyContextMenu);

    return this;
  }

  public container: ContainerRegistry = new ContainerRegistry();
  public securityKeyContextMenu: ContextMenuRegistry<{ securityKey: UserSecurityKey }> = new ContextMenuRegistry();

  public enterContainer(callback: (registry: ContainerRegistry) => unknown): this {
    callback(this.container);
    return this;
  }

  public enterSecurityKeyContextMenu(
    callback: (registry: ContextMenuRegistry<{ securityKey: UserSecurityKey }>) => unknown,
  ): this {
    callback(this.securityKeyContextMenu);
    return this;
  }
}
