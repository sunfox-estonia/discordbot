const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('gameslist')
		.setDescription('Показывает игры, имеющиеся у участников сообщества.'),

		async execute(interaction) {
			await interaction.reply({ content: 'Secret answer.'});
		},
};
