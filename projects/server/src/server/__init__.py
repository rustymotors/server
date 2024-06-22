import tkinter as tk
from socket import socket, SOL_SOCKET, SO_REUSEADDR
import argparse
import os


class EnvDefault(argparse.Action):
    def __init__(self, envvar, required=True, default=None, **kwargs):
        if envvar:
            if envvar in os.environ:
                default = os.environ[envvar]
        if required and default:
            required = False
        super(EnvDefault, self).__init__(default=default, required=required, **kwargs)

    def __call__(self, parser, namespace, values, option_string=None):
        setattr(namespace, self.dest, values)


class RustyMotorsServer(tk.Frame):
    def __init__(
        self,
        master=None,
    ):
        tk.Frame.__init__(self, master)
        self.grid()
        tk.Label(self, text="Hello World!").grid(column=0, row=0)
        tk.Button(self, text="Quit", command=self.quit).grid(column=1, row=0)

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
            default=12345,
            help="The port to bind the server to. Default: 12345. Can be set with the PORT environment variable.",
        )
        parser.add_help = True
        args = parser.parse_args()

        self.server_address = str(args.server_address)
        self.port = int(args.port)

        self.server_socket = socket()
        self.server_socket.setsockopt(SOL_SOCKET, SO_REUSEADDR, 1)
        self.server_socket.bind((self.server_address, self.port))

        if self.server_socket is not None:
            self.server_socket.listen(1)
            print(f"Server listening on {self.server_address}:{self.port}")
            self.server_socket.setblocking(False)
            self.after(1000, self.try_accept, self.server_socket)
        else:
            print("Unable to start server.")
            exit(1)

    def try_accept(self, sock: socket):
        try:
            client_socket, client_address = sock.accept()
            print(f"Connection from {client_address}")
            client_socket.sendall(b"Hello World!")
            # client_socket.close()
            self.after(1000, self.try_accept, sock)
        except BlockingIOError:
            self.after(1000, self.try_accept, sock)

    def run(self):
        self.mainloop()
