export enum EServerConnectionName {
  ADMIN = 'Admin',
  AUTH = 'Auth',
  MCSERVER = 'MCServer',
  PATCH = 'Patch',
  PROXY = 'Proxy',
  SHARD = 'Shard',
}

export enum EServerConnectionAction {
  REGISTER_SERVICE = 'Register Service',
}

export enum EServiceQuery {
  GET_CONNECTIONS = 'Get connections',
}

export interface IServerConnection {
  action?: EServerConnectionAction
  service: EServerConnectionName
  host: string
  port: number
}
