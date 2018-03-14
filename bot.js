const Discord = require("discord.js");
const client = new Discord.Client();

const auth = require('./auth.json');
const request = require('request');
const xml = require('xml-parse');

// Custom constants
const base_url = 'http://elementscommunity.org/tools/discord-bot/';
const emoji_dollar = '8ed2cc6920647efb9ed69ccc429fcee4';
const emoji_moneybag = 'ccebe0b729ff7530c5e37dbbd9f9938c';
const prefix = "!";

client.on('ready', evt => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
    console.log('Message received');
    
    // Ignore bots.
    if (message.author.bot) {
      console.log('Ignore bot.');
      return;
    }
    
    if (message.channel.type == 'dm') { // Process DMs
        console.log('DM received.');
        
        if (message.content.startsWith(prefix)) {
            console.log('Prefix!');
            
            // Get command and arguments
            let args = message.content.substring(1).split(' ');
            let cmd = args[0];
            
            console.log(cmd);
            
            switch(cmd) {
                // Link Elements Forum Profile to Discord Account
                case 'link':
                    let forum_username = message.content.substring(6);
                    
                    // Save to database & send forum PM to user
                    request.post({
                        url: base_url + "code.php",
                        form: {
                            forum_username: forum_username,
                        }, 
                    }, (err, res, body) => { 
                        if (body == 'success') {
                            // Respond with confirmation
                            message.reply('A Forum PM has been sent to the specified user. Respond with `!verify <code>` using the code from the Forum PM to link your Discord account with your Forum Profile.');
                        } else {
                            // Respond with error
                            message.reply('Something went wrong. Please check the username you entered and try again.');
                        }
                    });
                    
                    break;
                
                // Verify link with provided code
                case 'verify':
                    let code = message.content.substring(8);
                    
                    // Check code from database
                    request.post({
                        url: base_url + "verify.php", 
                        form: {
                            discord_id: message.author.id,
                            code: code,
                        }, 
                    }, (err, res, body) => { 
                        if (body == 'success') {
                            // Respond with confirmation
                            message.reply('Hurray! You have successfully linked your Discord Account with your Forum Profile.');
                        } else {
                            // Respond with error
                            message.reply('Something went wrong. Please check the code you entered and try again.');
                        }
                    });
                    
                    break;
                
                // Check if account is already linked
                case 'linked':
                    request.post({
                        url: base_url + "linked.php", 
                        form: {
                            discord_id: message.author.id,
                        }, 
                    }, (err, res, body) => { 
                        if (body == 'success') {
                            // Respond with confirmation
                            message.reply('No worries! Your Discord Account is already linked to your Forum Profile.');
                        } else {
                            // Respond with error
                            message.reply('Sorry! Your Discord Account is not yet linked to your Forum Profile. Use `!link <forum_username>` to get started.');
                        }
                    });
                    
                    break;
            }
        }
    } else if (message.channel.type == 'text') {
        console.log('Text channel');
        
        // Ensure user has a score, give them one if not
        request.post({
            url: base_url + 'score.php', 
            form: {
                type: 'check_score',
                user_id: message.author.id,
            },
        }, (check_score_err, check_score_res, check_score_body) => {
            if (check_score_err) {
                throw check_score_err;
            }
            
            // Randomly give out electrum - 5% chance at $1
            if (Math.floor(Math.random() * 101) > 95) {
                console.log('Dollar!');
                
                // Add $1 to user's score
                request.post({
                    url: base_url + 'score.php',
                    form: {
                        type: 'add_score',
                        user_id: message.author.id,
                        amount: 1,
                    },
                }, (add_score_err, add_score_res, add_score_body) => {
                    if (add_score_err) {
                        throw add_score_err;
                    }
                });
                
                // React to message to notify user
                message.react(emoji_dollar);
            } else if (Math.floor(Math.random() * 101) == 100) { // 1% chance at $10, if 5% chance for $1 already failed
                console.log('Money bags!');
                
                // Add $10 to user's score
                request.post({
                    url: base_url + 'score.php',
                    form: {
                        type: 'add_score',
                        user_id: message.author.id,
                        amount: 10,
                    },
                }, (add_score_err, add_score_res, add_score_body) => {
                    if (add_score_err) {
                        throw add_score_err;
                    }
                });
                
                // React to message to notify user
                message.react(emoji_moneybag);
            }
            
            // Check for commands
            if (message.content.startsWith(prefix)) {
                console.log('Prefix!');
                
                // Get command and arguments
                let args = message.content.substring(1).split(' ');
                let cmd = args[0];
                
                console.log(cmd);
                
                switch(cmd) {
                    // Display help details
                    case 'help':
                        break;
                    
                    // PM Reminder once user is out of jail
                    case 'remindme':
                        break;
                    
                    // Attempt steal
                    // 60% chance default, reduced chances after multiple attempts, reduced chances based on % of total electrum owned
                    case 'steal':
                        break;
                    
                    // How long since last attack/attacked
                    case 'time':
                        break;
                    
                    // Get Top 5 scores and display them
                    case 'top':
                        request.post({
                            url: base_url + 'score.php',
                            form: {
                                type: 'get_top_scores',
                            }
                        }, (top_scores_err, top_scores_res, top_scores_body) => {
                            if (top_scores_err) {
                                throw top_scores_err;
                            }
                            
                            let results = JSON.parse(top_scores_body);
                            let scoreboard = '';
                            for (let idx in results) {
                                scoreboard += '[' + (idx + 1) + '] ' + client.users.get("id", results[idx].userId).username + '\n';
                                scoreboard += '    > Electrum: ' + results[idx].points + '\n';
                            }
                            
                            message.reply({
                                embed: { 
                                    color: 3447003,
                                    fields: [{ 
                                        name: 'Elements Discord | Electrum Leaderboard', 
                                        value: scoreboard, 
                                    }]
                                },
                            });
                        });
                        break;
                    
                    // Transfer electrum to specified user
                    case 'transfer':
                        break;
                    
                    // Display user's current score
                    case 'wallet':
                        if (message.content.length > 8) { // Get specified user's wallet 
                            let username = message.content.substring(8);
                        } else { // Get Author's Wallet                
                            request.post({
                                url: base_url + 'score.php',
                                form: {
                                    type: 'get_score'
                                }
                            }, (wallet_err, wallet_res, wallet_body) => {
                                if (wallet_err) {
                                    throw wallet_err;
                                }
                                
                                let results = JSON.parse(wallet_body);
                                
                                message.reply({
                                    embed: {
                                        color: 3447003,
                                        fields: [{
                                            name: '![avatar](' + message.author.avatarURL + ') ' + message.author.username,
                                            value: '**Balance:** ' + results.score + ' Electrum',
                                        }]
                                    }
                                });
                            });
                        }
                        break;
                }
            }
        });
    }
});

client.login(process.env.auth_token);

let data = [
    { 
        'room_id': '363153836484984832',
        'url': 'http://elementscommunity.org/forum/index.php?action=.xml;sa=recent;limit=1;type=atom',
        'title': 'Latest Post',
        'color': 3447003,
        'last': '',
    },
    { 
        'room_id': '363153836484984832',
        'url': 'http://elementscommunity.org/forum/index.php?action=.xml;sa=recent;limit=1;type=atom;boards=77',
        'title': 'Latest Tourney Post',
        'color': 15158332,
        'last': '',
    },
];
setInterval(() => {
    let author = '';
    let profile = '';
    let forum = '';
    let forumid = '';
    let title = '';
    let forumlink = '';
    let line_text = '';

    /*
    // Turning potato off during testing of bot
    request(data[0].url, (err, res, body) => { processPotato(0, body); })
    request(data[1].url, (err, res, body) => { processPotato(1, body); })
    */
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

    client.channels.get(d.room_id).send({
        embed: { 
            color: d.color,
            fields: [{ 
                name: d.title, 
                value: line_text 
            }]
        },
    });
}