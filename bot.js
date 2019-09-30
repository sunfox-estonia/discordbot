const Discord = require('discord.js');
const mysql = require('mysql');
const client = new Discord.Client();
const config = require('./config.json');
const prefix = '/';
const database = mysql.createConnection({
  host: config.db_config.host,
  user: config.db_config.dbuser,
  password: config.db_config.dbpass,
  database: config.db_config.dbname,
  debug: false,
  multipleStatements: true,
});
// message.reply('message here');
// message.channel.send("Ping?");


client.on('ready', () => {
    database.connect(function(err) {
      if (err) {
        return console.error('error: ' + err.message);
      }
      console.log('Connected to the MySQL server database '+ config.db_config.dbname +'@'+ config.db_config.host +'.');
    });
    console.log(`Logged in Discord as ${client.user.tag}!`);
});

client.on('guildMemberAdd', member => {
    let channel = member.guild.channels.find(ch => ch.name === 'log');
    if (!channel) return;
    channel.send(`Привет, ${member}! Рады тебя видеть на нашем сервере :) Если ты используешь ник вместо настоящего имени, пожалуйста смени его на свое имя. Спасибо!`);

    var sql = `INSERT INTO drd_users (uid, level, community) VALUES (?, '0', NULL);`;
    database.query(sql, [member.id], function (err, result) {
        console.log(result);
    });
});

client.on("message", async message => {
    if(message.author.bot) return;

    if(message.content.indexOf(prefix) !== 0) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    //if(command === "ping") {
        // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
        // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
        // const m = await message.channel.send("Wait...");
        // m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
    //}
    
    // SHOW UPCOMING EVENTS
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
    
    // ADD NEW USER
    if(command === "adduser") {
        if(!message.member.roles.some(r=>JSON.stringify(config.admin_roles).includes(r.name)))
            return message.reply(" у вас нет права запускать эту команду!");
        if(args.length<2)
            return message.reply(" пожалуйста укажите тег пользователя и наименование сообщества!");
        
        var usr = message.mentions.users.first().id;
        var com = args.slice(1);            
        var sql = `SELECT * FROM drd_users WHERE uid = ?;`;        
        database.query(sql, [usr], function(err, result) {
            if(err) console.log(err);
            var users_total = result.length;            
            if (users_total<1){
                var sql = `INSERT INTO drd_users (uid, level, community) VALUES (?, 0, ?);`;
                database.query(sql, [usr, com], function (err, result) {
                    if(err) console.log(err);
                });
                return message.reply(" участник добавлен в БД и сообщество.");
            } else if (users_total==1){
                var sql = `UPDATE drd_users set community = ? WHERE uid = ?`;
                database.query(sql, [com, usr], function (err, result) {
                    if(err) console.log(err);
                }); 
                return message.reply(" участник добавлен в сообщество.");
            } else {
                return message.reply(" возникла техническая ошибка! Обратитесь к разработчику.");
            }
        });
    }
    
    // SHOW USER PROFILE
    if(command === "profile") {
        if(message.member.roles.some(r=>JSON.stringify(config.admin_roles).includes(r.name)) && args[0]){
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
    
    // ADD LEVEL TO USER
    if(command === "levelup") {      
        if(!message.member.roles.some(r=>JSON.stringify(config.admin_roles).includes(r.name)))
            return message.reply(" у вас нет права запускать эту команду!");

        if(args.length<2)
            return message.reply(" пожалуйста укажите тег пользователя и номер ачивки!");
        
        let lvl = args.slice(1);     
        let usr = message.mentions.users.first().id;
        
        // Add achievemnt to user account
        
        var sql = "SELECT * FROM drd_users WHERE uid = ?; SELECT * FROM drd_levels WHERE code = ?;";        
        database.query(sql, [usr, lvl], function(err, results, fields) {
            if(err){console.log(err)};            
            if (results[0].length != 1 || results[1].length != 1){
                return message.reply(" указанных данных не существует в базе!");
            } else {
            var user_data = Object.values(results[0]);
            var level_data = Object.values(results[1]);            
            
            if (user_data[0].community != level_data[0].community){
                return message.reply(" это достижение недоступно для выбранного пользователя!");
            } else {
                var sql = `SELECT count(*) AS rowscount FROM drd_usr_ach WHERE user_id = ? AND ach_id = ?;`;
                database.query(sql, [user_data[0].uid, level_data[0].code], function (err, result, fields) {
                    if(err) console.log(err);  
                    if(result[0].rowscount > 0){
                        message.reply(" это достижение уже добавлено для указанного пользователя!");
                    } else {
                        var sql = `INSERT INTO drd_usr_ach (ach_id, user_id) VALUES (?, ?);`;
                        database.query(sql, [level_data[0].code, user_data[0].uid], function (err, pingback) {
                            if(err) console.log(err);
                        });                     
                        var report = new Discord.RichEmbed()
                            .setColor('#F5A623')
                            .setTitle(message.mentions.users.first().username+' получил новую ачивку!')
                            .setThumbnail('https://sunfox.ee/resources/img/discord_bot/alert_scroll.png')
                            .addField(':ballot_box_with_check: - ' + level_data[0].title, level_data[0].description)
                            .addBlankField()
                            .setTimestamp();
                        let channel = message.guild.channels.find(channel => channel.name === "log");
                        if (!channel) return;
                        channel.send(report);                      
                    }
                }); 
            }                
            
            var sql = "SELECT count(*) AS allcount FROM drd_levels WHERE level = ? AND community = ?; SELECT count(*) AS lvlcount FROM drd_usr_ach LEFT JOIN drd_levels ON drd_usr_ach.ach_id = drd_levels.code WHERE drd_usr_ach.user_id = ? AND drd_levels.community = ?;";
            database.query(sql, [user_data[0].level, user_data[0].community, user_data[0].uid, user_data[0].community], function (err, result, fields) {
                if(err){console.log(err)}                
                var stats_data = new Array(Object.values(result[0]), Object.values(result[1])); 
                console.log(stats_data);
                if(stats_data[0][0].allcount == stats_data[1][0].lvlcount){
                    let new_lvl = user_data[0].level + 1;
                    var sql = `UPDATE drd_users SET level = ? WHERE uid = ?;`;
                    database.query(sql, [new_lvl, user_data[0].uid], function (err, result) {
                        if(err) {console.log(err)};                        
                        var report = new Discord.RichEmbed()
                            .setColor('#F5A623')
                            .setTitle(message.mentions.users.first().username+' получил '+ new_lvl +' уровень. Поздравляем!')
                            .setThumbnail('https://sunfox.ee/resources/img/discord_bot/alert_announcement.png')
                            .addBlankField()
                            .setTimestamp();
                        let channel = message.guild.channels.find(channel => channel.name === "log");
                        if (!channel) return;
                        channel.send(report);
                    });                    
                }
            });
            }
        });
    }
});

client.login(config.token);