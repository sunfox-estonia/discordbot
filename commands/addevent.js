const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('addevent')
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
					"title": "Создать мероприятие",
					"custom_id": "event_run",
					"components": [
					{
						"type": 1,
						"components": [{
							"type": 4,
							"custom_id": "event_title",
							"label": "Название мероприятия:",
							"style": 1,
							"min_length": 1,
							"max_length": 500,
							"required": true
						}]
					},
					{
						"type": 1,
						"components": [{
							"type": 4,
							"custom_id": "event_datetime",
							"label": "Дата проведения:",
							"placeholder": "DD/MM/YYYY HH:MM",
							"style": 1,
							"min_length": 1,
							"max_length": 500,
							"required": true
						}]
					},
					{
						"type": 1,
						"components": [{
							"type": 4,
							"custom_id": "event_location",
							"label": "Место проведения:",
							"style": 1,
							"min_length": 1,
							"max_length": 500,
							"value": "Помещение Клуба (Tamme 17, Jõhvi vald)",
							"required": true							
						}]
					},
					{
						"type": 1,
						"components": [{
						  "type": 4,
						  "custom_id": "event_description",
						  "label": "Краткое описание:",
						  "style": 2,
						  "min_length": 1,
						  "max_length": 2000,
						  "required": false
						}]
					},
					{
						"type": 1,
						"components": [{
							"type": 4,
							"custom_id": "event_url",
							"label": "URL с подробной информацией:",
							"style": 1,
							"min_length": 1,
							"max_length": 1000,
							"required": false
						}]
					},]
				  }
				break;
			case 'quest':
				var modal_form = {
					"title": "Создать квест",
					"custom_id": "quest_run",
					"components": [
					{
						"type": 1,
						"components": [{
							"type": 4,
							"custom_id": "quest_title",
							"label": "Название квеста:",
							"style": 1,
							"min_length": 1,
							"max_length": 1000,
							"required": true
						}]
					},
					{
						"type": 1,
						"components": [{
						  "type": 4,
						  "custom_id": "quest_description",
						  "label": "Краткое описание задания:",
						  "style": 2,
						  "min_length": 1,
						  "max_length": 2000,
						  "required": true
						}]
					},
					{
						"type": 1,
						"components": [{
							"type": 4,
							"custom_id": "quest_datetime",
							"label": "Срок выполнения:",
							"placeholder": "DD/MM/YYYY HH:MM",
							"style": 1,
							"min_length": 1,
							"max_length": 500,
							"required": true
						}]
					},
					{
						"type": 1,
						"components": [{
							"type": 4,
							"custom_id": "quest_reward",
							"label": "Награда за выполнение:",
							"style": 2,
							"min_length": 1,
							"max_length": 2000,
							"required": true
						}]
					},]
				  }
				break;
			default:
				break;
		}

		await interaction.showModal(modal_form);		
	},
};