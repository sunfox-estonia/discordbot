const { SlashCommandBuilder, ChannelType, EmbedBuilder } = require('discord.js');
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

/**
 * Ship command is a special command for Glitterbeard Sailors to create invites for the Sea of Thieves play session.
 * Command can be runned only by users with the Glitterbeard Sailors role.
 */

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ship')
        .setDescription('Пригласить в Sea of Thieves')
        .setDescriptionLocalizations({
            "en-US": 'Invite to play Sea of Thieves'
        })
        .addStringOption(option =>
            option.setName('ship')
                .setDescription('Тип корабля')
                .setDescriptionLocalizations({
                    "en-US": 'Ship type',
                })
                .setRequired(true)
                .addChoices(
                    { name: 'Шлюп | Sloop', value: 'slup' },
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
                )),

    async execute(interaction) {
        const hasSailorRole = interaction.member.roles.cache.has("1039215669943742475")
        const hasGlitterbeardRole = interaction.member.roles.cache.has("1104521026584457216")
        if (hasSailorRole == true || hasGlitterbeardRole == true) {
            // Send invite to specified channel
            const ShipNotify = interaction.client.channels.cache.get('1104517743279087676'); // Ships channel 1104517743279087676
            var member_id = interaction.member.user.id;

            const ship_type = interaction.options.getString('ship');
            const ship_task = interaction.options.getString('task');
            const ship_channel = interaction.options.getChannel('channel');
            const ship_time = interaction.options.getString('time');

            await interaction.guild.members.fetch(member_id).then(
                fetchedUser => {

                    // Set config before invite running

                    var ship_user = fetchedUser.nickname ?? fetchedUser.user.username;

                    var today = new Date();
                    var coeff = 1000 * 60 * 5;

                    switch (ship_time) {
                        case "0":
                            var session_start_text = "сразу.";
                            break;
                        case "15":
                            var minutes = 15;
                            var prep_time = new Date(today.getTime() + minutes * 60000);
                            var run_time = new Date(Math.round(prep_time.getTime() / coeff) * coeff);
                            var session_start_text = "через 15 минут.";
                            break;
                        case "30":
                            var minutes = 30;
                            var prep_time = new Date(today.getTime() + minutes * 60000);
                            var run_time = new Date(Math.round(prep_time.getTime() / coeff) * coeff);
                            var session_start_text = "через полчаса.";
                            break;
                        case "60":
                            today.setHours(today.getHours() + 1);
                            today.setMinutes(0);
                            today.setSeconds(0);
                            var session_start_text = "в следующем часе.";
                            break;
                        default:
                            var session_start_text = "сразу.";
                            break;
                    }

                    switch (ship_type) {
                        case "slup":
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

                    var invite_embed = new EmbedBuilder()
                        .setColor(0xdd6282)
                        .setAuthor({ name: ship_user + " собирает команду.", iconURL: "https://cdn.discordapp.com/avatars/" + fetchedUser.user.id + "/" + fetchedUser.user.avatar + ".jpeg" })
                        .setDescription("Начало сессии - " + session_start_text)
                        .setThumbnail("https://r.snfx.ee/img/gb/" + img_ship_mission + ".png")
                        .addFields(
                            { name: "Корабль:", value: text_ship_type },
                            { name: "Миссия:", value: text_mission_description },
                            { name: "\u200b", value: "**Добавляйся в голосовой канал:**" },
                            { name: "<#" + ship_channel + ">", value: "\u200b" }
                        )
                        .setTimestamp()
                        .setFooter({ 
                            icon_url: "https://r.snfx.ee/img/discord_bot/fox_sq_logo.png",
                            text: "Sunfox.ee Discord Server"
                         });

                    /*
                    Embed old version

                    var invite_embed = {
                        description: "Начало сессии - " + session_start_text,
                        color: 0xdd6282,
                        timestamp: new Date().toISOString(),
                        footer: {
                          icon_url: "https://r.snfx.ee/img/gb/gb_bottom_icon.png",
                          text: "Glitterbeard Brothers"
                        },
                        thumbnail: {
                          url: "https://r.snfx.ee/img/gb/"+img_ship_mission+".png",
                        },
                        author: {
                          name: ship_user + " собирает команду.",
                          icon_url: "https://cdn.discordapp.com/avatars/"+fetchedUser.user.id+"/"+fetchedUser.user.avatar+".jpeg"
                        },
                        fields: [
                          {
                            name: "Корабль:",
                            value: text_ship_type,
                          },
                          {
                            name: "Миссия:",
                            value: text_mission_description,
                          },
                          {
                            name: "\u200b",
                            value: "**Добавляйся в голосовой канал:**"                              
                          },
                          {
                            name: "<#"+ship_channel+">",
                            value: "\u200b"                              
                          }
                        ]
                    }
                    */

                    // Get Bifrost DB profile
                    getBifrost(member_id, function (error, member_data) {
                        if (error) {
                            // If there is no profile available		

                            ShipNotify.send({ content: `<@&1104521026584457216> и <@&1039215669943742475>, присоединяйтесь к путешествию:`, embeds: [invite_embed] }).then(repliedMessage => {
                                setTimeout(() => repliedMessage.delete(), 600000);
                            });
                            interaction.reply({ content: 'Invite has been sucessfully created!', ephemeral: true });

                        } else {
                            // If profile is available   
                            // Here you can see full achievements list:
                            // http://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v0002/?key=APIKEY&appid=1172620&l=english&format=json                         
                            // Get specified achievements for Sea of Thieves
                            steam.getUserAchievements(member_data.steam_id, "1172620").then(UserAchievements => {
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

                                ShipNotify.send({ content: `<@&1104521026584457216> и <@&1039215669943742475>, присоединяйтесь к путешествию:`, embeds: [invite_embed] }).then(repliedMessage => {
                                    setTimeout(() => repliedMessage.delete(), 600000);
                                });
                                interaction.reply({ content: 'Invite has been successfully created!', ephemeral: true });

                            })
                                .catch(error => {
                                    ShipNotify.send({ content: `<@&1104521026584457216> и <@&1039215669943742475>, присоединяйтесь к путешествию:`, embeds: [invite_embed] }).then(repliedMessage => {
                                        setTimeout(() => repliedMessage.delete(), 600000);
                                    });
                                    interaction.reply({ content: 'Invite has been successfully created!', ephemeral: true });
                                });

                        }
                    });
                }
                // await interaction.guild.members.fetch closed
            ).catch(console.error);
        } else {
            const locales = {
                "en-US": 'You do not have permission to execute this command!',
            };
            await interaction.reply(locales[interaction.locale] ?? 'У вас недостаточно прав для выполнения этой команды!');
        }
    },
};

getBifrost = function (user_id, callback) {
    let sql1 = "SELECT user_uid, steam_id, xbox_id FROM drd_bifrost WHERE user_uid = ? LIMIT 1;";
    database.query(sql1, [user_id], (error1, result_userdata, fields) => {
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


function getAchievemntStatusByCode(comedations, code) {
    return comedations.filter(
        function (comedations) { return comedations.api == code }
    );
}
