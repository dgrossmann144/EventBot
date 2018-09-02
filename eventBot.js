var auth = require("./auth.json");
var discord = require("discord.js");

var client = new discord.Client();

client.on('message', msg => {
    if (msg.content.charAt(0) === ':' && msg.content.charAt(1) === ':') {
        var command = msg.content.slice(2).split(' ')[0];

        switch(command) {
            case 'createEvent':
                var args = msg.content.split(' ');
                if (args.length != 5) {
                    msg.channel.send('That event does not have the correct number of  arguments, use help to view the arguments');
                    break;
                }
                var newEvent = new UserEvent(args[1], args[2], args[3], args[4], msg.member.nickname, msg.channel);

                break;
            case 'help':
                //TODO update help command with list of all commands

                break;
            default:
                msg.channel.send('That is not a valid command, use help to list all commands.');
        }
    }
});

client.login(auth.token);

function UserEvent(eventName, eventDescription, eventDate, eventTime, createdBy, channel) {
    this.eventName = eventName;
    this.eventDescription = eventDescription;
    this.eventDate = eventDate;
    this.eventTime = eventTime;
    this.createdBy = createdBy;
    this.channel = channel;
    var attendees = [];
    var potentialAttendees = [];

    var eventMessage;
    channel.send('test message').then(message => eventMessage = message);
    //TODO write message and put it in a message var
}
