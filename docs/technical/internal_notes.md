# Internal Notes

This document will serve as a framework for the internal breakdown and intra-service flow of information between services

## Services

### Gateway

#### Description

The Gateway service will accept all SSL and TCP connections as a raw network socket.

If the traffic is destined for a local TCP port that is extempting HTTP(S) traffic, the socket will be passed to an HTTP(s) server before being routed to the appropriate web service.

Otherwise, the incoming traffic will be checked to detrenmine if it matches the format for either a Game Packet, or a Transaction Packet, and deserialzed into the appropriate data structure if so. It will then be packaged and dispatched to the appropriate server, based on it's type and destination, along with a connection id.

If it does not match either of the above checks, it is silently discarded.

#### Sends

-   `{targetService: string, incomingData: Buffer, connectionId: string}`

#### Receives

-   `{eventType: string, connectionId: string} `
-   `{outboundData: Buffer | Buffer[]}`
