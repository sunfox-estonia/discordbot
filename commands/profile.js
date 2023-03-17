const { SlashCommandBuilder } = require('discord.js');
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
		.setName('profile')
		.setDescription('Просмотреть профиль пользователя.')
		.addUserOption(option =>
			option.setName('target_user')
			.setDescription('Имя пользователя')),

	async execute(interaction) {
		const hasAdminRole = interaction.member.roles.cache.some(r=>JSON.stringify(config.admin_roles).includes(r.name))
		if (hasAdminRole == true) {
			var data_user = interaction.options.getUser('target_user') ?? interaction.member ;
		} else {
			var data_user = interaction.member;
		}

		console.log(data_user);

		var embed_profile = {
			title: ":knife: Викинг",
			description: "1 уровень | 30 золотых",
			color: 0x0099ff,
			thumbnail: {
				url: "https://cdn.discordapp.com/avatars/363400912733208587/4bcbdac3afa52ce859dad372b1809796.png?size=2048"
			},
			author: {
				name: "Vitgor Sunfox"      
			},
			fields: [
				{
				name: "\u200b",
				value:"\u200b"
			},
			{
				name: ":ballot_box_with_check: - Сельский фехтовальщик",
				value: "Вооружившись топором, победить противника с аналогичным оружием."
			},
			{
				name: ":white_medium_square: - Невидимый убийца",
				value: "С возвышенности 10 м. бросить LARP-копьё (сулицу), попав не менее 3 раз из 5 в размеченную зону диаметром 3 метра."
			},
			{
				name: "\u200b",
				value:"\u200b"
			}
			],
			timestamp: new Date().toISOString(),
			footer: {
				icon_url: "https://sunfox.ee/resources/img/discord_bot/vv_sq_logo.png",
				text: "Викинги Вирумаа"
			},
		}
		
		await interaction.reply({embeds: [embed_profile]});
	},
};