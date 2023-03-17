const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('card')
		.setDescription('Вытащить случайную карту из колоды.'),

	async execute(interaction) {

		var crd = ['2','3','3','5','6','7','8','9','10','A','J','K','Q'];
        var clr = ['C','D','H','S'];
        var rndCrd = crd[Math.floor(Math.random()*crd.length)];
        var rndClr = clr[Math.floor(Math.random()*clr.length)];
		var card = rndCrd + rndClr + '.png';

		await interaction.reply({files: ['https://r.snfx.ee/img/discord_bot/card/' + card]});
	},
};