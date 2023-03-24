const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('eventslist')
		.setDescription('Показывает список зарегистрированных участников последнего созданного мероприятия.')
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

		async execute(interaction) {
			const hasAdminRole = interaction.member.roles.cache.some(r => JSON.stringify(config.admin_roles).includes(r.name))
			if (hasAdminRole == false) {
				const locales = {
					en: 'You do not have permission to execute this command!',
					et: 'Te ei saa seda skripti käivitada!',
				};
				await interaction.reply(locales[interaction.locale] ?? 'У вас недостаточно прав для выполнения этой команды!');
			}





			await interaction.reply({ content: 'Secret answer.'});
		},
};

getLastEvent = function (callback) {
	// Prepare MySQL request check if there is opened-registration event	
	let sql1 = "SELECT * FROM `events` ORDER BY `date_created` DESC LIMIT 1; ";
	database.query(sql1, (error1, result, fields) => {
		if (error1) {
			callback("Ошибка в работе базы данных.",null);
			return;
		} else if (result.length != 1) {
			callback("Отсуствуют события в базе данных.",null);
			return;
		} else {
			callback(null,result[0]);
		}
	});
	// getLastEvent closed
}

getRegistrations = function (event_id, callback) {	
		// Prepare MySQL request to get list of registred users	
		let sql2 = "SELECT * FROM events_usr INNER JOIN (SELECT MAX(id) as id FROM events_usr GROUP BY user_uid ) last_updates ON last_updates.id = events_usr.id WHERE events_usr.event_id = ?;";
		database.query(sql2, [event_id, event_id], (error2, result, fields) => {
			if (error2) {
				callback("Ошибка в работе базы данных.",null);
				return;
			} else if (result.length == 0) {
				callback("Отсуствуют регистрации на мероприятия.",null);
				return;
			} else {
				callback(null,result[0]);
			}
		});
	}
