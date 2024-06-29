from server.TCPRequestHandler import TCPRequestHandler
from server.tkservers import tkTCPServer


import tkinter as tk

allowed_backlog = 5


def setupTCPServer(
    tkApp: tk.Frame, port: int, handler=TCPRequestHandler
) -> tkTCPServer:
    server = tkTCPServer(("localhost", port), handler, tkApp)
    server.allow_reuse_address = True
    server.server_bind()
    server.socket.listen(allowed_backlog)
    return server
