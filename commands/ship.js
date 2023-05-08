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
                    .setDescription('Тип корабля')
                    .setDescriptionLocalizations({
                        "en-US": 'Ship type',
                    })
                    .setRequired(true)
                    .addChoices(
                        { name: 'Tall Tales', value: 'tales' },
                        { name: 'Tall Tales - Jack Sparrow', value: 'tales_sparrow' },
                        { name: 'Farm - Златодержцы', value: 'farm_gh' },
                        { name: 'Farm - Орден душ', value: 'farm_souls' },
                        { name: 'Farm - Торговый союз', value: 'farm_merch' },
                        { name: 'Farm - Охотники', value: 'farm_hunt' },
                        { name: 'Farm - Athena', value: 'farm_athena' },
                        { name: 'Farm - Reapers', value: 'farm_reaper' },
                        { name: 'PVP - Open world', value: 'pvp_world' },
                        { name: 'PVP - Matchmaking', value: 'pvp_matchmaking' },
                    ))
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
                    { name: '15 мин.', value: '15' },
                    { name: '30 мин.', value: '30' },
                    { name: 'Следующий час', value: '60' }
                )),

    async execute(interaction) {
        const hasCaptainRole = interaction.member.roles.cache.has("1104521026584457216")
		if (hasCaptainRole == false) {
			const locales = {
				"en-US": 'You do not have permission to execute this command!',
			};
			await interaction.reply(locales[interaction.locale] ?? 'У вас недостаточно прав для выполнения этой команды!');
		} else {

            // Send invite to specified channel
            const ShipNotify = interaction.client.channels.cache.get('1104517743279087676');
            var member_id = interaction.member.user.id;

            const ship_type = interaction.options.getString('ship');
            const ship_task = interaction.options.getString('task');
            const ship_channel = interaction.options.getString('channel');
            const ship_time = interaction.options.getString('time');

            await interaction.guild.members.fetch(member_id).then(
                fetchedUser => {

                    console.log(fetchedUser.user.id);
                       
                }
            // await interaction.guild.members.fetch closed
            ).catch(console.error);
        }
	},
};