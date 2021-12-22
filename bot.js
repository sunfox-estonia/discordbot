const Discord = require('discord.js');
const Roll20 = require('d20');
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
	
	console.log(message.member.roles);
	
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
        
    // SHOW AVAILABLE COMMANDS
    if(command === "help") {
        var msg = ' вот список доступных команд:\n';
        if(message.member.roles.some(r=>JSON.stringify(config.admin_roles).includes(r.name))){
            msg = msg + '/adduser [@пользователь] [viruviking|einherjar] - добавить нового пользователя в сообщество;\n';
            msg = msg + '/levelup [@пользователь] [# ачивки] - добавить ачивку пользователю. Ачивки и их коды смотри: https://wiki.sunfox.ee/\n';
            msg = msg + '/addcoins [@пользователь] [количество монет] - добавить монеты на аккаунт пользователю.\n';
        }
        msg = msg + '/profile [@пользователь] - показать профиль пользователя и список его достижений.\n';
        msg = msg + '/roll [XdX] [XdX] [...] - бросить кубы и показать выпавшие значения. По умолчанию бросает 1d6.\n';
        msg = msg + '/card - вытягивает случайную карту из колоды в 54 карты.\n';
        message.reply(msg);
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
        var sql = "SELECT drd_users.uid, drd_users.level, drd_users.community,  drd_users.coins, drd_levels.title, drd_levels.symbol FROM drd_users LEFT JOIN drd_levels ON drd_users.level = drd_levels.level AND drd_users.community = drd_levels.community WHERE drd_users.uid = ? LIMIT 1;";        
        database.query(sql, [uid], function(err, user_source, fields) {
            if(err){console.log(err)};             
            
            if (user_source.length == 1){                
                var sql = "SELECT drd_achievements.code, drd_achievements.title, drd_achievements.description, drd_usr_ach.date FROM drd_achievements LEFT JOIN drd_usr_ach ON drd_achievements.code = drd_usr_ach.ach_id AND drd_usr_ach.user_id = ? WHERE drd_achievements.community = ? AND drd_achievements.level = ?;"; 
                database.query(sql, [user_source[0].uid, user_source[0].community, user_source[0].level], function(err, lvls_source, fields) {
                    if(err){console.log(err)};                    
                    var profile = new Discord.RichEmbed()
                        .setAuthor(usr.username)
                        .setTitle(String.fromCodePoint(user_source[0].symbol) +' '+ user_source[0].title)
                        .setDescription(user_source[0].level +' уровень | ' + user_source[0].coins + ' золотых')
                        .setThumbnail(usr.avatarURL)
                        .addBlankField();                        
                    if(lvls_source.length>0){
                        for (i=0; i<lvls_source.length; i++){
                            if(lvls_source[i].date === null ){
                                var chkbox = ':white_medium_square:';
                            }else{
                                var chkbox = ':ballot_box_with_check:';
                            }
                            profile.addField(chkbox +' - '+ lvls_source[i].title, lvls_source[i].description);
                        }     
                    }else{
                        profile.addField('На этом уровне отсуствуют доступные достижения', 'Вероятнее всего, со временем они будут добавлены.');
                    }
                    profile.addBlankField()
                        .setTimestamp();
                    switch (user_source[0].community){
                        case 'viruviking':
                            profile.setFooter('Викинги Вирумаа', 'https://sunfox.ee/resources/img/discord_bot/vv_sq_logo.png').setColor('#0099ff');
                            break;
                        case 'einherjar':
                            profile.setFooter('Einherjar', 'https://sunfox.ee/resources/img/discord_bot/er_sq_logo.jpg').setColor('#808000');
                            break;
                    }                        
                    message.channel.send(profile);
                    
                });                
            } else {
                return message.reply(" указанного пользователя не существует в базе!");
            }
        });
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
        
        var sql = "SELECT drd_users.id, drd_users.uid, drd_users.level, drd_users.community, drd_users.coins, drd_levels.title, drd_levels.symbol FROM drd_users LEFT JOIN drd_levels ON drd_users.level = drd_levels.level WHERE uid = ? LIMIT 1; SELECT * FROM drd_achievements WHERE code = ?;";        
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
                        let coins_sum = user_data[0].coins + level_data[0].coins;
                        var sql = `UPDATE drd_users SET coins = ? WHERE uid = ?;`;
                        database.query(sql, [coins_sum, user_data[0].uid], function (err, pingback) {
                            if(err) console.log(err);
                        });
                        var report = new Discord.RichEmbed()
                            .setTitle(message.mentions.users.first().username+' получил новую ачивку!')
                            .setThumbnail('https://sunfox.ee/resources/img/discord_bot/alert_scroll.png')
                            .addField(':ballot_box_with_check: - ' + level_data[0].title + ' (' +  level_data[0].coins + ' золотых)', level_data[0].description)
                            .addBlankField()
                            .setTimestamp();
                        switch (user_data[0].community){
                            case 'viruviking':
                                report.setFooter('Викинги Вирумаа', 'https://sunfox.ee/resources/img/discord_bot/vv_sq_logo.png').setColor('#0099ff');
                                break;
                            case 'einherjar':
                                report.setFooter('Einherjar', 'https://sunfox.ee/resources/img/discord_bot/er_sq_logo.jpg').setColor('#808000');
                                break;
                        }
                        let channel = message.guild.channels.find(channel => channel.name === "log");
                        if (!channel) return;
                        channel.send(report);                      
                    }
                }); 
            }                
            
            var sql = "SELECT count(*) AS allcount FROM drd_achievements WHERE level = ? AND community = ?; SELECT count(*) AS lvlcount FROM drd_usr_ach LEFT JOIN drd_achievements ON drd_usr_ach.ach_id = drd_achievements.code AND drd_achievements.level = ? WHERE drd_usr_ach.user_id = ? AND drd_achievements.community = ?;";
            database.query(sql, [user_data[0].level, user_data[0].community, user_data[0].level, user_data[0].uid, user_data[0].community], function (err, result, fields) {
                if(err){console.log(err)}                
                var stats_data = new Array(Object.values(result[0]), Object.values(result[1])); 
                if(stats_data[0][0].allcount == stats_data[1][0].lvlcount){
                    let new_lvl = user_data[0].level + 1;
                    var sql = `UPDATE drd_users SET level = ? WHERE uid = ?;`;
                    database.query(sql, [new_lvl, user_data[0].uid], function (err, result) {
                        if(err) {console.log(err)};                        
                        var report = new Discord.RichEmbed()
                            .setTitle(message.mentions.users.first().username+' получил новый уровень!')
                            .setThumbnail('https://sunfox.ee/resources/img/discord_bot/alert_announcement.png')
                            .addField(String.fromCodePoint(user_data[0].symbol) + ' ' + user_data[0].title, new_lvl + ' уровень.')
                            .addBlankField()
                            .setTimestamp();                        
                        switch (user_data[0].community){
                            case 'viruviking':
                                report.setFooter('Викинги Вирумаа', 'https://sunfox.ee/resources/img/discord_bot/vv_sq_logo.png').setColor('#0099ff');
                                break;
                            case 'einherjar':
                                report.setFooter('Einherjar', 'https://sunfox.ee/resources/img/discord_bot/er_sq_logo.jpg').setColor('#808000');
                                break;
                        }

                        let channel = message.guild.channels.find(channel => channel.name === "log");
                        if (!channel) return;
                        channel.send(report);
                    });                    
                }
            });
            }
        });
    }

    // ADD COINS TO USER
    if(command === "addcoins") {      
        if(!message.member.roles.some(r=>JSON.stringify(config.admin_roles).includes(r.name)))
            return message.reply(" у вас нет права запускать эту команду!");

        if(args.length<2)
            return message.reply(" пожалуйста укажите тег пользователя и количество монет, добавляемых на счет!");
                
        let add_coins = parseInt(args.slice(1));
        let usr = message.mentions.users.first().id;
        
        var sql = "SELECT id, uid, community, coins FROM drd_users WHERE uid = ? LIMIT 1;";
        database.query(sql, [usr], function(err, result, fields) {
            if(err){console.log(err)};      
            if (result.length != 1){                
                return message.reply(" указанных данных не существует в базе!");
            } else {
                var user_data = Object.values(result);
                let coins_sum = user_data[0].coins + add_coins;
                var sql = `UPDATE drd_users SET coins = ? WHERE uid = ?;`;
                database.query(sql, [coins_sum, user_data[0].uid], function (err, pingback) {
                    if(err) console.log(err);
                });
                var report = new Discord.RichEmbed()
                .setTitle(message.mentions.users.first().username+' получил монеты!')
                .setThumbnail('https://sunfox.ee/resources/img/discord_bot/alert_coins.png')
                .setDescription('На аккаунт пользователя добавлено ' + add_coins + ' золотых.')
                .addBlankField()
                .setTimestamp();
                switch (user_data[0].community){
                    case 'viruviking':
                        report.setFooter('Викинги Вирумаа', 'https://sunfox.ee/resources/img/discord_bot/vv_sq_logo.png').setColor('#0099ff');
                        break;
                    case 'einherjar':
                        report.setFooter('Einherjar', 'https://sunfox.ee/resources/img/discord_bot/er_sq_logo.jpg').setColor('#808000');
                        break;
                }
                let channel = message.guild.channels.find(channel => channel.name === "log");
                if (!channel) return;
                channel.send(report);        
            }
        });
    }

    // ROLL DICES
    if(command === "roll" || command === "r") {
        var result = [];
        if(args.length > 0){
            for (i = 0; i < args.length; i++) {
                let p = args[i].match(/(\d{0,1})[d](\d{1,2})/g);
                result.push(Roll20.verboseRoll(p[0]));  
            }
        }else{
            result.push(Roll20.verboseRoll(6));
        }
        for (i = 0; i < result.length; i++) {
            if(args.length > 0){
                var dice = args[i].match(/[d](\d{1,2})/g); // dice[0]
            }else{
                var dice = ["d6"];
            }
            for (n = 0; n < result[i].length; n++) {
                var img =  dice[0] + '-' + result[i][n] + '.png';
                message.channel.send({file: 'https://sunfox.ee/resources/img/discord_bot/dice/' + img});

            }
        }        
    }

    // RND CARD
    if(command === "card" || command === "c") {    
        var crd = ['2','3','3','5','6','7','8','9','10','A','J','K','Q'];
        var clr = ['C','D','H','S'];
        var rndCrd = crd[Math.floor(Math.random()*crd.length)];
        var rndClr = clr[Math.floor(Math.random()*clr.length)];
        message.channel.send({file: 'https://sunfox.ee/resources/img/discord_bot/card/' + rndCrd + rndClr + '.png'});
    }
});

client.login(config.token);