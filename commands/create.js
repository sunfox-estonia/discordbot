const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('create')
		.setDescription('Создать Событие или Квест для участников сообщества.')
		.addStringOption(option =>
			option.setName('event_type')
			.setDescription('Что создаем?')
			.setRequired(true)
			.addChoices(
				{ name: 'Событие', value: 'event' },
				{ name: 'Квест', value: 'quest' }
			))
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),


	async execute(interaction) {
		const hasAdminRole = interaction.member.roles.cache.some(r=>JSON.stringify(config.admin_roles).includes(r.name))
		if (hasAdminRole == false) {
			const locales = {
				en: 'You do not have permission to execute this command!',
				et: 'Te ei saa sellist skripti käivitada!',
				};
			await interaction.reply(locales[interaction.locale] ?? 'У вас недостаточно прав для выполнения этой команды!');
		}

		const data_event = interaction.options.getString('event_type');

		switch (data_event) {
			case 'event':
				var modal_form = {
					"title": "My Cool Modal",
					"custom_id": "cool_modal",
					"components": [{
					  "type": 1,
					  "components": [{
						"type": 4,
						"custom_id": "name",
						"label": "Name",
						"style": 1,
						"min_length": 1,
						"max_length": 4000,
						"placeholder": "John",
						"required": true
					  }]
					},
					{
						"type": 1,
						"components": [{
						  "type": 4,
						  "custom_id": "name1",
						  "label": "Name 1",
						  "style": 1,
						  "min_length": 1,
						  "max_length": 4000,
						  "placeholder": "John",
						  "required": true
						}]
					  },
					]
				  }
				break;
			case 'quest':
				
				break;
			default:
				break;
		}

		await interaction.showModal(modal_form);
		
	},
};