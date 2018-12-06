var Sequelize = require("sequelize");
var sequelize = new Sequelize("database", "username", "password", {dialect: "sqlite", storage: "eventInfo.sqlite"});

var Event = sequelize.define("event", {
    name: {type: Sequelize.STRING, primaryKey: true, allowNull: false}, //name specified for the event, unique
    description: {type: Sequelize.STRING, allowNull: false}, //description specified for the event
    guild: {type: Sequelize.STRING, allowNull: false}, //snowflake of the guild of the event
    creator: {type: Sequelize.STRING, allowNull: false}, //snowflake of the author of the event
    channel: {type: Sequelize.STRING, allowNull: true}, //snowflake of the channel of the event
    message: {type: Sequelize.STRING, allowNull: true}, //snowflake of the message of the event
    isAnnounced: {type: Sequelize.BOOLEAN, allowNull: true, defaultValue: false}
    //maybe add isMessageUpdated
});

sequelize.sync();

module.exports = Event;

// function UserEvent(eventName, eventDescription, eventDate, eventTime, createdBy) {
//     this.eventName = eventName;
//     this.eventDescription = eventDescription;
//     this.eventDate = eventDate;
//     this.eventTime = eventTime;
//     this.createdBy = createdBy;
//     this.isMessageUpdated = false; //unsure if needed
//     this.attendees = new Set();
//     this.potentialAttendees = new Set();
//     this.notAttending = new Set();
//     this.eventMessage;
//     this.isAnnounced = false;
//     events.push(this);
//
//     this.announceEvent = function(channel) {
//         if (typeof this.eventDescription === 'undefined' ||
//             typeof this.eventDate === 'undefined' ||
//             typeof this.eventTime === 'undefined') {
//             channel.send('The description, date, or time was left undefined.');
//         } else {
//             channel.send(this.createdBy.user + ' has created an event: ' + this.eventName +
//                      '\n' + this.eventDescription +
//                      '\nIt will take place ' + this.eventDate + ' at ' + this.eventTime +
//                      '\nReact with ' + channel.guild.emojis.get('409344837997821952') + ' if you are attending, ❓ if you might be attending, or ' + channel.guild.emojis.get('292824502969303041') + ' if you are not attending.' +
//                      '\nAttending (0): ' +
//                      '\nMaybe Attending (0): ' +
//                      '\nNot Attending (0): ').then(message => {
//                 this.eventMessage = message;
//                 this.eventMessage.pin();
//                 this.isMessageUpdated = true;
//                 this.isAnnounced = true;
//
//                 this.eventMessage.react(this.eventMessage.guild.emojis.get('409344837997821952')).then(() => {
//                     this.eventMessage.react('❓').then(() => {
//                         this.eventMessage.react(this.eventMessage.guild.emojis.get('292824502969303041'));
//                     });
//                 });
//
//             // debug lists name and id of all custom emojis on a server
//             // function listEmojis(curEmoji) {
//             //     console.log(curEmoji.name + ' ' + curEmoji.id);
//             //     return true;
//             // }
//             // this.eventMessage.guild.emojis.every(listEmojis);
//             }, () => {
//                 channel.send('There was an error setting up the event, try again.');
//             });
//         }
//     }
//
//     this.addAttendee = function(user) {
//         this.attendees.add(user);
//         this.updateAttendees();
//     }
//
//     this.removeAttendee = function(user) {
//         this.attendees.delete(user);
//         this.updateAttendees();
//     }
//
//     this.addPotentialAttendee = function(user) {
//         this.potentialAttendees.add(user);
//         this.updateAttendees();
//     }
//
//     this.removePotentialAttendee = function(user) {
//         this.potentialAttendees.delete(user);
//         this.updateAttendees();
//     }
//
//     this.addNotAttending = function(user) {
//         this.notAttending.add(user);
//         this.updateAttendees();
//     }
//
//     this.removeNotAttending = function(user) {
//         this.notAttending.delete(user);
//         this.updateAttendees();
//     }
//
//     this.updateAttendees = function() {
//         this.isMessageUpdated = false;
//         var updatedText = this.createdBy.user + ' has created an event: ' + this.eventName +
//                      '\n' + this.eventDescription +
//                      '\n' + 'It will take place ' + this.eventDate + ' at ' + this.eventTime +
//                      '\n' + 'React with ' + this.message.channel.guild.emojis.get('409344837997821952') + ' if you are attending, ❓ if you might be attending, or ' + this.message.channel.guild.emojis.get('292824502969303041') + ' if you are not attending.' +
//                      '\nAttending (' + this.attendees.size +'): ';
//         for(let attendee of this.attendees) {
//             updatedText += attendee + ', ';
//         }
//         if(this.attendees.size > 0) {
//             updatedText = updatedText.substr(0, updatedText.length - 2);
//         }
//         updatedText += '\nMaybe Attending (' + this.potentialAttendees.size +'): ';
//         for(let potentialAttendee of this.potentialAttendees) {
//             updatedText += potentialAttendee + ', ';
//         }
//         if(this.potentialAttendees.size > 0) {
//             updatedText = updatedText.substr(0, updatedText.length - 2);
//         }
//         updatedText += '\nNot Attending (' + this.notAttending.size +'): ';
//         for(let notAttend of this.notAttending) {
//             updatedText += notAttend + ', ';
//         }
//         if(this.notAttending.size > 0) {
//             updatedText = updatedText.substr(0, updatedText.length - 2);
//         }
//         //TODO redo this to use an interval?
//         this.eventMessage.edit(updatedText).then(message => {
//             this.isMessageUpdated = true;
//         });
//     }
// }
