var irc = require("irc"),
    https = require("https"),
    exec = require('child_process').exec,
    config = require("./config");

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
        const linux_builders = 6;
        for (var i = 0; i < linux_builders; i++) {
            let handler = function(i) {
                return function(err, stdout, stderr) {
                    bot.say(from, 'servo-linux' + (i + 1) + ':');
                    let lines = stdout.split('\n');
                    lines.forEach(function(line) {
                        bot.say(from, line);
                    });
                };
            };
            saltCommand('servo-linux' + (i + 1), 'df -h', handler(i));
        }
    }
}

bot.addListener('error', function(message) {
    console.log('error: ', message);
});
bot.addListener("message", handler);
bot.addListener("action", handler);
