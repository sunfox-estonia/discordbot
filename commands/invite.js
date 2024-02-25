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
					{ name: 'Glitterbeard Sailors', value: 'glitterbeard' },
                    { name: 'Virumaa Viikingid', value: 'viruviking' }
        ))
        .setDefaultMemberPermissions(PermissionFlagsBits.CreateInstantInvite),

	async execute(interaction) {
        var landing = interaction.options.getString('landing');
        var baseUrl = 'https://welcome.sunfox.ee/';

        let invite = await interaction.channel.createInvite(
        {
            maxAge: 7200, // 2h
            maxUses: 1 // maximum times it can be used
        }
        ).catch(console.log);
        switch (landing) {
            case 'glitterbeard':
                var landingUrl = baseUrl + 'gs' + '/';
                break;
            case 'viruviking':
                var landingUrl = baseUrl + 'vv' + '/';
                break;
            default:
                var landingUrl = baseUrl;
                break;
        }
        var inviteUrl = landingUrl + 'i/' + invite.code;
		interaction.reply({content: '— Вот ссылка-приглашение на сервер: '+inviteUrl, ephemeral: true });	
	},
};