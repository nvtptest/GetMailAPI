const express = require('express');
const app = express();
const MailListener = require('mail-listener2');
const bodyParser = require('body-parser');

const jsonParses = bodyParser.json();

const PORT = process.env.PORT || 8099;


app.get('/', (req, res) => {
    res.send('PTSP-API!');
});

app.post('/mail', jsonParses, (req, res, next) => {
    var curr_date = new Date();
    let username = req.body.username || 'test';
    let password = req.body.password || 'test123';
    let host = req.body.host || 'mail.bravo.com.vn';
    let port = req.body.port || 143;
    let mailbox = req.body.mailbox || 'INBOX';
    let date = req.body.date || curr_date;
    let getBody = req.body.getBody || 'true';

    var mailListener = new MailListener({
        username: username,
        password: password,
        host: host,
        port: port,
        tls: false,
        connTimeout: 10000, // Default by node-imap
        authTimeout: 5000, // Default by node-imap,
        debug: null, // Or your custom function with only one incoming argument. Default: null
        tlsOptions: { rejectUnauthorized: false },
        mailbox: mailbox, // mailbox to monitor
        searchFilter: [["ON", date]], // the search filter being used after an IDLE notification has been retrieved
        markSeen: false, // all fetched email willbe marked as seen and not fetched next time
        fetchUnreadOnStart: true, // use it only if you want to get all unread email on lib start. Default is `false`,
        mailParserOptions: { streamAttachments: false }, // options to be passed to mailParser lib.
        attachments: false, // download attachments as they are encountered to the project directory
        attachmentOptions: { directory: "attachments/" } // specify a download directory for attachments
    });

    mailListener.start(); // start listening

    mailListener.on('server:connected', () => {
        console.log('imapConnected');
    });

    mailListener.on('server:disconnected', () => {
        console.log('imapDisconnected');
    });

    mailListener.on('error', (err) => {
        mailListener.stop();
        res.send('');
    })

    let lst = [];

    mailListener.on('mail', (mail, seqno, attributes) => {
        let message = {
            from: undefined,
            to: undefined,
            subject: undefined,
            date: undefined,
            body: undefined,
            messageId: undefined
        };

        if (typeof mail.to !== 'undefined')
            message.to = mail.to[0].address;

        if (typeof mail.from !== 'undefined')
            message.from = mail.from[0].address;

        message.from = mail.from[0].address;
        message.subject = mail.subject;
        message.date = mail.receivedDate;
        message.messageId = mail.messageId;

        if (typeof mail.cc !== 'undefined') {
            message.cc = '';

            mail.cc.forEach(ccDetail => {
                message.cc += ';' + ccDetail.address;
            })
        }


        if (getBody == 'true') {
            message.body = mail.text;
        }

        lst.push(message);

        if (lst.length == mail.total) {
            mailListener.stop();
            res.send(lst);
        }
    })
});


app.listen(PORT, () => { console.log(`Listening port ${PORT}`) });