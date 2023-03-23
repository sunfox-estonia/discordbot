const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Показывает статус работы Бота, сервисов Sunfox.ee и БД.')
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

		async execute(interaction) {
			
			var embed_help = {
				title: "Помощь по командам бота на сервере Sunfox.ee",
				description: "Мы значительно обновили функции бота и добавили новые команды. Ниже приведен их список и описание.",
				color: 0x0099ff,			
				fields: [	
					{
						name: "/profile <target_user>",
						value:"Просмотреть профиль пользователя. Пользователи могут просматривать только собственные профили, участники с ролью администраторов могут просмотреть профили других пользователей.",
					},
					{
						name: "/roll <dice_type>",
						value:"Кинуть выбранный кубик и показать результат в чате.",
					},
					{
						name: "/card",
						value:"Вытащить случайную карту из колоды и показать результат в чате.",
					},
					{
						name: "/adduser <target_user>",
						value:"Добавить пользователя в базу данных сообщества. Пользователь получит уведомление, и сможет просматривать свой профиль,а также регистрироваться на мероприятия и квесты сообщества. Команда доступна только участникам с ролью администратора.",
					},		
					{
						name: "/addcoins <target_user> <coins_amount>",
						value:"Добавить монеты на аккаунт пользователя. Пользователь получит уведомление, и сможет проверить сумму момент в профиле. Команда доступна только участникам с ролью администратора.",
					},
					{
						name: "/create <event_type>",
						value:"Показывает форму создания события одного из двух типов: мероприятия и квесты. После отправки формы, мероприятие/квест будет создано в базе данных, а пользователи получат уведомление с возможностью зарегистрироваться участником мероприятия/квеста или отказаться от него. Команда доступна только участникам с ролью администратора.",
					}
				],
				timestamp: new Date().toISOString(),
				footer: {
					icon_url: "https://sunfox.ee/resources/img/discord_bot/vv_sq_logo.png",
					text: "Викинги Вирумаа"
				},
			}
			var component_buttons = {
				"type": 1,
				"components": [
					{
						"type": 2,
						"label": "Читать подробнее",
						"style": 5,
						"url": "https://wiki.sunfox.ee/public:services_bot"
					},
					{
						"type": 2,
						"label": "Описание Системы достижений",
						"style": 5,
						"url": "https://vk.com/@viruviking-sistema-dostizhenii-vikingov-virumaa"
					}
				]
			}

			await interaction.reply({ content:`${interaction.member.nickname ?? interaction.member.user.username}, для Вас весть от Хугинна:`, embeds: [embed_help], components: [component_buttons], ephemeral: true });
		},
};
