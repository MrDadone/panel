import type { ITerminalInitOnlyOptions, ITerminalOptions, Terminal } from '@xterm/xterm';
import { Registry } from 'shared';

type XTermInitHandler<P> = (options: ITerminalOptions & ITerminalInitOnlyOptions, props: P) => void;
type XTermHandler<P> = (term: Terminal, props: P) => void;

export class XTermRegistry<Props = {}> implements Registry {
  public mergeFrom(other: this): this {
    this.initHandlers.push(...other.initHandlers);
    this.beforePluginsHandlers.push(...other.beforePluginsHandlers);
    this.afterPluginsHandlers.push(...other.afterPluginsHandlers);
    this.afterOpenHandlers.push(...other.afterOpenHandlers);
    this.onUnmountHandlers.push(...other.onUnmountHandlers);

    return this;
  }

  public initHandlers: XTermInitHandler<Props>[] = [];
  public beforePluginsHandlers: XTermHandler<Props>[] = [];
  public afterPluginsHandlers: XTermHandler<Props>[] = [];
  public afterOpenHandlers: XTermHandler<Props>[] = [];
  public onUnmountHandlers: XTermHandler<Props>[] = [];

  public addInitHandler(interceptor: XTermInitHandler<Props>): this {
    this.initHandlers.push(interceptor);
    return this;
  }

  public addBeforePluginsHandler(interceptor: XTermHandler<Props>): this {
    this.beforePluginsHandlers.push(interceptor);
    return this;
  }

  public addAfterPluginsHandler(interceptor: XTermHandler<Props>): this {
    this.afterPluginsHandlers.push(interceptor);
    return this;
  }

  public addAfterOpenHandler(interceptor: XTermHandler<Props>): this {
    this.afterOpenHandlers.push(interceptor);
    return this;
  }

  public addOnUnmountHandler(interceptor: XTermHandler<Props>): this {
    this.onUnmountHandlers.push(interceptor);
    return this;
  }
}
