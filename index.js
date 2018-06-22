// Libraries
const Discord = require('discord.io');
const request = require('request');

// Create client
const bot = new Discord.Client({
  token: process.env.token,
  autorun: true
});

// Constants
bot.BASE_URL = 'http://elementscommunity.org/tools/discord-bot/';
bot.PREFIX = '~';

// Client is ready!
bot.on('ready', function() {
  console.log('Logged in as %s - %s\n', bot.username, bot.id);
});

// Message received
bot.on('message', function(username, user_id, channel_id, message, event) {
  // Ignore if the message doesn't start with the prefix
  if (message.substring(0, 1) != bot.PREFIX) {
    return;
  }
  
  let forum_username = '';
  
  // Parse message into command and arguments
  let args = message.substring(1).split(' ');
  const cmd = args[0];
  args = args.splice(1);
  
  // Perform actions based on the command sent
  switch(cmd) {
    /**
      * SAMPLE
    **/
    case 'ping':
      bot.sendMessage({
          to: channel_id,
          message: 'pong'
      });
      break;
    
    /**
      * HELP
    **/
    case 'help':
      bot.sendMessage({
        to: channel_id,
        message: '',
        embed: {
          color: 3447003,
          author: {
            name: 'PotatoBot',
            icon_url: 'https://cdn.discordapp.com/avatars/418131680667238434/9d2d6b743d44e81f79b443d4c7624976.png'
          },
          thumbnail:
          {
            url: 'https://cdn.discordapp.com/avatars/418131680667238434/9d2d6b743d44e81f79b443d4c7624976.png'
          },
          'description': 'Here are the commands I recognize\n\n━━━━━━━━━━━━━━━━━━━━━━━',
          'footer': {
            'text': 'Last update: Friday Jun 22, 2018'
          },
          'fields': [
            {
              'name': 'General',
              'value': '\n`' + bot.PREFIX + 'help` Display this help message\n\n━━━━━━━━━━━━━━━━━━━━━━━'
            },
            {
              'name': 'Discord <-> Forum Link',
              'value': '\n`' + bot.PREFIX + 'link <forum_username>` Link your Discord account to a forum profile\n\n' +
                '`' + bot.PREFIX + 'verify <code>` Verify ownership of a forum profile\n\n' + 
                '`' + bot.PREFIX + 'linked` Check if your account is linked to a forum profile\n\n' + 
                '`' + bot.PREFIX + 'whois <discord_nickname>` Returns the Forum Profile associated with this Discord user\n\n' + 
                '`' + bot.PREFIX + 'lookup <forum_username>` Returns the Discord Username associated with this Forum Profile\n\n━━━━━━━━━━━━━━━━━━━━━━━'
            },
          ],
        }
      });
      break;
    
    /**
      * DISCORD-FORUMS LINK
    **/
    
    // Submit request to link Discord and Forum accounts
    case 'link':
      forum_username = args.join(' ');
      
      // Save to database & send forum PM to user
      request.post({
        url: bot.BASE_URL + "code.php",
        form: {
          discord_id: user_id,
          forum_username: forum_username
        }, 
      }, (err, res, body) => { 
        let message = '';
        if (body == 'success') {
          // Respond with confirmation
          message = 'A Forum PM has been sent to the specified user. Respond with `!verify <code>` using the code from the Forum PM to link your Discord account with your Forum Profile.';
        } else {
          // Respond with error
          message = 'Something went wrong. Please check the username you entered and try again.';
          
          // Log error
          console.log('link ' + forum_username);
          console.log(body);
        }
        
        // Send response
        bot.sendMessage({
          to: channel_id,
          message: message
        });
      });
      break;
    
    // Verify link with provided code
    case 'verify':
      // Check code from database
      request.post({
        url: bot.BASE_URL + "verify.php", 
        form: {
          discord_id: user_id,
          code: args[0],
        }, 
      }, (err, res, body) => { 
        if (body == 'success') {
          // Respond with confirmation
          message = 'Hurray! You have successfully linked your Discord Account with your Forum Profile.';
        } else {
          // Respond with error
          message = 'Something went wrong. Please check the code you entered and try again.';
          
          // Log error
          console.log('verify ' + args[0]);
          console.log(body);
        }
        
        // Send response
        bot.sendMessage({
          to: channel_id,
          message: message
        });
      });
      break;
    
    // Check if account is already linked
    case 'linked':
      request.post({
        url: bot.BASE_URL + "linked.php", 
        form: {
          discord_id: user_id,
        }, 
      }, (err, res, body) => { 
        if (body == 'success') {
          // Respond with confirmation
          message = 'No worries! Your Discord Account is already linked to your Forum Profile.';
        } else {
          // Respond with error
          message = 'Sorry! Your Discord Account is not yet linked to your Forum Profile. Use `!link <forum_username>` to get started.';
          
          // Log error
          console.log('linked - ' + username + ' (' + user_id + ')');
          console.log(body);
        }
        
        // Send response
        bot.sendMessage({
          to: channel_id,
          message: message
        });
      });
      break;
    
    // Returns the Forum Profile associated with this Discord user
    case 'whois':
      const discord_nickname = args.join(' ');
      const discord_id = getDiscordId(discord_nickname);
      
      if (!discord_id) {
        bot.sendMessage({
          to: channel_id,
          message: 'Discord nickname not found. Please check your spelling and try again.'
        });
        break;
      }
      
      request.post({
        url: bot.BASE_URL + "whois.php", 
        form: {
          discord_id: discord_id,
        }, 
      }, (err, res, body) => { 
        // Send response
        bot.sendMessage({
          to: channel_id,
          message: body
        });
      });
      break;
    
    // Returns the Discord Username associated with this Forum Profile
    case 'lookup':
      forum_username = args.join(' ');
      
      request.post({
        url: bot.BASE_URL + "lookup.php", 
        form: {
          forum_username: forum_username,
        }, 
      }, (err, res, body) => {
        const discord_nickname = getDiscordNickname(body);
        
        if (discord_nickname !== false) {
          bot.sendMessage({
            to: channel_id,
            message: 'This account is linked to: ' + discord_nickname
          });
        } else {
          // Send response
          bot.sendMessage({
            to: channel_id,
            message: body
          });
        }
      });
      break;
    
    /**
      * EMPTY OR UNKNOWN COMMAND
    **/
    // Do nothing
    default:
      break;
  }
});


/**
  * UTIL FUNCTIONS
**/

// Lookup Discord ID from Discord Nickname
function getDiscordId(discord_nickname) {
  for (let user of Object.values(bot.users)) {
    if (user.username.toLowerCase() == discord_nickname.toLowerCase()) {
      return user.id;
    }
  }
  
  return false;
}

// Lookup Discord Nickname from Discord ID
function getDiscordNickname(discord_id) {
  for (let user of Object.values(bot.users)) {
    if (user.id == discord_id) {
      return user.username;
    }
  }
  
  return false;
}