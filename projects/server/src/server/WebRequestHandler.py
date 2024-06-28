from http.server import BaseHTTPRequestHandler
from typing import Any


class WebRequestHandler(BaseHTTPRequestHandler):

    def log_message(self, format: str, *args: Any) -> None:
        if self.server.app.canLog:  # type: ignore
            self.server.app.log(format % args)  # type: ignore
        return super().log_message(format, *args)

    def do_GET(self):
        try:
            self.send_response(200)
            self.send_header("Content-type", "text/html")
            self.end_headers()
            self.wfile.write(b"Hello World!")
        except Exception as e:
            self.send_error(500, f"Server error: {e}")
            return
