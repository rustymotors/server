#!/usr/bin/env python3


from server.rusty_motors_server import RustyMotorsServer
from sentry_sdk.integrations.socket import SocketIntegration

import sentry_sdk

sentry_sdk.init(
    dsn="https://3d28b6085dabc6e8ecd7b263df477ead@o1413557.ingest.us.sentry.io/4507356101476352",
    # Set traces_sample_rate to 1.0 to capture 100%
    # of transactions for tracing.
    traces_sample_rate=1.0,
    # Set profiles_sample_rate to 1.0 to profile 100%
    # of sampled transactions.
    # We recommend adjusting this value in production.
    profiles_sample_rate=1.0,
    integrations=[SocketIntegration()],
)


path = "/home/drazisil/Downloads/MCO/mcity.exe"


def main():
    print("Hello World!")

    server = RustyMotorsServer({})
    server.run()


if __name__ == "__main__":
    main()
