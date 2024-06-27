from socketserver import BaseRequestHandler


class TCPRequestHandler(BaseRequestHandler):

    def handle(self):
        print(f"Received connection from {self.client_address}")
        data = self.request.recv(1024)
        print(f"Received data: {data}")
