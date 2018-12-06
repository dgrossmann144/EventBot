var auth = require("./auth.json");
var Event = require("./event.js");
var Status = require("./status.js");
var Discord = require("discord.js");
var client = new Discord.Client();

process.on('SIGINT', () => {
    console.log("Start closing eventBot");
    client.destroy().then(() => {
        console.log("Finished closing eventBot");
    });
});

client.login(auth.token)
.then((name) => console.log("Successfully logged into server"));

client.on('message', msg => {
    if(!msg.content.startsWith(";;")) {
        return;
    }
    var command = msg.content.slice(2).split(";")[0];
    selectCommand: switch(command) {
        case 'createEvent':
            var args = msg.content.slice(2).split(";");
            if(args.length !== 3) {
                msg.channel.send("That command does not have the correct number of arguments, use ;;help to view the arguments.");
                break;
            }
            Event.create({name: args[1], description: args[2], guild: msg.guild.id, creator: msg.member.id})
            .then((table) => {
                msg.channel.send("Successfully created event.");
            })
            .catch((err) => {
                msg.channel.send("There is already an event with that name.");
                console.error("Error in createEvent\n")
                console.error(err);
            });
            break;
        case 'setName':
            var args = msg.content.slice(2).split(";");
            if(args.length !== 3) {
                msg.channel.send("That command does not have the correct number of arguments, use help to view the arguments.");
                break;
            }

            Event.findByPk(args[1])
            .then((changeEvent) => {
                if(changeEvent !== null) {
                    if(changeEvent.dataValues.creator !== msg.member.id) {
                        msg.send("Only the creator of an event can change its properties.");
                        return;
                    }
                } else {
                    msg.channel.send("There is no event that goes by that name.");
                    return;
                }
                Event.findByPk(args[2])
                .then((existingEvent) => {
                    if(existingEvent !== null) {
                        msg.channel.send("There is already an event with that name.");
                    } else {
                        changeEvent.update({name: args[2]})
                        .then((changedEvent) => {
                            msg.channel.send("Successfully updated event name.");
                            if(changedEvent.dataValues.isAnnounced) {
                                updateAttendees(changedEvent);
                            }
                        });
                    }
                });
            });
            break;
        case 'setDescription':
            var args = msg.content.slice(2).split(';');
            if(args.length !== 3) {
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
            if(event.isAnnounced) {
                event.updateAttendees();
            }
            msg.channel.send('Successfully updated event description.');

            break;
        case 'setDate':
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
            if(event.isAnnounced) {
                event.updateAttendees();
            }
            msg.channel.send('Successfully updated event date.');

            break;
        case 'setTime':
            var args = msg.content.slice(2).split(';');
            if(args.length !== 3) {
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
            if(event.isAnnounced) {
                event.updateAttendees();
            }
            msg.channel.send('Successfully updated event time.');

            break;
        case 'announceEvent':
            var args = msg.content.slice(2).split(';');
            if(args.length !== 2) {
                msg.channel.send('That command does not have the correct number of arguments, use help to view the arguments.');
                break;
            }

            var event = lookupEvent(args[1]);
            if(event === null) {
                msg.channel.send('There is no event that goes by that name.');
                break;
            }

            if(event.isAnnounced) {
                msg.channel.send('That event is already announced.');
                break;
            }

            if(event.createdBy !== msg.member) {
                msg.channel.send('Only the creator of an event can announce it.');
                break;
            }

            event.announceEvent(msg.channel);
            break;
        case 'listEvents':
            var args = msg.content.slice(2).split(';');
            if(args.length !== 1) {
                msg.channel.send('That command does not have the correct number of arguments, use help to view the arguments.');
                break;
            }

            var announcedEvents = 'Announced event names: ';
            var unannouncedEvents = 'Unannounced event names: ';
            for(let event of events) {
                if (event.isAnnounced) {
                    announcedEvents += event.eventName + ', ';
                } else {
                    unannouncedEvents += event.eventName + ', ';
                }
            }
            if(announcedEvents !== 'Announced event names: ') {
                announcedEvents = announcedEvents.substr(0, announcedEvents.length - 2);
            } else {
                announcedEvents = 'There are no announced events.';
            }

            if(unannouncedEvents !== 'Unannounced event names: ') {
                unannouncedEvents = unannouncedEvents.substr(0, unannouncedEvents.length - 2);
            } else {
                unannouncedEvents = 'There are no unannounced events.';
            }

            msg.channel.send(announcedEvents + '\n' + unannouncedEvents);
            break;
        case 'deleteEvent':
            var args = msg.content.slice(2).split(';');
            if(args.length !== 2) {
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

            if(event.isAnnounced) {
                event.eventMessage.unpin()
                .then((message) => {
                    events.splice(events.indexOf(event), 1);
                    msg.channel.send('Event deleted.');
                });
            } else {
                events.splice(events.indexOf(event), 1);
                msg.channel.send('Event deleted.');
            }

            break;
        case 'help':
        //TODO update this list
            msg.channel.send(';;createEvent;eventName;eventDescription;eventDate;eventTime\n' +
                             ';;setName;eventName;newName\n' +
                             ';;setDescription;eventName;newDescription\n' +
                             ';;setDate;eventName;newDate\n' +
                             ';;setTime;eventName;newTime\n' +
                             ';;announceEvent;eventName\n' +
                             ';;listEvents\n' +
                             ';;deleteEvent;eventName');
            break;
        default:
            msg.channel.send('That is not a valid command, type ";;help" to list all commands.');
    }
});

client.on('messageReactionAdd', (messageReaction, user) => {
    if(user.id !== client.user.id) {
        for(let event of events) {
            if(/*event.isMessageUpdated && */messageReaction.message.id === event.eventMessage.id) {
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
            if(/*event.isMessageUpdated && */messageReaction.message.id === event.eventMessage.id) {
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

function updateAttendees(event) {

}

function lookupEvent(name) {
    for(let event of events) {
        if(event.eventName === name) {
            return event;
        }
    }
    return null;
}
