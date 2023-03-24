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
		.setName('listevent')
		.setDescription('Просмотреть список участников последнего созданного События или Квеста.')
		.addStringOption(option =>
			option.setName('event_type')
			.setDescription('Выберите тип события.')
			.setRequired(true)
			.addChoices(
				{ name: 'Событие', value: 'event' },
				{ name: 'Квест', value: 'quest' }
			))
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

			const data_event = interaction.options.getString('event_type');

			switch (data_event) {
				case "event":
					getLastEvent(function (error, event_data) {
						if (error) {
							const locales = {
								en: 'An error occurred while retrieving event data.',
								et: 'Sündmuse andmete otsimisel on tekkinud viga.',
							};
							interaction.reply({ content: locales[interaction.locale] ?? error, ephemeral: true });
						} else {
							getListEventRegistrations(event_data.id, function (error, registrations_list) {
								if (error) {
									const locales = {
										en: 'An error occurred while retrieving members list.',
										et: 'Osalejate nimekirja valmimisel on tekkinud viga.',
									};
									interaction.reply({ content: locales[interaction.locale] ?? error, ephemeral: true });
								} else {
		
									var list_accepted = '';
									var list_declined = '';
									var accepted_count = 0;	
									var declined_count = 0;	
		
									for (i = 0; i < registrations_list.length; i++) {
										end_user = interaction.guild.members.cache.get(registrations_list[i].user_uid);
										switch (registrations_list[i].user_status) {
											case '1':
												list_accepted = list_accepted + `${end_user}\r`;	
												accepted_count = i;									
												break;
											case '0':
												list_declined = list_declined + `${end_user}\r`;	
												declined_count = i;										
												break;
											default:
												break;
										}
									}
		
									if (accepted_count === 0) {
										list_accepted = "*Список пуст*";
									}
									if (declined_count === 0) {
										list_declined = "*Список пуст*";
									}
		
									const embed_event = {
										title: event_data.event_title,
										color: 0x0099ff,
										fields: [
											{
												name: "Дата проведения",
												value: format(new Date(event_data.event_date), 'DD.MM.YYYY, HH:mm'),
												inline: true
											},
											{
												name: "Место проведения",
												value: event_data.event_location,
												inline: true
											},
											{
												name: "Участвуют в мероприятии:",
												value: list_accepted,
											},
											{
												name: "Не участвуют:",
												value: list_declined,
											},
											{
												name: "\u200b",
												value: "\u200b"
											},
										],
										timestamp: new Date().toISOString(),
										footer: {
											icon_url: "https://sunfox.ee/resources/img/discord_bot/vv_sq_logo.png",
											text: "Викинги Вирумаа"
										},
									}
									interaction.reply({content: 'Вот список участников ближайшего мероприятия:', embeds: [embed_event], ephemeral: true });
								}
							});
						}
					});
					break;
				case "quest":
					getLastQuest(function (error, quest_data) {
						if (error) {
							const locales = {
								en: 'An error occurred while retrieving quest data.',
								et: 'Eesmärgi andmete otsimisel on tekkinud viga.',
							};
							interaction.reply({ content: locales[interaction.locale] ?? error, ephemeral: true });
						} else {
							getListQuestRegistrations(quest_data.id, function (error, registrations_list) {
								if (error) {
									const locales = {
										en: 'An error occurred while retrieving members list.',
										et: 'Osalejate nimekirja valmimisel on tekkinud viga.',
									};
									interaction.reply({ content: locales[interaction.locale] ?? error, ephemeral: true });
								} else {
		
									var list_accepted = '';
									var accepted_count = 0;
		
									for (i = 0; i < registrations_list.length; i++) {
										end_user = interaction.guild.members.cache.get(registrations_list[i].user_uid);
										list_accepted = list_accepted + `${end_user}\r`;	
										accepted_count = i;									
										break;
									}
		
									if (accepted_count === 0) {
										list_accepted = "*Список пуст*";
									}
		
									const embed_quest = {
										title: event_data.event_title,
										color: 0x0099ff,
										fields: [
											{
												name: "Дата завершения",
												value: format(new Date(event_data.event_date), 'DD.MM.YYYY, HH:mm'),
											},
											{
												name: "Взяли задание:",
												value: list_accepted,
											},
											{
												name: "\u200b",
												value: "\u200b"
											},
										],
										timestamp: new Date().toISOString(),
										footer: {
											icon_url: "https://sunfox.ee/resources/img/discord_bot/vv_sq_logo.png",
											text: "Викинги Вирумаа"
										},
									}
									interaction.reply({content: 'Вот список участников квеста:', embeds: [embed_quest], ephemeral: true });
								}
							});
						}
					});
					break;
				
				default:
					break;
			}			
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
			callback("Событие отсуствует в базе данных.",null);
			return;
		} else {
			callback(null,result[0]);
		}
	});
	// getLastEvent closed
}

getListEventRegistrations = function (event_id, callback) {	
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
				callback(null,result);
			}
		});
	}

getLastQuest = function (callback) {
	// Prepare MySQL request check if there is opened-registration event	
	let sql3 = "SELECT * FROM `quests` ORDER BY `date_created` DESC LIMIT 1; ";
	database.query(sql3, (error3, result, fields) => {
		if (error3) {
			callback("Ошибка в работе базы данных.",null);
			return;
		} else if (result.length != 1) {
			callback("Квест отсуствует в базе данных.",null);
			return;
		} else {
			callback(null,result[0]);
		}
	});
	// getLastEvent closed
}

getListQuestRegistrations = function (quest_id, callback) {	
		// Prepare MySQL request to get list of registred users	
		let sql4 = "SELECT `quest_usr`.`user_uid`, `quest_usr`.`user_status` FROM `quest_usr` INNER JOIN (SELECT MAX(id) as id FROM `quest_usr` GROUP BY `user_uid`) last_updates ON last_updates.id = quest_usr.id WHERE quest_usr.quest_id = ? AND  WHERE quest_usr.user_status = '1' ORDER BY `user_status` DESC;";
		database.query(sql4, [quest_id], (error4, result, fields) => {
			if (error4) {
				callback("Ошибка в работе базы данных.",null);
				return;
			} else if (result.length == 0) {
				callback("Отсуствуют регистрации на квест.",null);
				return;
			} else {
				callback(null,result);
			}
		});
	}