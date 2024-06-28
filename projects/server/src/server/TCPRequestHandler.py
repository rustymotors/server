from socketserver import BaseRequestHandler
from typing import Any


class TCPRequestHandler(BaseRequestHandler):

    def log_message(self, format: str, *args: Any) -> None:
        if self.server.app.canLog:  # type: ignore
            self.server.app.log(format % args)  # type: ignore
        else:
            print(format % args)

    def handle(self):
        self.log_message(f"Connection from {self.client_address}")
        data = self.request.recv(1024)
        self.log_message(f"Received {data}")
