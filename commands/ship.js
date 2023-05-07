const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ship')
		.setDescription('Пригласить в Sea of Thieves')
        .setDescriptionLocalizations({
            en: 'Invite to play Sea of Thieves',
        })
		.addStringOption(option =>
			option.setName('ship')
				.setDescription('Тип корабля')
                .setDescriptionLocalizations({
                    en: 'Ship type',
                })
				.setRequired(true)
				.addChoices(
					{ name: 'slup', value: 'Шлюп' },
					{ name: 'brig', value: 'Бригантина' },
					{ name: 'galley', value: 'Галеон' }
				))
        .addStringOption(option =>
            option.setName('task')
                .setDescription('Цель путешествия')
                .setMaxLength(500))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Канал')
                .setRequired(true)
                .setDescriptionLocalizations({
                    en: 'Voice channel',
                })
                .addChannelTypes(ChannelType.GuildText))
        .addStringOption(option =>
            option.setName('time')
                .setDescription('Старт сессии через...')
                .setDescriptionLocalizations({
                    en: 'Session starts in...',
                })
                .setRequired(true)
                .addChoices(
                    { name: '0', value: 'сразу' },
                    { name: '15', value: '15 min' },
                    { name: '30', value: '30 min' },
                    { name: '60', value: 'ближайший час' }
                )),

    async execute(interaction) {
        const hasCaptainRole = interaction.member.roles.cache.has("1104521026584457216")
		if (hasCaptainRole == false) {
			const locales = {
				en: 'You do not have permission to execute this command!',
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