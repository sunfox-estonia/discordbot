const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('levelup')
		.setDescription('Добавить достижение для выбранного пользователя.')
		.addUserOption(option =>
			option.setName('target_user')
			.setDescription('Имя пользователя')
			.setRequired(true))
		.addStringOption(option =>
			option.setName('achievement_code')
			.setDescription('Код достижения')
			.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

	async execute(interaction) {
		const hasAdminRole = interaction.member.roles.cache.some(r=>JSON.stringify(config.admin_roles).includes(r.name))
		if (hasAdminRole === FALSE) {
			const locales = {
				en: 'You do not have permission to execute this command!',
				et: 'Te ei saa sellist skripti käivitada!',
				};
			await interaction.reply(locales[interaction.locale] ?? 'У вас недостаточно прав для выполнения этой команды!');
		}		

		const data_user = interaction.options.getUser('target_user');
		const data_achievement = interaction.options.getString('achievement_code');

		var embed_achievement = {
			title: "Camellia получил новую ачивку!",
			color: 2763454,			
			thumbnail: {
			url: "https://sunfox.ee/resources/img/discord_bot/alert_scroll.png"
			},
			fields: [				
				{
					name: ":ballot_box_with_check: - Яйценос (2 золотых)",
					value: "Вооружившись топором, победить противника с аналогичным оружием."
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

		await client.channels.cache.get(config.log_channel_id).send({embeds: [embed_levelup]});

		var embed_levelup = {
			title: "Camellia получил новый уровень!",
			color: 2763454,			
			thumbnail: {
			url: "https://sunfox.ee/resources/img/discord_bot/alert_announcement.png"
			},
			fields: [				
				{
					name: ":knife: Викинг",
					value: "1 уровень"
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

		await client.channels.cache.get(config.log_channel_id).send({embeds: [embed_levelup]});
	},
};