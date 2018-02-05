var irc = require("irc"),
    https = require("https"),
    exec = require('child_process').exec,
    config = require("./config"),
    parseUsage = require('./usage').parseUsage;

var bot = new irc.Client(config.server, config.botName, {
    channels: config.channels,
    port: config.port,
    secure: config.secure,
    autoRejoin: config.autoRejoin,
});

function saltCommand(builders, cmd, callback) {
    if (builders.indexOf('"') > -1 || cmd.indexOf('"') > -1) {
        console.log('ignoring request to run "' + cmd + '" on "' + builders + '"');
        return;
    }
    exec('salt -E "' + builders + '" cmd.run "' + cmd + '"', callback);
}

function handler(from, to, original_message) {
    if (from == 'ghservo' || from.match(/crowbot/) || from.match(/rustbot/)) {
        return;
    }

    // Caseless message matching
    message = original_message.toLowerCase();

    if (message.indexOf('disk usage') > -1) {
        const numLinuxBuilders = 6;
        const numMacBuilders = 8;
        let builders = [];
        for (let i = 0; i < numLinuxBuilders; i++) {
            builders.push("servo-linux" + (i + 1));
        }
        for (let i = 0; i < numMacBuilders; i++) {
            builders.push("servo-mac" + (i + 1));
        }
        for (const builder of builders) {
            saltCommand('servo-linux' + (i + 1), 'df -h', function(err, stdout, stderr) {
                const response = builder + ': ';
                const usage = parseUsage(stdout, builder) || "<invalid response>";
                bot.say(from, response + usage);
            });
        }
    }
}

bot.addListener('error', function(message) {
    console.log('error: ', message);
});
bot.addListener("message", handler);
bot.addListener("action", handler);
