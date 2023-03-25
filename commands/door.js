const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('door')
		.setDescription('Отправить уведомление об изменении доступности помещения Клуба.')
		.addStringOption(option =>
			option.setName('door_status')
				.setDescription('Статус доступности.')
				.setRequired(true)
				.addChoices(
					{ name: 'Открыт', value: 'open' },
					{ name: 'Закрыт', value: 'close' }
				))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

	async execute(interaction) {
        var door_status = interaction.options.getString('door_status');
        
        switch (door_status) {
            case 'open':
                var notification_text = ' двери клуба открыты.';
                break;
            case 'close':
                var notification_text = ' двери клуба закрыты.';
                break;
            default:
                break;
        }

        const UserNotify = interaction.client.channels.cache.get(config.log_channel_id);
		UserNotify.send({ content: String.fromCodePoint('0x1F511') + ` <@&${config.event_notify_role_id}>, ${notification_text}` });
        interaction.reply({ content: 'Door status has been successfully changed!', ephemeral: true });
	},
};