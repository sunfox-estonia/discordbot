//const {} = require('discord.js');
const { Format } =  require('fecha.js');
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
        name: 'event_run'
    },
    async execute(interaction) {
        const event_title = interaction.fields.getTextInputValue('event_title');
        const event_datetime_text = interaction.fields.getTextInputValue('event_datetime');
        const event_location = interaction.fields.getTextInputValue('event_location');
        const event_description = interaction.fields.getTextInputValue('event_description');
        const event_url = interaction.fields.getTextInputValue('event_url');

        const event_datetime = parseDate(event_datetime);

        console.log("Event data: "+event_title+" - "+event_datetime+" - "+event_location);
        
    }
}

createEvent = function (title, datetime, location, description, url, callback) {
	// Prepare MySQL request to add a new event	
	let sql1 = "INSERT INTO events (event_title, event_date, event_location, event_description, event_url) VALUES (?,?,?,?,?);"; 
	// TODO: Remove community title when database migrates to SQLite  
	database.query(sql1, [title, datetime, location, description, url], (error4, pingback) => {
	    if (error4) {
	        callback("Ошибка добавления события в БД.");
	        return;
	    } else {
			callback(null);
	    }
	});
	// createEvent closed
}

parseDate = function (data) {
    return Parse(data, 'DD/MM/YYYY HH:mm:ss');
}