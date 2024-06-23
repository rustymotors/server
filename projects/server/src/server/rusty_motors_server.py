import argparse
import tkinter as tk
from .env_default_action import EnvDefault
from select import poll, POLLIN
from socketserver import BaseRequestHandler, ThreadingTCPServer
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


class WebRequestHandler(BaseHTTPRequestHandler):

    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
        self.wfile.write(b"Hello World!")


class TCPRequestHandler(BaseRequestHandler):

    def handle(self):
        print(f"Received connection from {self.client_address}")
        data = self.request.recv(1024)
        print(f"Received data: {data}")


class RustyMotorsServer(tk.Frame):
    def __init__(
        self,
        master=None,
    ):
        tk.Frame.__init__(self, master)
        self.grid()
        tk.Label(self, text="Hello World!").grid(column=0, row=0)
        tk.Button(self, text="Quit", command=self.shutdown).grid(column=1, row=0)

        self.bindings()

        parser = argparse.ArgumentParser()
        parser.add_argument(
            "--server-address",
            action=EnvDefault,
            envvar="SERVER_ADDRESS",
            default="localhost",
            help="The address to bind the server to. Default: localhost. \
            Can be set with the SERVER_ADDRESS environment variable.",
        )
        parser.add_argument(
            "--port",
            action=EnvDefault,
            envvar="PORT",
            default=3000,
            help="The port to bind the server to. Default: 3000. Can be set with the PORT environment variable.",
        )
        parser.add_argument(
            "--external-host",
            action=EnvDefault,
            envvar="EXTERNAL_HOST",
            default="localhost",
            help="The external host to tell clients to connect to. Default: localhost. \
            Can be set with the EXTERNAL_HOST environment variable.",
        )
        args = parser.parse_args()

        # Setup HTTP server
        self.http_server = ThreadingHTTPServer(
            (args.server_address, args.port), WebRequestHandler
        )
        self.http_server.socket.fileno()

        self.login_server = ThreadingTCPServer(("localhost", 8226), TCPRequestHandler)
        self.persona_server = ThreadingTCPServer(("localhost", 8228), TCPRequestHandler)
        self.lobby_server = ThreadingTCPServer(("localhost", 7003), TCPRequestHandler)
        self.mcots_server = ThreadingTCPServer(("localhost", 43300), TCPRequestHandler)

        self.fdMapper: dict[int, ThreadingHTTPServer | TCPRequestHandler] = {
            self.http_server.socket.fileno(): self.http_server,
            self.login_server.fileno(): self.login_server,
            self.persona_server.fileno(): self.persona_server,
            self.lobby_server.fileno(): self.lobby_server,
            self.mcots_server.fileno(): self.mcots_server,
        }

        self.poller = poll()
        self.poller.register(self.http_server.socket, POLLIN)
        self.poller.register(self.login_server, POLLIN)
        self.poller.register(self.persona_server, POLLIN)
        self.poller.register(self.lobby_server, POLLIN)
        self.poller.register(self.mcots_server, POLLIN)
        print("Registered all sockets")

        self.after(1000, self.try_poll)

    def shutdown(self):
        print("Shutting down server")
        self.quit()

    def try_poll(self):
        incoming = self.poller.poll(1)

        if len(incoming) == 0:
            self.after(1000, self.try_poll)
            return

        for fd, event in incoming:
            if event == POLLIN:
                self.handle_incoming(fd)

        self.after(1000, self.try_poll)

    def handle_incoming(self, fd):
        server = self.fdMapper[fd]
        print(f"Handling incoming connection from {server}")
        server.handle_request()

    def bindings(self):
        self.master.bind("x", lambda event: self.shutdown())

    def run(self):
        self.mainloop()
