import type { OnMount } from '@monaco-editor/react';
import { Registry } from 'shared';

export class MonacoEditorRegistry implements Registry {
  public mergeFrom(other: this): this {
    this.onMountHandlers.push(...other.onMountHandlers);

    return this;
  }

  public onMountHandlers: OnMount[] = [];

  public addOnMountHandler(handler: OnMount): this {
    this.onMountHandlers.push(handler);
    return this;
  }
}
