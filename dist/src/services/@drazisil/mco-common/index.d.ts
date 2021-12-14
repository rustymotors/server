import { EServerConnectionName } from '../mco-types';
export declare class RoutingMesh {
    static getInstance(): RoutingMesh;
    private constructor();
    registerServiceWithRouter(service: EServerConnectionName, host: string, port: number): void;
    private _sendToRouter;
}
