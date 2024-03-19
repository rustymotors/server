import { IRoute } from "../types.js";

function getServerHealth(): string {
    return "Server is healthy";
}
export function healthEndpoint(): IRoute {
    return {
        canHandle: (url, method) => url === "/health" && method === "GET",
        async handle(request, response) {
            response.writeHead(200);
            response.end(getServerHealth());
        },
    };
}
