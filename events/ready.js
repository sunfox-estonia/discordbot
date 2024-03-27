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

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
        database.connect(function(err) {
            if (err) {
              return console.error('error: ' + err.message);
            }
            console.log('Connected to the MySQL server database '+ config.db_config.dbname +'@'+ config.db_config.host +'.');
          });
          console.log(`Logged in Discord as ${client.user.tag}!`);
          const BotLogChannel = client.channels.cache.get('1195089293757137056');
          const Play2Channel = client.channels.cache.get('1221929886726488094');
          BotLogChannel.send({ content: `Bot has been successfully restarted!` });

          /* Play2gether channel praparing block
           * We should delete all messages in a play2gether channel
           * and create a new embed message with the information  
           * about the play2gether command usage
           */
          async () => {
            let fetched;
            do {
              fetched = await Play2Channel.fetchMessages({limit: 100});
              message.channel.bulkDelete(fetched);
            }
            while(fetched.size >= 1);
          }




	},
};
