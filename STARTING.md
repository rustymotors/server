# Getting started as a user

Documention type: Tutorial

Last updated: 40f6623947ee7a5c2ab90f9b1f64331c40180514

---

This project isn't really geared towards a player of the game, but if you want to try it out, this is how to do so:

## Requirements

// TODO: Link to the install docs for each item

-   Internet
-   Linux
-   Git
-   Docker
-   Docker Compose
-   NodeJS (v22.x)
-   NVM
-   The debug copy of the game

## Setup

After getting the requirements above ready, perform the following steps:

### On the computer where you are running the server

1. Open a terminal or command prompt
2. Type `git clone https://github.com/rustymotors/server.git rusty-server` and press enter
3. Type `cd rusty-server` and press enter
4. Type `./mcos/pull_nginx_image.sh` and press enter (this step may take a while, depending on your internet speed)
5. Type `docker-compose up -d` and press enter
6. Type `nvm install && nvm use` and press enter
7. Type `npm install` and press enter
8. Type `npm run build` and press enter
9. Type `cp .env.example .env` and press enter
10. Open the `.env` file with your favorite text editing program (the simpler the better) and edit the values as follows:
    a. `EXTERNAL_HOST=` - Add the hostname or ip of the computer you are running this server on. This value MUST be reachable from where you install the game.
    b. `CERTIFICATE_FILE=` - The relitive path from the `rusty-server` folder to the SSL certificate. If you want to use the one I have included with the repository (highly recomended), the value will be `data/mcouniverse.crt`
    c. `PRIVATE_KEY_FILE` - The path to the private key. Use `data/private_key.pem` for the working copy
    d. `PUBLIC_KEY_FILE` - The path to the public key. Use `data/pub.key` for the working copy
11. Type `npm start` and press enter
12. If the last message on your screen is `Server listening at http://0.0.0.0:3000`, then the server is running!

### On the computer where you are running the game

1. Open a web browser
2. In the address bar, type `<enternal_ip>/cert` where \<enternal_ip\> is the value you saved in the .env file on the server. Do not include the brackets, and press enter
3. Some text should load. The first line should contain `BEGIN CERTIFICATE`
4. Click "Save" when asked if you want to open or save
5. Select the folder you want to save in (I like the Desktop), but before you press "save", make sure to edit the file name so it says `"cert.crt"`. THE QUOTES ARE IMPORTANT
6. Sorry for the caps. Click "Save" if you haven't already
7. In the folder where you saved the certificate, you should see a file named "cert" with an icon that looks like a certificate. Double-click on it.

---

## 7.5. From this point on, I'm going to tell you to do a bunch of things that Windows will warn you NOT to do. This is because in order to have the game connect to our server we have to use some very old security methods that are no longer advised to be used. If you don't trust me, that's fine. But it won't work otherwise. Let's proceed.

8. We are looking at a windows that says "The CA Root Certificate is not trusted". Press "Install Certificate"
9. Click "Next"
10. You are now on a screen that asks where you want to save this certificate.
11. Click on the "Place all certificates in the following store" and click "browse"
12. Select "Trusted Root Certification Authorities". This should be the second one down.
13. Click "Ok"
14. Click "Next"
15. Click "Finish"
    16 You now have a window warning you that you are installing a untrusted root certificate that is unknown to Windows. Click "Yes"
16. Click "ok" and then click "Ok" again.
17. Return to your web browser.
18. In the address bar, type `<enternal_ip>/key` where \<enternal_ip\> is the value you saved in the .env file on the server. Do not include the brackets, and press enter
19. A long string of letters and numbers should load.
20. Click "Save" when asked if you want to open or save
21. Select the folder you want to save in (I like the Desktop), but before you press "save", make sure to edit the file name so it says `"pub.key"`. Again, make sure to include the quotes
22. Click "Save"
23. Copy the file you just saved to your game install folder. Tell Wndows it is ok to overwrite the existing file of the same name.
24. Return to your web browser
25. In the address bar, type `<enternal_ip>/registry` where \<enternal_ip\> is the value you saved in the .env file on the server. Do not include the brackets, and press enter
26. Some text will load. The first line should contain "Windows Registry Editor"
27. Click "Save" when asked if you want to open or save
28. Select the folder you want to save in (I like the Desktop), but before you press "save", make sure to edit the file name so it says `"client.reg"`. Again, make sure to include the quotes
29. Click "Save"

30. This next step has a slight change, depending on what version of Windows you have installed the game under
    a. If you are using Windows XP (or lower), you will need to edit this file we just save. To do so, right-click on the saved file and choose "edit"
    If Windows prompts you that the file is not signed, click "open".
    Every line that starts `HKEY_LOCAL_MACHINE\Software\WOW6432Node\`, change to say `HKEY_LOCAL_MACHINE\Software\`. Leve the rest of the line. Save.
    b. If you are using a version of Windows that is newer then Windows XP, no action is needed here
31. Double-click on the saved file.
32. f Windows prompts you that the file is not signed, click "open".
33. Windows will ask you if you are sure you want to import this registry file. Click "yes"
34. Click "Ok"

## Running

If you haven't followed all the steps under the Setup section, this will probably not work well

37. Double-click the debug copy of the game
38. These are the possible pre-created logins
    a. Username: "admin", Password: "admin" - No existing profile, profile design possible, but no cars to buy so you can't create
