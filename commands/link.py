from commands.base_command  import BaseCommand
import requests
import settings
from utils                  import get_base_url, get_emoji

class Link(BaseCommand):
    def __init__(self):
        description = "Link to a forum profile"
        params = ['forum_username']
        super().__init__(description, params)

    async def handle(self, params, message, client):
        url = get_base_url() + 'code.php'
        data = {
            'discord_id': message.author.id,
            'forum_username': ' '.join(params),
        }
        r = requests.post(url, data)
        
        if r.text == 'success':
            msg = 'A Forum PM has been sent to the specified user. Respond with `~verify <code>` using the code from the Forum PM to link your Discord account with your Forum Profile.'
        elif r.text == 'linked':
            msg = 'You are already linked to this account.'
        else:
            print(r.text)
            msg = 'Something went wrong. Please check the username you entered and try again.'
        
        await client.send_message(message.channel, msg)

