import { Registry } from 'shared';
import type { ContextMenuItem } from '@/elements/ContextMenu.tsx';

type ItemInterceptor<P> = (items: ContextMenuItem[], props: P) => ContextMenuItem[];

export class ContextMenuRegistry<Props = {}> implements Registry {
  public mergeFrom(other: this): this {
    this.itemInterceptors.push(...other.itemInterceptors);

    return this;
  }

  public itemInterceptors: ItemInterceptor<Props>[] = [];

  public addItemInterceptor(interceptor: ItemInterceptor<Props>): this {
    this.itemInterceptors.push(interceptor);
    return this;
  }
}
