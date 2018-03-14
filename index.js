const { Client } = require('yamdbf');
const module_exists = require('module_exists');
const path = require('path');

const config = (
    module_exists('./config.json') ?
        require('./config.json') :
        {
            token: process.env.token,
            owner: process.env.owner,
        }
);

class CustomClient extends Client {
	constructor() {
		super({
			token: config.token,
			owner: config.owner,
			statusText: 'try @mention help',
			readyText: 'Client is ready!',
			commandsDir: path.join(__dirname, 'commands'),
			pause: true
		});

		this.once('pause', async () => {
			await this.setDefaultSetting('prefix', '!');
			this.continue();
		});

		this.once('clientReady', () => {
			console.log(`Client ready! Serving ${this.guilds.size} guilds.`);
		});
	}
}

const client = new CustomClient().start();
