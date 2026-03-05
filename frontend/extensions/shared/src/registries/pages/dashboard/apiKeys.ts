import { ContainerRegistry, Registry } from 'shared';
import { ContextMenuRegistry } from '../../slices/contextMenu.ts';

export class ApiKeysRegistry implements Registry {
  public mergeFrom(other: this): this {
    this.container.mergeFrom(other.container);
    this.apiKeyContextMenu.mergeFrom(other.apiKeyContextMenu);

    return this;
  }

  public container: ContainerRegistry = new ContainerRegistry();
  public apiKeyContextMenu: ContextMenuRegistry<{ apiKey: UserApiKey }> = new ContextMenuRegistry();

  public enterContainer(callback: (registry: ContainerRegistry) => unknown): this {
    callback(this.container);
    return this;
  }

  public enterApiKeyContextMenu(callback: (registry: ContextMenuRegistry<{ apiKey: UserApiKey }>) => unknown): this {
    callback(this.apiKeyContextMenu);
    return this;
  }
}
