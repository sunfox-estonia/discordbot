const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Пригласить играть вместе')
		.addRoleOption(option =>
			option.setName('role')
            .setDescription('Группа пользователей - адресатов')
			.setRequired(true))
		.addStringOption(option =>
            option.setName('game_name')
                .setDescription('Наименование игры')
                .setRequired(true)
                .addChoices(
                    { name: 'Sea of Thieves', value: 'sot'},
                    { name: 'Deeprock Galactic', value: 'drg'},
                    { name: 'Euro Track Simulator 2', value: 'ets'},
                    { name: 'Valheim', value: 'val'},
                    { name: 'Mordhau', value: 'mhu'}
            )),

	async execute(interaction) {
		const data_role = interaction.options.getRole('role');
		const data_game = interaction.options.getString('game_name');

		await interaction.reply('');
	},
};