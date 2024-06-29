from http.server import BaseHTTPRequestHandler
from typing import Any


class AuthLoginHandler:

    def __init__(self, request_handler: BaseHTTPRequestHandler, app: Any):
        self.request_handler = request_handler
        self.app = app

    def do_GET(self):

        print("AuthLoginHandler")
        print(self.request_handler.query)  # type: ignore

        self.request_handler.send_response(200)
        self.request_handler.send_header("Content-type", "text/html")
        self.request_handler.end_headers()
        self.request_handler.wfile.write(b"Hello, world!")


urls = {
    "/AuthLogin": AuthLoginHandler,
}


class WebRequestHandler(BaseHTTPRequestHandler):

    def log_message(self, format: str, *args: Any) -> None:
        if self.server.app.canLog:  # type: ignore
            self.server.app.log(format % args)  # type: ignore
        else:
            super().log_message(format, *args)

    def do_POST(self):
        pass

    def do_PUT(self):
        pass

    def do_DELETE(self):
        pass

    def do_HEAD(self):
        pass

    def do_GET(self):

        self.query = dict()

        query = dict()
        if "?" in self.path:
            self.extract_query_params(query)

        if self.path in urls:
            try:
                self.log_message(f"GET request,\nPath: {self.path}\n")
                handler = urls[self.path]
                handler(self, self.server.app).do_GET()  # type: ignore
            except Exception as e:
                if self.server.app.canLog:  # type: ignore
                    self.server.app.log(f"Server error: {e}")  # type: ignore
                self.send_error(500, "Server error")

    def extract_query_params(self, query):
        self.path, query_string = self.path.split("?", 1)
        for key_value in query_string.split("&"):
            key, value = key_value.split("=")
            query[key] = value
        self.query = query
