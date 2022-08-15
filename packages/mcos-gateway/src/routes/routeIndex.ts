import type { ISocketRecord } from "mcos-types";
import type { OutgoingHttpHeader, OutgoingHttpHeaders } from "node:http";
import { listSessions } from "../adminServer.js";
import { defaultAdminRoute } from "./defaultAdminRoute.js";
import { resetQueue } from "./resetQueue.js";
import { releaseQueue } from "./releaseQueue.js";
import { listSocketRecords } from "./listSocketRecords.js";
import { listConnections } from "./listConnections.js";

export type AdminServerResponse = Promise<{
    code: number;
    headers: OutgoingHttpHeaders | OutgoingHttpHeader[] | undefined | undefined;
    body: string;
}>;

export const routes: {
    routeMatch: (requestUrl: URL) => boolean;
    handler: (
        socketRecords: ISocketRecord[],
        requestUrl: URL
    ) => Promise<AdminServerResponse>;
}[] = [
    {
        routeMatch: function (requestUrl: URL): boolean {
            return requestUrl.pathname === "/admin/sockets";
        },
        handler: listSocketRecords,
    },
    {
        routeMatch: function (requestUrl: URL) {
            return requestUrl.pathname === "/admin/connections/resetQueue";
        },
        handler: resetQueue,
    },
    {
        routeMatch: function (requestUrl: URL) {
            return requestUrl.pathname === "/admin/connections";
        },
        handler: listConnections,
    },
    {
        routeMatch: function (requestUrl: URL) {
            return requestUrl.pathname === "/admin/sessions";
        },
        handler: listSessions,
    },
    {
        routeMatch: function (requestUrl: URL) {
            return requestUrl.pathname === "/admin/sockets";
        },
        handler: listSocketRecords,
    },
    {
        routeMatch: function (requestUrl: URL) {
            return (
                requestUrl.pathname === "/admin/connections/releaseQueue" &&
                requestUrl.searchParams.get("id") !== null
            );
        },
        handler: releaseQueue,
    },
    {
        routeMatch: function (requestUrl: URL) {
            return requestUrl.pathname.startsWith("/admin");
        },
        handler: defaultAdminRoute,
    },
];
