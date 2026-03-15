import { ContainerRegistry, Registry } from 'shared';
import { z } from 'zod';
import type { Props as ContainerProps } from '@/elements/containers/ServerContentContainer.tsx';
import { serverAllocationSchema } from '@/lib/schemas/server/allocations.ts';
import { ContextMenuRegistry } from '../../slices/contextMenu.ts';

export class NetworkRegistry implements Registry {
  public mergeFrom(other: this): this {
    this.container.mergeFrom(other.container);
    this.allocationContextMenu.mergeFrom(other.allocationContextMenu);

    return this;
  }

  public container: ContainerRegistry<ContainerProps> = new ContainerRegistry();
  public allocationContextMenu: ContextMenuRegistry<{ allocation: z.infer<typeof serverAllocationSchema> }> =
    new ContextMenuRegistry();

  public enterContainer(callback: (registry: ContainerRegistry<ContainerProps>) => unknown): this {
    callback(this.container);
    return this;
  }

  public enterAllocationContextMenu(
    callback: (registry: ContextMenuRegistry<{ allocation: z.infer<typeof serverAllocationSchema> }>) => unknown,
  ): this {
    callback(this.allocationContextMenu);
    return this;
  }
}
