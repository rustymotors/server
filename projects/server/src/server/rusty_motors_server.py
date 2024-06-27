import argparse
import tkinter as tk

from server.TCPRequestHandler import TCPRequestHandler
from server.WebRequestHandler import WebRequestHandler
from .env_default_action import EnvDefault
from select import poll, POLLIN
from socketserver import ThreadingTCPServer
from http.server import ThreadingHTTPServer
import sys


class RustyMotorsServer(tk.Frame):
    def __init__(
        self,
        master=None,
    ):
        self.args = self.parseServerArguments()

        self.initialize_gui_and_servers(master)

    def initialize_gui_and_servers(self, master):
        self.initialize_gui(master)

        self.registerKeyboardBinding()

        self.initializeServers()

    def initialize_gui(self, master):
        tk.Frame.__init__(self, master)
        self.grid()
        tk.Wm.title(self.master, "Rusty Motors Server")
        tk.Label(self, text="Rusty Motors Server").grid(row=0, column=0)
        tk.Button(self, text="Quit", command=self.shutdown).grid(row=1, column=1)
        # Create a Label for log messages
        self.log = tk.Label(self, text="Log messages will appear here")
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
        # Create an entry widget for user input
        self.entry = tk.Entry(self, width=50, invcmd=self.processUserInput)

        # Place the widgets on the grid
        self.log.grid(row=2, column=0)
        self.scrollbar.grid(row=3, column=1, sticky="ns")
        self.log_text.grid(row=3, column=0)
        self.entry.grid(row=4, column=0)
        # Configure the scrollbar to scroll the log_text widget
        self.scrollbar.config(command=self.log_text.yview)

        # Redirect stdout to the log_text widget
        self.messageLogger()

    def processUserInput(self):
        self.log_text.insert(tk.END, self.entry.get(), "green")

    def messageLogger(self):
        class StdoutRedirector:
            def __init__(self, text_widget, message_type="stdout"):
                self.text_widget = text_widget

                if message_type == "stdout":
                    self.color = "black"
                elif message_type == "stderr":
                    self.color = "red"

            def write(self, message):
                self.text_widget.insert(tk.END, message, self.color)
                self.text_widget.see(tk.END)

        sys.stdout = StdoutRedirector(self.log_text, message_type="stdout")
        sys.stderr = StdoutRedirector(self.log_text, message_type="stderr")

    def initializeServers(self):
        # Setup HTTP server
        self.http_server = ThreadingHTTPServer(
            (self.args.server_address, self.args.port), WebRequestHandler
        )

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

    def parseServerArguments(self):
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
        return args

    def shutdown(self):
        print("Shutting down server")
        self.http_server.server_close()
        self.login_server.server_close()
        self.persona_server.server_close()
        self.lobby_server.server_close()
        self.mcots_server.server_close()
        self.quit()

    def pollingProcess(self):
        incoming = self.poller.poll(1)

        if len(incoming) == 0:
            self.after(1000, self.pollingProcess)
            return

        for fd, event in incoming:
            if event == POLLIN:
                self.handle_incoming(fd)

        self.after(1000, self.pollingProcess)

    def handle_incoming(self, fd):
        server = self.fdMapper[fd]
        print(f"Handling incoming connection from {server}")
        server.handle_request()

    def registerKeyboardBinding(self):
        self.master.bind("x", lambda event: self.shutdown())
        # On attempting to focuse on the log_entry widget, the focus will be set to the entry widget
        self.log_text.bind("<FocusIn>", lambda event: self.entry.focus_set())
        self.entry.bind("<Return>", lambda event: self.processUserInput())

    def run(self):
        self.after(1000, self.pollingProcess)
        self.mainloop()
