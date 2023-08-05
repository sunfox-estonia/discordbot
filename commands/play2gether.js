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
const SteamAPI = require('steamapi');
const steam = new SteamAPI(config.bifrost_config.token_steam);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play2gether')
		.setDescription('Пригласить в игровое лобби.')
		.addBooleanOption(option =>
			option.setName('link')
				.setRequired(false)
				.setDescription('Показать только ссылку-приглашение в приватном сообщении.')),

    async execute(interaction) {
		const hasBifrostRole = interaction.member.roles.cache.some(r => r.id === config.bifrost_config.roleid)
		if (hasBifrostRole == false) {
			const locales = {
				"en-US": 'You do not have permission to execute this command!'
			};
			await interaction.reply(locales[interaction.locale] ?? 'У вас недостаточно прав для выполнения этой команды!');
		}  else {
            const url_only = interaction.options.getBoolean('link') ?? false;
            const member_id = interaction.member.user.id;

            await interaction.guild.members.fetch(member_id).then(fetchedUser => {
                var embed_author = fetchedUser.nickname ?? fetchedUser.user.username;
                // Get user Steam and Xbox id from database
                getBifrost(member_id, function (error, member_data) {
                    if (error) {
                        const locales = {
                            "en-US": 'An error occurred while retrieving user profile.'
                        };
                        interaction.reply({ content: locales[interaction.locale] ?? error, ephemeral: true });
                    } else {
                        console.log(member_data);
                        // Get user data activity from Steam
                        steam.getUserSummary(member_data.steam_id).then(SteamUser => {
                            // Check if user is playing something or not
                            if(SteamUser.gameID !== undefined){
                                // Get Steam application data
                                steam.getGameDetails(SteamUser.gameID).then(SteamApp => {                               
                                    // Generate Bofrost invite URI
                                    const BofrostUri = 'https://bifrost.snfx.ee/steam/'+SteamApp.steam_appid+'/'+SteamUser.steamID;
                                    // Show embed component or just URI
                                    if (url_only === false) {
                                        var invite_embed = {
                                            //description: "",
                                            color: 0xdd6282,
                                            timestamp: new Date().toISOString(),
                                            footer: {
                                                icon_url: "https://sunfox.ee/resources/img/discord_bot/vv_sq_logo.png",
                                                text: "Викинги Вирумаа"
                                            },
                                            thumbnail: {
                                            url: SteamApp.capsule_image,
                                            },
                                            author: {
                                            name: embed_author + " приглашает поиграть в "+SteamApp.name+".",
                                            icon_url: "https://cdn.discordapp.com/avatars/"+fetchedUser.user.id+"/"+fetchedUser.user.avatar+".jpeg"
                                            }
                                        }

                                        const component_buttons = {
                                            type: 1,
                                            components: [
                                                {
                                                    type: 2,
                                                    label: "Присоедениться к лобби",
                                                    style: 5,
                                                    url: BofrostUri
                                                }
                                            ]
                                        }

                                        interaction.reply({embeds: [invite_embed], components: [component_buttons]  });
                                                                            
                                    } else {
                                        interaction.reply({ content: '— Вот Твоя ссылка-приглашение для совместной игры в *'+SteamApp.name+'*: '+BofrostUri, ephemeral: true });
                                    }  
                                });   
                            } else {
                                // Show error - no application to invite
                                interaction.reply({ content: '— Извини, не могу создать приглашение! Убедись что находишься в игровом лобби и попробуй еще раз.', ephemeral: true });
                            }                        
                        });
                    }
                });    
            });     
        }
    },
};

getBifrost = function(user_id, callback) {
	let sql1 = "SELECT user_uid, steam_id, xbox_id FROM drd_bifrost WHERE user_uid = ? LIMIT 1;";   
	database.query(sql1, [user_id], (error1, result_userdata, fields) => {
		if (error1) {
			callback("Ошибка в работе базы данных.",null);
			return;
		}
		if (result_userdata.length == 0 || result_userdata.length > 1){
			callback("Ошибка получения профиля пользователя.",null);
			return;
		}
		callback(null,result_userdata[0]);
	});
}