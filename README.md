# Бот Discord для Викингов Вирумаа
NodeJS приложение для управления сообществами Sunfox Team. Бот создавался под определенный чат, и к сожалению, не является универсальным. Однако, Вы можете создать бота для своего сообщества на его основе. 

Бот пока еще молод но умеет уже многое:
* по команде добавляет новоприбывших участников в базу Системы достижений
* по команде фиксирует факт получения той или иной ачивки (доступно администраторам)
* по команде добавляет на счет указанного участника системы необходимое количество монет
* по команде показывает профиль участника, включая уровень и список полученных достижений (а также тех, которые требуется получить для достижения нового уровня)
* бросает кубы для d4-d20 и показывает результат, выдает случайную игральную карту из колоды
* по запросу создает мероприятия и квесты (события) и контролирует регистрацию участников на них

Подробное описание команд Бота: http://wiki.sunfox.ee/public:services_bot

## Установка
Технические требования:
* Node.JS >= 16.19.1
* MySQL >= 5.5

Подключитесь к своему серверу по протоколу SSH, разверните репозиторий в рабочую директорию и инициализируйте Node.JS в ней же:
```bash
git clone https://github.com/Viruviking/discordbot.git bot.discord
cd bot.discord/
npm install
git update-index --assume-unchanged config.json
```
Далее скорректируйте файл config.json по шаблону:
```json
{
    "token": "your Discord bot token here",
    "client_id": "your Application ID here",
    "guild_id": "your Discord Server ID here",
    "log_channel_id": "read-only log channel ID here",
    "event_notify_role_id": "Role, which will be notified when an event created",
    "admin_roles": "Moderator & Admin roles titles here",
    "db_config": {
        "host": "localhost",
        "dbname": "database title",
        "dbuser": "database username",
        "dbpass": "database user password"
    }
}
```
Выполните регистрацию команд бота. Для этого в директории бота выполните команду:
```bash
npm run bot.install
```
Создайте базу данных в соответствии с данными подключения, указанными в файле конфигурации. Для развертывания БД выполните следующий код MySQL:
```mysql
SET NAMES utf8;

CREATE DATABASE `sfx_drdbot` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `sfx_drdbot`;

DROP TABLE IF EXISTS `drd_levels`;
CREATE TABLE `drd_levels` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `level` smallint(6) NOT NULL,
  `title` varchar(55) NOT NULL,
  `symbol` varchar(55) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `drd_achievements`;
CREATE TABLE `drd_achievements` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `code` smallint(6) NOT NULL,
  `level` smallint(6) NOT NULL,
  `title` varchar(55) NOT NULL,
  `description` varchar(512) DEFAULT NULL,
  `coins` smallint(3) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `drd_users`;
CREATE TABLE `drd_users` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `uid` varchar(55) NOT NULL,
  `level` smallint(6) NOT NULL,
  `coins` smallint(3) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `drd_usr_ach`;
CREATE TABLE `drd_usr_ach` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ach_id` varchar(55) NOT NULL,
  `user_id` varchar(55) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `events`;
CREATE TABLE `events` (
  `id` int(10) NOT NULL  AUTO_INCREMENT,
  `event_title` varchar(500) NOT NULL,
  `event_date` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `event_location` varchar(500) NOT NULL,
  `event_description` varchar(2000) DEFAULT NULL,
  `event_url` varchar(1000) DEFAULT NULL,
  `date_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `quests`;
CREATE TABLE `quests` (
  `id` int(10) NOT NULL  AUTO_INCREMENT,
  `quest_title` varchar(1000) NOT NULL,
  `quest_description` varchar(2000) NOT NULL,
  `quest_date` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `quest_reward` varchar(200) NOT NULL,
  `date_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `events_usr`;
CREATE TABLE `events_usr` (
  `id` int(10) NOT NULL  AUTO_INCREMENT,
  `event_id` int(10) DEFAULT NULL,
  `user_uid` varchar(55) NOT NULL,
  `user_status` enum('0','1') NOT NULL DEFAULT '0',
  `date_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `quests_usr`;
CREATE TABLE `quests_usr` (
  `id` int(10) NOT NULL  AUTO_INCREMENT,
  `quest_id` int(10) NOT NULL,
  `user_uid` varchar(55) NOT NULL,
  `user_status` enum('0','1') NOT NULL DEFAULT '0',
  `date_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
```
Внимание! База данных не содержит материалов (ачивок и уровней системы достижений).

## Настройка прав доступа на сайте Discord Developers

На странице конфигурации приложения, в разделе Bot, в секции Privileged Gateway Intents включите функции Presence Intent, Server Members Intent  также Message Content Intent. Сохраните изменения.

## Запуск бота
Для запуска бота выполните команду из рабочей директории:
```bash
npm run bot.start
```
Мы рекомендуем добавить CRON-задачу с интервалом запуска в 1 час:
```bash
killall -9 node; node /path/to/bot/index.js;
```
## Дополнительная информация
Чтобы получить ID Discord-сервера или его канала, включите "Режим разработчика" (смотри: "Настройки пользователя" -> "Расширенные").

Вы можете добавить новые коменды и EMBED-объекты с нужными Вам данными в них. Для генерации EMBED-объектов в формате JSON рекомендуем использовать сервис: https://leovoel.github.io/embed-visualizer/