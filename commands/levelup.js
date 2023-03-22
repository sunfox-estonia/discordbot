const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config.json');
const mysql = require('mysql');
const database = mysql.createConnection({
    host: config.db_config.host,
    user: config.db_config.dbuser,
    password: config.db_config.dbpass,
    database: config.db_config.dbname,
    debug: false,
    multipleStatements: true,
  });

module.exports = {
	data: new SlashCommandBuilder()
		.setName('levelup')
		.setDescription('Добавить достижение для выбранного пользователя.')
		.addUserOption(option =>
			option.setName('target_user')
			.setDescription('Имя пользователя')
			.setRequired(true))
		.addStringOption(option =>
			option.setName('achievement_code')
			.setDescription('Код достижения')
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
		const target_achievement = interaction.options.getString('achievement_code');
		const channel = interaction.client.channels.cache.get(config.log_channel_id);

		await interaction.guild.members.fetch(target_user).then(
			fetchedUser => {
				getProfile(fetchedUser.user.id,function(error,user_profile){
					if (error) {
						const locales = {
							en: 'An error occurred while retrieving user profile.',
							et: 'Kasutaja profiili otsimisel on tekkinud viga.',
							};
						interaction.reply({ content: locales[interaction.locale] ?? error, ephemeral: true });						
					} else {
						checkAchievement(user_profile,target_achievement,function(error,achievement_data){
							if (error) {
								const locales = {
									en: 'An error occurred while retrieving achievement data.',
									et: 'Saavutuse andmete otsimisel on tekkinud viga.',
									};
								interaction.reply({ content: locales[interaction.locale] ?? error, ephemeral: true });
							} else {		
								addAchievement(user_profile, achievement_data,function(error){
									if (error) {
										const locales = {
											en: 'An error occurred while user pofile updating.',
											et: 'Kasutaja profiili uuendamisel on tekkinud viga.',
											};
										interaction.reply({ content: locales[interaction.locale] ?? error, ephemeral: true });
									} else {										
										var embed_achievement = {
											title: fetchedUser.user.username + " получил новую ачивку!",
											color: 0x0099ff,			
											thumbnail: {
											url: "https://sunfox.ee/resources/img/discord_bot/alert_scroll.png"
											},
											fields: [				
												{
													name: ":ballot_box_with_check: - " + achievement_data.title + " (" + achievement_data.coins + " золотых)",
													value: achievement_data.description
												},
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
										
										updateLevel(user_profile, function(error,updated_profile){
											if (error) {
												const locales = {
													en: 'An error occurred while user pofile updating.',
													et: 'Kasutaja profiili uuendamisel on tekkinud viga.',
													};
												
												channel.send({embeds: [embed_achievement]});
												interaction.reply({ content: locales[interaction.locale] ?? error, ephemeral: true });
												return;
											} else {
												var embed_levelup = {
													title: fetchedUser.user.username + " получил новый уровень!",
													color: 0x0099ff,			
													thumbnail: {
													url: "https://sunfox.ee/resources/img/discord_bot/alert_announcement.png"
													},
													fields: [				
														{
															name: (String.fromCodePoint(updated_profile.symbol) +' '+ updated_profile.title),
															value: updated_profile.level +' уровень'
														},
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
												channel.send({embeds: [embed_achievement, embed_levelup]});
												interaction.reply({ content: 'Command has been successfully executed!', ephemeral: true });
												return;
											}
										});									
									}	
								});
								
							}	
						});
					}
				});

			}
		// await interaction.guild.members.fetch closed
		).catch(console.error);	
	}
};

getProfile = function(user_id, callback) {
	// Prepare MySQL request to retrieve user profile and achievement data	
	let sql1 = "SELECT drd_users.id, drd_users.uid, drd_users.level, drd_users.coins, drd_levels.title, drd_levels.symbol FROM drd_users LEFT JOIN drd_levels ON drd_users.level = drd_levels.level WHERE uid = ? LIMIT 1;";   
	database.query(sql1, [user_id], (error1, results, fields) => {
		if (error1) {
			callback("Ошибка в работе базы данных.",null);
			return;
		}
		if (results[0].length != 1 || results[1].length != 1){
			callback("Ошибка получения профиля пользователя.",null);
			return;
		}
		callback(null,results[0]);
	});
}

checkAchievement = function(user_data, achievement_code, callback) {
		// Check thе achievement exists and is available for user level
		let sql2 = "SELECT * FROM drd_achievements WHERE code = ? AND level = ?;";
		database.query(sql2, [achievement_code,user_data.level], (error2, achievement_fulldata, fields) => {
			if (error2) {
				callback("Ошибка в работе базы данных.",null);
				return;
			}
			if (achievement_fulldata.length != 1){
				callback("Указанное достижение не существует или не доступно для выбранного пользователя.",null);
				return;
			}
			// Check if achivement is already added for selected user
			let sql3 = "SELECT count(*) AS rowscount FROM drd_usr_ach WHERE user_id = ? AND ach_id = ?;";
			database.query(sql3, [user_data.uid,achievement_code], (error3, check_added, fields) => {
				if (error3) {
					callback("Ошибка в работе базы данных.",null);
					return;
				}
				if (check_added[0].rowscount > 0){
					callback("Указанное достижение уже добавлено для выбранного пользователя.",null);
					return;
				}
			});	
			callback(null,achievement_fulldata[0]);				
		});		
// checkAchievement ended
}

addAchievement = function(user_data, achievement_data, callback) {
	// Add achivement for user
	console.log(user_data.uid);
	console.log(achievement_data.code);
	let sql4 = "INSERT INTO drd_usr_ach (user_id, ach_id) VALUES (?,?);";
    database.query(sql4, [user_data.uid,achievement_data.code], (error4, pingback) => {
        if (error4) {
            callback("Ошибка добавления достижения в профиль пользователя.");
            return;
        }
		callback(null);

		let coins_sum = user_data.coins + achievement_data.coins;
		// Prepare MySQL request to update soins sum for selected user
		let sql5 = "UPDATE drd_users SET coins = ? WHERE uid = ?;";   
		database.query(sql5, [user_data.uid, coins_sum], (error5, pingback) => {
			if (error5) {
				callback("Ошибка обновления профиля пользователя.");
				return;
			}
			callback(null);
		});
    }); 
// addAchievement ended
}

updateLevel = function(user_data, callback) {
	// Get available and done achievement count
	let sql5 = "SELECT count(*) AS needed_count FROM drd_achievements WHERE level = ?; SELECT count(*) AS done_count FROM drd_usr_ach LEFT JOIN drd_achievements ON drd_usr_ach.ach_id = drd_achievements.code AND drd_achievements.level = ? WHERE drd_usr_ach.user_id = ?;"
	database.query(sql5, [user_data.level,user_data.level,user_data.uid], (error5, results, fields) => {
		if (error5) {
            callback("Ошибка в работе базы данных.",null);
            return;
    	}
		if (results[0].needed_count == results[1].done_count){
			// Levelup in case of user has been done all available achievements
			let lvl_sum = user_data.level + 1;
			let sql6 = "UPDATE drd_users SET level =? WHERE uid =?;"; 
			database.query(sql6, [lvl_sum,user_data.id], (error6, pingback) => {
				if (error6) {
                    callback("Ошибка обновления профиля пользователя.",null);
                    return;
                }				
				getProfile(user_data.uid,function(error,user_profile_updated){
					if (error) {
						callback("Ошибка получения профиля пользователя.",null);
						return;
					} else {
						callback(null,user_profile_updated);
					}
				});
			});            
        } else {
			callback("Выбранный пользователь не получит новый уровень.",null);
            return;
		}
	});
// updateLevel ended
}