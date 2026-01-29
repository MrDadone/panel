import { Registry } from 'shared';
import type { ContextMenuItem } from '@/elements/ContextMenu.tsx';

type ItemInterceptor = (items: ContextMenuItem[]) => ContextMenuItem[];

export class ContextMenuRegistry implements Registry {
  public mergeFrom(other: this): this {
    this.itemInterceptors.push(...other.itemInterceptors);

    return this;
  }

  public itemInterceptors: ItemInterceptor[] = [];

  public addItemInterceptor(interceptor: ItemInterceptor): this {
    this.itemInterceptors.push(interceptor);
    return this;
  }
}
