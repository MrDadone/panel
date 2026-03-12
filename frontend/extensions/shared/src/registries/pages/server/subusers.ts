import { ContainerRegistry, Registry } from 'shared';
import { z } from 'zod';
import type { Props as ContainerProps } from '@/elements/containers/ServerContentContainer.tsx';
import { serverSubuserSchema } from '@/lib/schemas/server/subusers.ts';
import { ContextMenuRegistry } from '../../slices/contextMenu.ts';

export class SubusersRegistry implements Registry {
  public mergeFrom(other: this): this {
    this.container.mergeFrom(other.container);
    this.subuserContextMenu.mergeFrom(other.subuserContextMenu);

    return this;
  }

  public container: ContainerRegistry<ContainerProps> = new ContainerRegistry();
  public subuserContextMenu: ContextMenuRegistry<{ subuser: z.infer<typeof serverSubuserSchema> }> =
    new ContextMenuRegistry();

  public enterContainer(callback: (registry: ContainerRegistry<ContainerProps>) => unknown): this {
    callback(this.container);
    return this;
  }

  public enterSubuserContextMenu(
    callback: (registry: ContextMenuRegistry<{ subuser: z.infer<typeof serverSubuserSchema> }>) => unknown,
  ): this {
    callback(this.subuserContextMenu);
    return this;
  }
}
