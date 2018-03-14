const { Command, Middleware } = require('yamdbf');
const { resolve, expect } = Middleware;

module.exports = class extends Command {
	constructor() {
		super({
			name: 'poke',
			desc: 'Poke a user',
			usage: '<prefix>poke <user> [...reason]',
			info: 'This would be an obnoxious command. Limited to 1 use per 10 seconds, per user',
			ratelimit: '1/10s'
		});

		this.use(resolve('user: User, ...reason?: String'));
		this.use(expect('user: User'));
	}

	action(message, [user, reason]) {
		let output = `${user}, you've been poked by ${message.author}!`;
		if (typeof reason !== 'undefined') {
			output += ` Reason: ${reason}`;
        }
		message.channel.send(output);
	}
}