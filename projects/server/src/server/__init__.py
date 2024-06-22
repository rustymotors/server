import tkinter as tk
from socket import socket, create_server, SOL_SOCKET, SO_REUSEADDR

server_address = "localhost"
port = 80


class RustyMotorsServer(tk.Frame):
    def __init__(
        self,
        master=None,
    ):
        tk.Frame.__init__(self, master)
        self.grid()
        tk.Label(self, text="Hello World!").grid(column=0, row=0)
        tk.Button(self, text="Quit", command=self.quit).grid(column=1, row=0)

        self.server_socket = create_server((server_address, port))

        if self.server_socket is not None:
            self.server_socket.listen(1)
            self.server_socket.setsockopt(SOL_SOCKET, SO_REUSEADDR, 1)
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
