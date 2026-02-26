# iOS-UDID-JS
An extremely simple JavaScript app which is hosted on a site and can be used in iOS applications to securely obtain the UDID (device identifier).

**YOU NEED HTTPS + VALID TLS ON THE SITE**

# How do I use this?

-> clone the repo

-> cd into the repo

-> install the modules in the app

-> use node to run the app

-> in your ios app, use the apis to open the host you're running the app on e.g: if the host is udidget.com, you will send a request to udidget.com/udid

-> ios will handle everything from there, and user just has to install profile

-> it will send a request to the app's url scheme and send the encrypted udid as a hex string

-> from there, capture it and decrypt it based on the seed you set in the node app.

# What to edit?

-> at the top of the file, edit the hosts variable to your main website upon which it will run on.

-> on line 72, change 'myapp://' to the cfbundleurlscheme of your ios app (found in info.plist)

-> optional: change xor implementation to make it harder for tamperers to mess with the udid.

-> in your ios app, implement the same xor cipher logic to decrypt the udid hex.
