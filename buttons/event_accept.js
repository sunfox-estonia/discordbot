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
        name: 'event_accept'
    },
    async execute(interaction) {

        const user_uid = interaction.user.id;

        checkProfileExists(user_uid,function(error){
            if (error) {
                const locales = {
                    en: 'User profile does not exists.',
                    et: 'Kasutaja profiil ei eksisteeri.',
                    };
                interaction.reply({ content: locales[interaction.locale] ?? error, ephemeral: true });						
            } else {
                checkEventExists(function(error,event_data){
                    if (error) {
                        const locales = {
                            en: 'Available event does not exists.',
                            et: 'Registreerimisele kättesaavad sündmus ei eksisteeri.',
                            };
                        interaction.reply({ content: locales[interaction.locale] ?? error, ephemeral: true });						
                    } else { 
                        var event_id = event_data.id;

                        addRegistration(user_uid, event_id ,function(error){
                            if (error) {
                                const locales = {
                                    en: 'An error occurred during the registration',
                                    et: 'Registreerimisel on tekkinud viga.',
                                    };
                                interaction.reply({ content: locales[interaction.locale] ?? error, ephemeral: true });						
                            } else {
                                interaction.reply({ content: `Вы зарегистрированы на мероприятие!`, ephemeral: true });
                            }
                        });
                    }
                });
            }
        });
    }
}

checkEventExists = function (callback) {
	// Prepare MySQL request check if there is opened-registration event	
	let sql1 = "SELECT * FROM `events` WHERE `event_date` > NOW() LIMIT 1; ";
	database.query(sql1, (error1, result, fields) => {
		if (error1) {
			callback("Ошибка в работе базы данных.",null);
			return;
		} else if (result.length != 1) {
			callback("Отсуствуют события с активной регистрацией.",null);
			return;
		} else {
			callback(null,result[0]);
		}
	});
	// checkEventExists closed
}

checkProfileExists = function (user_uid, callback) {
	// Prepare MySQL request check if user with the same uid already exists	
	let sql1 = "SELECT * FROM drd_users WHERE uid = ?;";
	database.query(sql1, [user_uid], (error1, results, fields) => {
		if (error1) {
			callback("Ошибка в работе базы данных.");
			return;
		} else if (results.length != 1) {
			callback("Данный профиль не существует. Невозможно зарегистрироваться на мероприятие.");
			return;
		} else {
			callback(null);
			return;
		}
	});
	// checkProfileExists closed
}

addRegistration = function(user_uid, event_id, callback) {
	// Add achivement for user
	let sql2 = "INSERT INTO events_usr (user_uid, event_id, user_status) VALUES (?,?,'1');";
    database.query(sql2, [user_uid,event_id], (error2, pingback) => {
        if (error2) {
            callback("Ошибка добавления регистрации на мероприятие.");
            return;
        } else {
			callback(null);
		}
    }); 
// addRegistration ended
}
