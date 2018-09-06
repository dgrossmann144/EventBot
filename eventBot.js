var auth = require("./auth.json");
var discord = require("discord.js");

var client = new discord.Client();
var events = [];

process.on('SIGINT', () => {
    for (let event of events) {
        event.eventMessage.unpin();
    }

    client.destroy();
});

client.login(auth.token);

client.on('message', msg => {
    if(!msg.content.startsWith(';;')) {
        return;
    }
    var command = msg.content.slice(2).split(';')[0];
    selectCommand: switch(command) {
        case 'createEvent':
            var args = msg.content.slice(2).split(';');
            if(args.length != 5) {
                msg.channel.send('That command does not have the correct number of arguments, use help to view the arguments.');
                break;
            }
            if(lookupEvent(args[1]) === null) {
                new UserEvent(args[1], args[2], args[3], args[4], msg.member, msg.channel);
            } else {
                msg.channel.send('There is already an event with that name.');
                break;
            }

            break;
        case 'changeName':
            var args = msg.content.slice(2).split(';');
            if(args.length != 3) {
                msg.channel.send('That command does not have the correct number of arguments, use help to view the arguments.');
                break;
            }

            var event = lookupEvent(args[1]);
            if(event === null) {
                msg.channel.send('There is no event that goes by that name.');
                break;
            }

            if(event.createdBy !== msg.member) {
                msg.channel.send('Only the creator of an event can change its properties.');
                break;
            }

            for(var i = 0; i < events.length; i++) {
                if(args[2] === events[i].eventName) {
                    msg.channel.send('There is already an event with that name.');
                    break selectCommand;
                }
            }
            event.eventName = args[2];
            event.updateAttendees();
            msg.channel.send('Successfully updated event name.');

            break;
        case 'changeDescription':
            var args = msg.content.slice(2).split(';');
            if(args.length != 3) {
                msg.channel.send('That command does not have the correct number of arguments, use help to view the arguments.');
                break;
            }

            var event = lookupEvent(args[1]);
            if(event === null) {
                msg.channel.send('There is no event that goes by that name.');
                break;
            }

            if(event.createdBy !== msg.member) {
                msg.channel.send('Only the creator of an event can change its properties.');
                break;
            }

            event.eventDescription = args[2];
            event.updateAttendees();
            msg.channel.send('Successfully updated event description.');

            break;
        case 'changeDate':
            var args = msg.content.slice(2).split(';');
            if(args.length != 3) {
                msg.channel.send('That command does not have the correct number of arguments, use help to view the arguments.');
                break;
            }

            var event = lookupEvent(args[1]);
            if(event === null) {
                msg.channel.send('There is no event that goes by that name.');
                break;
            }

            if(event.createdBy !== msg.member) {
                msg.channel.send('Only the creator of an event can change its properties.');
                break;
            }

            event.eventDate = args[2];
            event.updateAttendees();
            msg.channel.send('Successfully updated event date.');

            break;
        case 'changeTime':
            var args = msg.content.slice(2).split(';');
            if(args.length != 3) {
                msg.channel.send('That command does not have the correct number of arguments, use help to view the arguments.');
                break;
            }

            var event = lookupEvent(args[1]);
            if(event === null) {
                msg.channel.send('There is no event that goes by that name.');
                break;
            }

            if(event.createdBy !== msg.member) {
                msg.channel.send('Only the creator of an event can change its properties.');
                break;
            }

            event.eventTime = args[2];
            event.updateAttendees();
            msg.channel.send('Successfully updated event time.');

            break;
        case 'listEvents':
            var args = msg.content.slice(2).split(';');
            if(args.length != 1) {
                msg.channel.send('That command does not have the correct number of arguments, use help to view the arguments.');
                break;
            }

            var listOfEvents = 'List of event names: ';
            for(let event of events) {
                listOfEvents += event.eventName + ', ';
            }
            if(events.length > 0) {
                listOfEvents = listOfEvents.substr(0, listOfEvents.length - 2);
            } else {
                listOfEvents = 'There are no events.';
            }

            msg.channel.send(listOfEvents);

            break;
        case 'delete':
            var args = msg.content.slice(2).split(';');
            if(args.length != 2) {
                msg.channel.send('That command does not have the correct number of arguments, use help to view the arguments.');
                break;
            }

            var event = lookupEvent(args[1]);
            if(event === null) {
                msg.channel.send('There is no event that goes by that name.');
                break;
            }

            if(event.createdBy !== msg.member) {
                msg.channel.send('Only the creator of an event can delete it.');
                break;
            }

            event.eventMessage.unpin();
            events.splice(events.indexOf(event), 1);
            msg.channel.send('Event deleted.');

            break;
        case 'help':
            msg.channel.send('createEvent;eventName;eventDescription;eventDate;eventTime\n' +
                             'changeName;eventName;newName\n' +
                             'changeDescription;eventName;newDescription\n' +
                             'changeDate;eventName;newDate\n' +
                             'changeTime;eventName;newTime\n' +
                             'delete;eventName');
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

    channel.send(createdBy.user + ' has created an event: ' + this.eventName +
                 '\n' + this.eventDescription +
                 '\n' + 'It will take place ' + this.eventDate + ' at ' + this.eventTime +
                 '\n' + 'React with ' + channel.guild.emojis.get('409344837997821952') + ' if you are attending, ❓ if you might be attending, or ' + channel.guild.emojis.get('292824502969303041') + ' if you are not attending.').then(message => {
        this.eventMessage = message
        this.eventMessage.pin();
        this.isMessageUpdated = true;

        this.eventMessage.react(this.eventMessage.guild.emojis.get('409344837997821952')).then(() => {
            this.eventMessage.react('❓').then(() => {
                this.eventMessage.react(this.eventMessage.guild.emojis.get('292824502969303041'));
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
        var updatedText = this.createdBy.user + ' has created an event: ' + this.eventName +
                     '\n' + this.eventDescription +
                     '\n' + 'It will take place ' + this.eventDate + ' at ' + this.eventTime +
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

function lookupEvent(name) {
    for(let event of events) {
        if(event.eventName === name) {
            return event;
        }
    }
    return null;
}
