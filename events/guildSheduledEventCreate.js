const { Events } = require('discord.js');
const config = require('../config.json');

const mysql = require('mysql');
const database = mysql.createConnection({
	host: config.db_config.host,
	user: config.db_config.dbuser,
	password: config.db_config.dbpass,
	database: config.db_config.dbname,
	debug: false,
	multipleStatements: true,
});

/* 
 * This scipt creates an Event-related role 
 * for each new event created on the server.
 * It adds role ID with the event ID to the Database.
 */

module.exports = {
    name: Events.GuildScheduledEventCreate,
    async execute(event) {
        const NotificationsChannel = event.guild.channels.cache.get('621398274452094976');
        const BotLogChannel = event.guild.channels.cache.get('1195089293757137056');
        var discord_event_id = event.id;
        var discord_event_name = event.name;
        var discord_event_url = event.url;
        var event_role_name = "Участники события: " + discord_event_name;





        
        // Step 1. Create a new role for the event
        event.guild.roles.create({
            name: event_role_name,
            reason: 'Temporary Event-related role. Should be deleted after the event.'
        }).catch(err => {
            var NewRole = event.guild.roles.cache.find(role => role.name == event_role_name);
            // console.log("NEW METHOD");
    
            console.log(NewRole);
        });


    }
}