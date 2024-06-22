#!/usr/bin/env python3


from server import RustyMotorsServer


path = "/home/drazisil/Downloads/MCO/mcity.exe"


def main():
    print("Hello World!")

    server = RustyMotorsServer()
    if server is not None:
        server.run()
    else:
        print("Unable to start server.")
        exit(1)


if __name__ == "__main__":
    main()
