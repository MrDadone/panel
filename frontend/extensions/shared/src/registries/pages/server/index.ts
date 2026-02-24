import type { FC } from 'react';
import { Registry } from 'shared';
import { ConsoleRegistry } from './console.ts';

export class ServerRegistry implements Registry {
  public mergeFrom(other: this): this {
    this.console.mergeFrom(other.console);
    this.prependedComponents.push(...other.prependedComponents);
    this.appendedComponents.push(...other.appendedComponents);

    return this;
  }

  public console: ConsoleRegistry = new ConsoleRegistry();

  public prependedComponents: FC[] = [];
  public appendedComponents: FC[] = [];

  public enterConsole(callback: (registry: ConsoleRegistry) => unknown): this {
    callback(this.console);
    return this;
  }

  public prependComponent(component: FC): this {
    this.prependedComponents.push(component);
    return this;
  }

  public appendComponent(component: FC): this {
    this.appendedComponents.push(component);
    return this;
  }
}
