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
            if(events[i].isMessageUpdated && messageReaction.message.id === events[i].eventMessage.id) {
                if(messageReaction.emoji.id === '409344837997821952') {
                    events[i].addAttendee(user);
                    break;
                } else if (messageReaction.emoji.toString() === '❓') {
                    events[i].addPotentialAttendee(user);
                    break;
                } else if (messageReaction.emoji.id === '292824502969303041') {
                    events[i].addNotAttending(user);
                    break;
                }
            }
        }
    }
});

client.on('messageReactionRemove', (messageReaction, user) => {
    if(user.id !== client.user.id) {
        for(var i = 0; i < events.length; i++) {
            if(events[i].isMessageUpdated && messageReaction.message.id === events[i].eventMessage.id) {
                if(messageReaction.emoji.id === '409344837997821952') {
                    var removeIndex = events[i].attendees.indexOf(user);
                    events[i].removeAttendee(removeIndex);
                    break;
                } else if (messageReaction.emoji.toString() === '❓') {
                    var removeIndex = events[i].potentialAttendees.indexOf(user);
                    events[i].removePotentialAttendee(removeIndex);
                    break;
                } else if (messageReaction.emoji.id === '292824502969303041') {
                    var removeIndex = events[i].notAttending.indexOf(user);
                    events[i].removeNotAttending(removeIndex);
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
    this.attendees = [];
    this.potentialAttendees = [];
    this.notAttending = [];
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

    UserEvent.prototype.toString = function toString() {
        return this.eventName + ' by ' + this.createdBy.nickname.toString();
    }

    UserEvent.prototype.addAttendee = function(user) {
        this.attendees.push(user);
        this.updateAttendees();
    }

    UserEvent.prototype.removeAttendee = function(index) {
        this.attendees.splice(index, 1);
        this.updateAttendees();
    }

    UserEvent.prototype.addPotentialAttendee = function(user) {
        this.potentialAttendees.push(user);
        this.updateAttendees();
    }

    UserEvent.prototype.removePotentialAttendee = function(index) {
        this.potentialAttendees.splice(index, 1);
        this.updateAttendees();
    }

    UserEvent.prototype.addNotAttending = function(user) {
        this.notAttending.push(user);
        this.updateAttendees();
    }

    UserEvent.prototype.removeNotAttending = function(index) {
        this.notAttending.splice(index, 1);
        this.updateAttendees();
    }

    UserEvent.prototype.updateAttendees = function() {
        this.isMessageUpdated = false;
        var updatedText = this.createdBy.user + ' has created an event: ' + eventName +
                     '\n' + eventDescription +
                     '\n' + 'It will take place ' + eventDate + ' at ' + eventTime +
                     '\n' + 'React with ' + channel.guild.emojis.get('409344837997821952') + ' if you are attending, ❓ if you might be attending, or ' + channel.guild.emojis.get('292824502969303041') + ' if you are not attending.' +
                     '\nAttending (' + this.attendees.length +'): ';
        for (var i = 0; i < this.attendees.length - 1; i++) {
            updatedText += this.attendees[i] + ', ';
        }
        if (this.attendees.length > 0) {
            updatedText += this.attendees[this.attendees.length - 1];
        }
        updatedText += '\nMaybe Attending (' + this.potentialAttendees.length +'): ';
        for (var i = 0; i < this.potentialAttendees.length - 1; i++) {
            updatedText += this.potentialAttendees[i] + ', ';
        }
        if (this.potentialAttendees.length > 0) {
            updatedText += this.potentialAttendees[this.potentialAttendees.length - 1];
        }
        updatedText += '\nNot Attending (' + this.notAttending.length +'): ';
        for(var i = 0; i < this.notAttending.length - 1; i++) {
            updatedText += this.notAttending[i] + ', ';
        }
        if (this.notAttending.length > 0) {
            updatedText += this.notAttending[this.notAttending.length - 1];
        }
        this.eventMessage.edit(updatedText).then(message => {
            this.isMessageUpdated = true;
        });
    }
}
