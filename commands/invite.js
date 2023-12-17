const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

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

        let invite = await interaction.channel.createInvite(
        {
            maxAge: 1800000, // 30 minutes
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
		interaction.reply({content: '— Вот Твоя ссылка-приглашение на сервер: '+inviteUrl, ephemeral: true });	
	},
};