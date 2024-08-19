# Configuring the client to connect to the server

~**Important!:** You must use a newer version of Windows. Windows XP is unable to use the encryption ciphers needed to talk to the server~

You are probably best off using XP. Since the encryption ciphers used by the client are so weak, Anything higher might have a fit. Hence the SSLProxy container.

---

This currently has only been tested with the debug version of the client. If you don't have those files and instructions the server _might_ work, but is not currently supported.

## Registry

-   Copy the mco.reg file from `https://<server>/registry`.
-   Double-click the registry file to import and overwrite the default registry settings for the client.

### Client/Server Encryption Setup

-   Copy the pub.key file from `http://<server>/key` to the client game directory. Overwrite when prompted.
-   Download the SSL cert from `http://<server>/cert` and add it to the Trusted Root Store.

(_This can be done by opening a `Run... (Win+R) > MMC (Microsoft Management Console) > Add/Remove Snap-in > Available snap-ins, click Certificates > select Computer account and Local computer > double-click on Certificates > right-click on Trusted Root Certification Authorities Store > All tasks, select Import > Locate the cert.pem file > Finish`_)

!! Please make sure to restart the browser afterwards !!

### Change the graphics settings

In <game dir>\SaveData\options.ini, change the value `graphicsModeIndex=<value>`, according to resolution list:

-   `0` for 640x480
-   `1` for 800x600
-   `2` for 1024x768
-   `3` for 1152x864
-   `4` for 1280x960

### Disable the movies

You can delete the `<game dir>\Data\Movies` folder, or start the game with parameter `-nomovie` (_Create a shortcut for debug executable_).

### Windows 10 Compatibility settings

Please note, I'm not convinced this works anymore, I went back to my XP install.

-   Disable fullscreen (In some cases, fullscreen will work fine, to switch between window and fullscreen modes use Alt+Enter buttons).

-   Tell Windows to run in 16-bit color mode
