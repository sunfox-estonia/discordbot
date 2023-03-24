//const {} = require('discord.js');
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
    data: {
        name: 'quest_run'
    },
    async execute(interaction) {
        const quest_title = interaction.fields.getTextInputValue('quest_title');
        const quest_description = interaction.fields.getTextInputValue('quest_description');
        const quest_datetime = interaction.fields.getTextInputValue('quest_datetime');
        const quest_reward = interaction.fields.getTextInputValue('quest_reward');

        
    }
}