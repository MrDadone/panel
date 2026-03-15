import { ContainerRegistry, Registry } from 'shared';

export class ActivityRegistry implements Registry {
  public mergeFrom(other: this): this {
    this.container.mergeFrom(other.container);

    return this;
  }

  public container: ContainerRegistry = new ContainerRegistry();

  public enterContainer(callback: (registry: ContainerRegistry) => unknown): this {
    callback(this.container);
    return this;
  }
}
