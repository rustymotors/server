require 'webrick'
require 'webrick/https'
require 'openssl'

oldCiphers = [
    "ECDHE-ECDSA-CHACHA20-POLY1305",
    "ECDHE-RSA-CHACHA20-POLY1305",
    "ECDHE-RSA-AES128-GCM-SHA256",
    "ECDHE-ECDSA-AES128-GCM-SHA256",
    "ECDHE-RSA-AES256-GCM-SHA384",
    "ECDHE-ECDSA-AES256-GCM-SHA384",
    "DHE-RSA-AES128-GCM-SHA256",
    "DHE-DSS-AES128-GCM-SHA256",
    "kEDH+AESGCM",
    "ECDHE-RSA-AES128-SHA256",
    "ECDHE-ECDSA-AES128-SHA256",
    "ECDHE-RSA-AES128-SHA",
    "ECDHE-ECDSA-AES128-SHA",
    "ECDHE-RSA-AES256-SHA384",
    "ECDHE-ECDSA-AES256-SHA384",
    "ECDHE-RSA-AES256-SHA",
    "ECDHE-ECDSA-AES256-SHA",
    "DHE-RSA-AES128-SHA256",
    "DHE-RSA-AES128-SHA",
    "DHE-DSS-AES128-SHA256",
    "DHE-RSA-AES256-SHA256",
    "DHE-DSS-AES256-SHA",
    "DHE-RSA-AES256-SHA",
    "ECDHE-RSA-DES-CBC3-SHA",
    "ECDHE-ECDSA-DES-CBC3-SHA",
    "EDH-RSA-DES-CBC3-SHA",
    "AES128-GCM-SHA256",
    "AES256-GCM-SHA384",
    "AES128-SHA256",
    "AES256-SHA256",
    "AES128-SHA",
    "AES256-SHA",
    "AES",
    "DES-CBC3-SHA",
    "HIGH",
    "SEED",
    "!aNULL",
    "!eNULL",
    "!EXPORT",
    "!DES",
    "!RC4",
    "!MD5",
    "!PSK",
    "!RSAPSK",
    "!aDH",
    "!aECDH",
    "!EDH-DSS-DES-CBC3-SHA",
    "!KRB5-DES-CBC3-SHA",
    "!SRP",
  ];

  options_mask = OpenSSL::SSL::OP_NO_SSLv3

cert = OpenSSL::X509::Certificate.new File.read './data/cert.pem'
pkey = OpenSSL::PKey::RSA.new File.read './data/private_key.pem'

server = WEBrick::HTTPServer.new(:Port => 443,
                                 :SSLEnable => true,
                                 :SSLCertificate => cert,
                                 :SSLPrivateKey => pkey,
                                 :SSLCiphers => oldCiphers.join(':'),
                                 :SSL_Options => options_mask )

class Simple < WEBrick::HTTPServlet::AbstractServlet
    def do_GET request, response
    #   status, content_type, body = do_stuff_with request
  
      response.status = 200
      response['Content-Type'] = 'text/plain'
      response.body = 'Valid=TRUE\nTicket=d316cd2dd6bf870893dfbaaf17f965884e'
    end
  end

server.mount '/AuthLogin?', Simple

  trap 'INT' do server.shutdown end

    server.start