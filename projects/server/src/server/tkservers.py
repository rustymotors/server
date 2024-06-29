from http.server import ThreadingHTTPServer
from socketserver import ThreadingTCPServer
import tkinter as tk


class tkTCPServer(ThreadingTCPServer):
    def __init__(self, server_address, RequestHandlerClass, app: tk.Frame):
        super().__init__(server_address, RequestHandlerClass, False)
        self.app = app

    def fileno(self):
        return self.socket.fileno()


class tkHTTPServer(ThreadingHTTPServer):
    def __init__(self, server_address, RequestHandlerClass, app: tk.Frame):
        super().__init__(server_address, RequestHandlerClass, False)
        self.app = app

    def fileno(self):
        return self.socket.fileno()
