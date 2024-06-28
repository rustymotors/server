from argparse import Namespace
from tkinter import Text
import unittest
from unittest.mock import MagicMock, patch
from server.rusty_motors_server import RustyMotorsServer


class TestRustyMotorsServer(unittest.TestCase):

    def test_shutdown(self):
        args: Namespace = Namespace(
            server_address="localhost",
            port="3000",
        )
        server = RustyMotorsServer(args)
        with patch.object(server, "quit") as mock_quit:
            server.shutdown()
            mock_quit.assert_called_once()

    def test_messageLogger(self):

        # Create an instance of RustyMotorsServer
        args: Namespace = Namespace(
            server_address="localhost",
            port="3000",
        )
        server = RustyMotorsServer(args)
        # Create a mock Text widget
        server.log_text = MagicMock(spec=Text)

        # Call the messageLogger method with the mock Text widget

        server.log("Hello, World!")

        # Assert that the mock Text widget's insert method was called once
        server.log_text.insert.was_called_with(1, "Hello, World!", "black")

        server.shutdown()
