var Sequelize = require("sequelize");
var sequelize = new Sequelize("database", "username", "password", {dialect: "sqlite", storage: "eventInfo.sqlite"});


var Status = sequelize.define("status", {
    eventID: {type: Sequelize.UUID, primaryKey: true}, //event this user's status is for
    member: {type: Sequelize.STRING, primaryKey: true}, //snowflake of the user for this event
    status: {type: Sequelize.STRING, isIn: ["Attending", "Maybe", "Not Attending"]}
});

sequelize.sync();

module.exports = Status;
