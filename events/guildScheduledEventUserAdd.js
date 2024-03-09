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
 * The following script assigns the
 * event-specified role to the user
 * attended to participate in the event.
 */

module.exports = {
    name: Events.GuildScheduledEventUserAdd,
    async execute(meeting, user) {
        const BotLogChannel = meeting.guild.channels.cache.get('1195089293757137056');
        const NotificationsChannel = interaction.client.channels.cache.get('621398274452094976');
        var discord_event_id = meeting.id;
        var discord_uid = user.id;
        let sql1 = "SELECT discord_role_id FROM events_roles WHERE discord_event_id = ?";
        database.query(sql1, [discord_event_id], (error1, role_data, fields) => {
            if (error1) {
                callback("Database error.", null);
                return;
            } else if (role_data.length == 0 || role_data.length > 1) {
                BotLogChannel.send({ content: `[AUTOMATION] ERROR: Can't retrieve role data for event id: ${discord_event_id}` });
                return;
            } else {
                var RoleId = role_data[0]['discord_role_id'];
                meeting.guild.members.cache.get(discord_uid).roles.add(RoleId);
                BotLogChannel.send({ content: `[AUTOMATION] Role **"Участник события: ${meeting.name}"** assigned to ${user}.` });
            }
        });

    }
}