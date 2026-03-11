import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { ContainerRegistry, Registry } from 'shared';
import type { Props as ContainerProps } from '@/elements/containers/ServerContentContainer.tsx';
import { ComponentListRegistry } from '../../slices/componentList.ts';
import { ContextMenuRegistry } from '../../slices/contextMenu.ts';

type FileIconHandler = (file: DirectoryEntry) => IconDefinition | undefined;

export class FilesRegistry implements Registry {
  public mergeFrom(other: this): this {
    this.container.mergeFrom(other.container);
    this.editorContainer.mergeFrom(other.editorContainer);
    this.fileToolbar.mergeFrom(other.fileToolbar);
    this.fileActionBar.mergeFrom(other.fileActionBar);
    this.fileOperationsProgress.mergeFrom(other.fileOperationsProgress);
    this.fileEditorSettings.mergeFrom(other.fileEditorSettings);
    this.fileImageViewerSettings.mergeFrom(other.fileImageViewerSettings);
    this.newFileContextMenu.mergeFrom(other.newFileContextMenu);
    this.fileContextMenu.mergeFrom(other.fileContextMenu);

    this.fileIconHandlers.push(...other.fileIconHandlers);

    return this;
  }

  public container: ContainerRegistry<ContainerProps> = new ContainerRegistry();
  public editorContainer: ContainerRegistry<ContainerProps> = new ContainerRegistry();
  public fileToolbar: ComponentListRegistry = new ComponentListRegistry();
  public fileActionBar: ComponentListRegistry = new ComponentListRegistry();
  public fileOperationsProgress: ComponentListRegistry = new ComponentListRegistry();
  public fileSettings: ComponentListRegistry = new ComponentListRegistry();
  public fileEditorSettings: ComponentListRegistry = new ComponentListRegistry();
  public fileImageViewerSettings: ComponentListRegistry = new ComponentListRegistry();
  public newFileContextMenu: ContextMenuRegistry = new ContextMenuRegistry();
  public fileContextMenu: ContextMenuRegistry<{ file: DirectoryEntry }> = new ContextMenuRegistry();

  public fileIconHandlers: FileIconHandler[] = [];

  public addFileIconHandler(handler: FileIconHandler): this {
    this.fileIconHandlers.push(handler);
    return this;
  }

  public enterContainer(callback: (registry: ContainerRegistry<ContainerProps>) => unknown): this {
    callback(this.container);
    return this;
  }

  public enterEditorContainer(callback: (registry: ContainerRegistry<ContainerProps>) => unknown): this {
    callback(this.editorContainer);
    return this;
  }

  public enterFileToolbar(callback: (registry: ComponentListRegistry) => unknown): this {
    callback(this.fileToolbar);
    return this;
  }

  public enterFileActionBar(callback: (registry: ComponentListRegistry) => unknown): this {
    callback(this.fileActionBar);
    return this;
  }

  public enterFileOperationsProgress(callback: (registry: ComponentListRegistry) => unknown): this {
    callback(this.fileOperationsProgress);
    return this;
  }

  public enterFileSettings(callback: (registry: ComponentListRegistry) => unknown): this {
    callback(this.fileSettings);
    return this;
  }

  public enterFileEditorSettings(callback: (registry: ComponentListRegistry) => unknown): this {
    callback(this.fileEditorSettings);
    return this;
  }

  public enterFileImageViewerSettings(callback: (registry: ComponentListRegistry) => unknown): this {
    callback(this.fileImageViewerSettings);
    return this;
  }

  public enterNewFileContextMenu(callback: (registry: ContextMenuRegistry) => unknown): this {
    callback(this.newFileContextMenu);
    return this;
  }

  public enterFileContextMenu(callback: (registry: ContextMenuRegistry<{ file: DirectoryEntry }>) => unknown): this {
    callback(this.fileContextMenu);
    return this;
  }
}
