//const {} = require('discord.js');
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
        name: 'profile_show'
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
                    var text_ship_type = "Шлюп";
                    var img_ship_type = "slup_";
                    var text_mission_description = "PvP - Открытый мир";
                    var img_ship_mission = img_ship_type + "pvp_world";
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
                        icon_url: "https://r.snfx.ee/img/favicon/favicon-16x16.png",
                        text: "Sunfox.ee Discord Server"
                    });

                    Play2Channel.send({ content: `<@&1104521026584457216>, присоединяйтесь к путешествию:`, embeds: [invite_embed] }).then(repliedMessage => {
                        setTimeout(() => repliedMessage.delete(), 600000);
                    });
                    interaction.reply({ content: '— Приглашение создано!', ephemeral: true });
                    BotLogChannel.send({ content: `[PLAY2] SOT: <@` + DiscordUser.user.id + `> has been created a **/play2gether sot** invite.`});
                } else {
                    const locales = {
                        "en-US": 'You do not have permission to execute this command!',
                    };
                    interaction.reply(locales[interaction.locale] ?? 'У вас недостаточно прав для выполнения этой команды!');
    
                    BotLogChannel.send({ content: `[PLAY2] ERROR: <@` + DiscordUser.user.id + `> can't create a **/play2gether sot** invite without permission.`});
                }
            });
    }
};