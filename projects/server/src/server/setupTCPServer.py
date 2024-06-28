from server.TCPRequestHandler import TCPRequestHandler
from server.tkservers import tkTCPServer


import tkinter as tk


def setupTCPServer(tkApp: tk.Frame, port: int, handler) -> tkTCPServer:
    server = tkTCPServer(("localhost", port), TCPRequestHandler, tkApp)
    server.allow_reuse_address = True
    server.server_bind()
    server.socket.listen(5)
    return server