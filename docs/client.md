# Configuring the client to connect to the server

**Importent!:** You must use a newer version of Windows. Windows XP is unable to use the encryption ciphers needed to talk to the server

---

This currently has only been tested with the debug version of the client. If you don't have those files and instructions the server _might_ work, but is not currently supported.

## Registry

- copy `sample.reg` in the project root to a new file with the same extension
- Modify all instances of `dev.mco` in the new file to be your server's DNS or IP
- Double-click the registry file to import and overwrite the default registry settings for the client

### Client/Server Encryption Setup

- Copy the pub.key file from `https://<server>/key` to the client game directory. Overwrite when prompted.

- Download the SSL cert from `https://<server>/cert` and add it to the Trusted Root Store.

  You can find help doing this here <http://stackoverflow.com/a/2955546/335583>

### Delete the movies

`<game dir>\Data\Movies`

### Windows 10 Compatibility settings

- run in 640x480
- Disable fullscreen
