# Бот Discord для Викингов Вирумаа
NodeJS приложение для управления сообществами Sunfox Team. Бот создавался под определенный чат, и к сожалению, не является универсальным. Однако, Вы можете создать бота для своего сообщества на его основе. 

Бот пока еще молод и умеет не многое:
* автоматически добавляет новоприбывших участников в базу данных
* по команде фиксирует факт получения той или иной ачивки (доступно администраторам)
* по команде добавляет на счет указанного участника системы необходимое количество монет
* по команде показывает профиль участника, включая уровень и список полученных достижений (а также тех, которые требуется получить для достижения нового уровня)
* бросает кубы для d4-d20 в неограниченном количестве, и показывает результат
* выдает случайную игральную карту из колоды
* по запросу создает мероприятия и контролирует регистрацию участников на них

## Установка
Технические требования:
* Node.JS >= 16.19.1
* MySQL >= 5.5

Подключитесь к своему серверу по протоколу SSH, разверните репозиторий в рабочую директорию и инициализируйте Node.JS в ней же:
```bash
git clone https://github.com/Viruviking/discordbot.git bot.discord
cd bot.discord/
npm init -y
npm install
```
Далее скорректируйте файл config.json по шаблону:
```json
{
  "token": "[your Discord bot token here]",
  "client_id": "[your Application ID here]",
  "guild_id": "[your Discord Server ID here]",
  "log_channel_id": "[read-only log channel ID here]",
  "admin_roles": { [Moderator & Admin roles title here] },
  "db_config": {"host":"localhost", "dbname":"[database title]", "dbuser":"[database username]", "dbpass":"[database user password]" }
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
  `id` smallint(6) NOT NULL AUTO_INCREMENT,
  `level` smallint(6) NOT NULL,
  `title` varchar(55) NOT NULL,
  `symbol` varchar(55) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `drd_achievements`;
CREATE TABLE `drd_achievements` (
  `id` smallint(6) NOT NULL AUTO_INCREMENT,
  `code` smallint(6) NOT NULL,
  `level` smallint(6) NOT NULL,
  `title` varchar(55) NOT NULL,
  `description` varchar(512) DEFAULT NULL,
  `coins` smallint(3) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `drd_users`;
CREATE TABLE `drd_users` (
  `id` smallint(6) NOT NULL AUTO_INCREMENT,
  `uid` varchar(55) NOT NULL,
  `level` smallint(6) NOT NULL,
  `coins` smallint(3) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `drd_usr_ach`;
CREATE TABLE `drd_usr_ach` (
  `id` smallint(6) NOT NULL AUTO_INCREMENT,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ach_id` varchar(55) NOT NULL,
  `user_id` smallint(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
```
Внимание! База данных не содержит материалов (ачивок и уровней системы достижений).

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