const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('invite')
		.setDescription('Создать приглашение на сервер')
		.addStringOption(option =>
			option.setName('landing')
				.setDescription('Лендинг с правилами сервера')
				.setRequired(false)
				.addChoices(
					{ name: 'Общие правила', value: 'common' },
					{ name: 'Glitterbeard Sailors', value: 'glitterbeard' }
        ))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

	async execute(interaction) {
        var landing = interaction.options.getString('landing');
        var baseUrl = 'https://welcome.sunfox.ee/';

        let invite = await message.channel.createInvite(
        {
            maxAge: 30 * 60 * 1000, // maximum time for the invite, in milliseconds
            maxUses: 1 // maximum times it can be used
        }
        ).catch(console.log);
        switch (landing) {
            case 'glitterbeard':
                var landingUrl = baseUrl + 'glitterbeards' + '/';
                break;
        
            default:
                var landingUrl = baseUrl;
                break;
        }
        var inviteUrl = landingUrl + invite.code;
		await interaction.reply({content: '— Вот Твоя ссылка-приглашение на сервер: '+inviteUrl, ephemeral: true });	
	},
};