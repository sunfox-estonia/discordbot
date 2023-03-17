const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('adduser')
		.setDescription('Добавить пользователя в базу данных сообщества.')
		.addUserOption(option =>
			option.setName('target_user')
			.setDescription('Имя пользователя')
			.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

	async execute(interaction) {
		const hasAdminRole = interaction.member.roles.cache.some(r=>JSON.stringify(config.admin_roles).includes(r.name))
		if (hasAdminRole === FALSE) {
			const locales = {
				en: 'You do not have permission to execute this command!',
				et: 'Te ei saa seda skripti käivitada!',
				};
			await interaction.reply(locales[interaction.locale] ?? 'У вас недостаточно прав для выполнения этой команды!');
		}

		const data_user = interaction.options.getUser('target_user');

		await interaction.reply({ content: 'Пользователь добавлен в БД сообщества.', ephemeral: true });
	},
};