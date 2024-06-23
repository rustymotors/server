from unittest.mock import patch
from server.rusty_motors_server import RustyMotorsServer


def test_shutdown():
    server = RustyMotorsServer()
    with patch.object(server, "quit") as mock_quit:
        server.shutdown()
        mock_quit.assert_called_once()
