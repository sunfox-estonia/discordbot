const { SlashCommandBuilder } = require('discord.js');
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
		.setName('profile')
		.setDescription('Просмотреть профиль пользователя.')
		.addUserOption(option =>
			option.setName('target_user')
			.setDescription('Имя пользователя')),

	async execute(interaction) {
		// Check if member is admin, and recieve target user data.
		const hasAdminRole = interaction.member.roles.cache.some(r=>JSON.stringify(config.admin_roles).includes(r.name))
		if (hasAdminRole == true) {
			if (interaction.options.getMember('target_user') == null) {
				var member_id = interaction.member.user.id;
			} else {
				var member_id = interaction.options.getMember('target_user');
			}
		} else {
			var member_id = interaction.member.user.id ;
		}

		await interaction.guild.members.fetch(member_id).then(
			fetchedUser => {
				var embed_profile = prepareEmbed(fetchedUser.user);
				console.log(embed_profile);
				interaction.reply({embeds: [embed_profile]});
			}

		).catch(console.error);	
		
	},
};

function prepareEmbed(user_data) {
	// Prepare MySQL request to retrieve user data	
	let sql1 = "SELECT drd_users.uid, drd_users.level, drd_users.coins, drd_levels.title, drd_levels.symbol FROM drd_users LEFT JOIN drd_levels ON drd_users.level = drd_levels.level WHERE drd_users.uid = ? LIMIT 1;";   
	database.query(sql1, [user_data.id], (error1, result_userdata, fields) => {
		if (error1) {
			return 'false';
		}
		if (result_userdata.length == 0){
			return 'false';
		}
		if (result_userdata.length == 1 || result_userdata.length > 1){

			let sql2 = "SELECT drd_achievements.code, drd_achievements.title, drd_achievements.description, drd_usr_ach.date FROM drd_achievements LEFT JOIN drd_usr_ach ON drd_achievements.code = drd_usr_ach.ach_id AND drd_usr_ach.user_id = ? WHERE drd_achievements.level = ?;"; 
			database.query(sql2, [result_userdata[0].uid, result_userdata[0].level], function(error2, result_levels, fields) {
				if (error2) {
					return 'false';
				} 
				if (result_levels.length == 0 || result_levels.length > 1){
                    return 'false';
                }
				if (result_levels.length == 1){

					console.log(result_levels);

					var embed_profile = {
						title: (String.fromCodePoint(result_levels[0].symbol) +' '+ result_levels[0].title),
						description: user_source[0].level +' уровень | ' + user_source[0].coins + ' золотых',
						color: 0x0099ff,
						thumbnail: {
							url: member_data.avatarURL
						},
						author: {
							name: "Vitgor Sunfox"      
						},
						fields: [
							{
							name: "\u200b",
							value:"\u200b"
						},
						{
							name: ":white_medium_square: - Невидимый убийца",
							value: "С возвышенности 10 м. бросить LARP-копьё (сулицу), попав не менее 3 раз из 5 в размеченную зону диаметром 3 метра."
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
					return embed_profile;					
				}	
			});
		}	
	});	

}