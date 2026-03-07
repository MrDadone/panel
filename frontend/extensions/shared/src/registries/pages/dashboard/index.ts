import type { FC } from 'react';
import { Registry } from 'shared';
import { AccountRegistry } from './account.ts';
import { ActivityRegistry } from './activity.ts';
import { ApiKeysRegistry } from './apiKeys.ts';
import { HomeRegistry } from './home.ts';
import { KeyboardShortcutsRegistry } from './keyboardShortcuts.ts';
import { OAuthLinksRegistry } from './oauthLinks.ts';
import { SecurityKeysRegistry } from './securityKeys.ts';
import { SessionsRegistry } from './sessions.ts';
import { SshKeysRegistry } from './sshKeys.ts';

export class DashboardRegistry implements Registry {
  public mergeFrom(other: this): this {
    this.home.mergeFrom(other.home);
    this.account.mergeFrom(other.account);
    this.securityKeys.mergeFrom(other.securityKeys);
    this.apiKeys.mergeFrom(other.apiKeys);
    this.sshKeys.mergeFrom(other.sshKeys);
    this.oauthLinks.mergeFrom(other.oauthLinks);
    this.sessions.mergeFrom(other.sessions);
    this.keyboardShortcuts.mergeFrom(other.keyboardShortcuts);
    this.activity.mergeFrom(other.activity);

    this.prependedComponents.push(...other.prependedComponents);
    this.appendedComponents.push(...other.appendedComponents);

    return this;
  }

  public home: HomeRegistry = new HomeRegistry();
  public account: AccountRegistry = new AccountRegistry();
  public securityKeys: SecurityKeysRegistry = new SecurityKeysRegistry();
  public apiKeys: ApiKeysRegistry = new ApiKeysRegistry();
  public sshKeys: SshKeysRegistry = new SshKeysRegistry();
  public oauthLinks: OAuthLinksRegistry = new OAuthLinksRegistry();
  public sessions: SessionsRegistry = new SessionsRegistry();
  public keyboardShortcuts: KeyboardShortcutsRegistry = new KeyboardShortcutsRegistry();
  public activity: ActivityRegistry = new ActivityRegistry();

  public prependedComponents: FC[] = [];
  public appendedComponents: FC[] = [];

  public enterHome(callback: (registry: HomeRegistry) => unknown): this {
    callback(this.home);
    return this;
  }

  public enterAccount(callback: (registry: AccountRegistry) => unknown): this {
    callback(this.account);
    return this;
  }

  public enterSecurityKeys(callback: (registry: SecurityKeysRegistry) => unknown): this {
    callback(this.securityKeys);
    return this;
  }

  public enterApiKeys(callback: (registry: ApiKeysRegistry) => unknown): this {
    callback(this.apiKeys);
    return this;
  }

  public enterSshKeys(callback: (registry: SshKeysRegistry) => unknown): this {
    callback(this.sshKeys);
    return this;
  }

  public enterOAuthLinks(callback: (registry: OAuthLinksRegistry) => unknown): this {
    callback(this.oauthLinks);
    return this;
  }

  public enterSessions(callback: (registry: SessionsRegistry) => unknown): this {
    callback(this.sessions);
    return this;
  }

  public enterKeyboardShortcuts(callback: (registry: KeyboardShortcutsRegistry) => unknown): this {
    callback(this.keyboardShortcuts);
    return this;
  }

  public enterActivity(callback: (registry: ActivityRegistry) => unknown): this {
    callback(this.activity);
    return this;
  }

  public prependComponent(component: FC): this {
    this.prependedComponents.push(component);
    return this;
  }

  public appendComponent(component: FC): this {
    this.appendedComponents.push(component);
    return this;
  }
}
