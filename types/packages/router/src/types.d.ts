export type ServerConnectionRecord = {
    action?: EServerConnectionAction;
    service: EServerConnectionService;
    host: string;
    port: number;
};
export type EServerConnectionService = string;
export namespace EServerConnectionService {
    const ADMIN: string;
    const AUTH: string;
    const MCSERVER: string;
    const PATCH: string;
    const PROXY: string;
    const SHARD: string;
    const DATABASE: string;
}
export type EServerConnectionAction = string;
export namespace EServerConnectionAction {
    const REGISTER_SERVICE: string;
}
export type EServiceQuery = string;
export namespace EServiceQuery {
    const GET_CONNECTIONS: string;
}
