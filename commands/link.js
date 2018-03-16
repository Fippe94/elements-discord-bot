const { Command, Middleware } = require('yamdbf');
const { resolve, expect } = Middleware;
const utils = require('./utils');

module.exports = class extends Command {
	constructor() {
		super({
			name: 'link',
			desc: 'Link to a forum profile',
			usage: '<prefix>link <username>',
		});

		this.use(resolve('username: String'));
		this.use(expect('username: String'));
	}

	action(message, forum_username) {
		// Save to database & send forum PM to user
        utils.post('code.php', { forum_username: forum_username }, body => {
            if (body == 'success') {
                // Respond with confirmation
                message.reply('A Forum PM has been sent to the specified user. Respond with `!verify <code>` using the code from the Forum PM to link your Discord account with your Forum Profile.');
            } else {
                // Respond with error
                message.reply('Something went wrong. Please check the username you entered and try again.');
            }
        });
	}
};