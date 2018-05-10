from commands.base_command  import BaseCommand
import requests
import settings
from utils                  import get_base_url, get_emoji

class Lookup(BaseCommand):
    def __init__(self):
        description = "Returns the Discord Username associated with this Forum Profile"
        params = ['forum_username']
        super().__init__(description, params)

    async def handle(self, params, message, client):
        url = get_base_url() + 'lookup.php'
        data = {
            'forum_username': ' '.join(params),
        }
        r = requests.post(url, data)
        
        try:
            print('r.text: ' + r.text)
            user = await client.get_user_info(r.text)
            print(dir(user))
            msg = 'This account is linked to: ' + user.name
        except Exception as e:
            print(e)
            msg = 'Error: ' + r.text
        
        await client.send_message(message.channel, msg)

