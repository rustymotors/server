#!/usr/bin/env python3


from server import BinaryFileRunner


path = "/home/drazisil/Downloads/MCO/mcity.exe"


def main():
    print("Hello World!")

    binary_file_runner = BinaryFileRunner.from_path(path)
    if binary_file_runner is not None:
        print(binary_file_runner)
        binary_file_runner.run()


if __name__ == "__main__":
    main()
