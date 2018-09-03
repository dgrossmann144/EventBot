var auth = require("./auth.json");
var discord = require("discord.js");

var client = new discord.Client();
var events = [];

client.on('message', msg => {
    if (!(msg.content.charAt(0) === ':' && msg.content.charAt(1) === ':')) {
        return;
    }
    var command = msg.content.slice(2).split(' ')[0];

    switch(command) {
        case 'createEvent':
            var args = msg.content.split(' ');
            if (args.length != 5) {
                msg.channel.send('That event does not have the correct number of  arguments, use help to view the arguments');
                break;
            }
            var newEvent = new UserEvent(args[1], args[2], args[3], args[4], msg.member, msg.channel);

            break;
        case 'help':
            //TODO update help command with list of all commands

            break;
        default:
            msg.channel.send('That is not a valid command, use help to list all commands.');
    }
});

client.on('messageReactionAdd', (messageReaction, user) => {
    if(!(user.id === client.user.id)) {
        var i;
        for(i = 0; i < events.length; i++) {
            console.log("event tostring: " + events[i].toString());
            console.log(events[i].isMessageSent);
            if(events[i].isMessageSent && messageReaction.message.id === events[i].eventMessage.id) {
                if(messageReaction.emoji.id === '409344837997821952') {
                    events[i].attendees.push(user);
                    var test;
                    for(test = 0; test < events[i].attendees.length; i++) {
                        console.log(events[i].attendees[test]);
                    }
                } else if (messageReaction.me) {
                    events[i].potentialAttendees.push(user);
                    var test2;
                    for(test = 0; test2 < events[i].potentialAttendees.length; i++) {
                        console.log(events[i].potentialAttendees[test2]);
                    }
                }
            }
        }
    }
});

client.login(auth.token);

function UserEvent (eventName, eventDescription, eventDate, eventTime, createdBy, channel) {
    this.eventName = eventName;
    this.eventDescription = eventDescription;
    this.eventDate = eventDate;
    this.eventTime = eventTime;
    this.createdBy = createdBy;
    this.channel = channel;
    this.isMessageSent = false;
    this.attendees = [];
    this.potentialAttendees = [];
    this.eventMessage;

    channel.send(createdBy.user + ' has created an event: ' + eventName +
                 '\n' + eventDescription +
                 '\n' + 'It will take place on ' + eventDate + ' at ' + eventTime +
                 '\n' + 'React with ' + channel.guild.emojis.get('409344837997821952') + ' if you are attending, or ❓ if you might be attending.').then(message => {
        eventMessage = message
        isMessageSent = true;

        //id for party_wurmple: 409344837997821952
        eventMessage.react(eventMessage.guild.emojis.get('409344837997821952')).then(() => {
            eventMessage.react('❓');
        });

        events.push(this);

        // lists name and id of all custom emojis on a server
        // function listEmojis(curEmoji) {
        //     console.log(curEmoji.name + ' ' + curEmoji.id);
        //     return true;
        // }
        // eventMessage.guild.emojis.every(listEmojis)

    }, () => {
        channel.send('There was an error setting up the event, try again.');
    });
    //TODO write message and put it in a message var

    function toString() {
        return this.eventName.toString();
    }
}
