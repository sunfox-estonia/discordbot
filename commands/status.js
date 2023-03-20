const { SlashCommandBuilder, PermissionFlagsBits , Client } = require('discord.js');
const config = require('../config.json');
const client = new Client({ intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.MessageContent,
	GatewayIntentBits.GuildMembers,
] });

module.exports = {
	data: new SlashCommandBuilder()
		.setName('status')
		.setDescription('Показывает статус работы Бота, сервисов Sunfox.ee и БД.')
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

			const channel = client.channels.cache.get(config.log_channel_id);
			channel.send({ content: 'Secret content.', ephemeral: true });
		},
};
