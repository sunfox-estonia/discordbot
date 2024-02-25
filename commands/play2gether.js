const { SlashCommandBuilder, ChannelType, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
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
const moment = require('moment');
const SteamAPI = require('steamapi');
const steam = new SteamAPI(config.bifrost_config.token_steam);

/*
 * /play2gether command uses Discord.js subcommand system.
 * Currently it can be used to run Sea of Thieves crew ship or another game,
 * the list of another possible games to pley is located in a config.lists.json file
 * Current version can't find co-players withen the server members, this functionality
 * will be added in a future release, after Statistical bot release.
 * 
 */

module.exports = {
    data: new SlashCommandBuilder()
	.setName('play2gether')
	.setDescription('Пригласить в кооперативную игру')
    .setDescriptionLocalizations({
        "en-US": 'Invite a player to the cooperative game'
    })
	.addSubcommand(subcommand =>
		subcommand
			.setName('game')
			.setDescription('Выбрать из списка | Select from the list')
            .addStringOption(option =>
                option.setName('game')
                    .setDescription('Наименование игры')
                    .setDescriptionLocalizations({
                        "en-US": 'Game name',
                    })
                    .setRequired(true)
                    .addChoices(
						{ name: 'Battlefield 1', value: '1238840' },
						{ name: 'Dead by Daylight', value: '381210' },
						{ name: 'Deep Rock Galactic', value: '548430' },
						{ name: 'Dota 2', value: '570' },
						{ name: 'Elite Dangerous', value: '359320' },
						{ name: 'Euro Truck Simulator 2', value: '227300' },
						{ name: 'Halo Infinite', value: '1240440' },
						{ name: 'Lethal Company', value: '1966720' },
						{ name: 'MORDHAU', value: '629760' },
						{ name: 'PAYDAY 2', value: '218620' },
						{ name: 'Rust', value: '252490' },
						{ name: 'Terraria', value: '105600' },
						{ name: 'theHunter: Call of the Wild', value: '518790' },
						{ name: 'Valheim', value: '892970' }
					))
            .addChannelOption(option =>
                option.setName('channel')
                    .setDescription('Канал')
                    .setRequired(true)
                    .setDescriptionLocalizations({
                        "en-US": 'Voice channel'
                    })
                    .addChannelTypes(ChannelType.GuildVoice))
            .addStringOption(option =>
                option.setName('time')
                    .setDescription('Старт сессии через...')
                    .setDescriptionLocalizations({
                        "en-US": 'Session starts in...',
                    })
                    .setRequired(false)
                    .addChoices(
                        { name: 'Сразу | Now', value: '0' },
                        { name: '15 мин. | in 15 min.', value: '15' },
                        { name: '30 мин. | in 30 min.', value: '30' },
                        { name: 'Следующий час | Next hour', value: '60' }
                    ))
    )
	.addSubcommand(subcommand =>
		subcommand
			.setName('sot')
			.setDescription('Sea of Thieves')
            .addStringOption(option =>
                option.setName('ship')
                    .setDescription('Тип корабля')
                    .setDescriptionLocalizations({
                        "en-US": 'Ship type',
                    })
                    .setRequired(true)
                    .addChoices(
                        { name: 'Шлюп | Sloop', value: 'sloop' },
                        { name: 'Бригантина | Brigantine', value: 'brig' },
                        { name: 'Галеон | Galleon', value: 'galley' }
                    ))
            .addStringOption(option =>
                option.setName('task')
                    .setDescription('Миссия')
                    .setDescriptionLocalizations({
                        "en-US": 'Mission type',
                    })
                    .setRequired(true)
                    .addChoices(
                        { name: 'Сбор рейда | Run a raid', value: 'raid' },
                        { name: 'Tall Tales', value: 'tales' },
                        { name: 'Tall Tales - Jack Sparrow', value: 'tales_sparrow' },
                        { name: 'Farm - Гильдия | Guild', value: 'farm_guild' },
                        { name: 'Farm - Златодержцы | Goldhoarders', value: 'farm_gh' },
                        { name: 'Farm - Орден душ | Order of Souls', value: 'farm_souls' },
                        { name: 'Farm - Торговый союз | Merchant Alliance', value: 'farm_merch' },
                        { name: 'Farm - Охотники', value: 'farm_hunt' },
                        { name: 'Farm - Athena', value: 'farm_athena' },
                        { name: 'Farm - Reapers', value: 'farm_reaper' },
                        { name: 'PVP - Open world', value: 'pvp_world' },
                        { name: 'PVP - Слуги Пламени | Servants of the Flame', value: 'pvp_servants' },
                        { name: 'PVP - Хранители Сокровищ | Guardians of Fortune', value: 'pvp_guardians' },
                    ))
            .addChannelOption(option =>
                option.setName('channel')
                    .setDescription('Канал')
                    .setRequired(true)
                    .setDescriptionLocalizations({
                        "en-US": 'Voice channel'
                    })
                    .addChannelTypes(ChannelType.GuildVoice))
            .addStringOption(option =>
                option.setName('time')
                    .setDescription('Старт сессии через...')
                    .setDescriptionLocalizations({
                        "en-US": 'Session starts in...',
                    })
                    .setRequired(false)
                    .addChoices(
                        { name: 'Сразу | Now', value: '0' },
                        { name: '15 мин. | in 15 min.', value: '15' },
                        { name: '30 мин. | in 30 min.', value: '30' },
                        { name: 'Следующий час | Next hour', value: '60' }
                    ))
    ),

async execute(interaction) {
        const NotificationsChannel = interaction.client.channels.cache.get('621398274452094976');
        const ShipsNotificationsChannel = interaction.client.channels.cache.get('1104517743279087676');
        const BotLogChannel = interaction.client.channels.cache.get('1195089293757137056');
        const party_channel = interaction.options.getChannel('channel');
        const party_time = ( interaction.options.getString('time') !== undefined ) ? interaction.options.getString('time') : "0";

        /*
         * SEA OF THIEVES play togeter invite
         */
		if (interaction.options.getSubcommand() === 'sot') {
            // SOT-specific role check
            const hasSailorRole = interaction.member.roles.cache.has("1039215669943742475");
			const hasGlitterbeardRole = interaction.member.roles.cache.has("1104521026584457216");
            if (hasSailorRole == true || hasGlitterbeardRole == true) {
                const ship_type = interaction.options.getString('ship');
                const ship_task = interaction.options.getString('task');

                switch (ship_type) {
                    case "sloop":
                        var text_ship_type = "Шлюп";
                        var img_ship_type = "slup_";
                        break;
                    case "brig":
                        var text_ship_type = "Бригантина";
                        var img_ship_type = "brig_";
                        break;
                    case "galley":
                        var text_ship_type = "Галеон";
                        var img_ship_type = "galley_";
                        break;
                    default:
                        break;
                }

                switch (ship_task) {
                    case "raid":
                        var text_mission_description = "Сбор рейда";
                        var img_ship_mission = img_ship_type + "raid";
                        break;
                    case "tales":
                        var text_mission_description = "Tall Tales";
                        var img_ship_mission = img_ship_type + "tales";
                        break;
                    case "tales_sparrow":
                        var text_mission_description = "Tall Tales - Джек Воробей";
                        var img_ship_mission = img_ship_type + "tales_sparrow";
                        break;
                    case "farm_guild":
                        var text_mission_description = "Фарм - Гильдия";
                        var img_ship_mission = img_ship_type + "farm_guild";
                        break;
                    case "farm_gh":
                        var text_mission_description = "Фарм - Златодержцы";
                        var img_ship_mission = img_ship_type + "farm_gh";
                        break;
                    case "farm_souls":
                        var text_mission_description = "Фарм - Орден Душ";
                        var img_ship_mission = img_ship_type + "farm_souls";
                        break;
                    case "farm_merch":
                        var text_mission_description = "Фарм - Торговый Союз";
                        var img_ship_mission = img_ship_type + "farm_merch";
                        break;
                    case "farm_hunt":
                        var text_mission_description = "Фарм - Братство охотников";
                        var img_ship_mission = img_ship_type + "farm_hunt";
                        break;
                    case "farm_athena":
                        var text_mission_description = "Фарм - Сокровище Афины";
                        var img_ship_mission = img_ship_type + "farm_athena";
                        break;
                    case "farm_reaper":
                        var text_mission_description = "Фарм - Жнецы Костей";
                        var img_ship_mission = img_ship_type + "farm_reaper";
                        break;
                    case "pvp_world":
                        var text_mission_description = "PvP - Открытый мир";
                        var img_ship_mission = img_ship_type + "pvp_world";
                        break;
                    case "pvp_servants":
                        var text_mission_description = "PvP - Слуги Пламени";
                        var img_ship_mission = img_ship_type + "pvp_servants";
                        break;
                    case "pvp_guardians":
                        var text_mission_description = "PvP - Хранители Сокровищ";
                        var img_ship_mission = img_ship_type + "pvp_guardians";
                        break;
                    default:
                        break;
                }

                await interaction.guild.members.fetch(interaction.member.user.id).then( DiscordUser => {
                    var ship_user = DiscordUser.nickname ?? DiscordUser.user.username;
                    var time_to_go = fetchTimestamp(party_time);

                    var invite_embed = new EmbedBuilder()
                        .setColor(0x0099ff)
                        .setAuthor({ name: ship_user + " собирает команду.", iconURL: "https://cdn.discordapp.com/avatars/" + DiscordUser.user.id + "/" + DiscordUser.user.avatar + ".jpeg" })
                        .setDescription("Начало сессии - <t:" + time_to_go + ":R>")
                        .setThumbnail("https://r.snfx.ee/img/gb/" + img_ship_mission + ".png")
                        .addFields(
                            { name: "Корабль:", value: text_ship_type },
                            { name: "Миссия:", value: text_mission_description },
                            { name: "\u200b", value: "**Добавляйся в голосовой канал:**" },
                            { name: "<#" + party_channel + ">", value: "\u200b" }
                        )
                        .setTimestamp()
                        .setFooter({ 
                            icon_url: "https://r.snfx.ee/img/discord_bot/fox_sq_logo.png",
							text: "Sunfox.ee Discord Server"
                        });
                    /*
                    * Get Steam profile to show achievements in PVP
                    */ 
                    getBifrost(interaction.member.user.id, function (error, steam_data) {
                        if (error) {
                            // If there is no Steam profile available		
                            ShipsNotificationsChannel.send({ content: `<@&1104521026584457216> и <@&1039215669943742475>, присоединяйтесь к путешествию:`, embeds: [invite_embed] }).then(repliedMessage => {
                                setTimeout(() => repliedMessage.delete(), 600000);
                            });
                            interaction.reply({ content: '— Приглашение успешно создано!', ephemeral: true });

                            BotLogChannel.send({ content: `<@` + DiscordUser.user.id + `> has been created a play2gether invite - Sea of Thieves`});
                        } else {
                            // If profile is available   
                            // Here you can see full achievements list:
                            // http://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v0002/?key=APIKEY&appid=1172620&l=english&format=json                         
                            // Get specified achievements for Sea of Thieves
                            steam.getUserAchievements(steam_data.steam_id, "1172620").then(UserAchievements => {

                                if (UserAchievements.steamID !== undefined) {
                                    CommendationsList = ['220', '219', '221', '222'];
                                    var Badges = "";

                                    let i = 0;
                                    while (i < CommendationsList.length) {
                                        var getOne = getAchievemntStatusByCode(UserAchievements.achievements, CommendationsList[i]);
                                        let getOneStatus = getOne[0]['achieved'];
                                        if (getOneStatus == true) {
                                            Badges += "1";
                                        } else {
                                            Badges += "0";
                                        }
                                        i++;
                                    }

                                    var BadgesImage = "pvp_profile_" + Badges + ".png";

                                    if (ship_task == "pvp_servants" || ship_task == "pvp_guardians") {
                                        invite_embed.setImage('https://r.snfx.ee/img/gb/' + BadgesImage);
                                        invite_embed.addFields(
                                            { name: '\u200b', value: '**Достижения ' + ship_user + ' в режиме PvP:**' }
                                        )
                                    }
                                }

                                ShipsNotificationsChannel.send({ content: `<@&1104521026584457216> и <@&1039215669943742475>, присоединяйтесь к путешествию:`, embeds: [invite_embed] }).then(repliedMessage => {
                                    setTimeout(() => repliedMessage.delete(), 600000);
                                });
                                interaction.reply({ content: '— Приглашение успешно создано!', ephemeral: true });
                                BotLogChannel.send({ content: `<@` + DiscordUser.user.id + `> has been created a play2gether invite - Sea of Thieves`});

                            })
                            .catch(error => {
                                BotLogChannel.send({ content: `ERROR: Can't get Steam data for user <@` + DiscordUser.user.id + `> - Sea of Thieves` });
                                interaction.reply({ content: `Не могу получить данные твоего аккаунта Steam. Хранители уведомлены о проблеме и свяжутся с тобой позже.`, ephemeral: true });
                            });
                        }
                    });
                    // Get Steam profile END
                });
            } else {
                const locales = {
                    "en-US": 'You do not have permission to execute this command!',
                };
                await interaction.reply(locales[interaction.locale] ?? 'У вас недостаточно прав для выполнения этой команды!');

                BotLogChannel.send({ content: `ERROR: <@` + DiscordUser.user.id + `> can't create a play2gether invite - Sea of Thieves`});
            }
        } else {
        /*
         * ANOTHER GAME play together invite
         */
            await interaction.guild.members.fetch(interaction.member.user.id).then( DiscordUser => {
                const play2_user = DiscordUser.nickname ?? DiscordUser.user.username;
                const time_to_go = fetchTimestamp(party_time);
                const steam_app_id = interaction.options.getString('game');

                getBifrost(interaction.member.user.id, function (error, steam_data) {
                    if (error) {
                        // If there is no Steam profile available		

                        steam.getGameDetails(steam_app_id).then(SteamApp => {      
                            var invite_embed = new EmbedBuilder()
                                .setColor(0x0099ff)
                                .setAuthor({ name: play2_user + " приглашает поиграть\nв "+SteamApp.name+".", iconURL: "https://cdn.discordapp.com/avatars/" + DiscordUser.user.id + "/" + DiscordUser.user.avatar + ".jpeg" })
                                .setDescription("Начало сессии - <t:" + time_to_go + ":R>")
                                .setThumbnail("https://r.snfx.ee/img/discord_bot/alert_playtogether.png")
                                .setImage(SteamApp.header_image)
                                .addFields(
                                    { name: "Присоединяйся к игре!", value: "Чтобы играть вместе, Тебе необходимо установить **"+SteamApp.name+"** на свой компьютер, а также добавить **" + play2_user + "** в список друзей Steam." },
                                    { name: "\u200b", value: "**Добавляйся в голосовой канал:**" },
                                    { name: "<#" + party_channel + ">", value: "\u200b" }
                                )
                                .setTimestamp()
                                .setFooter({ 
									icon_url: "https://r.snfx.ee/img/discord_bot/fox_sq_logo.png",
									text: "Sunfox.ee Discord Server"
                                });

                            NotificationsChannel.send({ embeds: [invite_embed] }).then(repliedMessage => {
                                setTimeout(() => repliedMessage.delete(), 600000);
                            });
                            interaction.reply({ content: '— Приглашение успешно создано!', ephemeral: true });

                            BotLogChannel.send({ content: `<@` + DiscordUser.user.id + `> creates a play2gether invite - ` + SteamApp.name });
                        });
                    } else {
                        steam.getUserSummary(steam_data.steam_id).then(SteamUser => {
                            // Get Steam application data
                            
                            /* 
                             * Create an invite to play
                             */

                            // In case if user has been runnded something aready
                            if(SteamUser.gameID === undefined){
                            } else if (SteamUser.gameID !== undefined){
                            }

                            /*
                             * Get game details from Steam
                             */
                            steam.getGameDetails(steam_app_id).then(SteamApp => {      
                                const BifrostUri = 'https://bifrost.snfx.ee/steam/'+SteamApp.steam_appid+'/'+SteamUser.steamID;
                                var invite_embed = new EmbedBuilder()
                                    .setColor(0x0099ff)
                                    .setAuthor({ name: play2_user + " приглашает поиграть\nв "+SteamApp.name+".", iconURL: "https://cdn.discordapp.com/avatars/" + DiscordUser.user.id + "/" + DiscordUser.user.avatar + ".jpeg" })
                                    .setDescription("Начало сессии - <t:" + time_to_go + ":R>")
                                    .setThumbnail("https://r.snfx.ee/img/discord_bot/alert_playtogether.png")
                                    .setImage(SteamApp.header_image)
                                    .addFields(
                                        { name: "Присоединяйся к игре!", value: "Чтобы играть вместе, Тебе необходимо установить **"+SteamApp.name+"** на свой компьютер, а также добавить **" + play2_user + "** в список друзей Steam. Сделать это можно на странице по ссылке ниже." },
                                        { name: "\u200b", value: "**Добавляйся в голосовой канал:**" },
                                        { name: "<#" + party_channel + ">", value: "\u200b" }
                                    )
                                    .setTimestamp()
                                    .setFooter({ 
										icon_url: "https://r.snfx.ee/img/discord_bot/fox_sq_logo.png",
										text: "Sunfox.ee Discord Server"
                                    });

                                /*
                                * Get app connected achievements from DB
                                */

                                const button_join = new ButtonBuilder()
                                    .setLabel('Присоединиться к лобби')
                                    .setURL(BifrostUri)
                                    .setStyle(ButtonStyle.Link);

                                const component_buttons = new ActionRowBuilder()
                                    .addComponents(button_join);
    
                                NotificationsChannel.send({ embeds: [invite_embed], components: [component_buttons] }).then(repliedMessage => {
                                    setTimeout(() => repliedMessage.delete(), 600000);
                                });
                                interaction.reply({ content: '— Приглашение успешно создано!', ephemeral: true });

                                BotLogChannel.send({ content: `<@` + DiscordUser.user.id + `> creates a play2gether invite - ` + SteamApp.name });
                            });

                        });
                    }
                });
            });
        }
	},
};      

getBifrost = function (user_id, callback) {
    let sql1 = "SELECT user_uid, steam_id, xbox_id FROM drd_bifrost WHERE user_uid = ? LIMIT 1;";
    database.query(sql1, [user_id], (error1, result_userdata) => {
        if (error1) {
            callback("Ошибка в работе базы данных.", null);
            return;
        }
        if (result_userdata.length == 0 || result_userdata.length > 1) {
            callback("Ошибка получения профиля пользователя.", null);
            return;
        }
        callback(null, result_userdata[0]);
    });
}

fetchTimestamp = function (interval) {
    switch (interval) {
        case '15':
            var unix_time = moment().add(15, 'minutes').format('X');
            break;
        case '30':
            var unix_time = moment().add(30, 'minutes').format('X');
            break;
        case '60':
            var unix_time = moment().endOf('hour').format("X");
            break;
        default:
            var unix_time = moment().format("X");
            break;
    }
    return unix_time;
}
