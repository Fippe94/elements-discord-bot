const { Command, Middleware } = require('yamdbf');
const { resolve, expect } = Middleware;
const utils = require('./utils');

module.exports = class extends Command {
	constructor() {
		super({
			name: 'verify',
			desc: 'Verify ownership of a forum profile',
			usage: '<prefix>verify <code>',
		});

		this.use(resolve('code: String'));
		this.use(expect('code: String'));
	}

	action(message, code) {
		// Check code from database
        utils.post('verify.php', { 
            discord_id: message.author.id,
            code: code, 
        }, body => {
            if (body == 'success') {
                // Respond with confirmation
                message.reply('Hurray! You have successfully linked your Discord Account with your Forum Profile.');
            } else {
                // Respond with error
                message.reply('Something went wrong. Please check the code you entered and try again.');
            }
        });
	}
};