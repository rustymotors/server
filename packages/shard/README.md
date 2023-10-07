# MCOS - Shard Service

The shard service exposing the following endpoints to the gateway service:

-   `/cert`: Serves the SSL certificate that need to be installed on the client as a root cert in order for the `AuthLogin` server be trusted by Windows
-   `/key`: Serves the pubject keyfile (in DES encoding) that is used by the client when communicating with the server
-   `/registry`: Serves a generated Windows Registry .reg file that can be installed on the client to change settings from the defaults to the values needed to connect to MCOS from the client
-   `/ShardList/`: Serves the generated shard list that is requested by the client to locate available game servers
