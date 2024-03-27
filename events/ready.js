const { Events, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
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
	name: Events.ClientReady,
	once: true,
	execute(client) {
        database.connect(function(err) {
            if (err) {
              return console.error('error: ' + err.message);
            }
            console.log('Connected to the MySQL server database '+ config.db_config.dbname +'@'+ config.db_config.host +'.');
          });
          console.log(`Logged in Discord as ${client.user.tag}!`);
          const BotLogChannel = client.channels.cache.get('1195089293757137056');
          const Play2Channel = client.channels.cache.get('1221929886726488094');
          BotLogChannel.send({ content: `Bot has been successfully restarted!` });

          /* Play2gether channel praparing block
           * We should delete all messages in a play2gether channel
           * and create a new embed message with the information  
           * about the play2gether command usage
           */

          // Step 1. Clear the Play2gether channel
          if (!Play2Channel) {
            BotLogChannel.send({ content: `[PLAY2] ERROR: Invites channel not found!` });
          }
          Play2Channel.messages.fetch({ limit: 99 }).then(messages => {
            Play2Channel.bulkDelete(messages);
            BotLogChannel.send({ content: `[PLAY2] Invites channel has been cleared.` });
          });

          // Step 2. Create a new embed message with buttons
          var play2_intro_embed = new EmbedBuilder()
          .setColor(0xF28C0F)
          .setTitle( "— Будем играть вместе!" )
          .setDescription("Приглашай участников сообщества в кооперативные игры с помощью команды `/play2gether`. Доступно два режима использования команды: отдельный для экипажей Sea of Thieves, и для других игр.")
          .setImage("https://r.snfx.ee/img/discord_bot/help/play2gether.gif")
          .addFields(
              { name: "/play2gehter sot", value: "Выбери цель путешествия, тип судна и голосовой чат для общения с экипажем. После отправки команды, пираты Гильдии получат уведомление, и по возможности присоединятся к Тебе." },
              { name: "/play2gehter game", value: "Выбери игру из списка и голосовой чат для общения с командой. Участники сервера смогут подключиться к игровому лобби, воспользовавшись сгенерированной ссылкой-приглашением." },
              { name: "\u200b", value: "Используй команду `/play2gether` как показано ниже, либо воспользуйся кнопками для быстрого создания лобби по шаблону." },
          )
          .setFooter({ 
            icon_url: "https://r.snfx.ee/img/favicon/favicon-16x16.png",
            text: "Sunfox.ee Discord Server"
          });

          // SoT Predefine buttons
          var buttons_play2_predefined_1 = new ButtonBuilder()
          .setLabel('PVP - Слуги Пламени')
          .setCustomId('play2_predefine_1')
          .setEmoji("<:ship_brig:1155489530900660294>")
          .setStyle(ButtonStyle.Secondary);

          var buttons_play2_predefine_2 = new ButtonBuilder()
          .setLabel('PVP - Открытый мир')
          .setCustomId('play2_predefine_2')
          .setEmoji("<:ship_sloop:1155489536349057095>")
          .setStyle(ButtonStyle.Secondary);

          var buttons_play2_predefine_3 = new ButtonBuilder()
          .setLabel('Farm - Гильдия')
          .setCustomId('play2_predefine_3')
          .setEmoji("<:ship_brig:1155489530900660294>")
          .setStyle(ButtonStyle.Secondary);

          // Other games Predefine buttons
          var buttons_play2_predefine_4 = new ButtonBuilder()
          .setLabel('Deep Rock Galactic')
          .setCustomId('play2_predefine_4')
          .setStyle(ButtonStyle.Secondary);

          var buttons_play2_predefine_5 = new ButtonBuilder()
          .setLabel('Lethal Company')
          .setCustomId('play2_predefine_5')
          .setStyle(ButtonStyle.Secondary);

          var buttons_play2_predefine_6 = new ButtonBuilder()
          .setLabel('Dota 2')
          .setCustomId('play2_predefine_6')
          .setStyle(ButtonStyle.Secondary);

          var buttons_play2_predefine_7 = new ButtonBuilder()
          .setLabel('RUST')
          .setCustomId('play2_predefine_7')
          .setStyle(ButtonStyle.Secondary);

          var play2_buttons_row_1 = new ActionRowBuilder()
              .addComponents(buttons_play2_predefine_2, buttons_play2_predefined_1, buttons_play2_predefine_3);

          var play2_buttons_row_2 = new ActionRowBuilder()
              .addComponents(buttons_play2_predefine_4, buttons_play2_predefine_5, buttons_play2_predefine_6, buttons_play2_predefine_7);

          Play2Channel.send({ embeds: [play2_intro_embed], components: [play2_buttons_row_1, play2_buttons_row_2] });
	},
};
