import { Registry } from 'shared';
import { MonacoEditorRegistry } from './monacoEditor.ts';

export class ElementsRegistry implements Registry {
  public mergeFrom(other: this): this {
    this.monacoEditor.mergeFrom(other.monacoEditor);

    return this;
  }

  public monacoEditor: MonacoEditorRegistry = new MonacoEditorRegistry();

  public enterMonacoEditor(callback: (registry: MonacoEditorRegistry) => unknown): this {
    callback(this.monacoEditor);
    return this;
  }
}
