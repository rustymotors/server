import argparse
import tkinter as tk

from server.TCPRequestHandler import TCPRequestHandler
from server.WebRequestHandler import WebRequestHandler
from server.env_default_action import EnvDefault
from server.setupTCPServer import setupTCPServer
from server.tkservers import tkHTTPServer
from select import poll, POLLIN
from socketserver import ThreadingTCPServer
from http.server import ThreadingHTTPServer
import sys

root = tk.Tk()


class RustyMotorsServer(tk.Frame):
    """
    A class representing the Rusty Motors Server.

    This server provides a graphical user interface (GUI) for controlling and monitoring
    various servers used in the Rusty Motors project.

    Args:
        master: The master widget.

    Attributes:
        args: The parsed server arguments.
        http_server: The HTTP server instance.
        login_server: The login server instance.
        persona_server: The persona server instance.
        lobby_server: The lobby server instance.
        mcots_server: The MCOTS server instance.
        fdMapper: A dictionary mapping file descriptors to server instances.
        poller: The poller instance for handling incoming connections.

    Extends:
        tk.Frame
    """

    def __init__(
        self,
        args,
        master=None,
    ):
        self.canLog = False
        self.poll_interval = 100

        self.args = args or self.parse_args()

        try:
            self.initialize_gui_and_servers(master)
        except Exception as e:
            print(e)
            sys.exit(1)

    def parse_args(self):
        """
        Parse the command line arguments for the server.

        Returns:
            args (argparse.Namespace): The parsed command line arguments.
        """
        parser = argparse.ArgumentParser()
        parser.add_argument(
            "--server-address",
            action=EnvDefault,
            envvar="SERVER_ADDRESS",
            default="0.0.0.0",
            help="The address to bind the server to. Default: 0.0.0.0. \
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
        return parser.parse_args()

    def log(self, message: str, type: str = "info"):
        if self.canLog:
            self.log_text.insert(tk.END, message, type)
            self.log_text.insert(tk.END, "\n", type)
            self.log_text.see(tk.END)
        else:
            print(message)

    def initialize_gui_and_servers(self, master):
        self.initialize_gui(master)

        self.registerKeyboardBinding()

        self.initializeServers()

    def initialize_gui(self, master):
        tk.Frame.__init__(self, master)
        self.grid()
        root.title("Rusty Motors Server")
        tk.Label(self, text="Rusty Motors Server").grid(row=0, column=0)
        tk.Button(self, text="Quit", command=self.shutdown).grid(row=1, column=1)
        # Create a Label for log messages
        self.log_label = tk.Label(self, text="Log messages will appear here")
        # Create a scrollbar for the log
        self.scrollbar = tk.Scrollbar(self, orient="vertical")
        # Create a read-only Text widget to display the log
        self.log_text = tk.Text(
            self,
            height=10,
            width=50,
            yscrollcommand=self.scrollbar.set,
            wrap="word",
        )
        self.log_text.tag_config("input", foreground="blue")
        self.log_text.tag_config("error", foreground="red")
        # Create an entry widget for user input
        self.entry = tk.Entry(self, width=50)

        # Place the widgets on the grid
        self.log_label.grid(row=2, column=0)
        self.scrollbar.grid(row=3, column=1, sticky="ns")
        self.log_text.grid(row=3, column=0)
        self.entry.grid(row=4, column=0)
        # Configure the scrollbar to scroll the log_text widget
        self.scrollbar.config(command=self.log_text.yview)
        self.canLog = True

    def processUserInput(self):
        self.log(f"User input: {self.entry.get()}", "input")
        self.entry.delete(0, tk.END)

    def initializeServers(self):
        # Setup HTTP server
        self.log(f"Starting HTTP server on {self.args.server_address}:{self.args.port}")
        self.http_server = tkHTTPServer(
            (self.args.server_address, int(self.args.port)), WebRequestHandler, self
        )
        self.http_server.allow_reuse_address = True
        self.http_server.server_bind()
        self.http_server.socket.listen(5)

        try:
            self.login_server = setupTCPServer(self, 8226, TCPRequestHandler)
            self.persona_server = setupTCPServer(self, 8228, TCPRequestHandler)
            self.lobby_server = setupTCPServer(self, 7003, TCPRequestHandler)
            self.mcots_server = setupTCPServer(self, 43300, TCPRequestHandler)
        except OSError as e:
            self.canLog = False
            raise Exception(f"Cannot bind to port {e}")

        self.fdMapper: dict[int, ThreadingHTTPServer | ThreadingTCPServer] = {
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
        self.log("Registered all sockets")

    def shutdown(self):
        self.log("Shutting down servers...")
        if hasattr(self, "http_server"):
            self.http_server.server_close()
        if hasattr(self, "login_server"):
            self.login_server.server_close()
        if hasattr(self, "persona_server"):
            self.persona_server.server_close()
        if hasattr(self, "lobby_server"):
            self.lobby_server.server_close()
        if hasattr(self, "mcots_server"):
            self.mcots_server.server_close()
        self.quit()

    def pollingProcess(self):
        incoming = self.poller.poll(1)

        if len(incoming) == 0:
            self.checkServersForData()
            return

        for fd, event in incoming:
            if event == POLLIN:
                self.handle_incoming(fd)

        self.checkServersForData()

    def checkServersForData(self):
        self.after(self.poll_interval, self.pollingProcess)

    def handle_incoming(self, fd):
        server = self.fdMapper[fd]
        self.log(f"Handling incoming connection on port {server.server_address[1]}")
        server.handle_request()

    def registerKeyboardBinding(self):
        self.master.bind("x", lambda event: self.shutdown())
        # On attempting to focuse on the log_entry widget, the focus will be set to the entry widget
        self.log_text.bind("<FocusIn>", lambda event: self.entry.focus_set())
        self.entry.bind("<Return>", lambda event: self.processUserInput())

    def run(self):
        self.checkServersForData()
        self.mainloop()
