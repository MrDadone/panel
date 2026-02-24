import { Registry } from 'shared';
import { GlobalRegistry } from './global.ts';
import { ServerRegistry } from './server/index.ts';

export class PageRegistry implements Registry {
  public mergeFrom(other: this): this {
    this.global.mergeFrom(other.global);
    this.server.mergeFrom(other.server);

    return this;
  }

  public global: GlobalRegistry = new GlobalRegistry();
  public server: ServerRegistry = new ServerRegistry();

  public enterGlobal(callback: (registry: GlobalRegistry) => unknown): this {
    callback(this.global);
    return this;
  }

  public enterServer(callback: (registry: ServerRegistry) => unknown): this {
    callback(this.server);
    return this;
  }
}
