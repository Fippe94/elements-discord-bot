const { Command, Middleware } = require('yamdbf');
const { resolve, expect } = Middleware;
const utils = require('../utils');

module.exports = class extends Command {
	constructor() {
		super({
			name: 'whois',
			desc: 'Returns the Forum Profile associated with this Discord user',
			usage: '<prefix>whois [user]',
		});

		this.use(resolve('user?: User'));
	}

	action(message, args) {
		// Lookup forum_username associated with provided discord user, or self if no arguments
        let discord_id = (args.length > 0) ? args[0].id : message.author.id;
        utils.post('whois.php', { discord_id: discord_id }, body => {
            message.reply(body);
        });
	}
};