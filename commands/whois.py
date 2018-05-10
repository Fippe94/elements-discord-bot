from commands.base_command  import BaseCommand
import requests
import settings
from utils                  import get_base_url, get_emoji

class Whois(BaseCommand):
    def __init__(self):
        description = "Returns the Forum Profile associated with this Discord user"
        params = ['username']
        super().__init__(description, params)

    async def handle(self, params, message, client):
        try:
            discord_id = message.server.get_member_named(params[0]).id
        except Exception as e:
            print(e)
            msg = 'Discord User not found.'
            await client.send_message(message.channel, msg)
            return
        
        url = get_base_url() + 'whois.php'
        data = {
            'discord_id': discord_id,
        }
        r = requests.post(url, data)
        msg = r.text
        
        await client.send_message(message.channel, msg)

