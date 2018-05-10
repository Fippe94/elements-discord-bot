from commands.base_command  import BaseCommand
import requests
import settings
from utils                  import get_base_url, get_emoji

class Verify(BaseCommand):
    def __init__(self):
        description = "Verify ownership of a forum profile"
        params = ['code']
        super().__init__(description, params)

    async def handle(self, params, message, client):
        url = get_base_url() + 'verify.php'
        data = {
            'discord_id': message.author.id,
            'code': params[0],
        }
        r = requests.post(url, data)
        
        if r.text == 'success':
            msg = 'Hurray! You have successfully linked your Discord Account with your Forum Profile.'
        else:
            print(r.text)
            msg = 'Something went wrong. Please check the code you entered and try again.'
        
        await client.send_message(message.channel, msg)

