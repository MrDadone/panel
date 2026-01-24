import type { FC } from 'react';
import { Registry } from 'shared';

export class ContainerRegistry implements Registry {
  public mergeFrom(other: this): this {
    this.prependedComponents.push(...other.prependedComponents);
    this.prependedContentComponents.push(...other.prependedContentComponents);
    this.appendedContentComponents.push(...other.appendedContentComponents);

    return this;
  }

  public prependedComponents: FC[] = [];
  public prependedContentComponents: FC[] = [];
  public appendedContentComponents: FC[] = [];

  // Adds a component to be rendered before everything else
  public prependComponent(component: FC): this {
    this.prependedComponents.push(component);

    return this;
  }

  // Adds a component to be rendered before the main content but after the title/search area
  public prependContentComponent(component: FC): this {
    this.prependedContentComponents.push(component);

    return this;
  }

  // Adds a component to be rendered after the main content
  public appendContentComponent(component: FC): this {
    this.appendedContentComponents.push(component);

    return this;
  }
}
