import sys
from tkinter import Text
import unittest
from unittest.mock import MagicMock, patch
from server.rusty_motors_server import RustyMotorsServer


class TestRustyMotorsServer(unittest.TestCase):
    def test_shutdown(self):
        server = RustyMotorsServer()
        with patch.object(server, "quit") as mock_quit:
            server.shutdown()
            mock_quit.assert_called_once()

    def test_messageLogger(self):

        # Create an instance of RustyMotorsServer
        server = RustyMotorsServer()
        # Create a mock Text widget
        server.log_text = MagicMock(spec=Text)

        # Call the messageLogger method with the mock Text widget
        server.messageLogger()

        # Verify that sys.stdout and sys.stderr are redirected to the mock Text widget
        self.assertEqual(sys.stdout.text_widget, server.log_text)
        self.assertEqual(sys.stderr.text_widget, server.log_text)
        server.shutdown()
