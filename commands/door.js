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
					{ name: 'open', value: 'Открыт' },
					{ name: 'close', value: 'Закрыт' }
				))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

	async execute(interaction) {
        const door_status = interaction.options.getString('door_status');
        
        switch (door_status) {
            case 'open':
                var notification_text = String.fromCodePoint('0x1F511') + ' двери клуба открыты.';
                break;
            case 'close':
                var notification_text = String.fromCodePoint('0x1F511') + ' двери клуба закрыты.';
                break;
            default:
                break;
        }

        const UserNotify = interaction.client.channels.cache.get(config.log_channel_id);
		// UserNotify.send({ content: content: String.fromCodePoint('0x1F511') + ` <@&${config.event_notify_role_id}>, ${notification_text}` });
        // interaction.reply({ content: 'Command has been successfully executed!', ephemeral: true });
        interaction.reply({ content: String.fromCodePoint('0x1F511') + ` ${notification_text}`, ephemeral: true });
	},
};