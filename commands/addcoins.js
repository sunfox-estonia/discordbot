const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('addcoins')
		.setDescription('Добавить монеты на аккаунт пользователя.')
		.addUserOption(option =>
			option.setName('target_user')
			.setDescription('Имя пользователя')
			.setRequired(true))
		.addStringOption(option =>
			option.setName('coins_count')
				.setDescription('Количество монет')
				.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

	async execute(interaction) {
		const hasAdminRole = interaction.member.roles.cache.some(r=>JSON.stringify(config.admin_roles).includes(r.name))
		if (hasAdminRole == false) {
			const locales = {
				en: 'You do not have permission to execute this command!',
				et: 'Te ei saa sellist skripti käivitada!',
				};
			await interaction.reply(locales[interaction.locale] ?? 'У вас недостаточно прав для выполнения этой команды!');
		}
		


		const data_user = interaction.options.getUser('target_user');
		const data_coins = interaction.options.getString('coins_count');

		var embed_addcoins = {
			title: "Ejenkou получил монеты!",
			description: "На аккаунт пользователя добавлено 6 золотых.",
			color: 2763454,			
			thumbnail: {
				url: "https://sunfox.ee/resources/img/discord_bot/alert_coins.png"
			},
			fields: [				
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

		await client.channels.cache.get(config.log_channel_id_id).send({embeds: [embed_addcoins]});
	},
};
