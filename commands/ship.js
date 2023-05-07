const { SlashCommandBuilder, ChannelType  } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ship')
		.setDescription('Пригласить в Sea of Thieves')
        .setDescriptionLocalizations({
            "en-US": 'Invite to play Sea of Thieves'
        })
		.addStringOption(option =>
			option.setName('ship')
				.setDescription('Тип корабля')
                .setDescriptionLocalizations({
                    "en-US": 'Ship type',
                })
				.setRequired(true)
				.addChoices(
					{ name: 'Шлюп', value: 'slup' },
					{ name: 'Бригантина', value: 'brig' },
					{ name: 'Галеон', value: 'galley' }
				))
        .addStringOption(option =>
            option.setName('task')
                .setDescription('Цель путешествия')
                .setRequired(true)
                .setMaxLength(500))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Канал')
                .setRequired(true)
                .setDescriptionLocalizations({
                    "en-US": 'Voice channel'
                })
                .addChannelTypes(ChannelType.GuildVoice))
        .addStringOption(option =>
            option.setName('time')
                .setDescription('Старт сессии через...')
                .setDescriptionLocalizations({
                    "en-US": 'Session starts in...',
                })
                .setRequired(false)
                .addChoices(
                    { name: 'Сразу', value: '0' },
                    { name: '15 min', value: '15' },
                    { name: '30 min', value: '30' },
                    { name: 'Ближайший час', value: '60' }
                )),

    async execute(interaction) {
        const hasCaptainRole = interaction.member.roles.cache.has("1104521026584457216")
		if (hasCaptainRole == false) {
			const locales = {
				"en-US": 'You do not have permission to execute this command!',
			};
			await interaction.reply(locales[interaction.locale] ?? 'У вас недостаточно прав для выполнения этой команды!');
		}

        // Send invite to specified channel
        const ShipNotify = interaction.client.channels.cache.get('1104517743279087676');

        await interaction.guild.members.fetch(member_id).then(
            fetchedUser => {
                confirmed = console.log(fetchedUser);
			}
		
        // await interaction.guild.members.fetch closed
		).catch(console.error);
	},
};