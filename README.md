# Grade-Bot

## Version: Beta 1.5

Grade-Bot Is Thinking...

## Access StudentVUE within Discord

View your grades, schedule, and more in Discord! This bot is entirely open source to maintain transparency, and demonstrate how Discord's API can be used to access other external API'S.

## (Beta 1.5 Update)

- /gradebook now shows the gradebook for a specific class (ex. /gradebook 2)

## Features

- View your gradebook (Grades, Assignments, etc.)
- View your schedule
- View your general information
- Login/Logout (Saved between sessions & Credentials can't be viewed by anyone but you)
- Find school districts near your zipcode
- (More Features Coming Soon)

## Setup/Install

Before you can use the bot, you'll need to create a new discord app through the discord developer portal. A good guide to getting started can be found [here](https://discord.com/developers/docs/getting-started). Once that is set up and the bot is added to your server, save your bot's client id and token somewhere private and secure. You'll need it later.  
Now you need to install the bot. Here are the steps to clone the bot, and get it up and running:  

- Install Node.js and NPM
- Clone the repository and install the dependencies

```bash
git clone https://github.com/thereal-cc/Grade-Bot.git 
cd Grade-Bot
npm install
```

- Create a new file called `.env` in the root directory of the project. This file will contain your bot's token and client id. The file should look like this:

```.env
TOKEN=Bot's Token
CLIENT_ID=Bot's Client ID
GUILD_ID=Server's Guild ID
```

- Now it's time to run the bot. To begin, go to the root directory of the project. If you want to run the bot in development mode, run the following command:

```bash
npm run dev
```

Otherwise, run the following command in production mode

```bash
npm run start
```

- Hopefully your bot is now up and running, and you can start using it! If you have any issues, feel free to open an issue on the repository.

## Bugs/Contributing

If you find any bugs, or have any suggestions, feel free to open an issue on the repository. If you want to contribute, feel free to open a pull request.

## License

GNU General Public License v3.0
