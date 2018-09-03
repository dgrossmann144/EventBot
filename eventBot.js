var auth = require("./auth.json");
var discord = require("discord.js");

var client = new discord.Client();
var events = [];

client.login(auth.token);

client.on('message', msg => {
    if (!msg.content.startsWith(';;')) {
        return;
    }
    var command = msg.content.slice(2).split(';')[0];
    switch(command) {
        case 'createEvent':
            var args = msg.content.slice(2).split(';');
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
    if(user.id !== client.user.id) {
        for(var i = 0; i < events.length; i++) {
            if(events[i].isMessageSent && messageReaction.message.id === events[i].eventMessage.id) {
                if(messageReaction.emoji.id === '409344837997821952') {
                    events[i].addAttendee(user);
                    //debug
                    for(var test = 0; test < events[i].attendees.length; test++) {
                        console.log(events[i].attendees[test].username);
                    }

                    break;
                } else if (messageReaction.me) {
                    events[i].addPotentialAttendee(user);
                    //debug
                    for(var test2 = 0; test2 < events[i].potentialAttendees.length; test2++) {
                        console.log(events[i].potentialAttendees[test2].username);
                    }

                    break;
                }
            }
        }
    }
});

client.on('messageReactionRemove', (messageReaction, user) => {
    if(user.id !== client.user.id) {
        for(var i = 0; i < events.length; i++) {
            if(events[i].isMessageSent && messageReaction.message.id === events[i].eventMessage.id) {
                if(messageReaction.emoji.id === '409344837997821952') {
                    var removeIndex = events[i].attendees.indexOf(user);
                    events[i].removeAttendee(removeIndex);
                    //debug
                    for(var test = 0; test < events[i].attendees.length; test++) {
                        console.log(events[i].attendees[test].username);
                    }

                    break;
                } else if (messageReaction.me) {
                    var removeIndex = events[i].potentialAttendees.indexOf(user);
                    events[i].removePotentialAttendee(removeIndex);
                    //debug
                    for(var test2 = 0; test2 < events[i].potentialAttendees.length; test2++) {
                        console.log(events[i].potentialAttendees[test2].username);
                    }

                    break;
                }
            }
        }
    }
});

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
    var self = this;

    channel.send(createdBy.user + ' has created an event: ' + eventName +
                 '\n' + eventDescription +
                 '\n' + 'It will take place ' + eventDate + ' at ' + eventTime +
                 '\n' + 'React with ' + channel.guild.emojis.get('409344837997821952') + ' if you are attending, or ❓ if you might be attending.').then(message => {
        self.eventMessage = message
        self.isMessageSent = true;

        //id for party_wurmple: 409344837997821952
        self.eventMessage.react(self.eventMessage.guild.emojis.get('409344837997821952')).then(() => {
            self.eventMessage.react('❓');
        });

        events.push(this);
        // debug lists name and id of all custom emojis on a server
        // function listEmojis(curEmoji) {
        //     console.log(curEmoji.name + ' ' + curEmoji.id);
        //     return true;
        // }
        // eventMessage.guild.emojis.every(listEmojis)
    }, () => {
        channel.send('There was an error setting up the event, try again.');
    });

    UserEvent.prototype.toString = function toString() {
        return this.eventName + ' by ' + this.createdBy.nickname.toString();
    }

    UserEvent.prototype.addAttendee = function(user) {
        this.attendees.push(user);
        //TODO edit message to update attendee list
    }

    UserEvent.prototype.removeAttendee = function(index) {
        this.attendees.splice(index, 1);
        //TODO edit message to update attendee list
    }

    UserEvent.prototype.addPotentialAttendee = function(user) {
        this.potentialAttendees.push(user);
        //TODO edit message to update maybe list
    }

    UserEvent.prototype.removePotentialAttendee = function(index) {
        this.potentialAttendees.splice(index, 1);
        //TODO edit message to update maybe list
    }
}
