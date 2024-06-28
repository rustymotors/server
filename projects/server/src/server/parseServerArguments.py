from server.env_default_action import EnvDefault


import argparse


def parseServerArguments():
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
    args = parser.parse_args()
    return args
