from http.server import BaseHTTPRequestHandler
from typing import Any


class WebRequestHandler(BaseHTTPRequestHandler):

    def log_message(self, format: str, *args: Any) -> None:
        print(f"Reccieved request: {format % args}")
        return super().log_message(format, *args)

    def do_GET(self):

        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
        self.wfile.write(b"Hello World!")
