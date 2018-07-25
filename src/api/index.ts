


export function handleAPIRequest(request, response, connectionMgr) {
    const { cmd, data } = request.body;
    switch (cmd) {
        case "getConnectionById":
            // console.log(connectionMgr.findConnectionById(Number.parseInt(args[0])));
            break;

        case "getConnectionByIp":
            // console.log(
            //     connectionMgr.findConnectionByAddressAndPort(
            //         args[0],
            //         Number.parseInt(args[1])
            //     )
            // );

            break;
        case "getConnections":
            const connectionsList = connectionMgr.dumpConnections().map((connection => {
                const { id, remoteAddress, localPort, remotePort } = connection
                return { id, remoteAddress, localPort, remotePort }
            }))
            response.send(connectionsList);

            break;
        case "exit":
            response.send("Goodbye!");
            process.exit();
            break;
        default:
            response.send(request.body)
            break;
    }
}
