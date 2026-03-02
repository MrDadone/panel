import { ContainerRegistry, Registry } from 'shared';
import type { Props as ContainerProps } from '@/elements/containers/ServerContentContainer.tsx';
import { ComponentListRegistry } from '../../slices/componentList.ts';

export class SettingsRegistry implements Registry {
  public mergeFrom(other: this): this {
    this.container.mergeFrom(other.container);
    this.settingContainers.mergeFrom(other.settingContainers);

    return this;
  }

  public container: ContainerRegistry<ContainerProps> = new ContainerRegistry();
  public settingContainers: ComponentListRegistry = new ComponentListRegistry();

  public enterContainer(callback: (registry: ContainerRegistry<ContainerProps>) => unknown): this {
    callback(this.container);
    return this;
  }

  public enterSettingContainers(callback: (registry: ComponentListRegistry) => unknown): this {
    callback(this.settingContainers);
    return this;
  }
}
