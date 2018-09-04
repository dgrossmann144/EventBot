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
        for(let event of events) {
            if(event.isMessageUpdated && messageReaction.message.id === event.eventMessage.id) {
                if(messageReaction.emoji.id === '409344837997821952') {
                    event.addAttendee(user);
                    break;
                } else if (messageReaction.emoji.toString() === '❓') {
                    event.addPotentialAttendee(user);
                    break;
                } else if (messageReaction.emoji.id === '292824502969303041') {
                    event.addNotAttending(user);
                    break;
                }
            }
        }
    }
});

client.on('messageReactionRemove', (messageReaction, user) => {
    if(user.id !== client.user.id) {
        for(let event of events) {
            if(event.isMessageUpdated && messageReaction.message.id === event.eventMessage.id) {
                if(messageReaction.emoji.id === '409344837997821952') {
                    event.removeAttendee(user);
                    break;
                } else if (messageReaction.emoji.toString() === '❓') {
                    event.removePotentialAttendee(user);
                    break;
                } else if (messageReaction.emoji.id === '292824502969303041') {
                    event.removeNotAttending(user);
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
    this.isMessageUpdated = false;
    this.attendees = new Set();
    this.potentialAttendees = new Set();
    this.notAttending = new Set();
    this.eventMessage;
    var self = this;

    channel.send(createdBy.user + ' has created an event: ' + eventName +
                 '\n' + eventDescription +
                 '\n' + 'It will take place ' + eventDate + ' at ' + eventTime +
                 '\n' + 'React with ' + channel.guild.emojis.get('409344837997821952') + ' if you are attending, ❓ if you might be attending, or ' + channel.guild.emojis.get('292824502969303041') + ' if you are not attending.').then(message => {
        self.eventMessage = message
        self.isMessageUpdated = true;

        //id for party_wurmple: 409344837997821952
        self.eventMessage.react(self.eventMessage.guild.emojis.get('409344837997821952')).then(() => {
            self.eventMessage.react('❓').then(() => {
                self.eventMessage.react(self.eventMessage.guild.emojis.get('292824502969303041'));
            });
        });

        events.push(this);
        // debug lists name and id of all custom emojis on a server
        // function listEmojis(curEmoji) {
        //     console.log(curEmoji.name + ' ' + curEmoji.id);
        //     return true;
        // }
        // this.eventMessage.guild.emojis.every(listEmojis);
    }, () => {
        channel.send('There was an error setting up the event, try again.');
    });

    UserEvent.prototype.addAttendee = function(user) {
        this.attendees.add(user);
        this.updateAttendees();
    }

    UserEvent.prototype.removeAttendee = function(user) {
        this.attendees.delete(user);
        this.updateAttendees();
    }

    UserEvent.prototype.addPotentialAttendee = function(user) {
        this.potentialAttendees.add(user);
        this.updateAttendees();
    }

    UserEvent.prototype.removePotentialAttendee = function(user) {
        this.potentialAttendees.delete(user);
        this.updateAttendees();
    }

    UserEvent.prototype.addNotAttending = function(user) {
        this.notAttending.add(user);
        this.updateAttendees();
    }

    UserEvent.prototype.removeNotAttending = function(user) {
        this.notAttending.delete(user);
        this.updateAttendees();
    }

    UserEvent.prototype.updateAttendees = function() {
        this.isMessageUpdated = false;
        var updatedText = this.createdBy.user + ' has created an event: ' + eventName +
                     '\n' + eventDescription +
                     '\n' + 'It will take place ' + eventDate + ' at ' + eventTime +
                     '\n' + 'React with ' + channel.guild.emojis.get('409344837997821952') + ' if you are attending, ❓ if you might be attending, or ' + channel.guild.emojis.get('292824502969303041') + ' if you are not attending.' +
                     '\nAttending (' + this.attendees.size +'): ';
        for(let attendee of this.attendees) {
            updatedText += attendee + ', ';
        }
        if(this.attendees.size > 0) {
            updatedText = updatedText.substr(0, updatedText.length - 2);
        }
        updatedText += '\nMaybe Attending (' + this.potentialAttendees.size +'): ';
        for(let potentialAttendee of this.potentialAttendees) {
            updatedText += potentialAttendee + ', ';
        }
        if(this.potentialAttendees.size > 0) {
            updatedText = updatedText.substr(0, updatedText.length - 2);
        }
        updatedText += '\nNot Attending (' + this.notAttending.size +'): ';
        for(let notAttend of this.notAttending) {
            updatedText += notAttend + ', ';
        }
        if(this.notAttending.size > 0) {
            updatedText = updatedText.substr(0, updatedText.length - 2);
        }
        this.eventMessage.edit(updatedText).then(message => {
            this.isMessageUpdated = true;
        });
    }

    UserEvent.prototype.toString = function toString() {
        return this.eventName + ' by ' + this.createdBy.nickname.toString();
    }
}
