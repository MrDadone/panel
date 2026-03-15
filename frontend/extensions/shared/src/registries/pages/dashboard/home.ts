import { ContainerRegistry, Registry } from 'shared';

export class HomeRegistry implements Registry {
  public mergeFrom(other: this): this {
    this.containerGrouped.mergeFrom(other.containerGrouped);
    this.containerAll.mergeFrom(other.containerAll);

    return this;
  }

  public containerGrouped: ContainerRegistry = new ContainerRegistry();
  public containerAll: ContainerRegistry = new ContainerRegistry();

  public enterContainerGrouped(callback: (registry: ContainerRegistry) => unknown): this {
    callback(this.containerGrouped);
    return this;
  }

  public enterContainerAll(callback: (registry: ContainerRegistry) => unknown): this {
    callback(this.containerAll);
    return this;
  }
}
