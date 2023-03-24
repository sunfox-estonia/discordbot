const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { parse, format } = require('fecha');
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

			getLastEvent(function (error, event_data) {
				if (error) {
					const locales = {
						en: 'An error occurred while retrieving event data.',
						et: 'Sündmuse andmete otsimisel on tekkinud viga.',
					};
					interaction.reply({ content: locales[interaction.locale] ?? error, ephemeral: true });
				} else {
					getRegistrations(function (error, registrations_list) {
						if (error) {
							const locales = {
								en: 'An error occurred while retrieving members list.',
								et: 'Osalejate nimekirja valmimisel on tekkinud viga.',
							};
							interaction.reply({ content: locales[interaction.locale] ?? error, ephemeral: true });
						} else {

							var event_datetime =  new Date(parseDate(event_data.event_date));
							var list_accepted = '';
							var list_declined = '';

							for (i = 0; i < registrations_list.length; i++) {
								switch (registrations_list[i].user_status) {
									case '1':
										var list_accepted = list_accepted + `${registrations_list[0].uid}\r`;										
										break;
									case '0':
										var list_declined = list_declined + `${registrations_list[0].uid}\r`;										
										break;
									default:
										break;
								}
							}
							const embed_event = {
								title: event_data.event_title,
								color: 0x0099ff,
								fields: [
									{
										name: "Дата проведения",
										value: format(new Date(event_datetime), 'DD.MM.YYYY, HH:mm'),
										inline: true
									},
									{
										name: "Место проведения",
										value: event_data.event_location,
										inline: true
									},
									{
										name: "\u200b",
										value: "\u200b"
									},
									{
										name: "Участвуют в мероприятии",
										value: list_accepted,
									},
									{
										name: "Не участвуют:",
										value: list_declined,
									},
								],
								timestamp: new Date().toISOString(),
								footer: {
									icon_url: "https://sunfox.ee/resources/img/discord_bot/vv_sq_logo.png",
									text: "Викинги Вирумаа"
								},
							}
							interaction.reply({ embeds: [embed_event] });
						}
					});
				}
			});
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
		let sql2 = "SELECT `events_usr`.`user_uid`, `events_usr`.`user_status` FROM `events_usr` INNER JOIN (SELECT MAX(id) as id FROM `events_usr` GROUP BY `user_uid` ) last_updates ON last_updates.id = events_usr.id WHERE events_usr.event_id = ? ORDER BY `user_status` DESC;";
		database.query(sql2, [event_id], (error2, result, fields) => {
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

parseDate = function (data) {
		return parse(data, 'DD/MM/YYYY HH:mm');
	}
