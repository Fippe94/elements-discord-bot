const { Command, Middleware } = require('yamdbf');
const { resolve, expect } = Middleware;
const utils = require('../utils');

module.exports = class extends Command {
	constructor() {
		super({
			name: 'lookup',
			desc: 'Returns the Discord Username associated with this Forum Profile',
			usage: '<prefix>lookup <forum_username>',
		});

		this.use(resolve('forum_username?: String'));
	}

	action(message, args) {
		// Lookup discord user associated with provided forum username, or self if no arguments
        utils.post('lookup.php', { forum_username: args[0] }, body => {
            try {
                let username = message.client.users.find("id", body).username;
                message.reply('This account is linked to: ' + username);
            } catch(err) {
                message.reply(body);
            }
        });
	}
};