var auth = require("./auth.json");
var discord = require("discord.js");

var client = new discord.Client();

client.on('message', msg => {
    if (msg.content.charAt(0) === ':' && msg.content.charAt(1) === ':') {
        var command = msg.content.slice(2).split(' ')[0];
        msg.channel.send(msg.author + ' used the ' + command + ' command');
    }
});

client.login(auth.token);
