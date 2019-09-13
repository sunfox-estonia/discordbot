const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');
const prefix = '/';

// message.reply('message here');
// message.channel.send("Ping?");

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('guildMemberAdd', member => {
    const channel = member.guild.channels.find(ch => ch.name === 'log');
    if (!channel) return;
    channel.send(`Привет, ${member}! Рады тебя видеть на нашем сервере :) Если ты используешь ник вместо настоящего имени, пожалуйста смени его на свое имя. Спасибо!`);
});

client.on("message", async message => {
    if(message.author.bot) return;

    if(message.content.indexOf(prefix) !== 0) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    //if(command === "ping") {
        // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
        // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
    //    const m = await message.channel.send("Wait...");
    //    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
    //}

    if(command === "calendar" || command === "events") {
        var request = require('request');
        var count = (args[0] > 0) ? args[0] : 4;
        var url = `https://sunfox.ee/events/json/ru/${count}/0`;
        request({
            url: url,
            json: true
        }, function (error, response, data) {
            if (!error && response.statusCode === 200) {
                var msg = ' вот список мероприятий:\n';
                for (event in data) {
                    var msg = msg + `${data[event]['time_daymonth']} в ${data[event]['time_timeonly']} :small_orange_diamond: ${data[event]['title']['0']} (${data[event]['location']})\n`;
                }
            message.reply(msg);
            }
        })
    }

    if(command === "profile") {
        if(message.member.roles.some(r=>["Координаторы"].includes(r.name)) && args[0]){
            var usr = message.mentions.users.first();
        }else{
            var usr = message.author;
        }
        var uid = usr.id;
        var profile = new Discord.RichEmbed()
            .setColor('#0099ff')
            .setAuthor(usr.username)
            .setTitle(':dagger: Ландскнехт - 2 уровень')
            .setDescription('Координатор - Викинги Вирумаа')
            .setThumbnail(usr.avatarURL)
            .addBlankField()
            .addField(':ballot_box_with_check: - Сенсей', 'Провести занятие по фехтованию одноручным мечом.')
            .addField(':ballot_box_with_check: - Давид', 'Вооружившись топором, победить противника с двуручным мечом, не теряя хитов.')
            .addField(':ballot_box_with_check: - Так нечестно!', 'Научиться использовать окружение в бою.')
            .addField(':ballot_box_with_check: - Кукловод', 'Быть мастером настольной ролевой игры.')
            .addField(':black_square_button: - Порхай, как бабочка', '100 приседаний.')
            .addField(':black_square_button: - Готов в поход', '10 мин. на скакалке(количество допустимых зацепов - 5).')
            .addField(':black_square_button: - Мясник', '15 подтягиваний.')
            .addField(':ballot_box_with_check: - Чужие земли', 'Посетить тренировку в другом клубе.')
            .addField(':black_square_button: - Хост', 'Не менее двух раз в течение месяца инициировать и провести совместную игру с другими участниками сообщества.')
            .addBlankField()
            .setTimestamp()
            .setFooter('Викинги Вирумаа', 'https://sunfox.ee/resources/img/discord_bot/vv_sq_logo.png');
        message.channel.send(profile);
    }

    if(command === "levelup") {
        if(!message.member.roles.some(r=>["Координаторы"].includes(r.name)))
            return message.reply(" у вас нет права запускать эту команду!");

        if(args.length<2)
            return message.reply(" пожалуйста укажите тег пользователя и номер ачивки!");
    }

});


client.login(config.token);