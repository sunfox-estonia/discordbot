const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('status')
		.setDescription('Показывает статус работы Бота, сервисов Sunfox.ee и БД.')
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


			await interaction.reply({ content: 'Secret answer.', ephemeral: true });
		},
};
