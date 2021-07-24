export enum EServerConnectionName {
  AUTH = 'Auth',
  SHARD = 'Shard',
  PATCH = 'Patch',
  MCSERVER = 'MCServer',
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
