from .authlogin import handle_authlogin


class TestAuthLogin(object):
    def test_handle_authlogin(self):
        assert 'Ticket' in handle_authlogin('user', 'pass')
