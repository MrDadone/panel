import { AdminRouteDefinition, GlobalRouteDefinition, Registry, RouteDefinition, ServerRouteDefinition } from 'shared';

export class RouteRegistry implements Registry {
  public mergeFrom(other: this): this {
    this.globalRoutes.push(...other.globalRoutes);
    this.authenticationRoutes.push(...other.authenticationRoutes);
    this.accountRoutes.push(...other.accountRoutes);
    this.adminRoutes.push(...other.adminRoutes);
    this.serverRoutes.push(...other.serverRoutes);

    return this;
  }

  public globalRoutes: GlobalRouteDefinition[] = [];
  public authenticationRoutes: GlobalRouteDefinition[] = [];
  public accountRoutes: RouteDefinition[] = [];
  public adminRoutes: AdminRouteDefinition[] = [];
  public serverRoutes: ServerRouteDefinition[] = [];

  public addGlobalRoute(route: GlobalRouteDefinition): this {
    this.globalRoutes.push(route);

    return this;
  }

  public addAuthenticationRoute(route: GlobalRouteDefinition): this {
    this.authenticationRoutes.push(route);

    return this;
  }

  public addAccountRoute(route: RouteDefinition): this {
    this.accountRoutes.push(route);

    return this;
  }

  public addAdminRoute(route: AdminRouteDefinition): this {
    this.adminRoutes.push(route);

    return this;
  }

  public addServerRoute(route: ServerRouteDefinition): this {
    this.serverRoutes.push(route);

    return this;
  }
}
