import type { ReactNode } from 'react';
import { Registry } from 'shared';

export class PermissionIconRegistry implements Registry {
  public userPermissionIcons: Record<string, ReactNode> = {};
  public adminPermissionIcons: Record<string, ReactNode> = {};
  public serverPermissionIcons: Record<string, ReactNode> = {};

  public mergeFrom(other: this): this {
    for (const [k, v] of Object.entries(other.userPermissionIcons)) {
      this.userPermissionIcons[k] = v;
    }
    for (const [k, v] of Object.entries(other.adminPermissionIcons)) {
      this.adminPermissionIcons[k] = v;
    }
    for (const [k, v] of Object.entries(other.serverPermissionIcons)) {
      this.serverPermissionIcons[k] = v;
    }

    return this;
  }

  public addUserPermissionIcon(group: string, icon: ReactNode): this {
    this.userPermissionIcons[group] = icon;

    return this;
  }

  public addAdminPermissionIcon(group: string, icon: ReactNode): this {
    this.adminPermissionIcons[group] = icon;

    return this;
  }

  public addServerPermissionIcon(group: string, icon: ReactNode): this {
    this.serverPermissionIcons[group] = icon;

    return this;
  }
}
