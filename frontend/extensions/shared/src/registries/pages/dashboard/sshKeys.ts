import { ContainerRegistry, Registry } from 'shared';
import { ContextMenuRegistry } from '../../slices/contextMenu.ts';

export class SshKeysRegistry implements Registry {
  public mergeFrom(other: this): this {
    this.container.mergeFrom(other.container);
    this.sshKeyContextMenu.mergeFrom(other.sshKeyContextMenu);

    return this;
  }

  public container: ContainerRegistry = new ContainerRegistry();
  public sshKeyContextMenu: ContextMenuRegistry<{ sshKey: UserSshKey }> = new ContextMenuRegistry();

  public enterContainer(callback: (registry: ContainerRegistry) => unknown): this {
    callback(this.container);
    return this;
  }

  public enterSshKeyContextMenu(callback: (registry: ContextMenuRegistry<{ sshKey: UserSshKey }>) => unknown): this {
    callback(this.sshKeyContextMenu);
    return this;
  }
}
