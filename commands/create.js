const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('create')
		.setDescription('Создать Событие или Квест для участников сообщества.')
		.addStringOption(option =>
			option.setName('event_type')
			.setDescription('Что создаем?')
			.setRequired(true)
			.addChoices(
				{ name: 'Событие', value: 'event' },
				{ name: 'Квест', value: 'quest' }
			))
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

		const data_event = interaction.options.getString('event_type');

		await interaction.reply({ content: 'Secret answer.', ephemeral: true });
	},
};