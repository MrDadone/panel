import type { FC } from 'react';
import { ContainerRegistry, Registry } from 'shared';
import type { Props as ContainerProps } from '@/elements/containers/ServerContentContainer.tsx';

interface ConsoleFeatureDefinition {
  filter?: (features: string[]) => boolean;
  component: FC;
}

export class ConsoleRegistry implements Registry {
  public mergeFrom(other: this): this {
    this.features.push(...other.features);
    this.statCards.push(...other.statCards);
    this.statBlocks.push(...other.statBlocks);
    this.terminalHeaderLeftComponents.push(...other.terminalHeaderLeftComponents);
    this.terminalHeaderRightComponents.push(...other.terminalHeaderRightComponents);
    this.terminalInputRowComponents.push(...other.terminalInputRowComponents);

    return this;
  }

  public container: ContainerRegistry<ContainerProps> = new ContainerRegistry();

  public features: ConsoleFeatureDefinition[] = [];
  public statCards: FC[] = [];
  public statBlocks: FC[] = [];
  public terminalHeaderLeftComponents: FC[] = [];
  public terminalHeaderRightComponents: FC[] = [];
  public terminalInputRowComponents: FC[] = [];

  public enterContainer(callback: (registry: ContainerRegistry<ContainerProps>) => unknown): this {
    callback(this.container);
    return this;
  }

  public addFeature(feature: ConsoleFeatureDefinition): this {
    this.features.push(feature);

    return this;
  }

  public addStatCard(card: FC): this {
    this.statCards.push(card);

    return this;
  }

  public addStatBlock(block: FC): this {
    this.statBlocks.push(block);

    return this;
  }

  public addTerminalHeaderLeftComponent(component: FC): this {
    this.terminalHeaderLeftComponents.push(component);

    return this;
  }

  public addTerminalHeaderRightComponent(component: FC): this {
    this.terminalHeaderRightComponents.push(component);

    return this;
  }

  public addTerminalInputRowComponent(component: FC): this {
    this.terminalInputRowComponents.push(component);

    return this;
  }
}
