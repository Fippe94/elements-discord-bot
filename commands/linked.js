const { Command, Middleware } = require('yamdbf');
const { resolve, expect } = Middleware;
const utils = require('../utils');

module.exports = class extends Command {
	constructor() {
		super({
			name: 'linked',
			desc: 'Check if account is linked to a forum profile',
			usage: '<prefix>linked',
		});
	}

	action(message) {
		// Save to database & send forum PM to user
        utils.post('linked.php', { discord_id: message.author.id, }, body => {
            if (body == 'success') {
                // Respond with confirmation
                message.reply('No worries! Your Discord Account is already linked to your Forum Profile.');
            } else {
                // Respond with error
                console.log(body);
                message.reply('Sorry! Your Discord Account is not yet linked to your Forum Profile. Use `!link <forum_username>` to get started.');
            }
        });
	}
};