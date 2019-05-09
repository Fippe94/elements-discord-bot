// Libraries
const Discord = require('discord.js');
const request = require('request');
const xml = require('xml-parse');

const auth = require('./auth.json');

// Create client
const client = new Discord.Client();

const element_list = [ "Fire", "Water", "Earth", "Air", "Death", "Life", "Light", "Darkness", "Gravity", "Entropy", "Time", "Aether"];

// Constants
client.BASE_URL = 'http://elementscommunity.org/tools/discord-bot/';
client.PREFIX = '~';

// Client is ready!
client.on('ready', function() {
  console.log('Logged in as %s - %s\n', client.user.username, client.user.id);
  client.user.setPresence({ 
    'game': { 
      'name': client.PREFIX + "help | Taters gonna tate" 
    } 
  });
});

client.on('disconnect', function(event){
  console.log('Disconnected with code ' + event.code);
  client.login(auth.token);
  console.log('Reconnecting...');

});

// Message received
client.on('message', function(message) {
  // Ignore if the message doesn't start with the prefix
  if (message.content.substring(0, 1) != client.PREFIX) {
    return;
  }

  let user_id = message.author.id;

  let username = message.author.username;

  let channel = message.channel;
  
  let forum_username = '';
  
  // Parse message into command and arguments
  let args = message.content.substring(1).split(' ');
  const cmd = args[0];
  args = args.splice(1);
  
  // Perform actions based on the command sent
  switch(cmd) {
    /**
      * SAMPLE
    **/
    case 'ping':
      channel.send('pong');
      break;
    
    /**
      * HELP
    **/
    case 'help':
      channel.send('', {
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
            'text': 'Last update: Sunday Mar 10, 2019'
          },
          'fields': [
            {
              'name': 'General',
              'value': '\n`' + client.PREFIX + 'help` Display this help message\n\n' +
                '`' + client.PREFIX + 'elementcolor <element(s)> ` Change your role (and name color) to the Element(s) specified. ' +
                'If no Elements specified, your Elemental role will be removed.\n\n' +
                '`' + client.PREFIX +'roll XdY` Rolls X dice with Y sides.\n\n━━━━━━━━━━━━━━━━━━━━━━━'
            },
            {
              'name': 'Discord <-> Forum Link',
              'value': '\n`' + client.PREFIX + 'link <forum_username>` Link your Discord account to a forum profile\n\n' +
                '`' + client.PREFIX + 'verify <code>` Verify ownership of a forum profile\n\n' + 
                '`' + client.PREFIX + 'linked` Check if your account is linked to a forum profile\n\n' + 
                '`' + client.PREFIX + 'whois <discord_nickname>` Returns the Forum Profile associated with this Discord user\n\n' + 
                '`' + client.PREFIX + 'lookup <forum_username>` Returns the Discord Username associated with this Forum Profile\n\n━━━━━━━━━━━━━━━━━━━━━━━'
            },
            {
              'name': 'Elements',
              'value': '\n`' + client.PREFIX + 'card <card name>` Display an Elements card\n\n━━━━━━━━━━━━━━━━━━━━━━━'
            }
          ],
        }
      });
      break;
    
    case "card":
      card_name = args.join('');

      channel.send('', {
        embed: {
          "image": {
            "url": 'http://elementscommunity.org/images/Cards/' + card_name + '.png'
          }
        }
      });
      break;

    case "elementcolor":

      let new_elements = [];
      
      console.log('Changing roles for ' + message.member.displayName);
      element_list.forEach(element => {
        role = message.guild.roles.find(role => role.name === (element + " User"));
        if (role != null){
          if (args.indexOf(element) >= 0) {
            message.member.addRole(role);
            console.log('Added ' + role.name);
            new_elements.push(element);
          }
          else {
            message.member.removeRole(role);
            console.log('Removed ' + role.name);
          }
        }
      });

      if (new_elements.length > 0){
        message.channel.send('You have changed Element' + (new_elements.length > 1 ? 's' : '') + ' to ' + new_elements.join(' and ') + '.'  );
      }
      else{
        message.channel.send('You have removed your Elemental role.');
      }

      break;


    case 'roll':

      if (args.length == 0){
        args = ['6d10'];
      }
      
      if (args.length != 1){
        message.channel.send('This command requires exactly 1 argument.' );
        break;
      }

      let arg = args[0].toLowerCase();

      let d_index = arg.indexOf('d')

      
      if (d_index < 0) {
        message.channel.send('You need a \'d\' in your argument.');
        break;
      }

      let dice_args = arg.split('d');


      if (isNaN(dice_args[0]) || isNaN(dice_args[1])){
        message.channel.send('Dice uses numbers, not other symbols.');
        break;
      }

      amount = Number(dice_args[0]);
      sides = Number(dice_args[1]);

      if (!Number.isInteger(Number(amount)) || !Number.isInteger(Number(sides))) {
        message.channel.send('The number of dice and their sides must be integers.');
        break;
      }

      if (amount > 100 || amount < 1 || sides > 100 || sides < 1){
        message.channel.send('The number of dice and their sides must be between 1 and 100.');
        break;
      }

      let res = [];
      let sum = 0;

      for (let index = 0; index < amount; index++) {
        let roll = Math.floor(Math.random() * sides + 1);
        res.push(roll);        
        sum += roll;
      }

      message.channel.send('(' + amount + 'd' + sides + ') ' + res.join(' + ') + ' = **' + sum + '**' );

      break;
    /**
      * DISCORD-FORUMS LINK
    **/
    
    // Submit request to link Discord and Forum accounts
    case 'link':
      forum_username = args.join(' ');
      
      // Save to database & send forum PM to user
      request.post({
        url: client.BASE_URL + "code.php",
        form: {
          discord_id: user_id,
          forum_username: forum_username
        }, 
      }, (err, res, body) => { 
        let answer = '';
        if (body == 'success') {
          // Respond with confirmation
          answer = 'A Forum PM has been sent to the specified user. Respond with `' + client.PREFIX + 'verify <code>` using the code from the Forum PM to link your Discord account with your Forum Profile.';
        } else {
          // Respond with error
          answer = 'Something went wrong. Please check the username you entered and try again.';
          
          // Log error
          console.log('link ' + forum_username);
          console.log(body);
        }
        
        // Send response
          channel.send(answer);
      });
      break;
    
    // Verify link with provided code
    case 'verify':
      // Check code from database
      request.post({
        url: client.BASE_URL + "verify.php", 
        form: {
          discord_id: user_id,
          code: args[0],
        }, 
      }, (err, res, body) => { 
        if (body == 'success') {
          // Respond with confirmation
          answer = 'Hurray! You have successfully linked your Discord Account with your Forum Profile.';
        } else {
          // Respond with error
          answer = 'Something went wrong. Please check the code you entered and try again.';
          
          // Log error
          console.log('verify ' + args[0]);
          console.log(body);
        }
        
        // Send response
        channel.send(answer);
      });
      break;
    
    // Check if account is already linked
    case 'linked':
      request.post({
        url: client.BASE_URL + "linked.php", 
        form: {
          discord_id: user_id,
        }, 
      }, (err, res, body) => { 
        if (body == 'success') {
          // Respond with confirmation
          answer = 'No worries! Your Discord Account is already linked to your Forum Profile.';
        } else {
          // Respond with error
          answer = 'Sorry! Your Discord Account is not yet linked to your Forum Profile. Use `' + client.PREFIX + 'link <forum_username>` to get started.';
          
          // Log error
          console.log('linked - ' + username + ' (' + user_id + ')');
          console.log(body);
        }
        
        // Send response
        channel.send(answer);
      });
      break;
    
    // Returns the Forum Profile associated with this Discord user
    case 'whois':
      const discord_nickname = args.join(' ');
      const discord_id = getDiscordId(discord_nickname, message);
      
      if (!discord_id) {
        channel.send('Discord Username not found. Please check your spelling and try again.');
        break;
      }
      
      request.post({
        url: client.BASE_URL + "whois.php", 
        form: {
          discord_id: discord_id,
        }, 
      }, (err, res, body) => { 
        // Send response
        channel.send(body);
      });
      break;
    
    // Returns the Discord Username associated with this Forum Profile
    case 'lookup':
      forum_username = args.join(' ');
      
      request.post({
        url: client.BASE_URL + "lookup.php", 
        form: {
          forum_username: forum_username,
        }, 
      }, (err, res, body) => {
        console.log(body)
        member = message.guild.members.get(body)
            
          console.log(member)
        
          if (member) {

            channel.send('This account is linked to: ' + member.user.username);
          } else {
            // Send response
            channel.send('This account is not linked to any user on this server');
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

client.login(auth.token);

/**
  * UTIL FUNCTIONS
**/

// Lookup Discord ID from Discord Nickname
function getDiscordId(discord_nickname, message) {
  //console.log(client.users);
  /*for (var id in client.users) {
    console.log(id);
    console.log(client.users[id]);
    if (client.users[id].username.toLowerCase() == discord_nickname.toLowerCase()) {
      return id;
    }
  }*/
  console.log(discord_nickname);
  let user = message.guild.members.find( x => {x.displayName === discord_nickname});
  console.log(user);
  if (user == null){
    return user;
  }
  return user.user.id;
}

/**
  * AP & TP
**/

let data = [
  { 
    'room_id': '432228551786364938', // /* UTA-Test-bot #general */ '444186287671607298'
    'url': 'http://elementscommunity.org/forum/index.php?action=.xml;sa=recent;limit=1;type=atom',
    'title': 'Latest Post',
    'color': 3447003,
    'last': '',
  },
  { 
    'room_id': '426768975066562571', // /* UTA-Test-bot #tournaments */ '461917004735971328',
    'url': 'http://elementscommunity.org/forum/index.php?action=.xml;sa=recent;limit=1;type=atom;boards=77',
    'title': 'Latest Tourney Post',
    'color': 15158332,
    'last': '',
  },
];

/*
setInterval(function() {
  let author = '';
  let profile = '';
  let forum = '';
  let forumid = '';
  let title = '';
  let forumlink = '';
  let line_text = '';

  request(data[0].url, function(err, res, body) { processPotato(0, body); })
  request(data[1].url, function(err, res, body) { processPotato(1, body); })
}, 10000);

function removeCDATA(str) {
  return str.replace('<![CDATA[', '').split('').reverse().join('').replace('>]]', '').split('').reverse().join('');
}

function processPotato(idx, body) {
  let d = data[idx];
  let xmlDoc = xml.parse(body);
  for (let xml_tag of xmlDoc) {
    if (xml_tag.tagName != 'feed') {
      continue;
    }

    for (feed_tag of xml_tag.childNodes) {
      if (feed_tag.tagName != 'entry') {
          continue;
      }

      for (entry_tag of feed_tag.childNodes) {
        switch(entry_tag.tagName) {
          case 'link':
            link = entry_tag.attributes.href;
            break;
          case 'category':
            for (let cat_tag of entry_tag.childNodes) {
              if (cat_tag.tagName == 'label') {
                forum = removeCDATA(cat_tag.innerXML);
              } else if (cat_tag.tagName == 'term') {
                forumid = removeCDATA(cat_tag.innerXML);
              }
            }
            break;
          case 'author':
            for (let auth_tag of entry_tag.childNodes) {
              if (auth_tag.tagName == 'name') {
                author = removeCDATA(auth_tag.innerXML);
              } else if (auth_tag.tagName == 'uri') {
                profile = removeCDATA(auth_tag.innerXML);
              }
            }
            break;
          case 'title':
            title = removeCDATA(entry_tag.innerXML);
            break;
        }
      }
    }
  }
  
  if (d.last == link) {
    return;
  }

  data[idx].last = link;

  forumlink = "http://elementscommunity.org/forum/?board="+forumid;

  if (title.length > 45) {
    title = title.substring(0, 45) + '...';
  }

  line_text = 'The latest forum post is [' + title + '](' + link + ') from [' + author + '](' + profile + ') in [' + forum + '](' + forumlink + ').';
  
  // TODO: Add potato phrases
  // line_text += phrase;

  let channel = client.channels.get(d.room_id);
  channel.send( '', {
    embed: {
      color: d.color,
      fields: [{ 
        name: d.title, 
        value: line_text 
      }]
    },
  });
}
*/