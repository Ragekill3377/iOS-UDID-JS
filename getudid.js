const Express = require('express');
const { parseStringPromise } = require('xml2js');
const Crypto = require('crypto');
const App = Express();
const Port = 4588;//change to whatever port
const Host = process.env.HOST || 'https://domain.com';//put ur https domain here

function XorEncrypt(data, seed, salt = 'cbyw6gf4c7oh32d9n') {//you can decrypt the udid on client side with the same logic and seed (i added a salt)
    const key = Buffer.from(seed);
    const saltbuf = Buffer.from(salt);
    const input = Buffer.from(data, 'utf8');
    const out = Buffer.alloc(input.length);
    for (let i = 0; i < input.length; i++) {
        out[i] = input[i] ^ key[i % key.length] ^ saltbuf[i % saltbuf.length];
    }

    return out.toString('hex');
}

App.get('/udid', (Req, Res) => {
    const MobileConfig = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PayloadContent</key>
    <dict>
        <key>URL</key>
        <string>${Host}/endpoint</string>
        <key>DeviceAttributes</key>
        <array>
            <string>UDID</string>
            <string>DEVICE_NAME</string>
            <string>VERSION</string>
            <string>PRODUCT</string>
            <string>MAC_ADDRESS_EN0</string>
            <string>IMEI</string>
            <string>ICCID</string>
        </array>
    </dict>
    <key>PayloadOrganization</key>
    <string>Rage's UDID grabber</string>
    <key>PayloadDisplayName</key>
    <string>Device Registration</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
    <key>PayloadUUID</key>
    <string>${Crypto.randomUUID()}</string>
    <key>PayloadIdentifier</key>
    <string>com.rage.kill.udid</string>
    <key>PayloadDescription</key>
    <string>Gets your UDID</string>
    <key>PayloadType</key>
    <string>Profile Service</string>
</dict>
</plist>`;
    Res.setHeader('Content-Type', 'application/x-apple-aspen-config');//needed
    Res.send(MobileConfig);
});

App.post('/endpoint', Express.raw({ type: '*/*' }), async (Req, Res) => {
    try {
        const BodyString = Req.body.toString('utf-8');
        const Start = BodyString.indexOf('<?xml');
        const End = BodyString.indexOf('</plist>');
        if (Start === -1 || End === -1) return Res.status(400).send('bad plist');
        const Xml = BodyString.substring(Start, End + 8);
        const Parsed = await parseStringPromise(Xml);
        let Udid = '';
        const Keys = Parsed.plist.dict[0].key;
        const Values = Parsed.plist.dict[0].string;
        Keys.forEach((K, I) => { if (K === 'UDID') Udid = Values[I]; });
        if (!Udid) return Res.status(400).send('NULL');
        const EncryptedUdid = XorEncrypt(Udid, 'xraq5950snxhHdndjdiJggsiygw626ok');//returns the encrypted udid
        Res.writeHead(301, { Location: `myapp://udid?value=${EncryptedUdid}` });// replace myapp:// with the cfbundleurlscheme of your ios app
        Res.end();//the request back must be a 301 or else it will not work
    } catch {
        Res.status(500).send('server error, check node error logs please');
    }
});

App.get('/', (Req, Res) => {
    Res.send(`<h2>Running Fine</h2><a href="/udid">Send Request Here Thru App</a>`);
});

App.listen(Port);
