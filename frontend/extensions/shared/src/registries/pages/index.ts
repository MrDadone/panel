import { Registry } from 'shared';
import { ServerRegistry } from './server/index.ts';

export class PageRegistry implements Registry {
  public mergeFrom(other: this): this {
    this.server.mergeFrom(other.server);

    return this;
  }

  public server: ServerRegistry = new ServerRegistry();

  public enterServer(callback: (registry: ServerRegistry) => unknown): this {
    callback(this.server);
    return this;
  }
}
