const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('addcoins')
		.setDescription('Добавить монеты на аккаунт пользователя.')
		.addUserOption(option =>
			option.setName('target_user')
			.setDescription('Имя пользователя')
			.setRequired(true))
		.addStringOption(option =>
			option.setName('coins_count')
				.setDescription('Количество монет')
				.setRequired(true))
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

		const target_user = interaction.options.getUser('target_user');
		const data_coins = interaction.options.getString('coins_count');

		await interaction.guild.members.fetch(target_user).then(fetchedUser => {

			getProfile(fetchedUser.user.id,function(error,user_profile){
				if (error) {
					const locales = {
						en: 'An error occurred while retrieving user profile.',
						et: 'Kasutaja profiili otsimisel on tekkinud viga.',
						};
					interaction.reply(locales[interaction.locale] ?? error);
				} else {	

					let coins_sum = user_profile.coins + data_coins;

					updateCoins(fetchedUser.user.id,coins_sum,function(error){	
						if (error) {
							const locales = {
								en: 'An error occurred while updating user profile.',
								et: 'Kasutaja profiili uuendamisel on tekkinud viga.',
								};
							interaction.reply(locales[interaction.locale] ?? error);
						} else {

							var embed_addcoins = {
								title: fetchedUser.user.username + " получил монеты!",
								description: "На аккаунт пользователя добавлено " + data_coins + " золотых.",
								color: 2763454,			
								thumbnail: {
									url: "https://sunfox.ee/resources/img/discord_bot/alert_coins.png"
								},
								fields: [				
									{
										name: "\u200b",
										value:"\u200b"
									}
								],
								timestamp: new Date().toISOString(),
								footer: {
									icon_url: "https://sunfox.ee/resources/img/discord_bot/vv_sq_logo.png",
									text: "Викинги Вирумаа"
								},
							}
					
							const channel = await interaction.client.channels.cache.get(config.log_channel_id);
							await channel.send({embeds: [embed_addcoins]});
							await interaction.reply('Command has been successfully executed!');

						}
					// updateCoins closed
					});
				// else closed
				}
			// getProfile closed
			});	
		
		// await interaction.guild.members.fetch closed
		}



	},
};

getProfile = function(user_id, callback) {
	// Prepare MySQL request to retrieve user data	
	let sql1 = "SELECT id, uid, community, coins FROM drd_users WHERE uid = ? LIMIT 1;";   
	database.query(sql1, [user_id], (error1, result_userdata, fields) => {
		if (error1) {
			callback("Ошибка получения профиля пользователя.",null);
			return;
		}
		if (result_userdata.length == 0 || result_userdata.length > 1){
			callback("Ошибка получения профиля пользователя.",null);
			return;
		}
		callback(null,result_userdata[0]);
	});
}

updateCoins = function(user_id, coins, callback) {
	// Prepare MySQL request to retrieve user data	
	let sql2 = "UPDATE drd_users SET coins = ? WHERE uid = ?;";   
	database.query(sql2, [user_id, coins], (error2, pingback) => {
		if (error2) {
			callback("Ошибка обновления профиля пользователя.");
			return;
		}
		callback(null);
	});
}
