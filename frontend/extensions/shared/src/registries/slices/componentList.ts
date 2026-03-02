import type { FC } from 'react';
import { Registry } from 'shared';

export class ComponentListRegistry<Props = {}> implements Registry {
  public mergeFrom(other: this): this {
    this.prependedComponents.push(...other.prependedComponents);
    this.appendedComponents.push(...other.appendedComponents);

    return this;
  }

  public prependedComponents: FC<Props>[] = [];
  public appendedComponents: FC<Props>[] = [];

  public prependComponent(component: FC<Props>): this {
    this.prependedComponents.push(component);
    return this;
  }

  public appendComponent(component: FC<Props>): this {
    this.appendedComponents.push(component);
    return this;
  }
}
