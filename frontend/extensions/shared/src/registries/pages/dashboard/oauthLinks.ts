import { ContainerRegistry, Registry } from 'shared';
import { ContextMenuRegistry } from '../../slices/contextMenu.ts';

export class OAuthLinksRegistry implements Registry {
  public mergeFrom(other: this): this {
    this.container.mergeFrom(other.container);
    this.oauthLinkContextMenu.mergeFrom(other.oauthLinkContextMenu);

    return this;
  }

  public container: ContainerRegistry = new ContainerRegistry();
  public oauthLinkContextMenu: ContextMenuRegistry<{ oauthLink: UserOAuthLink }> = new ContextMenuRegistry();

  public enterContainer(callback: (registry: ContainerRegistry) => unknown): this {
    callback(this.container);
    return this;
  }

  public enterOauthLinkContextMenu(
    callback: (registry: ContextMenuRegistry<{ oauthLink: UserOAuthLink }>) => unknown,
  ): this {
    callback(this.oauthLinkContextMenu);
    return this;
  }
}
