import { createServer, Socket, type Server } from "node:net";
import { createServer as createHttpServer } from "node:http";



interface socketListener {
    (socket: Socket): void;
}

interface ServerEntry {
    server: Server;
    name: string;
    port: number;
    listener: socketListener;
}

const tcpListener: socketListener = (socket) => {
    console.log("New connection from", socket.remoteAddress, ":", socket.remotePort);

    socket.on("data", (data) => {
        console.log("Received data from", socket.remoteAddress, ":", socket.remotePort, "-", data.toString());
        // Echo the data back to the client
        socket.write(data);
    });

    socket.on("close", () => {
        console.log("Connection closed from", socket.remoteAddress, ":", socket.remotePort);
    });

    socket.on("error", (err) => {
        console.error("Error on connection from", socket.remoteAddress, ":", socket.remotePort, "-", err);
    });
}

const httpListener: socketListener = (socket) => {
    console.log("New HTTP connection from", socket.remoteAddress, ":", socket.remotePort);

    const httpServer = createHttpServer((req, res) => {
        console.log("Received HTTP request from", socket.remoteAddress, ":", socket.remotePort, "-", req.method, req.url);

        console.log("Request Headers:", req.headers);

        const url = new URL(req.url || "", `http://${req.headers.host}`);
        console.log("Request URL:", url.pathname);
        const queryParams = Object.fromEntries(url.searchParams.entries());
        console.log("Query Parameters:", queryParams);

        console.log("Request Body:");

        req.on("data", (chunk) => {
            console.log(chunk.toString());
        }); 

        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Hello from the HTTP server!\n");
    });

    httpServer.on("error", (err) => {
        console.error("Error on HTTP connection from", socket.remoteAddress, ":", socket.remotePort, "-", err);
    });

    httpServer.emit("connection", socket);
}

const portConfigs:  { serverName: string; port: number; listener: socketListener }[] = [
    { serverName: "http", port: 3000, listener: httpListener },
    { serverName: "login", port: 8226, listener: tcpListener },
];

async function createServerWithListener(portName: string, port: number, listener: socketListener): Promise<ServerEntry> {
    return new Promise((resolve, reject) => {
        const server = createServer(listener);

        server.listen(port, () => {
            resolve({
                server,
                name: portName,
                port,
                listener,
            });
        });

        server.on("error", (err) => {
            reject(err);
        });
    });
}
    


(async () => {
    
    const servers: ServerEntry[] = [];

    for (const { serverName, port, listener } of portConfigs) {
        
        try {
            const serverEntry = await createServerWithListener(serverName, port, listener);
            servers.push(serverEntry);
        } catch (err) {
            console.error(`Failed to start ${serverName} server:`, err);
        }
    }

    for (const serverEntry of servers) {
        console.log(`Server ${serverEntry.name} is running on port ${serverEntry.port}`);
    }


})();
