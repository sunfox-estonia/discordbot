const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
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

module.exports = {
    data: {
        name: 'play2_sot_1'
    },
    async execute(interaction) {
        var member_id = interaction.member.user.id;
        await interaction.guild.members.fetch(member_id).then(
            DiscordUser => {
                const Play2Channel = interaction.client.channels.cache.get('1221929886726488094');
                const BotLogChannel = interaction.client.channels.cache.get('1195089293757137056');
                const party_channel = interaction.client.channels.cache.get('1185539805522694164');
                const hasGlitterbeardRole = interaction.member.roles.cache.has("1104521026584457216");
                
                if (hasGlitterbeardRole == true) {
                    var text_ship_type = "Бригантина";
                    var img_ship_type = "brig_";
                    var text_mission_description = "PvP - Слуги Пламени";
                    var img_ship_mission = img_ship_type + "pvp_servants";
                    var ship_user = DiscordUser.nickname ?? DiscordUser.user.username;
                    var time_to_go = moment().format("X");

                    var invite_embed = new EmbedBuilder()
                    .setColor(0xF28C0F)
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
                        icon_url: "https://r.snfx.ee/img/discord_bot/fox_sq_logo.jpg",
                        text: "Sunfox.ee Discord Server"
                    });

                        /*
                        * Get Steam profile to show achievements in PVP
                        */ 
                        getBifrost(interaction.member.user.id, function (error, steam_data) {
                            if (error) {
                                // If there is no Steam profile available		
                                Play2Channel.send({ content: `<@&1104521026584457216>, присоединяйтесь к путешествию:`, embeds: [invite_embed] }).then(repliedMessage => {
                                    setTimeout(() => repliedMessage.delete(), 600000);
                                });

                                BotLogChannel.send({ content: `[PLAY2] BUTTON: <@` + DiscordUser.user.id + `> has been created a **/play2gether sot** invite`});
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
                                            var getOne = getAchievementStatusByCode(UserAchievements.achievements, CommendationsList[i]);
                                            
                                            let getOneStatus = getOne[0]['achieved'];
                                            if (getOneStatus == true) {
                                                Badges += "1";
                                            } else {
                                                Badges += "0";
                                            }
                                            i++;
                                        }

                                        var BadgesImage = "pvp_profile_" + Badges + ".png";

                                        invite_embed.setImage('https://r.snfx.ee/img/gb/' + BadgesImage);
                                        invite_embed.addFields(
                                            { name: '\u200b', value: '**Достижения ' + ship_user + ' в режиме PvP:**' }
                                        )
                                    }

                                    Play2Channel.send({ content: `<@&1104521026584457216>, присоединяйтесь к путешествию:`, embeds: [invite_embed] }).then(repliedMessage => {
                                        setTimeout(() => repliedMessage.delete(), 600000);
                                    });
                                    BotLogChannel.send({ content: `[PLAY2] BUTTON: <@` + DiscordUser.user.id + `> has been created a **/play2gether sot** invite.`});
                                })
                                .catch(error => {
                                    Play2Channel.send({ content: `<@&1104521026584457216>, присоединяйтесь к путешествию:`, embeds: [invite_embed] }).then(repliedMessage => {
                                        setTimeout(() => repliedMessage.delete(), 600000);
                                    });
    
                                    BotLogChannel.send({ content: `[PLAY2] BUTTON: <@` + DiscordUser.user.id + `> has been created a **/play2gether sot** invite, but Steam achievements has not been fetched.`});
                                });
                            }
                        });
                    // Get Steam profile END

                } else {
                    const locales = {
                        "en-US": 'You do not have permission to execute this command!',
                    };
                    interaction.reply(locales[interaction.locale] ?? 'У вас недостаточно прав для выполнения этой команды!');
    
                    BotLogChannel.send({ content: `[PLAY2] BUTTON ERROR: <@` + DiscordUser.user.id + `> can't create a **/play2gether sot** invite without permission.`});
                }
            }
        );
    }
};
