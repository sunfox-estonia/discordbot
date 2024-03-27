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
        name: 'play2_game_548430'
    },
    async execute(interaction) {
        var member_id = interaction.member.user.id;
        await interaction.guild.members.fetch(member_id).then(
            DiscordUser => {
                const Play2Channel = interaction.client.channels.cache.get('1221929886726488094');
                const BotLogChannel = interaction.client.channels.cache.get('1195089293757137056');
                const party_channel = interaction.client.channels.cache.get('1185539805522694164');
                const play2_user = DiscordUser.nickname ?? DiscordUser.user.username;
                const steam_app_id = '548430';
                const time_to_go = moment().format("X");

                getBifrost(DiscordUser.user.id, function (error, steam_data) {
                    if (error) {
                        // If there is no Steam profile available		

                        steam.getGameDetails(steam_app_id).then(SteamApp => {      
                            var invite_embed = new EmbedBuilder()
                                .setColor(0xF28C0F)
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
									icon_url: "https://r.snfx.ee/img/discord_bot/fox_sq_logo.jpg",
									text: "Sunfox.ee Discord Server"
                                });

                            Play2Channel.send({ embeds: [invite_embed] }).then(repliedMessage => {
                                setTimeout(() => repliedMessage.delete(), 600000);
                            });

                            BotLogChannel.send({ content: `[PLAY2] <@` + DiscordUser.user.id + `> creates a **/play2gether game** invite - ` + SteamApp.name });
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
                                    .setColor(0xF28C0F)
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
										icon_url: "https://r.snfx.ee/img/discord_bot/fox_sq_logo.jpg",
										text: "Sunfox.ee Discord Server"
                                    });

                                /*
                                * Get app connected achievements from DB
                                */

                                var button_join = new ButtonBuilder()
                                    .setLabel('Присоединиться к лобби')
                                    .setURL(BifrostUri)
                                    .setStyle(ButtonStyle.Link);

                                var component_buttons = new ActionRowBuilder()
                                    .addComponents(button_join);
    
                                Play2Channel.send({ embeds: [invite_embed], components: [component_buttons] }).then(repliedMessage => {
                                    setTimeout(() => repliedMessage.delete(), 600000);
                                });

                                BotLogChannel.send({ content: `[PLAY2] BUTTON <@` + DiscordUser.user.id + `> creates a **/play2gether game** invite - ` + SteamApp.name });
                            });

                        });
                    }
                });

            });
        }
    };