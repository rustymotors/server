# Configuring the client to connect to the server

**Important!:** You must use a newer version of Windows. Windows XP is unable to use the encryption ciphers needed to talk to the server

---

This currently has only been tested with the debug version of the client. If you don't have those files and instructions the server _might_ work, but is not currently supported.

## Registry

- Copy the mco.reg file from `https://<server>/registry`.
- Double-click the registry file to import and overwrite the default registry settings for the client.

### Client/Server Encryption Setup

- Copy the pub.key file from `https://<server>/key` to the client game directory. Overwrite when prompted.
- Download the SSL cert from `https://<server>/cert` and add it to the Trusted Root Store.

(_This can be done by opening a `Run... (Win+R) > MMC (Microsoft Management Console) > Add/Remove Snap-in > Available snap-ins, click Certificates > select Computer account and Local computer > double-click on Certificates > right-click on Trusted Root Certification Authorities Store > All tasks, select Import > Locate the cert.pem file > Finish`_)

### Change the graphics settings

In <game dir>\SaveData\options.ini, change `graphicsModeIndex=<value>`, according to resolution list:

- `1` for 640x480
- `2` for 800x600
- `3` for 1360x768
- `4` for 1280x1024
  
(thanks to [@VladManyanov](https://github.com/VladManyanov) for the tip)

### Disable the movies

You can delete the `<game dir>\Data\Movies` folder, or start the game with parameter `-nomovie` (_Create a shortcut for debug executable_).

### Windows 10 Compatibility settings

- Disable fullscreen (In some cases, fullscreen will work fine, to switch between window and fullscreen modes use Alt+Enter buttons).
