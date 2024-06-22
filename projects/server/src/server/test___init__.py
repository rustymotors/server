import unittest
from unittest.mock import MagicMock
from server import RustyMotorsServer


class TestRustyMotorsServer(unittest.TestCase):
    def test_init(self):
        # Create a mock master object
        master = MagicMock()

        # Create an instance of RustyMotorsServer
        server = RustyMotorsServer(master)

        # Assert that the server's master attribute is set correctly
        self.assertEqual(server.master, master)

        # Assert that the server's server_socket attribute is not None
        self.assertIsNotNone(server.server_socket)

        # Assert that the server's server_socket is set to non-blocking mode
        self.assertFalse(server.server_socket.getblocking())


if __name__ == "__main__":
    unittest.main()